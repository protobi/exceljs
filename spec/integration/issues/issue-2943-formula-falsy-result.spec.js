const ExcelJS = verquire('exceljs');

// Regression test for exceljs/exceljs#2943.
// Copying a formula cell whose cached result is a falsy value (0, false, '')
// previously dropped the `result` field because `_copyModel` used a truthy
// check (`if (value)`).

describe('github issue 2943 - copy formula cell with falsy result', () => {
  it('preserves result === 0 when copying formula cell value', () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('s');
    ws.getCell('A1').value = 5;
    ws.getCell('B1').value = {formula: 'A1-A1', result: 0};

    ws.getCell('C1').value = ws.getCell('B1').value;

    expect(ws.getCell('C1').value).to.deep.equal({
      formula: 'A1-A1',
      result: 0,
    });
    expect(ws.getCell('C1').value.result).to.equal(0);
  });

  it('preserves result === false when copying formula cell value', () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('s');
    ws.getCell('B1').value = {formula: 'FALSE()', result: false};

    ws.getCell('C1').value = ws.getCell('B1').value;

    expect(ws.getCell('C1').value).to.deep.equal({
      formula: 'FALSE()',
      result: false,
    });
    expect(ws.getCell('C1').value.result).to.equal(false);
  });

  it('preserves result === "" when copying formula cell value', () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('s');
    ws.getCell('B1').value = {formula: '""', result: ''};

    ws.getCell('C1').value = ws.getCell('B1').value;

    expect(ws.getCell('C1').value).to.deep.equal({
      formula: '""',
      result: '',
    });
    expect(ws.getCell('C1').value.result).to.equal('');
  });

  it('preserves result === 0 across xlsx round-trip', async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('s');
    ws.getCell('A1').value = 5;
    ws.getCell('B1').value = {formula: 'A1-A1', result: 0};

    const buffer = await wb.xlsx.writeBuffer();
    const wb2 = new ExcelJS.Workbook();
    await wb2.xlsx.load(buffer);

    expect(wb2.getWorksheet('s').getCell('B1').value).to.deep.equal({
      formula: 'A1-A1',
      result: 0,
    });
  });

  it('preserves result === false across xlsx round-trip', async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('s');
    ws.getCell('B1').value = {formula: 'FALSE()', result: false};

    const buffer = await wb.xlsx.writeBuffer();
    const wb2 = new ExcelJS.Workbook();
    await wb2.xlsx.load(buffer);

    expect(wb2.getWorksheet('s').getCell('B1').value).to.deep.equal({
      formula: 'FALSE()',
      result: false,
    });
  });

  it('preserves result === "" across xlsx round-trip', async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('s');
    ws.getCell('B1').value = {formula: '""', result: ''};

    const buffer = await wb.xlsx.writeBuffer();
    const wb2 = new ExcelJS.Workbook();
    await wb2.xlsx.load(buffer);

    expect(wb2.getWorksheet('s').getCell('B1').value).to.deep.equal({
      formula: '""',
      result: '',
    });
  });

  it('toCsvString returns "0" for falsy numeric result', () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('s');
    const cell = ws.getCell('B1');
    cell.value = {formula: 'A1-A1', result: 0};

    expect(cell.toCsvString()).to.equal('0');
  });

  it('toString returns "0" for falsy numeric result', () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('s');
    const cell = ws.getCell('B1');
    cell.value = {formula: 'A1-A1', result: 0};

    expect(cell.toString()).to.equal('0');
  });

  it('toCsvString returns "false" for boolean false result', () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('s');
    const cell = ws.getCell('B1');
    cell.value = {formula: 'FALSE()', result: false};

    expect(cell.toCsvString()).to.equal('false');
  });
});
