define([
	'../parser',
	'../../util'
], function(Parser, util) {

	function Vhtml(vm) {
		this.vm = vm;
		Parser.call(this);
	}
	var vhtml = Vhtml.prototype = Object.create(Parser.prototype);

	/**
	 * 解析 v-html, {{{html}}} 指令
	 * @param   {Array}       fors        [vfor 数据]
	 * @param   {DOMElement}  node        [指令节点]
	 * @param   {String}      expression  [指令表达式]
	 */
	vhtml.parse = function() {
		this.bind.apply(this, arguments);
	}

	/**
	 * 更新视图
	 * @param   {DOMElement}  node
	 * @param   {String}      html
	 */
	vhtml.update = function() {
		var updater = this.vm.updater;
		updater.updateNodeHtmlContent.apply(updater, arguments);
	}

	return Vhtml;
});