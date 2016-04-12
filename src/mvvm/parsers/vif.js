define([
	'../parser',
	'../../util'
], function(parser, util) {

	var vif = Object.create(parser);

	/**
	 * 解析 v-if 指令
	 * @param   {Object}      vm          [VM 对象]
	 * @param   {Array}       fors        [vfor 数据]
	 * @param   {DOMElement}  node        [指令节点]
	 * @param   {String}      expression  [指令表达式]
	 */
	vif.parse = function() {
		this.bind.apply(this, arguments);
	}

	/**
	 * 更新视图
	 * @param   {DOMElement}   node
	 * @param   {Boolean}      isRender
	 */
	vif.update = function() {
		var updater = this.updater;
		updater.updateNodeRenderContent.apply(updater, arguments);
	}

	return vif;
});