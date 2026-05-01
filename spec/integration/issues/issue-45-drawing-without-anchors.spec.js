// Regression test for protobi/exceljs#45 (and exceljs/exceljs#2591).
//
// Some real-world XLSX files contain drawing parts whose XML cannot be
// parsed into the standard `xdr:wsDr` shape (for example: c:userShapes,
// certain protected files, or other unrecognised root elements). In those
// cases DrawingXform.parseStream resolves to `undefined`, and the entry is
// stored as `model.drawings[name] = undefined`. The reconcile pass then
// dereferences `drawing.anchors` and crashes with:
//
//     TypeError: Cannot read properties of undefined (reading 'anchors')
//
// This test exercises XLSX.reconcile directly with a synthetic model that
// reproduces that state. On master it throws; with the guard added in
// lib/xlsx/xlsx.js it completes without error.

const XLSX = verquire('xlsx/xlsx');

describe('github issues', () => {
  describe('issue 45 - drawing without anchors should not crash reconcile', () => {
    function buildModelWithUndefinedDrawing() {
      // Minimal model shape required by XLSX.reconcile. The key field is
      // `drawings.drawing1 = undefined`, paired with a matching drawingRels
      // entry so the reconcile loop enters the drawing branch.
      return {
        worksheets: [],
        worksheetHash: {},
        worksheetRels: [],
        themes: {},
        media: [],
        mediaIndex: {},
        drawings: {
          drawing1: undefined, // drawing XML failed to parse
        },
        drawingRels: {
          drawing1: [
            {
              Id: 'rId1',
              Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image',
              Target: '../media/image1.png',
            },
          ],
        },
        comments: {},
        tables: {},
        vmlDrawings: {},
        pivotTables: [],
        preservedPivotTablesXml: {},
        preservedPivotTablesRels: {},
        preservedPivotCacheDefinitionsXml: {},
        preservedPivotCacheDefinitionsRels: {},
        preservedPivotCacheRecordsXml: {},
        preservedChartsXml: {},
        preservedChartsRels: {},
        preservedChartStylesXml: {},
        preservedChartColorsXml: {},
        preservedDrawingsXml: {},
        preservedDrawingsRels: {},
      };
    }

    it('does not throw when a drawing entry is undefined', () => {
      const xlsx = new XLSX();
      const model = buildModelWithUndefinedDrawing();

      expect(() => xlsx.reconcile(model, {})).to.not.throw();
    });
  });
});
