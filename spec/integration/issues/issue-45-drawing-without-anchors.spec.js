'use strict';

const XLSX = verquire('xlsx/xlsx');

// Regression test for issue #45:
// If a drawing XML has an unrecognised root element (e.g. a protected/encrypted
// sheet), DrawingXform.parseStream() returns undefined.  The reconcile loop
// must guard `if (drawing && drawingRel)` rather than just `if (drawingRel)`,
// so it skips the undefined entry instead of crashing with
// "TypeError: Cannot read properties of undefined (reading 'anchors')".

describe('github issue 45 - drawing reconcile does not crash when drawing is undefined', () => {
  it('does not throw when model.drawings contains an undefined entry', () => {
    const xlsx = new XLSX();

    // Build the minimal model required by xlsx.reconcile().
    // All collections are empty except drawings which has one undefined entry.
    const model = {
      workbookRels: [],
      sheets: [],
      worksheetHash: {},
      definedNames: [],
      media: [],
      mediaIndex: {},
      drawings: {drawing1: undefined},
      drawingRels: {drawing1: [{Id: 'rId1', Target: '../media/image1.png'}]},
      tables: {},
      styles: {},
      worksheets: [],
    };

    // Must not throw
    expect(() => xlsx.reconcile(model, {})).to.not.throw();
  });
});
