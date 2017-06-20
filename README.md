<a name="module_truncate-x"></a>

## truncate-x
<a href="https://travis-ci.org/Xotic750/truncate-x"
title="Travis status">
<img src="https://travis-ci.org/Xotic750/truncate-x.svg?branch=master"
alt="Travis status" height="18">
</a>
<a href="https://david-dm.org/Xotic750/truncate-x"
title="Dependency status">
<img src="https://david-dm.org/Xotic750/truncate-x.svg"
alt="Dependency status" height="18"/>
</a>
<a href="https://david-dm.org/Xotic750/truncate-x#info=devDependencies"
title="devDependency status">
<img src="https://david-dm.org/Xotic750/truncate-x/dev-status.svg"
alt="devDependency status" height="18"/>
</a>
<a href="https://badge.fury.io/js/truncate-x" title="npm version">
<img src="https://badge.fury.io/js/truncate-x.svg"
alt="npm version" height="18">
</a>

truncate module.

**Version**: 1.0.0  
**Author**: Xotic750 <Xotic750@gmail.com>  
**License**: [MIT](&lt;https://opensource.org/licenses/MIT&gt;)  
**Copyright**: Xotic750  
<a name="exp_module_truncate-x--module.exports"></a>

### `module.exports([string], [options])` ⇒ <code>string</code> ⏏
Truncates `string` if it's longer than the given maximum string length.
The last characters of the truncated string are replaced with the omission
string which defaults to "...".

**Kind**: Exported function  
**Returns**: <code>string</code> - Returns the truncated string.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [string] | <code>string</code> | <code>&quot;&#x27;&#x27;&quot;</code> | The string to truncate. |
| [options] | <code>Object</code> |  | The options object. |
| [options.length] | <code>number</code> | <code>30</code> | The maximum string length. |
| [options.omission] | <code>string</code> | <code>&quot;&#x27;...&#x27;&quot;</code> | The string to indicate text is omitted. |
| [options.separator] | <code>RegExp</code> \| <code>string</code> |  | The separator pattern to truncate to. |

**Example**  
```js
truncate('hi-diddly-ho there, neighborino');
// 'hi-diddly-ho there, neighbo...'

truncate('hi-diddly-ho there, neighborino', {
  'length': 24,
  'separator': ' '
});
// 'hi-diddly-ho there,...'

truncate('hi-diddly-ho there, neighborino', {
  'length': 24,
  'separator': /,? +/
});
// 'hi-diddly-ho there...'

truncate('hi-diddly-ho there, neighborino', {
  'omission': ' [...]'
});
// 'hi-diddly-ho there, neig [...]'
```
