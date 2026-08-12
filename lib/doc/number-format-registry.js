const NumFmtXform = require('../xlsx/xform/style/numfmt-xform');
const NumberFormatLimitError = require('../utils/number-format-limit-error');

// custom numfmt ids start at 164; ids below are reserved for built-in formats
const NUMFMT_BASE = 164;

// Default maximum number of *custom* number formats per workbook. Excel's documented
// limit is "between 200 and 250 depending on the language version"; 206 is the largest
// count verified to open without triggering Excel's repair prompt. Override with the
// Workbook `numFmtLimit` option.
const DEFAULT_NUMFMT_LIMIT = 206;

// Registry of custom number formats for a workbook. Gets-or-creates an id for a format
// code, keeps an index, and throws once the limit is reached. Built-in (default) formats
// are free and never count against the limit. A registry can be seeded with formats that
// already exist in a loaded workbook so the remaining budget reflects reality.
class NumberFormatRegistry {
  constructor(options) {
    options = options || {};
    this.limit = options.limit !== undefined ? options.limit : DEFAULT_NUMFMT_LIMIT;
    // formatCode -> numFmtId
    this.index = {};
    // ordered list of custom format codes (its length is the custom-format count)
    this.formatCodes = [];
  }

  // number of custom formats registered so far
  get count() {
    return this.formatCodes.length;
  }

  // remaining custom-format budget (never negative)
  get remaining() {
    return Math.max(0, this.limit - this.formatCodes.length);
  }

  // true if the code already resolves without consuming budget (built-in or registered)
  has(formatCode) {
    return (
      NumFmtXform.getDefaultFmtId(formatCode) !== undefined || this.index[formatCode] !== undefined
    );
  }

  // register codes that already exist (e.g. from a loaded template) without enforcing the
  // limit - what is already in the file cannot be rejected
  seed(formatCodes) {
    (formatCodes || []).forEach(formatCode => {
      this._register(formatCode);
    });
  }

  // get-or-create the numFmtId for a format code. Built-in formats return their reserved
  // id for free. An already-registered code returns its existing id (free even when full).
  // A new custom code beyond the limit throws NumberFormatLimitError.
  getOrAdd(formatCode) {
    const builtinId = NumFmtXform.getDefaultFmtId(formatCode);
    if (builtinId !== undefined) {
      return builtinId;
    }
    const existingId = this.index[formatCode];
    if (existingId !== undefined) {
      return existingId;
    }
    if (this.formatCodes.length >= this.limit) {
      throw new NumberFormatLimitError(this.limit, formatCode);
    }
    return this._register(formatCode);
  }

  // register a custom code without limit enforcement; built-ins and duplicates are skipped
  _register(formatCode) {
    if (NumFmtXform.getDefaultFmtId(formatCode) !== undefined) {
      return NumFmtXform.getDefaultFmtId(formatCode);
    }
    if (this.index[formatCode] !== undefined) {
      return this.index[formatCode];
    }
    const id = NUMFMT_BASE + this.formatCodes.length;
    this.index[formatCode] = id;
    this.formatCodes.push(formatCode);
    return id;
  }
}

NumberFormatRegistry.DEFAULT_NUMFMT_LIMIT = DEFAULT_NUMFMT_LIMIT;

module.exports = NumberFormatRegistry;
