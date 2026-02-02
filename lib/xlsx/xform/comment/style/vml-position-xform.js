const BaseXform = require('../../base-xform');

class VmlPositionXform extends BaseXform {
  constructor(model) {
    super();
    this._model = model;
  }

  get tag() {
    return this._model && this._model.tag;
  }

  render(xmlStream, model, type) {
    if (model === type[2]) {
      xmlStream.leafNode(`x:${this.tag}`);
    } else if (this.tag === 'SizeWithCells' && model === type[1]) {
      xmlStream.leafNode(`x:${this.tag}`);
    }
  }

  parseOpen(node) {
    switch (node.name) {
      case this.tag:
        this.model = {};
        this.model[this.tag] = true;
        return true;
      default:
        return false;
    }
  }

  parseText() {}

  parseClose() {
    return false;
  }
}

module.exports = VmlPositionXform;
