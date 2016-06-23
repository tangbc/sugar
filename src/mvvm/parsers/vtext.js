var Parser = require('../parser');

function Vtext(vm) {
	this.vm = vm;
	Parser.call(this);
}
var vtext = Vtext.prototype = Object.create(Parser.prototype);

/**
 * 解析 v-text, {{text}} 指令
 * @param   {Object}      fors        [vfor 数据]
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
	updater.updateTextContent.apply(updater, arguments);
}

module.exports = Vtext;
