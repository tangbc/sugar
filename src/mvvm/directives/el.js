import { warn } from '../../util';
import Parser, { linkParser } from '../parser';

/**
 * v-el 指令解析模块
 * 不需要实例化 Directive
 */
export function VEl () {
	Parser.apply(this, arguments);
}

let vel = linkParser(VEl);

/**
 * 解析 v-el 指令
 * 不需要在 model 中声明
 */
vel.parse = function () {
	// 不能在 vfor 中使用
	if (!this.scope) {
		this.vm.$regEles[this.desc.expression] = this.el;
	} else {
		warn('v-el can not be used inside v-for! Consider use v-custom to handle v-for element.');
	}
}
