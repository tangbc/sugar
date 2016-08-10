import Directive from './directive';

/**
 * 解析模块的类式继承
 * @param   {Function}   SubParser
 * @return  {Prototype}
 */
export function linkParser (SubParser) {
	return SubParser.prototype = Object.create(Parser.prototype);
}


/**
 * Parser 基础解析器模块，指令解析模块都继承于 Parser
 */
export default function Parser (vm, node, desc, scope) {
	// 数据缓存
	this.vm = vm;
	this.el = node;
	this.desc = desc;
	this.$scope = scope;

	// 解析的指令集合(相同类型)
	this.dirs = [];
	this.parse();
}

/**
 * 绑定一个基础指令实例
 */
Parser.prototype.bind = function () {
	var dir = new Directive(this, this.el, this.desc, this.$scope);
	this.dirs.push(dir);
	dir.install();
}