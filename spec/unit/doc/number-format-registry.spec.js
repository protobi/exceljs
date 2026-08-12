const Excel = verquire('exceljs');
const NumberFormatRegistry = verquire('doc/number-format-registry');

describe('NumberFormatRegistry', () => {
  it('gets-or-creates ids, returning the same id for the same code', () => {
    const reg = new NumberFormatRegistry();
    const id = reg.getOrAdd('[Red]"A" 0.0%');
    expect(reg.getOrAdd('[Red]"A" 0.0%')).to.equal(id);
    expect(reg.getOrAdd('[Red]"B" 0.0%')).to.not.equal(id);
    expect(reg.count).to.equal(2);
  });

  it('does not count built-in formats against the limit', () => {
    const reg = new NumberFormatRegistry({limit: 1});
    // '0.00%' and '0%' are built-in formats
    reg.getOrAdd('0.00%');
    reg.getOrAdd('0%');
    expect(reg.count).to.equal(0);
    // still room for one custom format
    expect(() => reg.getOrAdd('[Red]"A" 0.0%')).to.not.throw();
  });

  it('throws NumberFormatLimitError when a new code exceeds the limit', () => {
    const reg = new NumberFormatRegistry({limit: 2});
    reg.getOrAdd('custom-1');
    reg.getOrAdd('custom-2');
    let caught = null;
    try {
      reg.getOrAdd('custom-3');
    } catch (e) {
      caught = e;
    }
    expect(caught).to.be.instanceof(Excel.NumberFormatLimitError);
    expect(caught.limit).to.equal(2);
    expect(caught.formatCode).to.equal('custom-3');
  });

  it('still returns already-registered codes for free when full', () => {
    const reg = new NumberFormatRegistry({limit: 1});
    const id = reg.getOrAdd('custom-1');
    expect(reg.getOrAdd('custom-1')).to.equal(id);
  });

  it('seeds existing codes without enforcing the limit', () => {
    const reg = new NumberFormatRegistry({limit: 2});
    reg.seed(['a', 'b', 'c', 'd']);
    expect(reg.count).to.equal(4);
    expect(reg.remaining).to.equal(0);
    // already-seeded codes are still free
    expect(() => reg.getOrAdd('a')).to.not.throw();
    // but no new ones can be added
    expect(() => reg.getOrAdd('e')).to.throw(Excel.NumberFormatLimitError);
  });

  it('reports remaining budget and has()', () => {
    const reg = new NumberFormatRegistry({limit: 3});
    reg.getOrAdd('a');
    expect(reg.remaining).to.equal(2);
    expect(reg.has('a')).to.equal(true);
    expect(reg.has('b')).to.equal(false);
    expect(reg.has('0%')).to.equal(true); // built-in
  });

  it('exposes a default limit of 206', () => {
    expect(NumberFormatRegistry.DEFAULT_NUMFMT_LIMIT).to.equal(206);
    expect(new NumberFormatRegistry().limit).to.equal(206);
  });
});

describe('Workbook number formats', () => {
  it('defaults numFmtLimit to 206 and accepts an override', () => {
    expect(new Excel.Workbook().numFmtLimit).to.equal(206);
    expect(new Excel.Workbook({numFmtLimit: 50}).numFmtLimit).to.equal(50);
  });

  it('addNumberFormat throws NumberFormatLimitError past the limit', () => {
    const wb = new Excel.Workbook({numFmtLimit: 2});
    wb.addNumberFormat('[Red]"A" 0.0%');
    wb.addNumberFormat('[Red]"B" 0.0%');
    expect(() => wb.addNumberFormat('[Red]"C" 0.0%')).to.throw(Excel.NumberFormatLimitError);
    // reusing an existing one is still fine
    expect(() => wb.addNumberFormat('[Red]"A" 0.0%')).to.not.throw();
  });

  it('seeds the registry from custom formats already on cells', () => {
    const wb = new Excel.Workbook({numFmtLimit: 10});
    const ws = wb.addWorksheet('s');
    ws.getCell('A1').value = 1;
    ws.getCell('A1').numFmt = '[Red]"A" 0.0%';
    ws.getCell('A2').value = 2;
    ws.getCell('A2').numFmt = '[Red]"B" 0.0%';
    ws.getCell('A3').value = 3;
    ws.getCell('A3').numFmt = '0%'; // built-in, should not count
    expect(wb.numberFormats.count).to.equal(2);
    expect(wb.numberFormats.remaining).to.equal(8);
  });
});
