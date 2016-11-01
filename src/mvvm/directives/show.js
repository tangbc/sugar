import { def } from '../../util';
import { hasAttr } from '../../dom';
import Parser, { linkParser } from '../parser';

const visibleDisplay = '__visible__';

/**
 * 缓存节点行内样式显示值
 * 行内样式 display = '' 不会影响由 classname 中的定义
 * visibleDisplay 用于缓存节点行内样式的 display 显示值
 * @param  {Element}  node
 */
function setVisibleDisplay (node) {
	let display = node.style.display;
	def(node, visibleDisplay, display === 'none' ? '' : display);
}

/**
 * 设置节点 style.display 值
 * @param  {Element}  node
 * @param  {String}   display
 */
function setStyleDisplay (node, display) {
	node.style.display = display;
}


/**
 * v-show 指令解析模块
 */
export function VShow () {
	Parser.apply(this, arguments);
}

let vshow = linkParser(VShow);

/**
 * 解析 v-show 指令
 */
vshow.parse = function () {
	let el = this.el;

	setVisibleDisplay(el);

	// else 片段
	let elseEl = el.nextElementSibling;
	if (elseEl && hasAttr(elseEl, 'v-else')) {
		this.elseEl = elseEl;
		setVisibleDisplay(elseEl);
	}

	this.bind();
}

/**
 * 更新视图
 * @param  {Boolean}  isShow
 */
vshow.update = function (isShow) {
	let el = this.el;
	let elseEl = this.elseEl;

	setStyleDisplay(el, isShow ? el[visibleDisplay] : 'none');

	if (elseEl) {
		setStyleDisplay(elseEl, !isShow ? elseEl[visibleDisplay] : 'none');
	}
}
