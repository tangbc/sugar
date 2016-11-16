import { getHooks } from './for';
import Parser, { linkParser } from '../parser';
import { isElement, hasAttr, empty } from '../../dom';
import { hasOwn, nodeToFragment, isFunc } from '../../util';

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

	// 状态钩子
	this.hooks = getHooks(this.vm, el);

	// 缓存渲染内容
	this.elFrag = nodeToFragment(el);

	// else 节点
	if (elseEl && hasAttr(elseEl, 'v-else')) {
		this.elseEl = elseEl;
		this.elseElFrag = nodeToFragment(elseEl);
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
	let elseEl = this.elseEl;

	this.toggle(this.el, this.elFrag, isRender);

	if (elseEl) {
		this.toggle(elseEl, this.elseElFrag, !isRender, 1);
	}
}

/**
 * 切换节点内容渲染
 * @param  {Element}   renderEl
 * @param  {Fragment}  fragment
 * @param  {Boolean}   isRender
 * @param  {Mix}       isElse
 */
vif.toggle = function (renderEl, fragment, isRender, isElse) {
	let vm = this.vm;
	let frag = fragment.cloneNode(true);

	// 渲染 & 更新视图
	if (isRender) {
		vm.compile(frag, true, this.scope, this.desc.once);
		renderEl.appendChild(frag);
		this.hook('after', renderEl, !!isElse);
	}
	// 不渲染的情况需要移除 DOM 索引的引用
	else {
		this.hook('before', renderEl, !!isElse);
		empty(renderEl);
		removeDOMRegister(vm, frag);
	}
}
