import Directive from './directive';

/**
 * Parser 基础解析器模块，指令解析模块都继承于 Parser
 * @param  {Object}   vm
 * @param  {Element}  node
 * @param  {Object}   desc
 * @param  {Object}   scope
 */
export default function Parser (vm, node, desc, scope) {
	// 数据缓存
	this.vm = vm;
	this.el = node;
	this.desc = desc;
	this.$scope = scope;

	this.parse();
}

var pp = Parser.prototype;

/**
 * 绑定一个指令实例
 */
pp.bind = function () {
	var dir = this.directive = new Directive(this);
	dir.install();
}

/**
 * 指令销毁函数
 */
pp.destroy = function () {
	var directive = this.directive;

	// 有些指令没有实例化 Directive
	// 所以需要调用额外定义的销毁函数
	if (directive) {
		directive.uninstall();
	} else if (this._destroy) {
		this._destroy();
	}

	this.vm = this.desc = this.$scope = null;
}


/**
 * 解析模块的类式继承
 * @param   {Function}   PreParser
 * @return  {Prototype}
 */
export function linkParser (PreParser) {
	return PreParser.prototype = Object.create(Parser.prototype);
}