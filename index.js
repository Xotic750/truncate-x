/**
 * @file Truncate a string to a maximum specified length.
 * @version 3.0.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module truncate-x
 */

'use strict';

var isUndefined = require('validate.io-undefined');
var toLength = require('to-length-x');
var isRegExp = require('is-regexp-x');
var safeToString = require('safe-to-string-x');
var isObjectLike = require('is-object-like-x');
var isFalsey = require('is-falsey-x');
var hasOwn = require('has-own-property-x');
var arraySlice = require('array-slice-x');
var sMatch = String.prototype.match;
var sSlice = String.prototype.slice;
var sSearch = String.prototype.search;
var sIndexOf = String.prototype.indexOf;
var sLastIndexOf = String.prototype.lastIndexOf;
var aJoin = Array.prototype.join;
var Rx = RegExp;

/* Used to match `RegExp` flags from their coerced string values. */
var reFlags = /\w*$/;
var rxTest = reFlags.test;
var rxExec = reFlags.exec;

/* Used to compose unicode character classes. */
var rsAstralRange = '\\ud800-\\udfff';
var rsComboMarksRange = '\\u0300-\\u036f\\ufe20-\\ufe23';
var rsComboSymbolsRange = '\\u20d0-\\u20f0';
var rsVarRange = '\\ufe0e\\ufe0f';

/* Used to compose unicode capture groups. */
var rsAstral = '[' + rsAstralRange + ']';
var rsCombo = '[' + rsComboMarksRange + rsComboSymbolsRange + ']';
var rsFitz = '\\ud83c[\\udffb-\\udfff]';
var rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')';
var rsNonAstral = '[^' + rsAstralRange + ']';
var rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}';
var rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]';
var rsZWJ = '\\u200d';

/* Used to compose unicode regexes. */
var reOptMod = rsModifier + '?';
var rsOptVar = '[' + rsVarRange + ']?';
var rsOptJoin = '(?:' + rsZWJ + '(?:' + aJoin.call([
  rsNonAstral,
  rsRegional,
  rsSurrPair
], '|') + ')' + rsOptVar + reOptMod + ')*';
var rsSeq = rsOptVar + reOptMod + rsOptJoin;
var rsSymbol = '(?:' + aJoin.call([
  rsNonAstral + rsCombo + '?',
  rsCombo,
  rsRegional,
  rsSurrPair,
  rsAstral
], '|') + ')';

/*
 * Used to match string symbols
 * @see https://mathiasbynens.be/notes/javascript-unicode
 */
var reComplexSymbol = new Rx(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g');

/*
 * Used to detect strings with [zero-width joiners or code points from
 * the astral planes](http://eev.ee/blog/2015/09/12/dark-corners-of-unicode/).
 */
var reHasComplexSymbol = new Rx('[' + rsZWJ + rsAstralRange + rsComboMarksRange + rsComboSymbolsRange + rsVarRange + ']');

/**
 * Gets the number of symbols in `string`.
 *
 * @private
 * @param {string} string - The string to inspect.
 * @returns {number} Returns the string size.
 */
var stringSize = function _stringSize(string) {
  if (isFalsey(string) || rxTest.call(reHasComplexSymbol, string) === false) {
    return string.length;
  }

  reComplexSymbol.lastIndex = 0;
  var result = 0;
  while (rxTest.call(reComplexSymbol, string)) {
    result += 1;
  }

  return result;
};

/**
 * Truncates `string` if it's longer than the given maximum string length.
 * The last characters of the truncated string are replaced with the omission
 * string which defaults to "...".
 *
 * @param {string} string - The string to truncate.
 * @param {Object} [options] - The options object.
 * @param {number} [options.length=30] - The maximum string length.
 * @param {string} [options.omission='...'] - The string to indicate text
 * is omitted.
 * @param {RegExp|string} [options.separator] - The separator pattern to
 * truncate to.
 * @returns {string} Returns the truncated string.
 * @example
 * var truncate = require('truncate-x');
 *
 * truncate('hi-diddly-ho there, neighborino');
 * // 'hi-diddly-ho there, neighbo...'
 *
 * truncate('hi-diddly-ho there, neighborino', {
 *   'length': 24,
 *   'separator': ' '
 * });
 * // 'hi-diddly-ho there,...'
 *
 * truncate('hi-diddly-ho there, neighborino', {
 *   'length': 24,
 *   'separator': /,? +/
 * });
 * // 'hi-diddly-ho there...'
 *
 * truncate('hi-diddly-ho there, neighborino', {
 *   'omission': ' [...]'
 * });
 * // 'hi-diddly-ho there, neig [...]'
 */
module.exports = function truncate(string, options) {
  var str = safeToString(string);
  var length = 30;
  var omission = '...';
  var separator;
  if (isObjectLike(options)) {
    if (hasOwn(options, 'separator')) {
      separator = options.separator;
    }

    if (hasOwn(options, 'length')) {
      length = toLength(options.length);
    }

    if (hasOwn(options, 'omission')) {
      omission = safeToString(options.omission);
    }
  }

  var strLength = str.length;
  var matchSymbols;
  if (rxTest.call(reHasComplexSymbol, str)) {
    matchSymbols = sMatch.call(str, reComplexSymbol);
    strLength = matchSymbols.length;
  }

  if (length >= strLength) {
    return str;
  }

  var end = length - stringSize(omission);
  if (end < 1) {
    return omission;
  }

  var result = matchSymbols ? aJoin.call(arraySlice(matchSymbols, 0, end), '') : sSlice.call(str, 0, end);
  if (isUndefined(separator)) {
    return result + omission;
  }

  if (matchSymbols) {
    end += result.length - end;
  }

  if (isRegExp(separator)) {
    if (sSearch.call(sSlice.call(str, end), separator)) {
      var substr = result;
      if (isFalsey(separator.global)) {
        separator = new Rx(separator.source, safeToString(rxExec.call(reFlags, separator)) + 'g');
      }

      separator.lastIndex = 0;
      var newEnd;
      var match = rxExec.call(separator, substr);
      while (match) {
        newEnd = match.index;
        match = rxExec.call(separator, substr);
      }

      result = sSlice.call(result, 0, isUndefined(newEnd) ? end : newEnd);
    }
  } else if (sIndexOf.call(str, separator, end) !== end) {
    var index = sLastIndexOf.call(result, separator);
    if (index > -1) {
      result = sSlice.call(result, 0, index);
    }
  }

  return result + omission;
};
