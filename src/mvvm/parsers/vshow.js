import Parser from '../parser';

/**
 * v-show 指令解析模块
 */
function Vshow(vm) {
	this.vm = vm;
	Parser.call(this);
}
var vshow = Vshow.prototype = Object.create(Parser.prototype);

/**
 * 解析 v-show 指令
 * @param   {Object}      fors        [vfor 数据]
 * @param   {DOMElement}  node        [指令节点]
 * @param   {String}      expression  [指令表达式]
 */
vshow.parse = function() {
	this.bind.apply(this, arguments);
}

/**
 * 更新视图
 * @param   {DOMElement}   node
 * @param   {Boolean}      isShow
 */
vshow.update = function() {
	var updater = this.vm.updater;
	updater.updateDisplay.apply(updater, arguments);
}

export default Vshow;
