import toLength from 'to-length-x';
import isRegExp from 'is-regexp-x';
import safeToString from 'to-string-symbols-supported-x';
import isObjectLike from 'is-object-like-x';
import hasOwn from 'has-own-property-x';
import arraySlice from 'array-slice-x';
import toBoolean from 'to-boolean-x';
import isNil from 'is-nil-x';
import methodize from 'simple-methodize-x';

const EMPTY_STRING = '';
const match = methodize(EMPTY_STRING.match);
const slice = methodize(EMPTY_STRING.slice);
const search = methodize(EMPTY_STRING.search);
const indexOf = methodize(EMPTY_STRING.indexOf);
const lastIndexOf = methodize(EMPTY_STRING.lastIndexOf);
const aJoin = methodize([].join);

/* Used to match `RegExp` flags from their coerced string values. */
const reFlags = /\w*$/;
const RegExpCtr = reFlags.constructor;
const rxTest = methodize(reFlags.test);
const rxExec = methodize(reFlags.exec);

/* Used to compose unicode character classes. */
const rsAstralRange = '\\ud800-\\udfff';
const rsComboMarksRange = '\\u0300-\\u036f\\ufe20-\\ufe23';
const rsComboSymbolsRange = '\\u20d0-\\u20f0';
const rsVarRange = '\\ufe0e\\ufe0f';

/* Used to compose unicode capture groups. */
const rsAstral = `[${rsAstralRange}]`;
const rsCombo = `[${rsComboMarksRange}${rsComboSymbolsRange}]`;
const rsFitz = '\\ud83c[\\udffb-\\udfff]';
const rsModifier = `(?:${rsCombo}|${rsFitz})`;
const rsNonAstral = `[^${rsAstralRange}]`;
const rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}';
const rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]';
const rsZWJ = '\\u200d';

/* Used to compose unicode regexes. */
const reOptMod = `${rsModifier}?`;
const rsOptVar = `[${rsVarRange}]?`;
const rsOptJoin = `(?:${rsZWJ}(?:${aJoin([rsNonAstral, rsRegional, rsSurrPair], '|')})${rsOptVar}${reOptMod})*`;
const rsSeq = rsOptVar + reOptMod + rsOptJoin;
const rsSymbol = `(?:${aJoin([`${rsNonAstral + rsCombo}?`, rsCombo, rsRegional, rsSurrPair, rsAstral], '|')})`;

/*
 * Used to match string symbols
 * @see https://mathiasbynens.be/notes/javascript-unicode
 */
const reComplexSymbol = new RegExpCtr(`${rsFitz}(?=${rsFitz})|${rsSymbol}${rsSeq}`, 'g');

/*
 * Used to detect strings with [zero-width joiners or code points from
 * the astral planes](http://eev.ee/blog/2015/09/12/dark-corners-of-unicode/).
 */
const reHasComplexSymbol = new RegExpCtr(`[${rsZWJ}${rsAstralRange}${rsComboMarksRange}${rsComboSymbolsRange}${rsVarRange}]`);

/**
 * Gets the number of symbols in `string`.
 *
 * @private
 * @param {string} string - The string to inspect.
 * @returns {number} Returns the string size.
 */
const stringSize = function _stringSize(string) {
  if (toBoolean(string) === false || rxTest(reHasComplexSymbol, string) === false) {
    return string.length;
  }

  reComplexSymbol.lastIndex = 0;
  let result = 0;
  while (rxTest(reComplexSymbol, string)) {
    result += 1;
  }

  return result;
};

const getOptions = function getOptions(options) {
  const opts = {length: 30, omission: '...', separator: null};

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

const getConsts = function getConsts(str) {
  if (rxTest(reHasComplexSymbol, str)) {
    const matchSymbols = match(str, reComplexSymbol);

    return {
      matchSymbols: match(str, reComplexSymbol),
      strLength: matchSymbols.length,
    };
  }

  return {
    matchSymbols: null,
    strLength: str.length,
  };
};

const getNewEnd = function getNewEnd(rxSeperator, result) {
  let newEnd;
  let rxMatch = rxExec(rxSeperator, result);
  while (rxMatch) {
    newEnd = rxMatch.index;
    rxMatch = rxExec(rxSeperator, result);
  }

  return newEnd;
};

const getRxResult = function getRxResult(obj) {
  const {str, separator, end, result} = obj;

  if (search(slice(str, end), separator)) {
    const rxSeperator = toBoolean(separator.global)
      ? separator
      : new RegExpCtr(separator.source, `${safeToString(rxExec(reFlags, separator))}g`);

    rxSeperator.lastIndex = 0;
    const newEnd = getNewEnd(rxSeperator, result);

    return slice(result, 0, typeof newEnd === 'undefined' ? end : newEnd);
  }

  return result;
};

const getResult = function getResult(obj) {
  const {str, separator, end, result} = obj;

  if (isRegExp(separator)) {
    return getRxResult({str, separator, end, result});
  }

  if (indexOf(str, separator, end) !== end) {
    const index = lastIndexOf(result, separator);

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
const truncate = function truncate(string, options) {
  const str = safeToString(string);
  const {length, omission, separator} = getOptions(options);
  const {strLength, matchSymbols} = getConsts(str);

  if (length >= strLength) {
    return str;
  }

  const end = length - stringSize(omission);

  if (end < 1) {
    return omission;
  }

  const result = matchSymbols ? aJoin(arraySlice(matchSymbols, 0, end), EMPTY_STRING) : slice(str, 0, end);

  if (isNil(separator)) {
    return result + omission;
  }

  return getResult({str, separator, end: matchSymbols ? result.length : end, result}) + omission;
};

export default truncate;
