const BaseXform = require('../base-xform');
const CacheField = require('./cache-field');
const XmlStream = require('../../../utils/xml-stream');
const colCache = require('../../../utils/col-cache');

/**
 * Build the worksheetSource `ref` attribute value.
 *
 * When sourceRef is provided the ref is scoped from that top-left cell to the
 * last used cell of the sheet (e.g. "C3:F100"). Falls back to the full sheet
 * dimensions when the data starts at A1.
 *
 * @param {object} model  pivot table model
 * @returns {string}      e.g. "A1:E20" or "C3:F20"
 */
function buildSourceRef(model) {
  const {sourceSheet, col, row} = model;
  const dims = sourceSheet.dimensions;

  if (row === 1 && col === 1) {
    // Fast path — no offset, keep existing behaviour.
    return dims.shortRange;
  }

  const topLeft = colCache.encodeAddress(row, col);
  const bottomRight = colCache.encodeAddress(dims.bottom, dims.right);
  return `${topLeft}:${bottomRight}`;
}

class PivotCacheDefinitionXform extends BaseXform {
  constructor() {
    super();

    this.map = {};
  }

  prepare(model) {
    // TK
  }

  get tag() {
    // http://www.datypic.com/sc/ooxml/e-ssml_pivotCacheDefinition.html
    return 'pivotCacheDefinition';
  }

  render(xmlStream, model) {
    const {sourceSheet, cacheFields} = model;

    xmlStream.openXml(XmlStream.StdDocAttributes);
    xmlStream.openNode(this.tag, {
      ...PivotCacheDefinitionXform.PIVOT_CACHE_DEFINITION_ATTRIBUTES,
      'r:id': 'rId1',
      refreshOnLoad: '1', // important for our implementation to work
      refreshedBy: 'Author',
      refreshedDate: '45125.026046874998',
      createdVersion: '8',
      refreshedVersion: '8',
      minRefreshableVersion: '3',
      recordCount: cacheFields.length + 1,
    });

    xmlStream.openNode('cacheSource', {type: 'worksheet'});
    xmlStream.leafNode('worksheetSource', {
      ref: buildSourceRef(model),
      sheet: sourceSheet.name,
    });
    xmlStream.closeNode();

    xmlStream.openNode('cacheFields', {count: cacheFields.length});
    // Note: keeping this pretty-printed for now to ease debugging.
    xmlStream.writeXml(
      cacheFields.map(cacheField => new CacheField(cacheField).render()).join('\n    ')
    );
    xmlStream.closeNode();

    xmlStream.closeNode();
  }

  parseOpen(node) {
    // TK
  }

  parseText(text) {
    // TK
  }

  parseClose(name) {
    // TK
  }

  reconcile(model, options) {
    // TK
  }
}

PivotCacheDefinitionXform.PIVOT_CACHE_DEFINITION_ATTRIBUTES = {
  xmlns: 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
  'xmlns:r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
  'xmlns:mc': 'http://schemas.openxmlformats.org/markup-compatibility/2006',
  'mc:Ignorable': 'xr',
  'xmlns:xr': 'http://schemas.microsoft.com/office/spreadsheetml/2014/revision',
};

module.exports = PivotCacheDefinitionXform;
