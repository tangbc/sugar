define([
	'../parser'
], function(Parser) {

	function VClass(vm) {
		this.vm = vm;
		Parser.call(this);
	}
	var vclass = VClass.prototype = Object.create(Parser.prototype);

	/**
	 * 解析 v-bind-class
	 * @param   {Object}      fors        [vfor 数据]
	 * @param   {DOMElement}  node        [指令节点]
	 * @param   {String}      expression  [指令表达式]
	 */
	vclass.parse = function(fors, node, expression) {
		//
	}

	return VClass;
});