import Parser, { linkParser } from '../parser';
import { hasOwn, stringToFragment } from '../../util';
import { isElement, hasAttr, empty, getNextElement } from '../../dom';

/**
 * 移除 DOM 注册的引用
 * @param   {Object}      vm
 * @param   {DOMElement}  element
 */
function removeDOMRegister (vm, element) {
	var registers = vm.$data.$els;
	var childNodes = element.childNodes;

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

var vif = linkParser(VIf);

/**
 * 解析 v-if 指令
 */
vif.parse = function () {
	var el = this.el;

	// 缓存渲染内容
	this.elContent = el.innerHTML;
	empty(el);

	// else 节点
	var elseEl = getNextElement(el);
	if (
		elseEl &&
		(hasAttr(elseEl, 'v-else') || elseEl.__directive === 'v-else')
	) {
		this.elseEl = elseEl;
		this.elseElContent = elseEl.innerHTML;
		empty(elseEl);
	}

	this.bind();
}

/**
 * 更新视图
 * @param   {Boolean}  isRender
 */
vif.update = function (isRender) {
	this.toggle(this.el, this.elContent, isRender);

	var elseEl = this.elseEl;
	if (elseEl) {
		this.toggle(elseEl, this.elseElContent, !isRender);
	}
}

/**
 * 切换节点内容渲染
 */
vif.toggle = function (node, content, isRender) {
	var vm = this.vm;
	var frag = stringToFragment(content);

	// 渲染
	if (isRender) {
		vm.complieElement(frag, true, this.$scope);
		node.appendChild(frag);
	}
	// 不渲染的情况需要移除 DOM 注册的引用
	else {
		empty(node);
		removeDOMRegister(vm, frag);
	}
}