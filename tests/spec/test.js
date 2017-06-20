'use strict';

var truncate;
if (typeof module === 'object' && module.exports) {
  require('es5-shim');
  require('es5-shim/es5-sham');
  if (typeof JSON === 'undefined') {
    JSON = {};
  }
  require('json3').runInContext(null, JSON);
  require('es6-shim');
  var es7 = require('es7-shim');
  Object.keys(es7).forEach(function (key) {
    var obj = es7[key];
    if (typeof obj.shim === 'function') {
      obj.shim();
    }
  });
  truncate = require('../../index.js');
} else {
  truncate = returnExports;
}

describe('truncate', function () {
  var testString = 'hi-diddly-ho there, neighborino';
  it('is a function', function () {
    expect(typeof truncate).toBe('function');
  });

  it('default action', function () {
    var actual = truncate(testString);
    var expected = 'hi-diddly-ho there, neighbo...';
    expect(actual).toBe(expected);
  });

  it('with length and seperator string', function () {
    var actual = truncate(testString, {
      length: 24,
      separator: ' '
    });
    var expected = 'hi-diddly-ho there,...';
    expect(actual).toBe(expected);
  });

  it('with length and seperator regex', function () {
    var actual = truncate(testString, {
      length: 24,
      separator: /,? +/
    });
    var expected = 'hi-diddly-ho there...';
    expect(actual).toBe(expected);
  });

  it('with omission', function () {
    var actual = truncate(testString, { omission: ' [...]' });
    var expected = 'hi-diddly-ho there, neig [...]';
    expect(actual).toBe(expected);
  });
});

