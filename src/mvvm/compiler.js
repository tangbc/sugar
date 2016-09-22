import { directiveParsers } from './directives/index';
import { createObserver, setComputedProperty } from './observe/index';
import { defRec, each, warn, isObject, nodeToFragment } from '../util';
import { hasAttr, isElement, isTextNode, removeAttr, empty } from '../dom';

const regNewline = /\n/g;
const regText = /\{\{(.+?)\}\}/g;
const regHtml = /\{\{\{(.+?)\}\}\}/g;
const regMustacheSpace = /\s\{|\{|\{|\}|\}|\}/g;
const noNeedParsers = ['velse', 'vpre', 'vcloak'];
const regMustache = /(\{\{.*\}\})|(\{\{\{.*\}\}\})/;

/**
 * 是否是合法指令
 * @param   {String}   directive
 * @return  {Boolean}
 */
function isDirective (directive) {
	return directive.indexOf('v-') === 0;
}

/**
 * 节点的子节点是否延迟编译
 * 单独处理 vif, vfor 和 vpre 子节点的编译
 * @param   {Element}  node
 * @return  {Boolean}
 */
function hasLateCompileChilds (node) {
	return hasAttr(node, 'v-if') || hasAttr(node, 'v-for') || hasAttr(node, 'v-pre');
}

/**
 * 节点是否含有合法指令
 * @param   {Element}  node
 * @return  {Number}
 */
function hasDirective (node) {
	if (isElement(node) && node.hasAttributes()) {
		let nodeAttrs = node.attributes;

		for (let i = 0; i < nodeAttrs.length; i++) {
			if (isDirective(nodeAttrs[i].name)) {
				return true;
			}
		}

	} else if (isTextNode(node) && regMustache.test(node.textContent)) {
		return true;
	}
}

/**
 * 获取指令信息
 * @param   {Attr}    attribute
 * @return  {Object}
 */
function getDirectiveDesc (attribute) {
	var attr = attribute.name;
	var expression = attribute.value;
	var directive, args, pos = attr.indexOf(':');

	if (pos > -1) {
		args = attr.substr(pos + 1);
		directive = attr.substr(0, pos);
	} else {
		directive = attr;
	}

	return { args, attr, directive, expression };
}

/**
 * ViewModel 编译模块
 * @param  {Object}  option  [参数对象]
 */
function Compiler (option) {
	var model = option.model;
	var element = option.view;
	var computed = option.computed;

	if (!isElement(element)) {
		return warn('view must be a type of DOMElement: ', element);
	}

	if (!isObject(model)) {
		return warn('model must be a type of Object: ', model);
	}

	// 编译节点缓存队列
	this.$queue = [];
	// 数据模型对象
	this.$data = model;
	// 缓存根节点
	this.$element = element;
	// DOM 注册索引
	defRec(this.$data, '$els', {});

	// 指令实例缓存
	this.$directives = [];
	// 指令解析模块
	this.$parsers = directiveParsers;

	// 监测数据模型
	this.$ob = createObserver(this.$data, '__MODEL__');
	// 设置计算属性
	if (computed) {
		setComputedProperty(this.$data, computed);
	}

	// 编译完成后的回调集合
	this.$afters = [];
	// 自定义指令刷新函数
	this.$customs = option.customs || {};

	// 是否立刻编译根元素
	if (!option.lazy) {
		this.mount();
	}
}

var cp = Compiler.prototype;

/**
 * 挂载/编译根元素
 */
cp.mount = function () {
	this.$done = false;
	this.$fragment = nodeToFragment(this.$element);
	this.compile(this.$fragment, true);
}

/**
 * 收集节点所有需要编译的指令
 * 并在收集完成后编译指令队列
 * @param   {Element}  element  [编译节点]
 * @param   {Boolean}  root     [是否是根节点]
 * @param   {Object}   scope    [vfor 取值域]
 */
cp.compile = function (element, root, scope) {
	var childNodes = element.childNodes;

	if (root && hasDirective(element)) {
		this.$queue.push([element, scope]);
	}

	for (let i = 0; i < childNodes.length; i++) {
		let node = childNodes[i];

		if (hasDirective(node)) {
			this.$queue.push([node, scope]);
		}

		if (node.hasChildNodes() && !hasLateCompileChilds(node)) {
			this.compile(node, false, scope);
		}
	}

	if (root) {
		this.compileAll();
	}
}

/**
 * 编译节点缓存队列
 */
cp.compileAll = function () {
	each(this.$queue, function (info) {
		this.complieNode(info);
		return null;
	}, this);

	this.completed();
}

/**
 * 收集并编译节点指令
 * @param   {Array}  info  [node, scope]
 */
cp.complieNode = function (info) {
	var node = info[0], scope = info[1];

	if (isElement(node)) {
		let vfor, attrs = [];
		// node 节点集合转为数组
		let nodeAttrs = node.attributes;

		for (let i = 0; i < nodeAttrs.length; i++) {
			let atr = nodeAttrs[i];
			let name = atr.name;

			if (isDirective(name)) {
				if (name === 'v-for') {
					vfor = atr;
				}
				attrs.push(atr);
			}
		}

		// vfor 指令与其他指令共存时优先编译 vfor 指令
		if (vfor) {
			defRec(node, '__dirs__', attrs.length);
			attrs = [vfor];
			vfor = null;
		}

		// 解析节点指令
		each(attrs, function (attr) {
			this.parse(node, attr, scope);
		}, this);

	} else if (isTextNode(node)) {
		this.parseText(node, scope);
	}
}

/**
 * 解析元素节点指令
 * @param   {Element}  node
 * @param   {Object}   attr
 * @param   {Object}   scope
 */
cp.parse = function (node, attr, scope) {
	var desc = getDirectiveDesc(attr);
	var directive = desc.directive;

	var dir = 'v' + directive.substr(2);
	var Parser = this.$parsers[dir];

	// 移除指令标记
	removeAttr(node, desc.attr);

	// 不需要实例化解析的指令
	if (noNeedParsers.indexOf(dir) > -1) {
		return;
	}

	if (Parser) {
		this.$directives.push(new Parser(this, node, desc, scope));
	} else {
		warn('[' + directive + '] is an unknown directive!');
	}
}

/**
 * 解析文本指令 {{ text }} 和 {{{ html }}}
 * @param   {Element}  node
 * @param   {Object}   scope
 */
cp.parseText = function (node, scope) {
	var exp, match, matches, pieces, tokens = [], desc = {};
	var text = node.textContent.trim().replace(regNewline, '');

	// html match
	if (regHtml.test(text)) {
		matches = text.match(regHtml);
		match = matches[0];
		exp = match.replace(regMustacheSpace, '');

		if (match.length !== text.length) {
			return warn('[' + text + '] compile for HTML can not have a prefix or suffix');
		}

		desc.expression = exp;
		this.$directives.push(new directiveParsers.vhtml(this, node.parentNode, desc, scope));

	} else {
		pieces = text.split(regText);
		matches = text.match(regText);

		// 文本节点转化为常量和变量的组合表达式
		// 'a {{b}} c' => '"a " + b + " c"'
		each(pieces, function (piece) {
			// {{text}}
			if (matches.indexOf('{{' + piece + '}}') > -1) {
				tokens.push('(' + piece + ')');
			} else if (piece) {
				tokens.push('"' + piece + '"');
			}
		});

		desc.expression = tokens.join('+');
		this.$directives.push(new directiveParsers.vtext(this, node, desc, scope));
	}
}

/**
 * 停止编译节点的剩余指令
 * 如含有其他指令的 vfor 节点
 * 应保留指令信息并放到循环列表中编译
 * @param   {Element}  node
 */
cp.block = function (node) {
	each(this.$queue, function (info) {
		if (node === info[0]) {
			return null;
		}
	});
}

/**
 * 添加编译完成后的回调函数
 * @param  {Function}  callback
 * @param  {Object}    context
 */
cp.after = function (callback, context) {
	this.$afters.push([callback, context]);
}

/**
 * 检查根节点是否编译完成
 */
cp.completed = function () {
	if (this.$queue.length === 0 && !this.$done) {
		this.$done = true;
		this.$element.appendChild(this.$fragment);

		// 触发编译完成后的回调函数
		each(this.$afters, function (after) {
			after[0].call(after[1]);
			return null;
		});
	}
}

/**
 * 销毁函数，销毁指令，清空根节点
 */
cp.destroy = function () {
	this.$data = null;
	empty(this.$element);
	each(this.$directives, function (directive) {
		directive.destroy();
		return null;
	});
}

export default Compiler;
