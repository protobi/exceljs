// Tests for the `sourceRef` option on addPivotTable(), which allows the caller
// to specify the top-left cell of the data block when it does not start at A1.
const fs = require('fs');
const {promisify} = require('util');

const fsReadFileAsync = promisify(fs.readFile);

const JSZip = require('jszip');

const ExcelJS = verquire('exceljs');

const TEST_XLSX_FILEPATH = './spec/out/wb.pivot-source-ref.test.xlsx';

// Helper: write a workbook to disk and return parsed JSZip + raw XML strings.
async function writeAndReadZip(workbook) {
  await workbook.xlsx.writeFile(TEST_XLSX_FILEPATH);
  const buffer = await fsReadFileAsync(TEST_XLSX_FILEPATH);
  return JSZip.loadAsync(buffer);
}

async function xmlOf(zip, path) {
  const file = zip.files[path];
  if (!file) throw new Error(`File not found in zip: ${path}`);
  return file.async('string');
}

// Build a workbook where the source data begins at a non-A1 cell.
// The sheet has 2 "noise" rows above the header and 2 "noise" columns to the left.
//
//        A          B         C        D        E
//  1   (empty)   (empty)   (empty)  (empty)  (empty)
//  2   (empty)   (empty)   (empty)  (empty)  (empty)
//  3   (empty)   (empty)   Region   Quarter  Amount
//  4   (empty)   (empty)   North    Q1       100
//  5   (empty)   (empty)   South    Q1       200
//  6   (empty)   (empty)   North    Q2       150
//  7   (empty)   (empty)   South    Q2       250
//
// sourceRef: 'C3'  →  header row = 3, first data column = C (index 3)
function buildOffsetWorkbook() {
  const workbook = new ExcelJS.Workbook();
  const dataSheet = workbook.addWorksheet('Data');

  // Noise rows
  dataSheet.addRow([]);
  dataSheet.addRow([]);
  // Header at row 3, starting at column C (columns A+B left empty)
  dataSheet.getRow(3).getCell('C').value = 'Region';
  dataSheet.getRow(3).getCell('D').value = 'Quarter';
  dataSheet.getRow(3).getCell('E').value = 'Amount';
  // Data rows
  dataSheet.getRow(4).getCell('C').value = 'North';
  dataSheet.getRow(4).getCell('D').value = 'Q1';
  dataSheet.getRow(4).getCell('E').value = 100;

  dataSheet.getRow(5).getCell('C').value = 'South';
  dataSheet.getRow(5).getCell('D').value = 'Q1';
  dataSheet.getRow(5).getCell('E').value = 200;

  dataSheet.getRow(6).getCell('C').value = 'North';
  dataSheet.getRow(6).getCell('D').value = 'Q2';
  dataSheet.getRow(6).getCell('E').value = 150;

  dataSheet.getRow(7).getCell('C').value = 'South';
  dataSheet.getRow(7).getCell('D').value = 'Q2';
  dataSheet.getRow(7).getCell('E').value = 250;

  const pivotSheet = workbook.addWorksheet('Pivot');
  pivotSheet.addPivotTable({
    sourceSheet: dataSheet,
    sourceRef: 'C3',
    rows: ['Region'],
    columns: ['Quarter'],
    values: ['Amount'],
    metric: 'sum',
  });

  return workbook;
}

// =============================================================================
// Tests

describe('Workbook', () => {
  describe('Pivot Tables — sourceRef option', () => {
    it('writes required pivot table files when sourceRef is specified', async () => {
      const workbook = buildOffsetWorkbook();
      const zip = await writeAndReadZip(workbook);

      const requiredPaths = [
        'xl/pivotCache/pivotCacheRecords1.xml',
        'xl/pivotCache/pivotCacheDefinition1.xml',
        'xl/pivotTables/pivotTable1.xml',
      ];
      for (const p of requiredPaths) {
        expect(zip.files[p]).to.not.be.undefined();
      }
    });

    it('worksheetSource ref starts at the specified cell, not A1', async () => {
      const workbook = buildOffsetWorkbook();
      const zip = await writeAndReadZip(workbook);

      const cacheDefXml = await xmlOf(zip, 'xl/pivotCache/pivotCacheDefinition1.xml');

      // The worksheetSource ref should begin at C3, not A1.
      expect(cacheDefXml).to.include('ref="C3:');
      expect(cacheDefXml).to.not.include('ref="A1:');
    });

    it('cacheDefinition contains the correct field names from the offset header row', async () => {
      const workbook = buildOffsetWorkbook();
      const zip = await writeAndReadZip(workbook);

      const cacheDefXml = await xmlOf(zip, 'xl/pivotCache/pivotCacheDefinition1.xml');

      expect(cacheDefXml).to.include('Region');
      expect(cacheDefXml).to.include('Quarter');
      expect(cacheDefXml).to.include('Amount');
    });

    it('cacheRecords contains exactly the data rows (not the header or noise rows)', async () => {
      const workbook = buildOffsetWorkbook();
      const zip = await writeAndReadZip(workbook);

      const recordsXml = await xmlOf(zip, 'xl/pivotCache/pivotCacheRecords1.xml');

      // Pivot cache records use shared-item indices (<x v="N" />) rather than
      // raw strings, so we assert on structure rather than literal data values.

      // The source data block has 4 data rows (rows 4–7 in the sheet).
      expect(recordsXml).to.include('count="4"');

      // Each record row is wrapped in <r>…</r>.
      const recordCount = (recordsXml.match(/<r>/g) || []).length;
      expect(recordCount).to.equal(4);

      // Header names must NOT appear as literal text in the records file —
      // they live in pivotCacheDefinition, not pivotCacheRecords.
      expect(recordsXml).to.not.include('Region');
      expect(recordsXml).to.not.include('Quarter');
      expect(recordsXml).to.not.include('Amount');
    });

    it('omitting sourceRef keeps original A1 behaviour (backwards-compatible)', async () => {
      const workbook = new ExcelJS.Workbook();
      const dataSheet = workbook.addWorksheet('Data');
      dataSheet.addRows([
        ['Region', 'Quarter', 'Amount'],
        ['North', 'Q1', 100],
        ['South', 'Q1', 200],
      ]);
      const pivotSheet = workbook.addWorksheet('Pivot');
      pivotSheet.addPivotTable({
        sourceSheet: dataSheet,
        rows: ['Region'],
        columns: ['Quarter'],
        values: ['Amount'],
        metric: 'sum',
      });

      const zip = await writeAndReadZip(workbook);
      const cacheDefXml = await xmlOf(zip, 'xl/pivotCache/pivotCacheDefinition1.xml');

      // Without sourceRef the ref must start at A1.
      expect(cacheDefXml).to.include('ref="A1:');
    });

    it('throws a descriptive error for an invalid sourceRef string', () => {
      const workbook = new ExcelJS.Workbook();
      const dataSheet = workbook.addWorksheet('Data');
      dataSheet.addRows([
        ['Region', 'Amount'],
        ['North', 100],
      ]);
      const pivotSheet = workbook.addWorksheet('Pivot');

      expect(() => {
        pivotSheet.addPivotTable({
          sourceSheet: dataSheet,
          sourceRef: 'not-a-ref',
          rows: ['Region'],
          columns: ['Region'],
          values: ['Amount'],
          metric: 'sum',
        });
      }).to.throw(/Invalid sourceRef/);
    });
  });
});
