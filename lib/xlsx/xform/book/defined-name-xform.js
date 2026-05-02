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
  // A defined-name value that contains '(' is a formula expression (e.g. LAMBDA, LET, OFFSET),
  // never a valid range address list.  Return early so the caller can preserve it verbatim.
  if (parsedText.includes('(')) {
    return [];
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
