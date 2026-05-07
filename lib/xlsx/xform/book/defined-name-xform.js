const BaseXform = require('../base-xform');
const colCache = require('../../../utils/col-cache');

class DefinedNamesXform extends BaseXform {
  render(xmlStream, model) {
    // <definedNames>
    //   <definedName name="name">name.ranges.join(',')</definedName>
    //   <definedName name="_xlnm.Print_Area" localSheetId="0">name.ranges.join(',')</definedName>
    // </definedNames>
    xmlStream.openNode('definedName', {
      name: model.name,
      localSheetId: model.localSheetId,
    });
    // Non-range defined names (e.g. named LAMBDAs) are preserved verbatim in formula field
    xmlStream.writeText(model.formula !== undefined ? model.formula : model.ranges.join(','));
    xmlStream.closeNode();
  }

  parseOpen(node) {
    switch (node.name) {
      case 'definedName':
        this._parsedName = node.attributes.name;
        this._parsedLocalSheetId = node.attributes.localSheetId;
        this._parsedText = [];
        return true;
      default:
        return false;
    }
  }

  parseText(text) {
    this._parsedText.push(text);
  }

  parseClose() {
    const text = this._parsedText.join('');
    const ranges = extractRanges(text);
    this.model = {name: this._parsedName, ranges};
    // Preserve non-range content (e.g. LAMBDA, LET, or other formula expressions) verbatim
    if (ranges.length === 0 && text.trim().length > 0) {
      this.model.formula = text;
    }
    if (this._parsedLocalSheetId !== undefined) {
      this.model.localSheetId = parseInt(this._parsedLocalSheetId, 10);
    }
    return false;
  }
}

function isValidRange(range) {
  try {
    colCache.decodeEx(range);
    return true;
  } catch (err) {
    return false;
  }
}

function extractRanges(parsedText) {
  // A defined-name value is a formula expression (e.g. LAMBDA(x,x*2), LET, OFFSET)
  // rather than a range list when it contains a '(' that is NOT inside a single-quoted
  // sheet name. Sheet names with parentheses look like 'Data (2026)'!$A$1 — the '('
  // appears between an odd number of preceding single quotes (i.e. inside a quotation).
  // This heuristic avoids splitting LAMBDA/LET bodies whose comma-delimited tokens can
  // accidentally pass isValidRange.
  const firstParen = parsedText.indexOf('(');
  if (firstParen !== -1) {
    const singleQuotesBefore = (parsedText.slice(0, firstParen).match(/'/g) || []).length;
    // If the number of single quotes before '(' is even (including zero), the '(' is
    // outside any quoted sheet name — treat the whole value as a formula expression.
    if (singleQuotesBefore % 2 === 0) {
      return [];
    }
  }
  const ranges = [];
  let quotesOpened = false;
  let last = '';
  parsedText.split(',').forEach(item => {
    if (!item) {
      return;
    }
    const quotes = (item.match(/'/g) || []).length;

    if (!quotes) {
      if (quotesOpened) {
        last += `${item},`;
      } else if (isValidRange(item)) {
        ranges.push(item);
      }
      return;
    }
    const quotesEven = quotes % 2 === 0;

    if (!quotesOpened && quotesEven && isValidRange(item)) {
      ranges.push(item);
    } else if (quotesOpened && !quotesEven) {
      quotesOpened = false;
      if (isValidRange(last + item)) {
        ranges.push(last + item);
      }
      last = '';
    } else {
      quotesOpened = true;
      last += `${item},`;
    }
  });
  return ranges;
}

module.exports = DefinedNamesXform;
