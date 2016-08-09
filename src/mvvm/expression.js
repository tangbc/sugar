import { error } from '../util';

// 匹配常量缓存序号 "1"
const regSaveConst = /"(\d+)"/g;
// 只含有 true 或 false
const regBool = /^(true|false)$/;
// 匹配表达式中的常量
const regReplaceConst = /[\{,]\s*[\w\$_]+\s*:|('[^']*'|"[^"]*")|typeof /g;
// 匹配表达式中的取值域
const regReplaceScope = /[^\w$\.]([A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\])*)/g;
// 匹配常规取值: item or item['x'] or item["y"] or item[0]
const regNormal = /^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\]|\[\d+\]|\[[A-Za-z_$][\w$]*\])*$/;

// 表达式中允许的关键字
const allowKeywords = 'Math.parseInt.parseFloat.Date.this.true.false.null.undefined.Infinity.NaN.isNaN.isFinite.decodeURI.decodeURIComponent.encodeURI.encodeURIComponent';
const regAllowKeyword = new RegExp('^(' + allowKeywords.replace(/\./g, '\\b|') + '\\b)');

// 表达式中禁止的关键字
const avoidKeywords = 'var.const.let.if.else.for.in.continue.switch.case.break.default.function.return.do.while.delete.try.catch.throw.finally.with.import.export.instanceof.yield.await';
const regAviodKeyword = new RegExp('^(' + avoidKeywords.replace(/\./g, '\\b|') + '\\b)');


/**
 * 是否是常规指令表达式
 * @param   {String}   expression
 * @return  {Boolean}
 */
function isNormal (expression) {
	return regNormal.test(expression) && !regBool.test(expression) && expression.indexOf('Math.') !== 0;
}

// 保存常量，返回序号 "i"
var consts = [];
function saveConst (string) {
	var i = consts.length;
	consts[i] = string;
	return '"' + i + '"';
}

/**
 * 返回替换之前的常量
 * @param   {Strinf}  string
 * @param   {Number}  i
 * @return  {String}
 */
function returnConst (string, i) {
	return consts[i];
}

/**
 * 返回变量/单词的 scope 替换
 * @param   {String}  string
 * @return  {String}
 */
function replaceScope (string) {
	var pad = string.charAt(0);
	var path = string.slice(1);

	if (regAllowKeyword.test(path)) {
		return string;
	} else {
		path = path.indexOf('"') > -1 ? path.replace(regSaveConst, returnConst) : path;
		return pad + 'scope.' + path;
	}
}

/**
 * 为表达式中的变量添加 scope 关键字
 * @return  {String}
 */
function addScope (expression) {
	if (isNormal(expression)) {
		return 'scope.' + expression;
	}

	expression = (' ' + expression).replace(regReplaceConst, saveConst);
	expression = expression.replace(regReplaceScope, replaceScope);
	expression = expression.replace(regSaveConst, returnConst);

	return expression;
}

/**
 * 空操作取值函数
 */
function noop () {}

/**
 * 生成表达式的取值函数
 * @param   {String}    expression
 * @return  {Function}
 */
export function createGetter (expression) {
	try {
		return new Function('scope', 'return ' + addScope(expression) + ';');
	} catch (e) {
		error('Invalid generated expression: ' + expression);
		return noop;
	}
}