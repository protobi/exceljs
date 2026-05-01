// Regression test for protobi/exceljs#42:
//   "[BUG] Pivot cache triggers Excel repair"
//
// When a workbook contains a pivot table whose source sheet has fields that
// are NOT used as pivot axes (rows/columns/pages) and contain high-cardinality
// or long-text values (e.g. a "Description" column), Excel opens the file with:
//
//   "Repaired Records: PivotTable report from /xl/pivotCache/
//    pivotCacheDefinition1.xml part (PivotTable cache)"
//
// Root cause: pivotCacheDefinition fully materialized <sharedItems> for every
// source column, including non-axial fields. Excel's strict cache validator
// flags this — and it's also wasteful (1500-row long-text columns produced
// ~900KB cache definitions that were never indexed by anything).
//
// Fix: only enumerate sharedItems for fields actually used as pivot axes.
// Non-axial fields get a lightweight <sharedItems .../> declaration with type
// hints; pivotCacheRecords inlines their values (<n>/<s>/<m>) rather than
// referencing them by index. recordCount on the cache definition is also
// corrected to match the data row count (was previously cacheFields.length+1).

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
    let zip;
    let cacheDefXml;
    let cacheRecordsXml;
    const ROW_COUNT = 200;

    before(async () => {
      const workbook = new ExcelJS.Workbook();
      const dataSheet = workbook.addWorksheet('Data');
      dataSheet.columns = [
        {header: 'Repo', key: 'repo', width: 20},
        {header: 'Group', key: 'group', width: 20},
        {header: 'Severity', key: 'severity', width: 20},
        // Description: long-text, high-cardinality, NOT used as a pivot axis.
        // This is the field that triggers the bug.
        {header: 'Description', key: 'description', width: 80},
        {header: 'Counter', key: 'count', width: 10},
      ];

      for (let i = 0; i < ROW_COUNT; i++) {
        dataSheet.addRow({
          repo: `repo-${i % 10}`,
          group: `group-${i % 20}`,
          severity: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'][i % 5],
          description: `long-description-text-${i}-${'x'.repeat(300)}`,
          count: 1,
        });
      }

      const pivotSheet = workbook.addWorksheet('Summary');
      pivotSheet.addPivotTable({
        sourceSheet: dataSheet,
        rows: ['Repo', 'Group'],
        columns: ['Severity'],
        values: ['Counter'],
        metric: 'sum',
      });

      await workbook.xlsx.writeFile(TEST_XLSX_FILEPATH);
      const buffer = await fsReadFileAsync(TEST_XLSX_FILEPATH);
      zip = await JSZip.loadAsync(buffer);
      cacheDefXml = await zip.file('xl/pivotCache/pivotCacheDefinition1.xml').async('string');
      cacheRecordsXml = await zip.file('xl/pivotCache/pivotCacheRecords1.xml').async('string');
    });

    it('emits a pivot cache definition', () => {
      expect(cacheDefXml).to.be.a('string');
      expect(cacheDefXml).to.include('<pivotCacheDefinition');
    });

    it('declares recordCount equal to the source data row count', () => {
      // Was previously `cacheFields.length + 1` (= 6 for this fixture);
      // Excel expects it to match the <pivotCacheRecords count="..."> attribute,
      // which is the number of data rows.
      const match = cacheDefXml.match(/recordCount="(\d+)"/);
      expect(match).to.not.be.null();
      expect(Number(match[1])).to.equal(ROW_COUNT);

      const recordsCountMatch = cacheRecordsXml.match(/<pivotCacheRecords[^>]*count="(\d+)"/);
      expect(recordsCountMatch).to.not.be.null();
      expect(Number(recordsCountMatch[1])).to.equal(ROW_COUNT);
    });

    it('does NOT enumerate sharedItems for the non-axial Description field', () => {
      // The Description cacheField should appear with a lightweight
      // <sharedItems ... /> (self-closing or with attributes only) — it must
      // NOT contain <s v="long-description-..."> children.
      const descMatch = findCacheField(cacheDefXml, 'Description');
      expect(descMatch, 'Description cacheField missing').to.not.be.null();
      const descBlock = descMatch[0];
      expect(descBlock).to.not.include('<s v="long-description-text-');
      // Should be a self-closing sharedItems element.
      expect(descBlock).to.match(/<sharedItems[^>]*\/>/);
    });

    it('does NOT enumerate sharedItems for the non-axial Counter field', () => {
      const counterMatch = findCacheField(cacheDefXml, 'Counter');
      expect(counterMatch).to.not.be.null();
      const counterBlock = counterMatch[0];
      expect(counterBlock).to.not.match(/<n v="\d+" \/>/);
      expect(counterBlock).to.match(/<sharedItems[^>]*\/>/);
    });

    it('keeps full sharedItems enumeration for axial Repo/Group/Severity fields', () => {
      for (const fieldName of ['Repo', 'Group', 'Severity']) {
        const block = findCacheField(cacheDefXml, fieldName);
        expect(block, `${fieldName} cacheField missing`).to.not.be.null();
        // Axial fields keep full <sharedItems count="N"> ... </sharedItems>
        expect(block[0]).to.include('<sharedItems');
        expect(block[0]).to.include('</sharedItems>');
        expect(block[0]).to.match(/<s v="/);
      }
    });

    it('inlines values (not <x v="N"/> indices) in pivotCacheRecords for non-axial fields', () => {
      // Each row should have 5 cells: <x>(Repo) <x>(Group) <x>(Severity) <s>(Desc) <n>(Counter)
      // Pull the first <r>...</r> record and verify shape.
      const firstRecord = cacheRecordsXml.match(/<r>([\s\S]*?)<\/r>/);
      expect(firstRecord, 'no <r> record found').to.not.be.null();
      const body = firstRecord[1];
      // Three <x> indices for the three axial fields:
      const xCount = (body.match(/<x v="\d+"/g) || []).length;
      expect(xCount).to.equal(3);
      // One inline <s> for Description:
      expect(body).to.match(/<s v="long-description-text-/);
      // One inline <n> for Counter:
      expect(body).to.match(/<n v="1"/);
    });

    it('produces a cache definition substantially smaller than the bug version', () => {
      // Pre-fix, this fixture (200 rows × ~325-char descriptions) produced a
      // ~75 KB pivotCacheDefinition. Post-fix it should be a few KB at most,
      // because the giant Description sharedItems block is gone.
      expect(cacheDefXml.length).to.be.lessThan(20000);
    });

    it('round-trip-loads the resulting workbook without throwing', async () => {
      const reloaded = new ExcelJS.Workbook();
      await reloaded.xlsx.readFile(TEST_XLSX_FILEPATH);
      expect(reloaded.worksheets.map(ws => ws.name)).to.include('Data');
      expect(reloaded.worksheets.map(ws => ws.name)).to.include('Summary');
    });
  });
});
