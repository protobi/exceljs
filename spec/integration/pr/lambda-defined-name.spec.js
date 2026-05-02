// Integration test: named LAMBDA defined names must survive an ExcelJS round-trip.
// Modern Excel (2024+) supports workbook-level LAMBDA definitions like:
//   MyDouble = LAMBDA(x, x*2)
// Prior to this fix, DefinedNamesXform.extractRanges() would silently discard
// any definedName whose value is not a valid range address, losing the LAMBDA.

const ExcelJS = verquire('exceljs');
const JSZip = require('jszip');
const fs = require('fs');
const path = require('path');
const os = require('os');

const WORKBOOK_XML_WITH_LAMBDA = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
          xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <fileVersion appName="xl" lastEdited="7" lowestEdited="7" rupBuild="22228"/>
  <workbookPr defaultThemeVersion="166925"/>
  <bookViews>
    <workbookView xWindow="0" yWindow="0" windowWidth="28800" windowHeight="12420"/>
  </bookViews>
  <sheets>
    <sheet name="Sheet1" sheetId="1" r:id="rId1"/>
  </sheets>
  <definedNames>
    <definedName name="MyDouble">LAMBDA(x,x*2)</definedName>
    <definedName name="MyAdd">LAMBDA(x,y,x+y)</definedName>
    <definedName name="NormalRange">Sheet1!$A$1:$B$2</definedName>
  </definedNames>
  <calcPr calcId="191028"/>
</workbook>`;

const SHEET_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
           xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheetData>
    <row r="1"><c r="A1" t="n"><v>1</v></c></row>
  </sheetData>
</worksheet>`;

const RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`;

const ROOT_RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

const CONTENT_TYPES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`;

async function buildXlsxWithLambda() {
  const zip = new JSZip();
  zip.file('[Content_Types].xml', CONTENT_TYPES_XML);
  zip.file('_rels/.rels', ROOT_RELS_XML);
  zip.file('xl/workbook.xml', WORKBOOK_XML_WITH_LAMBDA);
  zip.file('xl/_rels/workbook.xml.rels', RELS_XML);
  zip.file('xl/worksheets/sheet1.xml', SHEET_XML);
  return zip.generateAsync({type: 'nodebuffer'});
}

async function roundTrip(inputBuffer) {
  const tmpIn = path.join(os.tmpdir(), `lambda-test-in-${Date.now()}.xlsx`);
  const tmpOut = path.join(os.tmpdir(), `lambda-test-out-${Date.now()}.xlsx`);
  try {
    fs.writeFileSync(tmpIn, inputBuffer);

    const wb1 = new ExcelJS.Workbook();
    await wb1.xlsx.readFile(tmpIn);
    await wb1.xlsx.writeFile(tmpOut);

    const wb2 = new ExcelJS.Workbook();
    await wb2.xlsx.readFile(tmpOut);
    return wb2;
  } finally {
    try {
      fs.unlinkSync(tmpIn);
    } catch (e) {
      /* ignore */
    }
    try {
      fs.unlinkSync(tmpOut);
    } catch (e) {
      /* ignore */
    }
  }
}

describe('Named LAMBDA defined names', () => {
  let inputBuffer;

  before(async () => {
    inputBuffer = await buildXlsxWithLambda();
  });

  it('should round-trip LAMBDA defined names verbatim without dropping them', async () => {
    const wb = await roundTrip(inputBuffer);
    // Read the written xlsx back as a zip to inspect definedNames XML directly
    const outBuf = await wb.xlsx.writeBuffer();
    const zip = await JSZip.loadAsync(outBuf);
    const workbookXml = await zip.file('xl/workbook.xml').async('string');

    expect(workbookXml).to.include('MyDouble');
    expect(workbookXml).to.include('LAMBDA(x,x*2)');
    expect(workbookXml).to.include('MyAdd');
    expect(workbookXml).to.include('LAMBDA(x,y,x+y)');
  });

  it('should not drop LAMBDA definitions while preserving normal range defined names', async () => {
    const wb = await roundTrip(inputBuffer);
    const outBuf = await wb.xlsx.writeBuffer();
    const zip = await JSZip.loadAsync(outBuf);
    const workbookXml = await zip.file('xl/workbook.xml').async('string');

    // Normal range-based defined name must also survive
    expect(workbookXml).to.include('NormalRange');
    expect(workbookXml).to.include('Sheet1!$A$1:$B$2');
  });

  it('should preserve LAMBDA formula text exactly as stored', async () => {
    const wb = await roundTrip(inputBuffer);
    const outBuf = await wb.xlsx.writeBuffer();
    const zip = await JSZip.loadAsync(outBuf);
    const workbookXml = await zip.file('xl/workbook.xml').async('string');

    // Verify exact text content — no mangling of the LAMBDA body
    const lambdaMatch = workbookXml.match(/name="MyDouble"[^>]*>([^<]*)<\/definedName>/);
    expect(lambdaMatch).to.not.be.null();
    expect(lambdaMatch[1]).to.equal('LAMBDA(x,x*2)');
  });
});
