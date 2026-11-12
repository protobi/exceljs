const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

const ExcelJS = verquire('exceljs');
const fixture = path.join(__dirname, 'data/column-page-breaks.xlsx');
const breaks = [
  {id: 3, min: 0, max: 1048575, man: 1},
  {id: 6, min: 2, max: 19, man: 1},
];

async function sheetXml(buffer) {
  const zip = await JSZip.loadAsync(buffer);
  return zip.file('xl/worksheets/sheet1.xml').async('string');
}

function expectBreaks(xml) {
  expect(xml).to.contain('<colBreaks count="2" manualBreakCount="2">');
  expect(xml).to.contain('<brk id="3" min="0" max="1048575" man="1"/>');
  expect(xml).to.contain('<brk id="6" min="2" max="19" man="1"/>');
}

describe('Column page breaks', () => {
  it('preserves column breaks through load, write, and reload', async () => {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(fs.readFileSync(fixture));
    expect(wb.worksheets[0].pageSetup.colBreaks).to.deep.equal(breaks);
    const buffer = await wb.xlsx.writeBuffer();
    expectBreaks(await sheetXml(buffer));
    const copy = new ExcelJS.Workbook();
    await copy.xlsx.load(buffer);
    expect(copy.worksheets[0].pageSetup.colBreaks).to.deep.equal(breaks);
  });

  [false, true].forEach(streaming => {
    it(`writes assigned breaks after row breaks (streaming: ${streaming})`, async () => {
      const wb = streaming
        ? new ExcelJS.stream.xlsx.WorkbookWriter()
        : new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Breaks', {pageSetup: {colBreaks: breaks}});
      ws.getCell('A1').value = 'Page breaks';
      ws.getRow(5).addPageBreak();
      let buffer;
      if (streaming) {
        await wb.commit();
        buffer = wb.stream.read();
      } else {
        buffer = await wb.xlsx.writeBuffer();
      }
      const xml = await sheetXml(buffer);
      expectBreaks(xml);
      expect(xml.indexOf('</rowBreaks>')).to.be.lessThan(xml.indexOf('<colBreaks'));
    });
  });

  it('omits empty column breaks and counts only manual breaks', async () => {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(fs.readFileSync(fixture));
    const ws = wb.worksheets[0];
    ws.pageSetup.colBreaks = null;
    expect(await sheetXml(await wb.xlsx.writeBuffer())).not.to.contain('<colBreaks');
    ws.pageSetup.colBreaks = [];
    expect(await sheetXml(await wb.xlsx.writeBuffer())).not.to.contain('<colBreaks');
    ws.pageSetup.colBreaks = [{id: 3, man: 1}, {id: 6, man: 0, pt: 1}];
    const buffer = await wb.xlsx.writeBuffer();
    expect(await sheetXml(buffer)).to.contain('<colBreaks count="2" manualBreakCount="1">');
    const copy = new ExcelJS.Workbook();
    await copy.xlsx.load(buffer);
    expect(copy.worksheets[0].pageSetup.colBreaks).to.deep.equal(ws.pageSetup.colBreaks);
  });
});
