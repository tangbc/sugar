import { getHooks } from './for';
import Parser, { linkParser } from '../parser';
import { isElement, hasAttr } from '../../dom';
import { hasOwn, def, warn, isFunc } from '../../util';

/**
 * 移除 DOM 注册的引用
 * @param  {Object}      vm
 * @param  {DOMElement}  element
 */
function removeDOMRegister (vm, element) {
	let registers = vm.$regEles;
	let childNodes = element.childNodes;

	for (let i = 0; i < childNodes.length; i++) {
		let node = childNodes[i];

		if (!isElement(node)) {
			continue;
		}

		let nodeAttrs = node.attributes;

		for (let ii = 0; ii < nodeAttrs.length; ii++) {
			let attr = nodeAttrs[ii];

			if (
				attr.name === 'v-el' &&
				hasOwn(registers, attr.value)
			) {
				registers[attr.value] = null;
			}
		}

		if (node.hasChildNodes()) {
			removeDOMRegister(vm, node);
		}
	}
}

/**
 * 生成一个锚点标记
 * @return  {TextNode}
 */
function createAnchor () {
	return document.createTextNode('');
}

/**
 * 元素节点替换
 * @param  {Element}  oldChild
 * @param  {Element}  newChild
 */
function replaceNode (oldChild, newChild) {
	let parent = oldChild.parentNode;
	if (parent) {
		parent.replaceChild(newChild, oldChild);
	}
}


/**
 * v-if 指令解析模块
 */
export function VIf () {
	Parser.apply(this, arguments);
}

let vif = linkParser(VIf);

/**
 * 解析 v-if 指令
 */
vif.parse = function () {
	let el = this.el;
	let elseEl = el.nextElementSibling;

	let parent = el.parentNode;

	if (parent.nodeType !== 1) {
		return warn('v-if cannot use in the root element!');
	}

	this.$parent = parent;

	// 状态钩子
	this.hooks = getHooks(this.vm, el);

	// 缓存渲染模板
	this.elTpl = el.cloneNode(true);
	this.elAnchor = createAnchor();
	replaceNode(el, this.elAnchor);
	this.el = null;

	// else 节点
	if (elseEl && hasAttr(elseEl, 'v-else')) {
		this.elseTpl = elseEl.cloneNode(true);
		this.elseAnchor = createAnchor();
		replaceNode(elseEl, this.elseAnchor);
		elseEl = null;
	}

	this.bind();
}

/**
 * 调用状态钩子函数
 * @param  {String}   type      [钩子类型]
 * @param  {Element}  renderEl  [渲染元素]
 * @param  {Boolean}  isElse    [是否是 else 板块]
 */
vif.hook = function (type, renderEl, isElse) {
	let hook = this.hooks[type];
	if (isFunc(hook)) {
		hook.call(this.vm.$context, renderEl, isElse);
	}
}

/**
 * 更新视图
 * @param  {Boolean}  isRender
 */
vif.update = function (isRender) {
	let elseAnchor = this.elseAnchor;

	this.toggle(this.elAnchor, this.elTpl, isRender, false);

	if (elseAnchor) {
		this.toggle(elseAnchor, this.elseTpl, !isRender, true);
	}
}

/**
 * 切换节点内容渲染
 * @param  {Element}   anchor
 * @param  {Fragment}  template
 * @param  {Boolean}   isRender
 * @param  {Boolean}   isElse
 */
vif.toggle = function (anchor, template, isRender, isElse) {
	let vm = this.vm;
	let parent = this.$parent;
	let tpl = template.cloneNode(true);

	// 渲染 & 更新视图
	if (isRender) {
		vm.compile(tpl, true, this.scope, this.desc.once);
		let insert = parent.insertBefore(tpl, anchor);
		this.hook('after', insert, isElse);
		def(insert, '__vif__', true);
	}
	// 不渲染的情况需要移除 DOM 索引的引用
	else {
		let el = anchor.previousSibling;
		if (el && el.__vif__) {
			this.hook('before', el, isElse);
			removeDOMRegister(vm, template);
			parent.removeChild(el);
		}
	}
}
