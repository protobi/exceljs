// Thrown when a workbook would exceed its maximum number of custom number formats.
// Excel cannot open a file with too many custom formats and offers only to "repair"
// it (silently dropping formats). Callers can catch this and fall back to a shared
// format. See Workbook#addNumberFormat and the `numFmtLimit` option.
class NumberFormatLimitError extends Error {
  constructor(limit, formatCode) {
    super(`Too many custom number formats (limit ${limit}); cannot add "${formatCode}"`);
    this.name = 'NumberFormatLimitError';
    this.limit = limit;
    this.formatCode = formatCode;
  }
}

module.exports = NumberFormatLimitError;
