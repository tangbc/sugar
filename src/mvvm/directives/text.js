import { _toString } from '../../util';
import Parser, { linkParser } from '../parser';

/**
 * v-text 指令解析模块
 */
export function VText () {
	Parser.apply(this, arguments);
}

let vtext = linkParser(VText);

/**
 * 解析 v-text, {{ text }} 指令
 */
vtext.parse = function () {
	this.bind();
}

/**
 * 更新视图
 * @param  {String}  value
 */
vtext.update = function (value) {
	this.el.textContent = _toString(value);
}
