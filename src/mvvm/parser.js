import { isFunc } from '../util';
import Directive from './directive';

/**
 * Parser 基础指令解析器模块
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
	this.scope = scope;

	// 解析指令
	this.parse();
}

let pp = Parser.prototype;

/**
 * 安装指令实例
 */
pp.bind = function () {
	this.directive = new Directive(this);
	this.directive.mount();
}

/**
 * 指令销毁函数
 */
pp.destroy = function () {
	let directive = this.directive;

	// 有些指令没有实例化 Directive
	// 所以需要调用额外定义的销毁函数
	if (directive) {
		directive.destroy();
	} else if (isFunc(this._destroy)) {
		this._destroy();
	}

	this.vm = this.el = this.desc = this.scope = null;
}


/**
 * 解析器模块的类式继承
 * @param   {Function}   PostParser
 * @return  {Prototype}
 */
export function linkParser (PostParser) {
	return PostParser.prototype = Object.create(Parser.prototype);
}
