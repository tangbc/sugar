define([
	'../parser',
	'../../util'
], function(parser, util) {

	var vel = Object.create(parser);

	/**
	 * 解析 v-el 指令 (不需要在 model 中声明)
	 * @param   {Object}      vm      [VM 对象]
	 * @param   {Array}       fors    [vfor 数据]
	 * @param   {DOMElement}  node    [注册节点]
	 * @param   {String}      value   [注册字段]
	 */
	vel.parse = function(vm, fors, node, value) {
		var key, alias, scope;

		if (fors) {
			alias = util.getExpAlias(value);

			// vel 在 vfor 循环中只能在当前循环体中赋值
			if (alias !== fors.alias) {
				util.warn('when v-el use in v-for must be defined inside current loop body!');
				return;
			}

			scope = fors.scope;

			if (util.isObject(scope)) {
				key = util.getExpKey(value);
				scope[key] = node;
			}
		}
		else {
			vm.$data.$els[value] = node;
		}
	}

	return vel;
});