const uuidv4 = verquire('utils/uuid-v4');

describe('uuidv4', () => {
  it('produces RFC 4122 version 4 UUIDs', () => {
    for (let i = 0; i < 100; i++) {
      expect(uuidv4()).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    }
  });

  it('does not repeat', () => {
    const seen = new Set();
    for (let i = 0; i < 1000; i++) {
      seen.add(uuidv4());
    }
    expect(seen.size).to.equal(1000);
  });
});
