const _ = require('../../../utils/under-dash');
const BaseXform = require('../base-xform');

class SheetFormatPropertiesXform extends BaseXform {
  get tag() {
    return 'sheetFormatPr';
  }

  render(xmlStream, model) {
    if (model) {
      const attributes = {
        defaultRowHeight: model.defaultRowHeight,
        'x14ac:dyDescent': model.dyDescent,
      };
      if (model.defaultColWidth) {
        attributes.defaultColWidth = model.defaultColWidth;
      }
      if (model.outlineLevelRow) {
        attributes.outlineLevelRow = model.outlineLevelRow;
      }
      if (model.outlineLevelCol) {
        attributes.outlineLevelCol = model.outlineLevelCol;
      }

      // Handle customHeight: preserve from original, or auto-calculate for new workbooks
      if (model.customHeight !== undefined) {
        // Value was read from file, preserve it
        if (model.customHeight) {
          attributes.customHeight = model.customHeight;
        }
      } else if (!model.defaultRowHeight || model.defaultRowHeight !== 15) {
        // Not read from file, use original logic for new workbooks
        // default value for 'defaultRowHeight' is 15, this should not be 'custom'
        attributes.customHeight = '1';
      }

      if (_.some(attributes, value => value !== undefined)) {
        xmlStream.leafNode('sheetFormatPr', attributes);
      }
    }
  }

  parseOpen(node) {
    if (node.name === 'sheetFormatPr') {
      this.model = {
        defaultRowHeight: parseFloat(node.attributes.defaultRowHeight || '0'),
        dyDescent: parseFloat(node.attributes['x14ac:dyDescent'] || '0'),
        outlineLevelRow: parseInt(node.attributes.outlineLevelRow || '0', 10),
        outlineLevelCol: parseInt(node.attributes.outlineLevelCol || '0', 10),
        customHeight: node.attributes.customHeight,
      };
      if (node.attributes.defaultColWidth) {
        this.model.defaultColWidth = parseFloat(node.attributes.defaultColWidth);
      }
      return true;
    }
    return false;
  }

  parseText() {}

  parseClose() {
    return false;
  }
}

module.exports = SheetFormatPropertiesXform;
