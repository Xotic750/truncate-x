let truncate;

if (typeof module === 'object' && module.exports) {
  require('es5-shim');
  require('es5-shim/es5-sham');

  if (typeof JSON === 'undefined') {
    JSON = {};
  }

  require('json3').runInContext(null, JSON);
  require('es6-shim');
  const es7 = require('es7-shim');
  Object.keys(es7).forEach(function(key) {
    const obj = es7[key];

    if (typeof obj.shim === 'function') {
      obj.shim();
    }
  });
  truncate = require('../../index.js');
} else {
  truncate = returnExports;
}

describe('truncate', function() {
  const testString = 'hi-diddly-ho there, neighborino';

  it('is a function', function() {
    expect(typeof truncate).toBe('function');
  });

  it('no arguments', function() {
    const actual = truncate();
    const expected = 'undefined';
    expect(actual).toBe(expected);
  });

  it('non-strings', function() {
    const actual = truncate(null);
    const expected = 'null';
    expect(actual).toBe(expected);
  });

  it('default action', function() {
    const actual = truncate(testString);
    const expected = 'hi-diddly-ho there, neighbo...';
    expect(actual).toBe(expected);
  });

  it('with length and seperator string', function() {
    const actual = truncate(testString, {
      length: 24,
      separator: ' ',
    });
    const expected = 'hi-diddly-ho there,...';
    expect(actual).toBe(expected);
  });

  it('with length and seperator regex', function() {
    const actual = truncate(testString, {
      length: 24,
      separator: /,? +/,
    });
    const expected = 'hi-diddly-ho there...';
    expect(actual).toBe(expected);
  });

  it('with omission', function() {
    const actual = truncate(testString, {omission: ' [...]'});
    const expected = 'hi-diddly-ho there, neig [...]';
    expect(actual).toBe(expected);
  });
});
