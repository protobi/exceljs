const XmlStream = require('../../../utils/xml-stream');
const BaseXform = require('../base-xform');

/**
 * Control Properties Xform - Generates ctrlProp*.xml for form controls
 *
 * Each form control (checkbox, button, etc.) has an associated ctrlProp file
 * that stores its properties like objectType, checked state, and linked cell.
 */
class CtrlPropXform extends BaseXform {
  _checkedToXmlValue(checked) {
    switch (checked) {
      case 'Checked':
        return '1';
      case 'Mixed':
        return '2';
      case 'Unchecked':
      default:
        return '0';
    }
  }

  get tag() {
    return 'formControlPr';
  }

  render(xmlStream, model) {
    const attrs = {
      xmlns: 'http://schemas.microsoft.com/office/spreadsheetml/2009/9/main',
      objectType: 'CheckBox',
      // Excel tends to serialize this as numeric state (0/1/2), matching VML x:Checked.
      checked: this._checkedToXmlValue(model.checked),
      lockText: '1',
    };

    // Add linked cell reference
    if (model.link) {
      attrs.fmlaLink = model.link;
    }

    // Add noThreeD for flat appearance
    if (model.noThreeD) {
      attrs.noThreeD = '1';
    }

    xmlStream.openXml({version: '1.0', encoding: 'UTF-8', standalone: 'yes'});
    xmlStream.leafNode(this.tag, attrs);
  }

  /**
   * Generate XML string directly (convenience method)
   * Uses render() internally to ensure consistency
   */
  toXml(model) {
    const xmlStream = new XmlStream();
    this.render(xmlStream, model);
    return xmlStream.xml;
  }

  // Parsing not implemented - form controls are write-only for now
  parseOpen() {
    return true;
  }

  parseText() {
    // Not implemented
  }

  parseClose() {
    return false;
  }
}

module.exports = CtrlPropXform;
