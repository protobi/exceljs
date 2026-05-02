const fs = require('fs');
const JSZip = require('jszip');

const ExcelJS = verquire('exceljs');

// Test for issue #56: StreamBuf parser hangs when a workbook drawing file uses
// a root element other than <xdr:wsDr> (e.g. a proprietary or unknown namespace).
//
// Root cause: DrawingXform.parseClose() only returned the loop-exit signal (false)
// when the close tag was exactly "xdr:wsDr". Any other close tag fell to
// `default: return true`, keeping the BaseXform for-await loop alive until the
// underlying stream was exhausted — which never happens with StreamBuf unless the
// caller explicitly ends it. Fix: capture the actual root tag in parseOpen() and
// also return false when that tag closes.

function buildFixture() {
  const srcBuf = fs.readFileSync('./spec/integration/data/test-issue-1575.xlsx');
  const unknownTag = '<some:other xmlns:some="http://example.com/unknown-drawing-ns"/>';

  return JSZip.loadAsync(srcBuf).then(zip =>
    zip.files['xl/drawings/drawing1.xml'].async('string').then(originalXml => {
      // The fixture drawing is a self-closing element: <xdr:wsDr ... />
      // Replace the entire tag with a minimal unknown-namespace tag using
      // string indexing (avoids regex issues with long attribute strings).
      const openStart = originalXml.indexOf('<xdr:wsDr');
      const openEnd = originalXml.indexOf('>', openStart);
      const modifiedXml =
        originalXml.substring(0, openStart) + unknownTag + originalXml.substring(openEnd + 1);

      zip.file('xl/drawings/drawing1.xml', modifiedXml);
      return zip.generateAsync({type: 'nodebuffer'});
    })
  );
}

describe('github issues', () => {
  it('issue 56 - StreamBuf hang on drawing with non-xdr:wsDr root element', () => {
    const wb = new ExcelJS.Workbook();
    return buildFixture()
      .then(buf => wb.xlsx.load(buf))
      .then(() => {
        // Arriving here means the parser exited cleanly — no StreamBuf hang.
        expect(true).to.equal(true);
      });
  }).timeout(5000);
});
