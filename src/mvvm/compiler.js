import VOn from './directives/von';
import VEl from './directives/vel';
import VIf from './directives/vif';
import VFor from './directives/vfor';
import VText from './directives/vtext';
import VHtml from './directives/vhtml';
import VShow from './directives/vshow';
import VBind from './directives/vbind';
import VModel from './directives/vmodel';

import { createObserver } from './observer';
import { hasAttr, isElement, isTextNode, removeAttr, empty} from '../dom';
import { def, each, warn, isObject, nodeToFragment, clearObject } from '../util';

const regNewline = /\n/g;
const regText = /\{\{(.+?)\}\}/g;
const regHtml = /\{\{\{(.+?)\}\}\}/g;
const regMustacheSpace = /\s\{|\{|\{|\}|\}|\}/g;
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
 * @param   {DOMElement}   node
 * @return  {Boolean}
 */
function isLateCompileChilds (node) {
	return hasAttr(node, 'v-if') || hasAttr(node, 'v-for') || hasAttr(node, 'v-pre');
}

/**
 * 节点是否含有合法指令
 * @param   {DOMElement}  node
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
 * 元素编译模块
 * @param  {Object}  option  [数据参数对象]
 */
function Compiler (option) {
	var element = option.view;
	var model = option.model;

	if (!isElement(element)) {
		return warn('element must be a type of DOMElement: ', element);
	}

	if (!isObject(model)) {
		return warn('model must be a type of Object: ', model);
	}

	// 缓存根节点
	this.$element = element;
	// 根节点转文档碎片（element 将被清空）
	this.$fragment = nodeToFragment(this.$element);

	// 数据模型对象
	this.$data = model;

	// 未编译节点缓存队列
	this.$unCompiles = [];
	// 根节点是否已完成编译
	this.$rootComplied = false;
	// 指令缓存
	this.directives = [];

	// 指令解析模块
	let von = VOn;
	let vel = VEl;
	let vif = VIf;
	let vfor = VFor;
	let vtext = VText;
	let vhtml = VHtml;
	let vshow = VShow;
	let vbind = VBind;
	let vmodel = VModel;

	this.parsers = { von, vel, vif, vfor, vtext, vhtml, vshow, vbind, vmodel }

	this.init();
}

Compiler.prototype.init = function () {
	createObserver(this.$data, this);
	this.complieElement(this.$fragment, true);
}

/**
 * 编译文档碎片/节点
 * @param   {Element}  element  [文档碎片/节点]
 * @param   {Boolean}  root     [是否是编译根节点]
 * @param   {Object}   scope    [vfor 取值域]
 */
Compiler.prototype.complieElement = function (element, root, scope) {
	var childNodes = element.childNodes;

	if (root && hasDirective(element)) {
		this.$unCompiles.push([element, scope]);
	}

	for (let i = 0; i < childNodes.length; i++) {
		let node = childNodes[i];

		if (hasDirective(node)) {
			this.$unCompiles.push([node, scope]);
		}

		if (node.hasChildNodes() && !isLateCompileChilds(node)) {
			this.complieElement(node, false, scope);
		}
	}

	if (root) {
		this.compileAll();
	}
}

/**
 * 编译节点缓存队列
 */
Compiler.prototype.compileAll = function () {
	each(this.$unCompiles, function (info) {
		this.complieDirectives(info);
		return null;
	}, this);

	this.checkRoot();
}

/**
 * 收集并编译节点指令
 * @param   {Array}  info   [node, scope]
 */
Compiler.prototype.complieDirectives = function (info) {
	var node = info[0], scope = info[1];

	if (isElement(node)) {
		let vfor, attrs = [];
		// node 节点集合转为数组
		let nodeAttrs = node.attributes;

		for (var i = 0; i < nodeAttrs.length; i++) {
			let atr = nodeAttrs[i];
			let name = atr.name;
			if (isDirective(name)) {
				if (name === 'v-for') {
					vfor = atr;
				}
				attrs.push(atr);
			}
		}

		// vfor 编译时标记节点的指令数
		if (vfor) {
			def(node, '__directives', attrs.length);
			attrs = [vfor];
			vfor = null;
		}

		// 编译节点指令
		each(attrs, function (attr) {
			this.compile(node, attr, scope);
		}, this);

	} else if (isTextNode(node)) {
		this.compileText(node, scope);
	}
}

/**
 * 编译元素节点指令
 * @param   {DOMElement}  node
 * @param   {Object}      attr
 * @param   {Object}      scope
 */
Compiler.prototype.compile = function (node, attr, scope) {
	var desc = getDirectiveDesc(attr);
	var directive = desc.directive;

	// 移除指令标记
	removeAttr(node, desc.attr);

	var dir = 'v' + directive.substr(2);
	var Parser = this.parsers[dir];

	if (Parser) {
		this.directives.push(new Parser(this, node, desc, scope));
	} else {
		warn('[' + directive + '] is an unknown directive!');
	}
}

/**
 * 编译文本节点 {{text}} or {{{html}}}
 * @param   {DOMElement}   node
 * @param   {Object}       scope
 */
Compiler.prototype.compileText = function (node, scope) {
	var exp, match, matches, pieces, tokens = [];
	var text = node.textContent.trim().replace(regNewline, '');

	// html match
	if (regHtml.test(text)) {
		matches = text.match(regHtml);
		match = matches[0];
		exp = match.replace(regMustacheSpace, '');

		if (match.length !== text.length) {
			return warn('[' + text + '] compile for HTML can not have a prefix or suffix');
		}

		this.vhtml.parse.call(this.vhtml, scope, node, exp);

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

		this.vtext.parse.call(this.vtext, scope, node, tokens.join('+'));
	}
}

/**
 * 停止编译节点的剩余指令，如 vfor 的根节点
 * @param   {DOMElement}  node
 */
Compiler.prototype.block = function (node) {
	each(this.$unCompiles, function (info) {
		if (node === info[0]) {
			return null;
		}
	});
}

/**
 * 检查根节点是否编译完成
 */
Compiler.prototype.checkRoot = function () {
	if (this.$unCompiles.length === 0 && !this.$rootComplied) {
		this.$rootComplied = true;
		this.$element.appendChild(this.$fragment);
	}
}

/**
 * 销毁函数
 */
Compiler.prototype.destroy = function () {
	empty(this.$element);
	util.clearObject(this.parsers);
	this.$fragment = this.$data = this.$unCompiles = null;
}

export default Compiler;
