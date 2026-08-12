const XmlStream = require('../../../utils/xml-stream');

const BaseXform = require('../base-xform');
const VmlShapeXform = require('./vml-shape-xform');
const FormCheckbox = require('../../../doc/form-checkbox');

// Unified VML Drawing Xform - Combines Notes (comments) and Form Controls
// Excel uses a single VML file per worksheet that can contain:
// - Comment/note shapes (shapetype 202)
// - Form control shapes (checkbox shapetype 201, etc.)
class VmlNotesXform extends BaseXform {
  constructor() {
    super();
    this.map = {
      'v:shape': new VmlShapeXform(),
    };
  }

  get tag() {
    return 'xml';
  }

  render(xmlStream, model) {
    const hasComments = model.comments && model.comments.length > 0;
    const hasFormControls = model.formControls && model.formControls.length > 0;

    xmlStream.openXml(XmlStream.StdDocAttributes);
    xmlStream.openNode(this.tag, VmlNotesXform.DRAWING_ATTRIBUTES);

    // Shape layout - shared by both notes and form controls
    xmlStream.openNode('o:shapelayout', {'v:ext': 'edit'});
    xmlStream.leafNode('o:idmap', {'v:ext': 'edit', data: 1});
    xmlStream.closeNode();

    // Shapetype 202 for notes/comments
    if (hasComments) {
      xmlStream.openNode('v:shapetype', {
        id: '_x0000_t202',
        coordsize: '21600,21600',
        'o:spt': 202,
        path: 'm,l,21600r21600,l21600,xe',
      });
      xmlStream.leafNode('v:stroke', {joinstyle: 'miter'});
      xmlStream.leafNode('v:path', {gradientshapeok: 't', 'o:connecttype': 'rect'});
      xmlStream.closeNode();
    }

    // Shapetype 201 for form control checkboxes
    if (hasFormControls) {
      xmlStream.openNode('v:shapetype', {
        id: '_x0000_t201',
        coordsize: '21600,21600',
        'o:spt': '201',
        path: 'm,l,21600r21600,l21600,xe',
      });
      xmlStream.leafNode('v:stroke', {joinstyle: 'miter'});
      xmlStream.leafNode('v:path', {
        shadowok: 'f',
        'o:extrusionok': 'f',
        strokeok: 'f',
        fillok: 'f',
        'o:connecttype': 'rect',
      });
      xmlStream.leafNode('o:lock', {'v:ext': 'edit', shapetype: 't'});
      xmlStream.closeNode();
    }

    // Render comment shapes
    if (hasComments) {
      model.comments.forEach((item, index) => {
        this.map['v:shape'].render(xmlStream, item, index);
      });
    }

    // Render form control shapes
    if (hasFormControls) {
      model.formControls.forEach(control => {
        this._renderCheckboxShape(xmlStream, control);
      });
    }

    xmlStream.closeNode();
  }

  /**
   * Render a checkbox form control shape
   */
  _renderCheckboxShape(xmlStream, control) {
    const shapeAttrs = {
      id: `_x0000_s${control.shapeId}`,
      type: '#_x0000_t201',
      style: FormCheckbox.getVmlStyle(control),
      'o:insetmode': 'auto',
      fillcolor: 'buttonFace [67]',
      strokecolor: 'windowText [64]',
      'o:preferrelative': 't',
      filled: 'f',
      stroked: 'f',
    };

    xmlStream.openNode('v:shape', shapeAttrs);

    // Fill element
    xmlStream.leafNode('v:fill', {'o:detectmouseclick': 't'});

    // Lock element
    xmlStream.leafNode('o:lock', {'v:ext': 'edit', text: 't'});

    // Textbox for label
    if (control.text) {
      xmlStream.openNode('v:textbox', {
        style: 'mso-direction-alt:auto',
        'o:singleclick': 't',
      });
      xmlStream.openNode('div', {style: 'text-align:left'});
      xmlStream.openNode('font', {face: 'Tahoma', size: '160', color: 'auto'});
      xmlStream.writeText(control.text);
      xmlStream.closeNode(); // font
      xmlStream.closeNode(); // div
      xmlStream.closeNode(); // v:textbox
    }

    // ClientData - the core of the checkbox control
    xmlStream.openNode('x:ClientData', {ObjectType: 'Checkbox'});

    // Anchor position
    xmlStream.openNode('x:Anchor');
    xmlStream.writeText(FormCheckbox.getVmlAnchor(control));
    xmlStream.closeNode();

    // Print settings
    xmlStream.leafNode('x:PrintObject', undefined, control.print ? 'True' : 'False');
    xmlStream.leafNode('x:AutoFill', undefined, 'False');
    xmlStream.leafNode('x:AutoLine', undefined, 'False');
    xmlStream.leafNode('x:TextVAlign', undefined, 'Center');

    // Linked cell
    if (control.link) {
      xmlStream.leafNode('x:FmlaLink', undefined, control.link);
    }

    // 3D appearance
    if (control.noThreeD) {
      xmlStream.leafNode('x:NoThreeD');
    }

    // Checked state (0 = unchecked, 1 = checked, 2 = mixed)
    xmlStream.leafNode('x:Checked', undefined, String(FormCheckbox.getVmlCheckedValue(control)));

    xmlStream.closeNode(); // x:ClientData
    xmlStream.closeNode(); // v:shape
  }

  parseOpen(node) {
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }
    switch (node.name) {
      case this.tag:
        this.reset();
        this.model = {
          comments: [],
          formControls: [],
        };
        break;
      default:
        this.parser = this.map[node.name];
        if (this.parser) {
          this.parser.parseOpen(node);
        }
        break;
    }
    return true;
  }

  parseText(text) {
    if (this.parser) {
      this.parser.parseText(text);
    }
  }

  parseClose(name) {
    if (this.parser) {
      if (!this.parser.parseClose(name)) {
        this.model.comments.push(this.parser.model);
        this.parser = undefined;
      }
      return true;
    }
    switch (name) {
      case this.tag:
        return false;
      default:
        // could be some unrecognised tags
        return true;
    }
  }

  reconcile(model, options) {
    model.anchors.forEach(anchor => {
      if (anchor.br) {
        this.map['xdr:twoCellAnchor'].reconcile(anchor, options);
      } else {
        this.map['xdr:oneCellAnchor'].reconcile(anchor, options);
      }
    });
  }
}

VmlNotesXform.DRAWING_ATTRIBUTES = {
  'xmlns:v': 'urn:schemas-microsoft-com:vml',
  'xmlns:o': 'urn:schemas-microsoft-com:office:office',
  'xmlns:x': 'urn:schemas-microsoft-com:office:excel',
};

module.exports = VmlNotesXform;
