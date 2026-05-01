const {objectFromProps, range, toSortedArray} = require('../utils/utils');

// TK(2023-10-10): turn this into a class constructor.

// IMPORTANT: Pivot tables are NOT supported with streaming API (WorkbookWriter)
//
// Pivot tables require reading ALL source data to generate the pivot cache,
// which conflicts with streaming's one-pass write model. Excel requires complete
// pivot cache data (all unique values and all data rows) at file creation time.
//
// For large datasets, use the standard (non-streaming) Workbook API with pivot tables.

function makePivotTable(worksheet, model) {
  // Example `model`:
  // {
  //   // Source of data: the entire sheet range is taken,
  //   // akin to `worksheet1.getSheetValues()`.
  //   sourceSheet: worksheet1,
  //
  //   // Pivot table fields: values indicate field names;
  //   // they come from the first row in `worksheet1`.
  //   rows: ['A', 'B'],
  //   columns: ['C'],
  //   values: ['E'], // only 1 item possible for now
  //   pages: ['F'], // optional: page fields (report filters)
  //   pageDefaults: { F: 'value' }, // optional: default filter values
  //   metric: 'sum', 'count' // only 'sum' and 'count' are possible for now
  // }

  validate(worksheet, model);

  const {sourceSheet} = model;
  let {rows, columns, values, pages = []} = model;
  const {metric, pageDefaults = {}} = model;

  // Generate sharedItems only for fields used as pivot axes (rows, columns, pages).
  // Value fields and unused fields use lightweight sharedItems (no enumeration) — Excel
  // flags pivot caches that materialize sharedItems for unused/long-text fields with a
  // "Repaired Records: PivotTable report from /xl/pivotCache/pivotCacheDefinition*.xml"
  // warning on open (see protobi/exceljs#42).
  const allHeaderNames = sourceSheet.getRow(1).values.slice(1);
  const axialFieldNames = [...rows, ...columns, ...pages];
  const cacheFields = makeCacheFields(sourceSheet, axialFieldNames, allHeaderNames);

  // let {rows, columns, values, pages} use indices instead of names;
  // names can then be accessed via `pivotTable.cacheFields[index].name`.
  // *Note*: Using `reduce` as `Object.fromEntries` requires Node 12+;
  // ExcelJS is >=8.3.0 (as of 2023-10-08).
  const nameToIndex = cacheFields.reduce((result, cacheField, index) => {
    result[cacheField.name] = index;
    return result;
  }, {});
  rows = rows.map(row => nameToIndex[row]);
  columns = columns.map(column => nameToIndex[column]);
  values = values.map(value => nameToIndex[value]);
  pages = pages.map(page => nameToIndex[page]);

  // Generate unique cache ID based on the number of existing pivot tables
  // Each pivot table gets its own cache ID (starting from 10)
  const cacheId = String(10 + worksheet.workbook.pivotTables.length);

  // Convert pageDefaults from field names to indices with item indices
  const pageDefaultsIndices = {};
  for (const [fieldName, defaultValue] of Object.entries(pageDefaults)) {
    const fieldIndex = nameToIndex[fieldName];
    if (fieldIndex !== undefined) {
      const cacheField = cacheFields[fieldIndex];
      if (cacheField.sharedItems) {
        // Find the item index for the default value
        const itemIndex = cacheField.sharedItems.findIndex(item => item === defaultValue);
        if (itemIndex >= 0) {
          pageDefaultsIndices[fieldIndex] = itemIndex;
        }
      }
    }
  }

  // form pivot table object
  return {
    sourceSheet,
    rows,
    columns,
    values,
    pages,
    pageDefaults: pageDefaultsIndices,
    metric,
    cacheFields,
    // defined in <pivotTableDefinition> of xl/pivotTables/pivotTableN.xml;
    // also used in xl/workbook.xml
    cacheId,
    // Control whether pivot table style overrides worksheet column widths
    // '0' = preserve worksheet column widths (useful for custom sizing)
    // '1' = apply pivot table style width/height (default Excel behavior)
    applyWidthHeightFormats:
      model.applyWidthHeightFormats !== undefined ? model.applyWidthHeightFormats : '1',
  };
}

function validate(worksheet, model) {
  // Note: Multiple pivot tables are now supported

  if (model.metric && model.metric !== 'sum' && model.metric !== 'count') {
    throw new Error('Only the "sum" and "count" metric is supported at this time.');
  }

  const headerNames = model.sourceSheet.getRow(1).values.slice(1);
  const isInHeaderNames = objectFromProps(headerNames, true);
  const pages = model.pages || [];
  for (const name of [...model.rows, ...model.columns, ...model.values, ...pages]) {
    if (!isInHeaderNames[name]) {
      throw new Error(`The header name "${name}" was not found in ${model.sourceSheet.name}.`);
    }
  }

  if (!model.rows.length) {
    throw new Error('No pivot table rows specified.');
  }

  if (!model.columns.length) {
    throw new Error('No pivot table columns specified.');
  }

  if (model.values.length !== 1) {
    throw new Error('Exactly 1 value needs to be specified at this time.');
  }

  // Validate page fields don't overlap with rows/columns/values
  const allFields = [...model.rows, ...model.columns, ...model.values];
  for (const pageField of pages) {
    if (allFields.includes(pageField)) {
      const msg = `Page field "${pageField}" cannot also be used as a row, column, or value field.`;
      throw new Error(msg);
    }
  }

  // Validate pageDefaults reference valid page fields and values
  if (model.pageDefaults) {
    for (const fieldName of Object.keys(model.pageDefaults)) {
      if (!pages.includes(fieldName)) {
        throw new Error(`pageDefaults field "${fieldName}" is not in the pages array.`);
      }
    }
  }
}

function makeCacheFields(worksheet, fieldNamesWithSharedItems, allFieldNames /* reserved */) {
  // `allFieldNames` is reserved for future use; iteration uses worksheet.getRow(1)
  // Cache fields are used in pivot tables to reference source data.
  //
  // Example
  // -------
  // Turn
  //
  //  `worksheet` sheet values [
  //    ['A', 'B', 'C', 'D', 'E'],
  //    ['a1', 'b1', 'c1', 4, 5],
  //    ['a1', 'b2', 'c1', 4, 5],
  //    ['a2', 'b1', 'c2', 14, 24],
  //    ['a2', 'b2', 'c2', 24, 35],
  //    ['a3', 'b1', 'c3', 34, 45],
  //    ['a3', 'b2', 'c3', 44, 45]
  //  ];
  //  fieldNamesWithSharedItems = ['A', 'B', 'C'];
  //
  // into
  //
  //  [
  //    { name: 'A', sharedItems: ['a1', 'a2', 'a3'] },
  //    { name: 'B', sharedItems: ['b1', 'b2'] },
  //    { name: 'C', sharedItems: ['c1', 'c2', 'c3'] },
  //    { name: 'D', sharedItems: null },
  //    { name: 'E', sharedItems: null }
  //  ]

  const names = worksheet.getRow(1).values;
  const nameToHasSharedItems = objectFromProps(fieldNamesWithSharedItems, true);

  const aggregate = columnIndex => {
    const columnValues = worksheet.getColumn(columnIndex).values.slice(2);

    // Deduplicate case-insensitively for Excel compatibility
    // Excel treats pivot table values as case-insensitive, so "Apple" and "apple"
    // are considered the same value. We keep the first occurrence of each case-insensitive variant.
    const seen = new Map(); // lowercase -> first occurrence
    const uniqueValues = [];

    for (const value of columnValues) {
      if (value === null || value === undefined) continue;

      const key = typeof value === 'string' ? value.toLowerCase() : value;
      if (!seen.has(key)) {
        seen.set(key, value);
        uniqueValues.push(value);
      }
    }

    return toSortedArray(uniqueValues);
  };

  // Inspect a column's body values to derive lightweight sharedItems hints
  // (containsBlank / containsString / containsNumber / longText) WITHOUT enumerating
  // every unique value. Used for fields that aren't pivot axes — Excel can rebuild
  // the index on refresh from the inline values written into pivotCacheRecords.
  const inspect = columnIndex => {
    const columnValues = worksheet.getColumn(columnIndex).values.slice(2);
    const hints = {
      containsBlank: false,
      containsString: false,
      containsNumber: false,
      containsInteger: true, // assume true until proven false
      hasNumber: false,
      longText: false,
    };
    for (const value of columnValues) {
      if (value === null || value === undefined) {
        hints.containsBlank = true;
        continue;
      }
      if (typeof value === 'number') {
        hints.containsNumber = true;
        hints.hasNumber = true;
        if (!Number.isInteger(value)) hints.containsInteger = false;
      } else if (typeof value === 'string') {
        hints.containsString = true;
        if (value.length > 255) hints.longText = true;
      } else {
        // fallback for dates/booleans/etc — treat as string-ish
        hints.containsString = true;
      }
    }
    if (!hints.hasNumber) hints.containsInteger = false;
    return hints;
  };

  // make result
  const result = [];
  for (const columnIndex of range(1, names.length)) {
    const name = names[columnIndex];
    let sharedItems;
    if (nameToHasSharedItems[name]) {
      // Axial field — needs full enumeration so pivotCacheRecords can reference
      // values via <x v="N"/> indices.
      sharedItems = aggregate(columnIndex);
    } else {
      // Non-axial field — emit lightweight sharedItems (type hints only).
      // pivotCacheRecords will inline values rather than reference indices.
      sharedItems = null;
    }
    const cacheField = {name, sharedItems};
    if (sharedItems === null) {
      cacheField.hints = inspect(columnIndex);
    }
    result.push(cacheField);
  }
  return result;
}

module.exports = {makePivotTable};
