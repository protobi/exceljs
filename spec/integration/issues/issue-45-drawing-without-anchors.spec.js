'use strict';

// Regression test for issue #45:
// Drawings that produce no anchors (empty xdr:wsDr body) previously crashed
// in the reconcile loop because drawing.anchors was undefined.  The fix
// guards the reconcile block with `if (drawing && drawingRel)` and uses
// `(drawing.anchors || [])` so both cases are safe.
//
// Note: the complementary case where DrawingXform.parseStream() itself returns
// undefined (non-xdr:wsDr root) is covered by PR #70 and its test.  That
// path requires the StreamBuf hang fix to be present; test it after #70 merges.

const JSZip = require('jszip');
const ExcelJS = verquire('exceljs');

// Minimal XLSX parts -------------------------------------------------------

const WORKBOOK_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
          xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Sheet1" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`;

const WORKBOOK_RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1"
    Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet"
    Target="worksheets/sheet1.xml"/>
</Relationships>`;

const SHEET1_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
           xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheetData>
    <row r="1"><c r="A1" t="inlineStr"><is><t>Hello</t></is></c></row>
  </sheetData>
  <drawing r:id="rId1"/>
</worksheet>`;

const SHEET1_RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1"
    Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing"
    Target="../drawings/drawing1.xml"/>
</Relationships>`;

// A valid xdr:wsDr root but with NO anchor children — DrawingXform returns
// {anchors: []} and reconcile must not crash on the empty anchors array.
const DRAWING1_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing"
          xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
</xdr:wsDr>`;

const DRAWING1_RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`;

const CONTENT_TYPES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml"
    ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml"
    ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/drawings/drawing1.xml"
    ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>
</Types>`;

const ROOT_RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1"
    Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument"
    Target="xl/workbook.xml"/>
</Relationships>`;

async function buildXlsxBuffer() {
  const zip = new JSZip();
  zip.file('[Content_Types].xml', CONTENT_TYPES_XML);
  zip.file('_rels/.rels', ROOT_RELS_XML);
  zip.file('xl/workbook.xml', WORKBOOK_XML);
  zip.file('xl/_rels/workbook.xml.rels', WORKBOOK_RELS_XML);
  zip.file('xl/worksheets/sheet1.xml', SHEET1_XML);
  zip.file('xl/worksheets/_rels/sheet1.xml.rels', SHEET1_RELS_XML);
  zip.file('xl/drawings/drawing1.xml', DRAWING1_XML);
  zip.file('xl/drawings/_rels/drawing1.xml.rels', DRAWING1_RELS_XML);
  return zip.generateAsync({type: 'nodebuffer'});
}

// --------------------------------------------------------------------------

describe('github issue 45 - drawing reconcile does not crash on empty drawing', () => {
  it('loads an XLSX with a drawing that has no anchors without throwing', async () => {
    const buffer = await buildXlsxBuffer();
    const wb = new ExcelJS.Workbook();
    // Must not throw; before the fix `drawing.anchors` access could crash when
    // the drawing model had no anchors array.
    await wb.xlsx.load(buffer);
    const ws = wb.getWorksheet('Sheet1');
    expect(ws).to.exist;
    expect(ws.getCell('A1').value).to.equal('Hello');
  }).timeout(10000);
});
