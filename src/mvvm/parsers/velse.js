define([
	'../../util'
], function(util) {

	/**
	 * 解析 v-else 指令 (v-show 和 v-if 的 else 板块)
	 * @param   {Object}      vm
	 * @param   {Array}       fors
	 * @param   {DOMElement}  node
	 */
	return function(vm, fors, node) {
		util.defineProperty(node, '_directive', 'v-else');
	}
});