const BaseXform = require('../base-xform');
const CacheField = require('./cache-field');
const XmlStream = require('../../../utils/xml-stream');

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

    // recordCount must match the count attribute of <pivotCacheRecords> — the
    // number of data rows in the source sheet (header excluded). Excel uses
    // this to validate the cache; a mismatch is one of the triggers for the
    // "Repaired Records: PivotTable report from /xl/pivotCache/
    // pivotCacheDefinition*.xml" warning (see protobi/exceljs#42).
    const recordCount = Math.max(0, sourceSheet.getSheetValues().length - 2);

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
      recordCount,
    });

    xmlStream.openNode('cacheSource', {type: 'worksheet'});
    xmlStream.leafNode('worksheetSource', {
      ref: sourceSheet.dimensions.shortRange,
      sheet: sourceSheet.name,
    });
    xmlStream.closeNode();

    xmlStream.openNode('cacheFields', {count: cacheFields.length});
    // Note: keeping this pretty-printed for now to ease debugging.
    const cacheFieldsXml = cacheFields
      .map(cacheField => new CacheField(cacheField).render())
      .join('\n    ');
    xmlStream.writeXml(cacheFieldsXml);
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
