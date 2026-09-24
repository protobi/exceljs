const ExcelJS = verquire('exceljs');

describe('github issues', () => {
  it('issue 93 - x14 expression conditional formatting survives write', () => {
    const wb = new ExcelJS.Workbook();
    return wb.xlsx.readFile('./spec/integration/data/test-issue-93.xlsx').then(workbook => {
      return workbook.xlsx.writeBuffer().then(buffer => {
        const reloaded = new ExcelJS.Workbook();
        return reloaded.xlsx.load(buffer).then(() => {
          const sheet = reloaded.getWorksheet('Data');
          const formulae = sheet.conditionalFormattings.flatMap(cf => cf.rules.map(rule => rule.formulae && rule.formulae[0]));
          expect(formulae).to.include('$A1=1');
        });
      });
    });
  });
});
