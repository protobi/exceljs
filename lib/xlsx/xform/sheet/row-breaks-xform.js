'use strict';

const PageBreaksXform = require('./page-breaks-xform');

const ListXform = require('../list-xform');

class RowBreaksXform extends ListXform {
  constructor(tag = 'rowBreaks') {
    const options = {
      tag,
      count: true,
      childXform: new PageBreaksXform(),
    };
    super(options);
  }

  // get tag() { return 'rowBreaks'; }

  render(xmlStream, model) {
    if (model && model.length) {
      xmlStream.openNode(this.tag, this.$);
      if (this.count) {
        xmlStream.addAttribute(this.$count, model.length);
        xmlStream.addAttribute(
          'manualBreakCount',
          model.filter(pageBreak => pageBreak.man === 1 || pageBreak.man === true).length
        );
      }

      const {childXform} = this;
      model.forEach(childModel => {
        childXform.render(xmlStream, childModel);
      });

      xmlStream.closeNode();
    } else if (this.empty) {
      xmlStream.leafNode(this.tag);
    }
  }
}

module.exports = RowBreaksXform;
