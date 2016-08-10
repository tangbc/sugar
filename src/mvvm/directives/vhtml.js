import dom from '../../dom';
import Parser from '../parser';

/**
 * v-html 指令解析模块
 */
export function Vhtml (vm) {
	this.vm = vm;
	Parser.call(this);
}
var vhtml = Vhtml.prototype = Object.create(Parser.prototype);

/**
 * 解析 v-html, {{{html}}} 指令
 * @param   {Object}      fors        [vfor 数据]
 * @param   {DOMElement}  node        [指令节点]
 * @param   {String}      expression  [指令表达式]
 */
vhtml.parse = function (fors, node, expression) {
	this.bind.apply(this, [fors, (dom.isTextNode(node) ? node.parentNode : node), expression]);
}

/**
 * 更新视图
 * @param   {DOMElement}  node
 * @param   {String}      html
 */
vhtml.update = function () {
	var updater = this.vm.updater;
	updater.updateHtmlContent.apply(updater, arguments);
}