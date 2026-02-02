const BaseXform = require('../base-xform');

const VmlAnchorXform = require('./vml-anchor-xform');
const VmlProtectionXform = require('./style/vml-protection-xform');
const VmlPositionXform = require('./style/vml-position-xform');

const POSITION_TYPE = ['twoCells', 'oneCells', 'absolute'];

class VmlClientDataXform extends BaseXform {
  constructor() {
    super();
    // SAX parser strips 'x:' prefix from Excel namespace elements
    this.map = {
      Anchor: new VmlAnchorXform(),
      Locked: new VmlProtectionXform({tag: 'Locked'}),
      LockText: new VmlProtectionXform({tag: 'LockText'}),
      SizeWithCells: new VmlPositionXform({tag: 'SizeWithCells'}),
      MoveWithCells: new VmlPositionXform({tag: 'MoveWithCells'}),
    };
  }

  get tag() {
    return 'ClientData'; // SAX parser strips 'x:' prefix
  }

  render(xmlStream, model) {
    const {protection, editAs} = model.note;
    xmlStream.openNode('x:ClientData', {ObjectType: 'Note'}); // Write with prefix
    this.map.MoveWithCells.render(xmlStream, editAs, POSITION_TYPE);
    this.map.SizeWithCells.render(xmlStream, editAs, POSITION_TYPE);
    this.map.Anchor.render(xmlStream, model);
    this.map.Locked.render(xmlStream, protection.locked);
    xmlStream.leafNode('x:AutoFill', null, 'False');
    this.map.LockText.render(xmlStream, protection.lockText);
    xmlStream.leafNode('x:Row', null, model.refAddress.row - 1);
    xmlStream.leafNode('x:Column', null, model.refAddress.col - 1);
    xmlStream.closeNode();
  }

  parseOpen(node) {
    switch (node.name) {
      case this.tag:
        this.reset();
        this.model = {
          anchor: [],
          protection: {},
          editAs: '',
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
        this.parser = undefined;
      }
      return true;
    }
    switch (name) {
      case this.tag:
        this.normalizeModel();
        return false;
      default:
        return true;
    }
  }

  normalizeModel() {
    const position = Object.assign({}, this.map.MoveWithCells.model, this.map.SizeWithCells.model);
    const len = Object.keys(position).length;
    this.model.editAs = POSITION_TYPE[len];
    this.model.anchor = this.map.Anchor.text;
    this.model.protection.locked = this.map.Locked.text;
    this.model.protection.lockText = this.map.LockText.text;
  }
}

module.exports = VmlClientDataXform;
