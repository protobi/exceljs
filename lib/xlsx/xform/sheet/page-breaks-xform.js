const BaseXform = require('../base-xform');

class PageBreaksXform extends BaseXform {
  get tag() {
    return 'brk';
  }

  render(xmlStream, model) {
    xmlStream.leafNode('brk', model);
  }

  parseOpen(node) {
    if (node.name === 'brk') {
      this.model = {};
      ['id', 'min', 'max', 'man', 'pt'].forEach(name => {
        if (node.attributes[name] !== undefined) {
          this.model[name] =
            name === 'man' || name === 'pt'
              ? Number(node.attributes[name] === '1' || node.attributes[name] === 'true')
              : parseInt(node.attributes[name], 10);
        }
      });
      return true;
    }
    return false;
  }

  parseText() {}

  parseClose() {
    return false;
  }
}

module.exports = PageBreaksXform;
