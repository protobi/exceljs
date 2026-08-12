const ExcelJS = {
  Workbook: require('./doc/workbook'),
  ModelContainer: require('./doc/modelcontainer'),
  NumberFormatLimitError: require('./utils/number-format-limit-error'),
  stream: {
    xlsx: {
      WorkbookWriter: require('./stream/xlsx/workbook-writer'),
      WorkbookReader: require('./stream/xlsx/workbook-reader'),
    },
  },
};

Object.assign(ExcelJS, require('./doc/enums'));

module.exports = ExcelJS;
