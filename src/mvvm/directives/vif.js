import Parser from '../parser';

/**
 * v-if 指令解析模块
 */
function Vif (vm) {
	this.vm = vm;
	Parser.call(this);
}
var vif = Vif.prototype = Object.create(Parser.prototype);

/**
 * 解析 v-if 指令
 * @param   {Object}      fors        [vfor 数据]
 * @param   {DOMElement}  node        [指令节点]
 * @param   {String}      expression  [指令表达式]
 */
vif.parse = function () {
	this.bind.apply(this, arguments);
}

/**
 * 更新视图
 * @param   {DOMElement}   node
 * @param   {Boolean}      isRender
 */
vif.update = function () {
	var updater = this.vm.updater;
	updater.updateRenderContent.apply(updater, arguments);
}

export default Vif;
