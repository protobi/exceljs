// --------------------------------------------------
// Test round-trip for pivot tables and charts
// Reproduces issue from https://github.com/cjnoname/excelts/issues/41
// --------------------------------------------------
/* eslint-disable */

async function main(inputPath, outputPath) {
  const Excel = require('../lib/exceljs.nodejs.js');
  const fs = require('fs');

  console.log('Reading:', inputPath);
  const workbook = new Excel.Workbook();

  try {
    await workbook.xlsx.readFile(inputPath);
    console.log('Read successfully');
    console.log('Worksheets:', workbook.worksheets.map(ws => ws.name).join(', '));

    // Check for pivot tables
    let pivotCount = 0;
    workbook.worksheets.forEach(ws => {
      if (ws.pivotTables && ws.pivotTables.length > 0) {
        pivotCount += ws.pivotTables.length;
        console.log(`  Sheet "${ws.name}" has ${ws.pivotTables.length} pivot table(s)`);
      }
    });
    console.log(`Total pivot tables found: ${pivotCount}`);

    console.log('\nWriting to:', outputPath);
    await workbook.xlsx.writeFile(outputPath);
    console.log('Write successfully');

    // Verify the output file was created
    const stats = fs.statSync(outputPath);
    console.log('Output file size:', stats.size, 'bytes');

    console.log('\nRound-trip complete. Try opening the output file in Excel.');

  } catch (error) {
    console.error('Error during round-trip:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

const [, , inputPath, outputPath] = process.argv;

if (!inputPath || !outputPath) {
  console.error('Usage: node test-roundtrip-pivot.js <input.xlsx> <output.xlsx>');
  process.exit(1);
}

main(inputPath, outputPath);
