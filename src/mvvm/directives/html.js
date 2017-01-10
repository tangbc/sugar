import { _toString } from '../../util';
import Parser, { linkParser } from '../parser';

/**
 * v-html 指令解析模块
 */
export function VHtml () {
	Parser.apply(this, arguments);
}

let vhtml = linkParser(VHtml);

/**
 * 解析 v-html 指令
 */
vhtml.parse = function () {
	this.bind();
}

/**
 * 更新视图
 * @param  {String}  value
 */
vhtml.update = function (value) {
	this.el.innerHTML = _toString(value);
}
