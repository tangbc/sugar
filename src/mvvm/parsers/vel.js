/**
 * v-el 指令解析模块
 * ===============
 */

import util from '../../util';
import Parser from '../parser';

function Vel(vm) {
	this.vm = vm;
	Parser.call(this);
}
var vel = Vel.prototype = Object.create(Parser.prototype);

/**
 * 解析 v-el 指令 (不需要在 model 中声明)
 * @param   {Object}      fors    [vfor 数据]
 * @param   {DOMElement}  node    [注册节点]
 * @param   {String}      value   [注册字段]
 */
vel.parse = function(fors, node, value) {
	if (fors) {
		let alias = util.getExpAlias(value);

		// vel 在 vfor 循环中只能在当前循环体中赋值
		if (alias !== fors.alias) {
			return util.warn('when v-el use in v-for must be defined inside current loop body!');
		}

		let scope = fors.scopes[alias];

		if (util.isObject(scope)) {
			let key = util.getExpKey(value);
			scope[key] = node;
		}
	}
	else {
		this.vm.$data.$els[value] = node;
	}
}

export default Vel;
