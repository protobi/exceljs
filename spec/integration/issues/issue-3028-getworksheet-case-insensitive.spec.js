const ExcelJS = verquire('exceljs');

describe('github issues', () => {
  describe('issue 3028 - workbook.getWorksheet should be case-insensitive', () => {
    it('returns the same worksheet regardless of name casing', () => {
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('TestSheet');

      expect(wb.getWorksheet('TestSheet')).to.equal(ws);
      expect(wb.getWorksheet('testsheet')).to.equal(ws);
      expect(wb.getWorksheet('TESTSHEET')).to.equal(ws);
      expect(wb.getWorksheet('tEsTsHeEt')).to.equal(ws);
    });

    it('returns undefined for genuinely unknown names', () => {
      const wb = new ExcelJS.Workbook();
      wb.addWorksheet('TestSheet');

      expect(wb.getWorksheet('OtherSheet')).to.equal(undefined);
    });

    it('preserves numeric id lookup', () => {
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('TestSheet');

      expect(wb.getWorksheet(ws.id)).to.equal(ws);
    });

    it('preserves the no-arg first-worksheet shortcut', () => {
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('TestSheet');

      expect(wb.getWorksheet()).to.equal(ws);
    });

    it('aligns getWorksheet with addWorksheet case-insensitive uniqueness', () => {
      // addWorksheet rejects "testsheet" as a duplicate of "TestSheet";
      // therefore getWorksheet("testsheet") must locate the existing sheet.
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('TestSheet');

      expect(() => wb.addWorksheet('testsheet')).to.throw();
      expect(wb.getWorksheet('testsheet')).to.equal(ws);
    });
  });
});
