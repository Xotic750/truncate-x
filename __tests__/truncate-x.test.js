import truncate from '../src/truncate-x';

describe('truncate', function() {
  const testString = 'hi-diddly-ho there, neighborino';

  it('is a function', function() {
    expect.assertions(1);
    expect(typeof truncate).toBe('function');
  });

  it('no arguments', function() {
    expect.assertions(1);
    const actual = truncate();
    const expected = 'undefined';
    expect(actual).toBe(expected);
  });

  it('non-strings', function() {
    expect.assertions(1);
    const actual = truncate(null);
    const expected = 'null';
    expect(actual).toBe(expected);
  });

  it('default action', function() {
    expect.assertions(1);
    const actual = truncate(testString);
    const expected = 'hi-diddly-ho there, neighbo...';
    expect(actual).toBe(expected);
  });

  it('with length and seperator string', function() {
    expect.assertions(1);
    const actual = truncate(testString, {
      length: 24,
      separator: ' ',
    });
    const expected = 'hi-diddly-ho there,...';
    expect(actual).toBe(expected);
  });

  it('with length and seperator regex', function() {
    expect.assertions(1);
    const actual = truncate(testString, {
      length: 24,
      separator: /,? +/,
    });
    const expected = 'hi-diddly-ho there...';
    expect(actual).toBe(expected);
  });

  it('with omission', function() {
    expect.assertions(1);
    const actual = truncate(testString, {omission: ' [...]'});
    const expected = 'hi-diddly-ho there, neig [...]';
    expect(actual).toBe(expected);
  });
});
