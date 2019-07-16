/**
 * @file Truncate a string to a maximum specified length.
 * @version 3.1.1
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module truncate-x
 */

import isUndefined from 'validate.io-undefined';

import {toLength2018 as toLength} from 'to-length-x';
import isRegExp from 'is-regexp-x';
import safeToString from 'to-string-symbols-supported-x';
import isObjectLike from 'is-object-like-x';
import isFalsey from 'is-falsey-x';
import hasOwn from 'has-own-property-x';
import arraySlice from 'array-slice-x';

const sMatch = String.prototype.match;
const sSlice = String.prototype.slice;
const sSearch = String.prototype.search;
const sIndexOf = String.prototype.indexOf;
const sLastIndexOf = String.prototype.lastIndexOf;
const aJoin = Array.prototype.join;
const Rx = RegExp;

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
const reComplexSymbol = new Rx(`${rsFitz}(?=${rsFitz})|${rsSymbol}${rsSeq}`, 'g');

/*
 * Used to detect strings with [zero-width joiners or code points from
 * the astral planes](http://eev.ee/blog/2015/09/12/dark-corners-of-unicode/).
 */
const reHasComplexSymbol = new Rx(`[${rsZWJ}${rsAstralRange}${rsComboMarksRange}${rsComboSymbolsRange}${rsVarRange}]`);

/**
 * Gets the number of symbols in `string`.
 *
 * @private
 * @param {string} string - The string to inspect.
 * @returns {number} Returns the string size.
 */
const stringSize = function _stringSize(string) {
  if (isFalsey(string) || rxTest.call(reHasComplexSymbol, string) === false) {
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
export default function truncate(string, options) {
  const str = safeToString(string);
  let length = 30;
  let omission = '...';
  let separator;

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

  let result = matchSymbols ? aJoin.call(arraySlice(matchSymbols, 0, end), '') : sSlice.call(str, 0, end);

  if (isUndefined(separator)) {
    return result + omission;
  }

  if (matchSymbols) {
    end += result.length - end;
  }

  if (isRegExp(separator)) {
    if (sSearch.call(sSlice.call(str, end), separator)) {
      const substr = result;

      if (isFalsey(separator.global)) {
        separator = new Rx(separator.source, `${safeToString(rxExec.call(reFlags, separator))}g`);
      }

      separator.lastIndex = 0;
      let newEnd;
      let match = rxExec.call(separator, substr);
      while (match) {
        newEnd = match.index;
        match = rxExec.call(separator, substr);
      }

      result = sSlice.call(result, 0, isUndefined(newEnd) ? end : newEnd);
    }
  } else if (sIndexOf.call(str, separator, end) !== end) {
    const index = sLastIndexOf.call(result, separator);

    if (index > -1) {
      result = sSlice.call(result, 0, index);
    }
  }

  return result + omission;
}
