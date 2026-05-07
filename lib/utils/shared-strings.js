const SharedStringXform = require('../xlsx/xform/strings/shared-string-xform');

class SharedStrings {
  constructor() {
    this._values = [];
    this._totalRefs = 0;
    this._hash = Object.create(null);
  }

  get count() {
    return this._values.length;
  }

  get values() {
    return this._values;
  }

  get totalRefs() {
    return this._totalRefs;
  }

  getString(index) {
    return this._values[index];
  }

  get sharedStringXform() {
    return this._sharedStringXform || (this._sharedStringXform = new SharedStringXform());
  }

  add(value) {
    const hashKey = value && value.richText ? this.sharedStringXform.toXml(value) : value;
    let index = this._hash[hashKey];
    if (index === undefined) {
      index = this._hash[hashKey] = this._values.length;
      this._values.push(value);
    }
    this._totalRefs++;
    return index;
  }
}

module.exports = SharedStrings;
