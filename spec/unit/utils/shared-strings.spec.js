const SharedStrings = verquire('utils/shared-strings');

describe('SharedStrings', () => {
  it('Stores and shares string values', () => {
    const ss = new SharedStrings();

    const iHello = ss.add('Hello');
    const iHelloV2 = ss.add('Hello');
    const iGoodbye = ss.add('Goodbye');

    expect(iHello).to.equal(iHelloV2);
    expect(iGoodbye).to.not.equal(iHelloV2);

    expect(ss.count).to.equal(2);
    expect(ss.totalRefs).to.equal(3);
  });

  it('Does not escape values', () => {
    // that's the job of the xml utils
    const ss = new SharedStrings();

    const iXml = ss.add('<tag>value</tag>');
    const iAmpersand = ss.add('&');

    expect(ss.getString(iXml)).to.equal('<tag>value</tag>');
    expect(ss.getString(iAmpersand)).to.equal('&');
  });

  it('Deduplicates richText values by their XML representation', () => {
    // regression: previously, richText objects all collapsed to the
    // hash key "[object Object]", deduping every richText cell into one entry
    const ss = new SharedStrings();

    const a = {richText: [{text: 'Hello'}]};
    const b = {richText: [{text: 'Hello'}]};
    const c = {richText: [{text: 'Goodbye'}]};

    const iA = ss.add(a);
    const iB = ss.add(b);
    const iC = ss.add(c);

    expect(iA).to.equal(iB);
    expect(iC).to.not.equal(iA);
    expect(ss.count).to.equal(2);
    expect(ss.totalRefs).to.equal(3);
  });

  it('Distinguishes richText entries that differ only in formatting', () => {
    const ss = new SharedStrings();

    const plain = {richText: [{text: 'Hello'}]};
    const bold = {richText: [{font: {bold: true}, text: 'Hello'}]};

    const iPlain = ss.add(plain);
    const iBold = ss.add(bold);

    expect(iPlain).to.not.equal(iBold);
    expect(ss.count).to.equal(2);
  });
});
