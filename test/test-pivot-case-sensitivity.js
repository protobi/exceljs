// --------------------------------------------------
// Test for case-sensitivity bug fix in pivot tables
// https://github.com/protobi/exceljs/issues/1
//
// Excel treats pivot table values as case-insensitive,
// so "Apple", "apple", and "APPLE" should be treated
// as the same value to prevent file corruption.
// --------------------------------------------------
/* eslint-disable */

function main(filepath) {
  const Excel = require('../lib/exceljs.nodejs.js');

  const workbook = new Excel.Workbook();

  // Create source data with case-sensitive variants
  const worksheet1 = workbook.addWorksheet('SourceData');
  worksheet1.addRows([
    ['Product', 'Region', 'Sales'],
    ['Apple', 'North', 100], // First occurrence: "Apple"
    ['apple', 'South', 200], // Same as "Apple" (case-insensitive)
    ['APPLE', 'East', 150], // Same as "Apple" (case-insensitive)
    ['Apple', 'West', 300], // Same as "Apple" (case-insensitive)
    ['Banana', 'North', 50], // Different product
    ['banana', 'South', 75], // Same as "Banana" (case-insensitive)
    ['Orange', 'East', 120], // Different product
  ]);

  // Create pivot table - should not cause Excel corruption
  const worksheet2 = workbook.addWorksheet('PivotTable');
  worksheet2.addPivotTable({
    sourceSheet: worksheet1,
    rows: ['Product'],
    columns: ['Region'],
    values: ['Sales'],
    metric: 'sum',
  });

  save(workbook, filepath);
}

function save(workbook, filepath) {
  const HrStopwatch = require('./utils/hr-stopwatch');
  const stopwatch = new HrStopwatch();
  stopwatch.start();

  workbook.xlsx.writeFile(filepath).then(() => {
    const microseconds = stopwatch.microseconds;
    console.log('Done.');
    console.log('Time taken:', microseconds);

    // Verify the fix by checking the generated XML
    const JSZip = require('jszip');
    const fs = require('fs');

    fs.readFile(filepath, (err, data) => {
      if (err) throw err;

      JSZip.loadAsync(data)
        .then(zip => {
          return zip
            .file('xl/pivotCache/pivotCacheDefinition1.xml')
            .async('string');
        })
        .then(xml => {
          console.log('\n--- Verification ---');

          // Check that Product field has only 3 unique values (Apple, Banana, Orange)
          // not 5 (Apple, apple, APPLE, Banana, banana)
          const productMatch = xml.match(
            /<cacheField name="Product"[^>]*>[\s\S]*?<sharedItems count="(\d+)">/
          );
          if (productMatch) {
            const count = parseInt(productMatch[1]);
            console.log(`Product sharedItems count: ${count}`);

            if (count === 3) {
              console.log(
                '✓ PASS: Case-insensitive deduplication working correctly'
              );
              console.log(
                '  Expected 3 unique products (Apple, Banana, Orange)'
              );
              console.log('  Case variants properly deduplicated');
            } else {
              console.log(
                `✗ FAIL: Expected 3 unique products but found ${count}`
              );
              process.exit(1);
            }
          }

          // Extract the actual shared items
          const itemsMatch = xml.match(
            /<cacheField name="Product"[^>]*>[\s\S]*?<sharedItems[^>]*>([\s\S]*?)<\/sharedItems>/
          );
          if (itemsMatch) {
            const items = itemsMatch[1].match(/v="([^"]+)"/g);
            if (items) {
              console.log(
                '  Shared items:',
                items.map(i => i.match(/v="([^"]+)"/)[1]).join(', ')
              );
            }
          }
        });
    });
  });
}

const [, , filepath] = process.argv;
main(filepath);
