import toLength from 'to-length-x';
import isRegExp from 'is-regexp-x';
import safeToString from 'to-string-symbols-supported-x';
import isObjectLike from 'is-object-like-x';
import hasOwn from 'has-own-property-x';
import arraySlice from 'array-slice-x';
import toBoolean from 'to-boolean-x';

const EMPTY_STRING = '';
const sMatch = EMPTY_STRING.match;
const sSlice = EMPTY_STRING.slice;
const sSearch = EMPTY_STRING.search;
const sIndexOf = EMPTY_STRING.indexOf;
const sLastIndexOf = EMPTY_STRING.lastIndexOf;
const aJoin = [].join;
/** @type {RegExpConstructor} */
const RegExpCtr = /none/.constructor;

/* Used to match `RegExp` flags from their coerced string values. */
const reFlags = /\w*$/;
const rxTest = reFlags.test;
const rxExec = reFlags.exec;

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
const rsOptJoin = `(?:${rsZWJ}(?:${aJoin.call([rsNonAstral, rsRegional, rsSurrPair], '|')})${rsOptVar}${reOptMod})*`;
const rsSeq = rsOptVar + reOptMod + rsOptJoin;
const rsSymbol = `(?:${aJoin.call([`${rsNonAstral + rsCombo}?`, rsCombo, rsRegional, rsSurrPair, rsAstral], '|')})`;

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
  if (toBoolean(string) === false || rxTest.call(reHasComplexSymbol, string) === false) {
    return string.length;
  }

  reComplexSymbol.lastIndex = 0;
  let result = 0;
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
const truncate = function truncate(string, options) {
  const str = safeToString(string);
  let length = 30;
  let omission = '...';
  let separator;

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

  let strLength = str.length;
  let matchSymbols;

  if (rxTest.call(reHasComplexSymbol, str)) {
    matchSymbols = sMatch.call(str, reComplexSymbol);
    strLength = matchSymbols.length;
  }

  if (length >= strLength) {
    return str;
  }

  let end = length - stringSize(omission);

  if (end < 1) {
    return omission;
  }

  let result = matchSymbols ? aJoin.call(arraySlice(matchSymbols, 0, end), EMPTY_STRING) : sSlice.call(str, 0, end);

  if (typeof separator === 'undefined') {
    return result + omission;
  }

  if (matchSymbols) {
    end += result.length - end;
  }

  if (isRegExp(separator)) {
    if (sSearch.call(sSlice.call(str, end), separator)) {
      const substr = result;

      if (toBoolean(separator.global) === false) {
        separator = new RegExpCtr(separator.source, `${safeToString(rxExec.call(reFlags, separator))}g`);
      }

      separator.lastIndex = 0;
      let newEnd;
      let match = rxExec.call(separator, substr);
      while (match) {
        newEnd = match.index;
        match = rxExec.call(separator, substr);
      }

      result = sSlice.call(result, 0, typeof newEnd === 'undefined' ? end : newEnd);
    }
  } else if (sIndexOf.call(str, separator, end) !== end) {
    const index = sLastIndexOf.call(result, separator);

    if (index > -1) {
      result = sSlice.call(result, 0, index);
    }
  }

  return result + omission;
};

export default truncate;
