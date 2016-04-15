define([
	'../parser',
	'../../util'
], function(Parser, util) {

	function Vtext(vm) {
		this.vm = vm;
		Parser.call(this);
	}
	var vtext = Vtext.prototype = Object.create(Parser.prototype);

	/**
	 * 解析 v-text, {{text}} 指令
	 * @param   {Array}       fors        [vfor 数据]
	 * @param   {DOMElement}  node        [指令节点]
	 * @param   {String}      expression  [指令表达式]
	 */
	vtext.parse = function() {
		this.bind.apply(this, arguments);
	}

	/**
	 * 更新视图
	 * @param   {DOMElement}  node
	 * @param   {String}      text
	 */
	vtext.update = function() {
		var updater = this.vm.updater;
		updater.updateNodeTextContent.apply(updater, arguments);
	}

	return Vtext;
});