import dom from '../dom';
import util from '../util';
import Updater from './updater';
import Watcher from './watcher';
import Von from './parsers/von';
import Vel from './parsers/vel';
import Vif from './parsers/vif';
import Vfor from './parsers/vfor';
import Vtext from './parsers/vtext';
import Vhtml from './parsers/vhtml';
import Vshow from './parsers/vshow';
import Vbind from './parsers/vbind';
import Vmodel from './parsers/vmodel';

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
	return dom.hasAttr(node, 'v-if') || dom.hasAttr(node, 'v-for') || dom.hasAttr(node, 'v-pre');
}

/**
 * 节点是否含有合法指令
 * @param   {DOMElement}  node
 * @return  {Number}
 */
function hasDirective (node) {
	if (dom.isElement(node) && node.hasAttributes()) {
		let nodeAttrs = node.attributes;
		for (let i = 0; i < nodeAttrs.length; i++) {
			if (isDirective(nodeAttrs[i].name)) {
				return true;
			}
		}

	} else if (dom.isTextNode(node) && regMustache.test(node.textContent)) {
		return true;
	}
}

/**
 * 元素编译/指令提取模块
 * @param  {DOMElement}  element  [视图的挂载原生 DOM]
 * @param  {Object}      model    [数据模型对象]
 */
function Compiler (element, model) {
	if (!dom.isElement(element)) {
		return util.warn('element must be a type of DOMElement: ', element);
	}

	if (!util.isObject(model)) {
		return util.warn('model must be a type of Object: ', model);
	}

	// 缓存根节点
	this.$element = element;
	// 根节点转文档碎片（element 将被清空）
	this.$fragment = util.nodeToFragment(this.$element);

	// 数据模型对象
	this.$data = model;
	// DOM 注册索引
	util.defRec(model, '$els', {});
	// 子取值域索引
	util.defRec(model, '$scope', {});

	// 未编译节点缓存队列
	this.$unCompiles = [];
	// 根节点是否已完成编译
	this.$rootComplied = false;

	// 视图刷新模块
	this.updater = new Updater(this);
	// 数据订阅模块
	this.watcher = new Watcher(this.$data);
	// 指令解析模块
	this.von = new Von(this);
	this.vel = new Vel(this);
	this.vif = new Vif(this);
	this.vfor = new Vfor(this);
	this.vtext = new Vtext(this);
	this.vhtml = new Vhtml(this);
	this.vshow = new Vshow(this);
	this.vbind = new Vbind(this);
	this.vmodel = new Vmodel(this);

	this.init();
}

var cp = Compiler.prototype;

cp.init = function () {
	this.complieElement(this.$fragment, true);
}

/**
 * 编译文档碎片/节点
 * @param   {Fragment|DOMElement}  element   [文档碎片/节点]
 * @param   {Boolean}              root      [是否是编译根节点]
 * @param   {Object}               fors      [vfor 数据]
 */
cp.complieElement = function (element, root, fors) {
	var childNodes = element.childNodes;

	if (root && hasDirective(element)) {
		this.$unCompiles.push([element, fors]);
	}

	for (let i = 0; i < childNodes.length; i++) {
		let node = childNodes[i];

		if (hasDirective(node)) {
			this.$unCompiles.push([node, fors]);
		}

		if (node.hasChildNodes() && !isLateCompileChilds(node)) {
			this.complieElement(node, false, fors);
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
	util.each(this.$unCompiles, function (info) {
		this.complieDirectives(info);
		return null;
	}, this);

	this.checkRoot();
}

/**
 * 收集并编译节点指令
 * @param   {Array}  info   [node, fors]
 */
cp.complieDirectives = function (info) {
	var node = info[0], fors = info[1];

	if (dom.isElement(node)) {
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
			util.def(node, '__directives', attrs.length);
			attrs = [vfor];
			vfor = null;
		}

		// 编译节点指令
		util.each(attrs, function (attr) {
			this.compile(node, attr, fors);
		}, this);

	} else if (dom.isTextNode(node)) {
		this.compileText(node, fors);
	}
}

/**
 * 编译元素节点指令
 * @param   {DOMElement}   node
 * @param   {Object}       attr
 * @param   {Array}        fors
 */
cp.compile = function (node, attr, fors) {
	var dir = attr.name;
	var exp = attr.value;
	var args = [fors, node, exp, dir];

	// 移除指令标记
	dom.removeAttr(node, dir);

	// 动态指令：v-bind:xxx
	if (dir.indexOf('v-bind') === 0) {
		this.vbind.parse.apply(this.vbind, args);
	}
	// 动态指令：v-on:xxx
	else if (dir.indexOf('v-on') === 0) {
		this.von.parse.apply(this.von, args);
	}
	// 静态指令
	else {
		switch (dir) {
			case 'v-el':
				this.vel.parse.apply(this.vel, args);
				break;
			case 'v-text':
				this.vtext.parse.apply(this.vtext, args);
				break;
			case 'v-html':
				this.vhtml.parse.apply(this.vhtml, args);
				break;
			case 'v-show':
				this.vshow.parse.apply(this.vshow, args);
				break;
			case 'v-if':
				this.vif.parse.apply(this.vif, args);
				break;
			case 'v-else':
				util.def(node, '__directive', 'v-else');
				break;
			case 'v-model':
				this.vmodel.parse.apply(this.vmodel, args);
				break;
			case 'v-for':
				this.vfor.parse.apply(this.vfor, args);
				break;
			case 'v-pre':
				break;
			default: util.warn('[' + dir + '] is an unknown directive!');
		}
	}
}

/**
 * 编译文本节点 {{text}} or {{{html}}}
 * @param   {DOMElement}   node
 * @param   {Object}       fors
 */
cp.compileText = function (node, fors) {
	var exp, match, matches, pieces, tokens = [];
	var text = node.textContent.trim().replace(regNewline, '');

	// html match
	if (regHtml.test(text)) {
		matches = text.match(regHtml);
		match = matches[0];
		exp = match.replace(regMustacheSpace, '');

		if (match.length !== text.length) {
			return util.warn('[' + text + '] compile for HTML can not have a prefix or suffix');
		}

		this.vhtml.parse.call(this.vhtml, fors, node, exp);

	} else {
		pieces = text.split(regText);
		matches = text.match(regText);

		// 文本节点转化为常量和变量的组合表达式
		// 'a {{b}} c' => '"a " + b + " c"'
		util.each(pieces, function (piece) {
			// {{text}}
			if (matches.indexOf('{{' + piece + '}}') > -1) {
				tokens.push('(' + piece + ')');
			} else if (piece) {
				tokens.push('"' + piece + '"');
			}
		});

		this.vtext.parse.call(this.vtext, fors, node, tokens.join('+'));
	}
}

/**
 * 停止编译节点的剩余指令，如 vfor 的根节点
 * @param   {DOMElement}  node
 */
cp.block = function (node) {
	util.each(this.$unCompiles, function (info) {
		if (node === info[0]) {
			return null;
		}
	});
}

/**
 * 检查根节点是否编译完成
 */
cp.checkRoot = function () {
	if (this.$unCompiles.length === 0 && !this.$rootComplied) {
		this.$rootComplied = true;
		this.$element.appendChild(this.$fragment);
	}
}

/**
 * 销毁函数
 */
cp.destroy = function () {
	this.watcher.destroy();
	dom.empty(this.$element);
	this.$fragment = this.$data = this.$unCompiles = this.updater = null;
	this.von = this.vel = this.vif = this.vfor = this.vtext = this.vhtml = this.vshow = this.vbind = this.vmodel = null;
}

export default Compiler;
