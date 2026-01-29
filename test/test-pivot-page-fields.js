// Test pivot table page fields (report filters)
// Last updated: 2026-01-29

/* eslint-disable */

function main(filepath) {
  const Excel = require('../lib/exceljs.nodejs.js');

  const workbook = new Excel.Workbook();

  // Create source data with 'latest' flag
  const sourceSheet = workbook.addWorksheet('Data');
  sourceSheet.addRows([
    ['Region', 'Product', 'Quarter', 'Sales', 'latest'],
    ['East', 'Widget A', 'Q1', 1000, 1],
    ['East', 'Widget A', 'Q2', 1200, 0],
    ['East', 'Widget B', 'Q1', 800, 1],
    ['West', 'Widget A', 'Q1', 1500, 1],
    ['West', 'Widget B', 'Q2', 2000, 1],
    ['West', 'Widget B', 'Q3', 1800, 0],
  ]);

  // Test 1: Pivot table with single page field and default value
  const pivotSheet1 = workbook.addWorksheet('Pivot - Latest Only');
  pivotSheet1.addPivotTable({
    sourceSheet: sourceSheet,
    rows: ['Region'],
    columns: ['Quarter'],
    values: ['Sales'],
    pages: ['latest'],
    pageDefaults: {latest: 1}, // Default to showing only latest=1
    metric: 'sum',
  });

  // Test 2: Pivot table with page field but no default (show all)
  const pivotSheet2 = workbook.addWorksheet('Pivot - All Data');
  pivotSheet2.addPivotTable({
    sourceSheet: sourceSheet,
    rows: ['Region', 'Product'],
    columns: ['Quarter'],
    values: ['Sales'],
    pages: ['latest'], // Page field without default
    metric: 'sum',
  });

  // Test 3: Pivot table with multiple page fields
  const sourceSheet2 = workbook.addWorksheet('Data2');
  sourceSheet2.addRows([
    ['Region', 'Product', 'Quarter', 'Sales', 'latest', 'status'],
    ['East', 'Widget A', 'Q1', 1000, 1, 'active'],
    ['East', 'Widget A', 'Q2', 1200, 0, 'active'],
    ['East', 'Widget B', 'Q1', 800, 1, 'inactive'],
    ['West', 'Widget A', 'Q1', 1500, 1, 'active'],
    ['West', 'Widget B', 'Q2', 2000, 1, 'active'],
    ['West', 'Widget B', 'Q3', 1800, 0, 'inactive'],
  ]);

  const pivotSheet3 = workbook.addWorksheet('Pivot - Multiple Pages');
  pivotSheet3.addPivotTable({
    sourceSheet: sourceSheet2,
    rows: ['Region'],
    columns: ['Quarter'],
    values: ['Sales'],
    pages: ['latest', 'status'],
    pageDefaults: {latest: 1, status: 'active'},
    metric: 'sum',
  });

  // Test 4: Backward compatibility - pivot table without page fields
  const pivotSheet4 = workbook.addWorksheet('Pivot - No Pages');
  pivotSheet4.addPivotTable({
    sourceSheet: sourceSheet,
    rows: ['Region'],
    columns: ['Quarter'],
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
  });
}

const [, , filepath] = process.argv;
main(filepath);
