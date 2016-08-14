import { empty } from '../../dom';
import { stringToFragment } from '../../util';
import Parser, { linkParser } from '../parser';

/**
 * v-html 指令解析模块
 */
export function VHtml () {
	Parser.apply(this, arguments);
}

var vhtml = linkParser(VHtml);

/**
 * 解析 v-html, {{{html}}} 指令
 */
vhtml.parse = function () {
	this.bind();
}

/**
 * 更新视图
 * @param   {String}   htmlString
 */
vhtml.update = function (htmlString) {
	empty(this.el).appendChild(stringToFragment(String(htmlString)));
}