'use strict';

const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

const ExcelJS = verquire('exceljs');

// Programmatically build a workbook in memory whose sheet1.xml contains a
// formula cell with the given inner XML. The cell uses numFmt "m/d/yyyy".
async function buildWorkbookWithFormulaCell(cellInnerXml) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Sheet1');
  // Seed a placeholder formula+date cell so ExcelJS writes a valid styles.xml
  // with the m/d/yyyy numFmt referenced as styleId 1.
  const cell = ws.getCell('A1');
  cell.value = {formula: 'TODAY()', result: new Date(2025, 0, 1)};
  cell.numFmt = 'm/d/yyyy';

  const buf = await wb.xlsx.writeBuffer();
  const zip = await JSZip.loadAsync(buf);
  const sheetPath = 'xl/worksheets/sheet1.xml';
  let sheetXml = await zip.file(sheetPath).async('string');

  // Replace the existing <c r="A1" ...>...</c> with a custom one that keeps
  // the same styleId attribute (s="1") but uses the caller-supplied inner XML.
  sheetXml = sheetXml.replace(/<c r="A1"([^>]*)>[\s\S]*?<\/c>/, (_match, attrs) => {
    const styleAttr = (attrs.match(/\ss="\d+"/) || [' s="1"'])[0];
    return `<c r="A1"${styleAttr}${cellInnerXml.attrs || ''}>${cellInnerXml.body}</c>`;
  });

  zip.file(sheetPath, sheetXml);
  return zip.generateAsync({type: 'nodebuffer'});
}

describe('github issues', () => {
  describe('issue 2966 - formula result with date numFmt', () => {
    it('returns a JS Date when result is a numeric serial (numeric <v>, no t)', async () => {
      const buf = await buildWorkbookWithFormulaCell({
        attrs: '',
        body: '<f>TODAY()</f><v>46143</v>',
      });

      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(buf);
      const cell = wb.getWorksheet('Sheet1').getCell('A1');

      expect(cell.value).to.have.property('formula', 'TODAY()');
      expect(cell.value.result).to.be.an.instanceOf(Date);
      expect(Number.isNaN(cell.value.result.getTime())).to.equal(false);
    });

    it('returns a JS Date when result is a numeric serial marked as t="str"', async () => {
      // Some writers serialize formula results as t="str" even when the
      // cached value is a numeric date serial. The reader must still convert.
      const buf = await buildWorkbookWithFormulaCell({
        attrs: ' t="str"',
        body: '<f>TODAY()</f><v>46143.20833333333</v>',
      });

      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(buf);
      const cell = wb.getWorksheet('Sheet1').getCell('A1');

      expect(cell.value.result).to.be.an.instanceOf(Date);
      expect(Number.isNaN(cell.value.result.getTime())).to.equal(false);
    });

    it('does not produce an Invalid Date when result is a non-numeric display string', async () => {
      // Display-formatted strings cannot be reliably parsed as a numeric
      // Excel serial; the reader must not fabricate an Invalid Date.
      const buf = await buildWorkbookWithFormulaCell({
        attrs: ' t="str"',
        body: '<f>TODAY()</f><v>27/08/2025 19:33:34</v>',
      });

      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(buf);
      const cell = wb.getWorksheet('Sheet1').getCell('A1');

      const {result} = cell.value;
      // Must not be an Invalid Date.
      if (result instanceof Date) {
        expect(Number.isNaN(result.getTime())).to.equal(false);
      } else {
        expect(typeof result).to.equal('string');
      }
    });

    it('streaming reader also returns a JS Date for numeric formula results', async () => {
      const buf = await buildWorkbookWithFormulaCell({
        attrs: ' t="str"',
        body: '<f>TODAY()</f><v>46143.20833333333</v>',
      });

      const tmpPath = path.resolve(__dirname, '../../out', 'issue-2966-stream.xlsx');
      fs.mkdirSync(path.dirname(tmpPath), {recursive: true});
      fs.writeFileSync(tmpPath, buf);

      const collected = [];
      await new Promise((resolve, reject) => {
        const reader = new ExcelJS.stream.xlsx.WorkbookReader(tmpPath, {
          worksheets: 'emit',
          styles: 'cache',
          sharedStrings: 'cache',
          hyperlinks: 'ignore',
          entries: 'ignore',
        });
        reader.read();
        reader.on('worksheet', worksheet => {
          worksheet.on('row', row => {
            collected.push(row.getCell(1).value);
          });
        });
        reader.on('end', resolve);
        reader.on('error', reject);
      });

      expect(collected).to.have.length(1);
      const value = collected[0];
      expect(value).to.have.property('formula', 'TODAY()');
      expect(value.result).to.be.an.instanceOf(Date);
      expect(Number.isNaN(value.result.getTime())).to.equal(false);
    });
  });
});
