class CacheField {
  constructor({name, sharedItems, hints}) {
    // string type (axial field — used as pivot row/column/page)
    //
    // {
    //   'name': 'A',
    //   'sharedItems': ['a1', 'a2', 'a3']
    // }
    //
    // or
    //
    // non-axial field (value field or unused) — sharedItems is null and `hints`
    // describes the column's value types so we can emit a lightweight
    // <sharedItems .../> declaration without enumerating every unique value.
    // This avoids triggering Excel's "Repaired Records: PivotTable report"
    // warning on pivot caches with high-cardinality / long-text non-axial
    // fields (see protobi/exceljs#42).
    //
    // {
    //   'name': 'D',
    //   'sharedItems': null,
    //   'hints': { containsBlank, containsString, containsNumber,
    //              containsInteger, hasNumber, longText }
    // }
    this.name = name;
    this.sharedItems = sharedItems;
    this.hints = hints || null;
  }

  // Helper function to escape XML special characters
  escapeXml(unsafe) {
    if (unsafe == null) return '';
    return String(unsafe)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  render() {
    // PivotCache Field: http://www.datypic.com/sc/ooxml/e-ssml_cacheField-1.html
    // Shared Items: http://www.datypic.com/sc/ooxml/e-ssml_sharedItems-1.html

    // Non-axial field — emit lightweight <sharedItems> based on hints from
    // column inspection. pivotCacheRecords inlines values for these fields
    // (see pivot-cache-records-xform.js + lib/doc/pivot-table.js).
    if (this.sharedItems === null) {
      const hints = this.hints || {};
      const attrs = [];
      // Pure-numeric column: declare it explicitly so Excel doesn't infer mixed.
      if (hints.containsNumber && !hints.containsString) {
        attrs.push('containsSemiMixedTypes="0"');
        attrs.push('containsString="0"');
        attrs.push('containsNumber="1"');
        if (hints.containsInteger) attrs.push('containsInteger="1"');
        if (hints.containsBlank) attrs.push('containsBlank="1"');
      } else {
        // Pure-string or mixed column. Excel's parser is strict about which
        // attributes appear together; the safest minimal form is just the
        // hints that matter — no count, no enumerated items.
        if (hints.containsBlank) attrs.push('containsBlank="1"');
        if (hints.longText) attrs.push('longText="1"');
        // Mixed string+number: omit containsString/containsNumber to let Excel
        // infer from the inline records; declaring both can disagree with the
        // record contents and trigger repair.
      }
      const attrStr = attrs.length ? ` ${attrs.join(' ')}` : '';
      return `<cacheField name="${this.escapeXml(this.name)}" numFmtId="0">
      <sharedItems${attrStr} />
    </cacheField>`;
    }

    // Check if all items are numeric
    const isNumericItem = item =>
      typeof item === 'number' ||
      (typeof item === 'string' && !Number.isNaN(Number(item)) && item.trim() !== '');
    const allNumeric = this.sharedItems.every(isNumericItem);

    if (allNumeric) {
      // numeric types - use <n> tags
      const numbers = this.sharedItems.map(item => Number(item));
      const minValue = Math.min(...numbers);
      const maxValue = Math.max(...numbers);
      const containsInteger = numbers.every(n => Number.isInteger(n));

      return `<cacheField name="${this.escapeXml(this.name)}" numFmtId="0">
      <sharedItems containsSemiMixedTypes="0" containsString="0" containsNumber="1" containsInteger="${containsInteger ? '1' : '0'}" minValue="${minValue}" maxValue="${maxValue}" count="${this.sharedItems.length}">
        ${this.sharedItems.map(item => `<n v="${item}" />`).join('')}
      </sharedItems>
    </cacheField>`;
    }

    // string types
    return `<cacheField name="${this.escapeXml(this.name)}" numFmtId="0">
      <sharedItems count="${this.sharedItems.length}">
        ${this.sharedItems.map(item => `<s v="${this.escapeXml(item)}" />`).join('')}
      </sharedItems>
    </cacheField>`;
  }
}

module.exports = CacheField;
