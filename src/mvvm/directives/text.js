import Parser, { linkParser } from '../parser';

/**
 * v-text 指令解析模块
 */
export function VText () {
	Parser.apply(this, arguments);
}

var vtext = linkParser(VText);

/**
 * 解析 v-text, {{ text }} 指令
 * @param   {Element}  node   [指令节点]
 * @param   {Object}   desc   [指令信息]
 * @param   {Object}   scope  [vfor 取值域]
 */
vtext.parse = function () {
	this.bind();
}

/**
 * 更新视图
 * @param   {String}   textValue
 */
vtext.update = function (textValue) {
	this.el.textContent = String(textValue);
}
