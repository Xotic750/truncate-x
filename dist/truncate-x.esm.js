import toLength from 'to-length-x';
import isRegExp from 'is-regexp-x';
import safeToString from 'to-string-symbols-supported-x';
import isObjectLike from 'is-object-like-x';
import hasOwn from 'has-own-property-x';
import arraySlice from 'array-slice-x';
import toBoolean from 'to-boolean-x';
import isNil from 'is-nil-x';
import methodize from 'simple-methodize-x';
var EMPTY_STRING = '';
var match = methodize(EMPTY_STRING.match);
var slice = methodize(EMPTY_STRING.slice);
var search = methodize(EMPTY_STRING.search);
var indexOf = methodize(EMPTY_STRING.indexOf);
var lastIndexOf = methodize(EMPTY_STRING.lastIndexOf);
var aJoin = methodize([].join);
/* Used to match `RegExp` flags from their coerced string values. */

var reFlags = /\w*$/;
var RegExpCtr = reFlags.constructor;
var rxTest = methodize(reFlags.test);
var rxExec = methodize(reFlags.exec);
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
var rsOptJoin = "(?:".concat(rsZWJ, "(?:").concat(aJoin([rsNonAstral, rsRegional, rsSurrPair], '|'), ")").concat(rsOptVar).concat(reOptMod, ")*");
var rsSeq = rsOptVar + reOptMod + rsOptJoin;
var rsSymbol = "(?:".concat(aJoin(["".concat(rsNonAstral + rsCombo, "?"), rsCombo, rsRegional, rsSurrPair, rsAstral], '|'), ")");
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
  if (toBoolean(string) === false || rxTest(reHasComplexSymbol, string) === false) {
    return string.length;
  }

  reComplexSymbol.lastIndex = 0;
  var result = 0;

  while (rxTest(reComplexSymbol, string)) {
    result += 1;
  }

  return result;
};

var getOptions = function getOptions(options) {
  var opts = {
    length: 30,
    omission: '...',
    separator: null
  };

  if (isObjectLike(options)) {
    if (hasOwn(options, 'length')) {
      opts.length = toLength(options.length);
    }

    if (hasOwn(options, 'omission')) {
      opts.omission = options.omission;
    }

    if (hasOwn(options, 'separator')) {
      opts.separator = options.separator;
    }
  }

  return opts;
};

var getConsts = function getConsts(str) {
  if (rxTest(reHasComplexSymbol, str)) {
    var matchSymbols = match(str, reComplexSymbol);
    return {
      matchSymbols: match(str, reComplexSymbol),
      strLength: matchSymbols.length
    };
  }

  return {
    matchSymbols: null,
    strLength: str.length
  };
};

var getNewEnd = function getNewEnd(rxSeperator, result) {
  var newEnd;
  var rxMatch = rxExec(rxSeperator, result);

  while (rxMatch) {
    newEnd = rxMatch.index;
    rxMatch = rxExec(rxSeperator, result);
  }

  return newEnd;
};

var getRxResult = function getRxResult(obj) {
  var str = obj.str,
      separator = obj.separator,
      end = obj.end,
      result = obj.result;

  if (search(slice(str, end), separator)) {
    var rxSeperator = toBoolean(separator.global) ? separator : new RegExpCtr(separator.source, "".concat(safeToString(rxExec(reFlags, separator)), "g"));
    rxSeperator.lastIndex = 0;
    var newEnd = getNewEnd(rxSeperator, result);
    return slice(result, 0, typeof newEnd === 'undefined' ? end : newEnd);
  }

  return result;
};

var getResult = function getResult(obj) {
  var str = obj.str,
      separator = obj.separator,
      end = obj.end,
      result = obj.result;

  if (isRegExp(separator)) {
    return getRxResult({
      str: str,
      separator: separator,
      end: end,
      result: result
    });
  }

  if (indexOf(str, separator, end) !== end) {
    var index = lastIndexOf(result, separator);

    if (index > -1) {
      return slice(result, 0, index);
    }
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

  var _getOptions = getOptions(options),
      length = _getOptions.length,
      omission = _getOptions.omission,
      separator = _getOptions.separator;

  var _getConsts = getConsts(str),
      strLength = _getConsts.strLength,
      matchSymbols = _getConsts.matchSymbols;

  if (length >= strLength) {
    return str;
  }

  var end = length - stringSize(omission);

  if (end < 1) {
    return omission;
  }

  var result = matchSymbols ? aJoin(arraySlice(matchSymbols, 0, end), EMPTY_STRING) : slice(str, 0, end);

  if (isNil(separator)) {
    return result + omission;
  }

  return getResult({
    str: str,
    separator: separator,
    end: matchSymbols ? result.length : end,
    result: result
  }) + omission;
};

export default truncate;

//# sourceMappingURL=truncate-x.esm.js.map