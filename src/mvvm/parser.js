import Directive from './directive';

/**
 * Parser 基础解析器模块，指令解析模块都继承于 Parser
 */
export default function Parser (vm, node, desc, scope) {
	// 数据缓存
	this.vm = vm;
	this.el = node;
	this.desc = desc;
	this.$scope = scope;

	this.parse();
}

/**
 * 绑定一个指令实例
 */
Parser.prototype.bind = function () {
	var dir = this.directive = new Directive(this);
	dir.install();
}


/**
 * 解析模块的类式继承
 * @param   {Function}   PreParser
 * @return  {Prototype}
 */
export function linkParser (PreParser) {
	return PreParser.prototype = Object.create(Parser.prototype);
}