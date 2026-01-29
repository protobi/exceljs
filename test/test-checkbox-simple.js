const ExcelJS = require('../lib/exceljs.nodejs');

async function main() {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'ExcelJS Checkbox Test';

  const ws = wb.addWorksheet('Checkboxes');

  // Header
  ws.getCell('A1').value = 'Form Control Checkbox Demo';
  ws.getCell('A1').font = {bold: true, size: 14};

  // Simple checkbox
  ws.getCell('A3').value = 'Option 1:';
  ws.addFormCheckbox('B3:C4', {
    checked: true,
    link: 'D3',
    text: 'Enable feature',
  });
  ws.getCell('D3').value = true;

  // Another checkbox
  ws.getCell('A6').value = 'Option 2:';
  ws.addFormCheckbox('B6:C7', {
    checked: false,
    link: 'D6',
    text: 'Subscribe',
  });
  ws.getCell('D6').value = false;

  // Column widths
  ws.getColumn('A').width = 15;
  ws.getColumn('B').width = 4;
  ws.getColumn('C').width = 10;
  ws.getColumn('D').width = 15;

  await wb.xlsx.writeFile('test-output-dir/checkbox-simple.xlsx');
  console.log('Created: test-output-dir/checkbox-simple.xlsx');
}

main().catch(err => {
  console.error(err);
  throw err;
});
