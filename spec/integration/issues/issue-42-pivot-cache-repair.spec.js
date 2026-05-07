// Regression test for protobi/exceljs#42:
//   "[BUG] Pivot cache triggers Excel repair"
//
// When a workbook contains a pivot table whose source sheet has fields that
// are NOT used as pivot axes (rows/columns/pages) and contain high-cardinality
// or long-text values, Excel opens the file with:
//
//   "Repaired Records: PivotTable report from /xl/pivotCache/
//    pivotCacheDefinition1.xml part (PivotTable cache)"
//
// Two bugs caused this:
// 1. `recordCount` on pivotCacheDefinition was set to `cacheFields.length + 1`
//    instead of the number of data rows. Excel validates this matches the
//    `<pivotCacheRecords count="...">` attribute.
// 2. `makeCacheFields` enumerated sharedItems for ALL source fields, including
//    non-axial value/unused fields. Excel flags full sharedItems on non-axial
//    fields as a repair condition for high-cardinality or long-text columns.
//
// Fix: only enumerate sharedItems for axial fields (rows/columns/pages).
// Non-axial fields get a lightweight <sharedItems /> with type hints.

const fs = require('fs');
const {promisify} = require('util');
const fsReadFileAsync = promisify(fs.readFile);
const JSZip = require('jszip');

const ExcelJS = verquire('exceljs');

const TEST_XLSX_FILEPATH = './spec/out/wb.issue-42.xlsx';

function findCacheField(xml, name) {
  const re = new RegExp(`<cacheField name="${name}"[^>]*>[\\s\\S]*?</cacheField>`);
  return xml.match(re);
}

describe('Workbook', () => {
  describe('Pivot Tables (issue #42 — Excel repair on cache definition)', () => {
    let cacheDefXml;
    let cacheRecordsXml;
    const ROW_COUNT = 20;

    before(async () => {
      const workbook = new ExcelJS.Workbook();
      const dataSheet = workbook.addWorksheet('Data');
      dataSheet.columns = [
        {header: 'Repo', key: 'repo', width: 20},
        {header: 'Severity', key: 'severity', width: 20},
        // Description: long-text, high-cardinality, NOT used as a pivot axis.
        {header: 'Description', key: 'description', width: 80},
        {header: 'Counter', key: 'count', width: 10},
      ];

      for (let i = 0; i < ROW_COUNT; i++) {
        dataSheet.addRow({
          repo: `repo-${i % 5}`,
          severity: ['HIGH', 'LOW'][i % 2],
          description: `long-description-${i}-${'x'.repeat(100)}`,
          count: 1,
        });
      }

      const pivotSheet = workbook.addWorksheet('Summary');
      pivotSheet.addPivotTable({
        sourceSheet: dataSheet,
        rows: ['Repo'],
        columns: ['Severity'],
        values: ['Counter'],
        metric: 'sum',
      });

      await workbook.xlsx.writeFile(TEST_XLSX_FILEPATH);
      const buffer = await fsReadFileAsync(TEST_XLSX_FILEPATH);
      const zip = await JSZip.loadAsync(buffer);
      cacheDefXml = await zip.file('xl/pivotCache/pivotCacheDefinition1.xml').async('string');
      cacheRecordsXml = await zip.file('xl/pivotCache/pivotCacheRecords1.xml').async('string');
    });

    it('emits a pivot cache definition', () => {
      expect(cacheDefXml).to.be.a('string');
      expect(cacheDefXml).to.include('<pivotCacheDefinition');
    });

    it('declares recordCount equal to the source data row count', () => {
      // Was previously `cacheFields.length + 1` (= 5 for this fixture);
      // Excel expects it to match <pivotCacheRecords count="..."> which is ROW_COUNT.
      const match = cacheDefXml.match(/recordCount="(\d+)"/);
      expect(match).to.not.be.null();
      expect(Number(match[1])).to.equal(ROW_COUNT);

      const recordsCountMatch = cacheRecordsXml.match(/<pivotCacheRecords[^>]*count="(\d+)"/);
      expect(recordsCountMatch).to.not.be.null();
      expect(Number(recordsCountMatch[1])).to.equal(ROW_COUNT);
    });

    it('does NOT enumerate sharedItems for the non-axial Description field', () => {
      const descMatch = findCacheField(cacheDefXml, 'Description');
      expect(descMatch, 'Description cacheField missing').to.not.be.null();
      const descBlock = descMatch[0];
      // Must not contain inline <s v="long-description-..."> children.
      expect(descBlock).to.not.include('<s v="long-description-');
      // Should be a self-closing sharedItems element.
      expect(descBlock).to.match(/<sharedItems[^>]*\/>/);
    });

    it('keeps full sharedItems enumeration for axial Repo and Severity fields', () => {
      for (const fieldName of ['Repo', 'Severity']) {
        const block = findCacheField(cacheDefXml, fieldName);
        expect(block, `${fieldName} cacheField missing`).to.not.be.null();
        expect(block[0]).to.include('</sharedItems>');
        expect(block[0]).to.match(/<s v="/);
      }
    });

    it('round-trip-loads the resulting workbook without throwing', async () => {
      const reloaded = new ExcelJS.Workbook();
      await reloaded.xlsx.readFile(TEST_XLSX_FILEPATH);
      expect(reloaded.worksheets.map(ws => ws.name)).to.include('Data');
      expect(reloaded.worksheets.map(ws => ws.name)).to.include('Summary');
    });
  });
});
