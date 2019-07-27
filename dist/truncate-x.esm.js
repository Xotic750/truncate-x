import toLength from 'to-length-x';
import isRegExp from 'is-regexp-x';
import safeToString from 'to-string-symbols-supported-x';
import isObjectLike from 'is-object-like-x';
import hasOwn from 'has-own-property-x';
import arraySlice from 'array-slice-x';
import toBoolean from 'to-boolean-x';
var EMPTY_STRING = '';
var sMatch = EMPTY_STRING.match;
var sSlice = EMPTY_STRING.slice;
var sSearch = EMPTY_STRING.search;
var sIndexOf = EMPTY_STRING.indexOf;
var sLastIndexOf = EMPTY_STRING.lastIndexOf;
var aJoin = [].join;
var RegExpCtr = /none/.constructor;
/* Used to match `RegExp` flags from their coerced string values. */

var reFlags = /\w*$/;
var rxTest = reFlags.test;
var rxExec = reFlags.exec;
/* Used to compose unicode character classes. */

var rsAstralRange = "\\ud800-\\udfff";
var rsComboMarksRange = "\\u0300-\\u036f\\ufe20-\\ufe23";
var rsComboSymbolsRange = "\\u20d0-\\u20f0";
var rsVarRange = "\\ufe0e\\ufe0f";
/* Used to compose unicode capture groups. */

var rsAstral = "[".concat(rsAstralRange, "]");
var rsCombo = "[".concat(rsComboMarksRange).concat(rsComboSymbolsRange, "]");
var rsFitz = "\\ud83c[\\udffb-\\udfff]";
var rsModifier = "(?:".concat(rsCombo, "|").concat(rsFitz, ")");
var rsNonAstral = "[^".concat(rsAstralRange, "]");
var rsRegional = "(?:\\ud83c[\\udde6-\\uddff]){2}";
var rsSurrPair = "[\\ud800-\\udbff][\\udc00-\\udfff]";
var rsZWJ = "\\u200d";
/* Used to compose unicode regexes. */

var reOptMod = "".concat(rsModifier, "?");
var rsOptVar = "[".concat(rsVarRange, "]?");
var rsOptJoin = "(?:".concat(rsZWJ, "(?:").concat(aJoin.call([rsNonAstral, rsRegional, rsSurrPair], '|'), ")").concat(rsOptVar).concat(reOptMod, ")*");
var rsSeq = rsOptVar + reOptMod + rsOptJoin;
var rsSymbol = "(?:".concat(aJoin.call(["".concat(rsNonAstral + rsCombo, "?"), rsCombo, rsRegional, rsSurrPair, rsAstral], '|'), ")");
/*
 * Used to match string symbols
 * @see https://mathiasbynens.be/notes/javascript-unicode
 */

var reComplexSymbol = new RegExpCtr("".concat(rsFitz, "(?=").concat(rsFitz, ")|").concat(rsSymbol).concat(rsSeq), 'g');
/*
 * Used to detect strings with [zero-width joiners or code points from
 * the astral planes](http://eev.ee/blog/2015/09/12/dark-corners-of-unicode/).
 */

var reHasComplexSymbol = new RegExpCtr("[".concat(rsZWJ).concat(rsAstralRange).concat(rsComboMarksRange).concat(rsComboSymbolsRange).concat(rsVarRange, "]"));
/**
 * Gets the number of symbols in `string`.
 *
 * @private
 * @param {string} string - The string to inspect.
 * @returns {number} Returns the string size.
 */

var stringSize = function _stringSize(string) {
  if (toBoolean(string) === false || rxTest.call(reHasComplexSymbol, string) === false) {
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
 * @param {object} [options] - The options object.
 * @param {number} [options.length=30] - The maximum string length.
 * @param {string} [options.omission='...'] - The string to indicate text
 * is omitted.
 * @param {RegExp|string} [options.separator] - The separator pattern to
 * truncate to.
 * @returns {string} Returns the truncated string.
 */


var truncate = function truncate(string, options) {
  var str = safeToString(string);
  var length = 30;
  var omission = '...';
  var separator;

  if (isObjectLike(options)) {
    if (hasOwn(options, 'separator')) {
      /* eslint-disable-next-line prefer-destructuring */
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

  var result = matchSymbols ? aJoin.call(arraySlice(matchSymbols, 0, end), EMPTY_STRING) : sSlice.call(str, 0, end);

  if (typeof separator === 'undefined') {
    return result + omission;
  }

  if (matchSymbols) {
    end += result.length - end;
  }

  if (isRegExp(separator)) {
    if (sSearch.call(sSlice.call(str, end), separator)) {
      var substr = result;

      if (toBoolean(separator.global) === false) {
        separator = new RegExpCtr(separator.source, "".concat(safeToString(rxExec.call(reFlags, separator)), "g"));
      }

      separator.lastIndex = 0;
      var newEnd;
      var match = rxExec.call(separator, substr);

      while (match) {
        newEnd = match.index;
        match = rxExec.call(separator, substr);
      }

      result = sSlice.call(result, 0, typeof newEnd === 'undefined' ? end : newEnd);
    }
  } else if (sIndexOf.call(str, separator, end) !== end) {
    var index = sLastIndexOf.call(result, separator);

    if (index > -1) {
      result = sSlice.call(result, 0, index);
    }
  }

  return result + omission;
};

export default truncate;

//# sourceMappingURL=truncate-x.esm.js.map