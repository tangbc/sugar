import { getAttr, isElement, hasAttr } from '../../dom';
import Parser, { linkParser } from '../parser';
import { removeSpace, getKeyValue, getNextSiblingElement } from '../../util';

const visibleDisplay = '__visible';

/**
 * 缓存节点行内样式值
 * 行内样式 display='' 不会影响由 classname 中的定义
 * visibleDisplay 用于缓存节点行内样式的 display 显示值
 * @param  {DOMElement}  node
 */
function setVisibleDisplay (node) {
	if (!node[visibleDisplay]) {
		let display;
		let inlineStyle = removeSpace(getAttr(node, 'style'));

		if (inlineStyle && inlineStyle.indexOf('display') > -1) {
			let styles = inlineStyle.split(';');

			each(styles, function (style) {
				if (style.indexOf('display') > -1) {
					display = getKeyValue(style);
				}
			});
		}

		if (display !== 'none') {
			node[visibleDisplay] = display || '';
		}
	}
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
var vshow = linkParser(VShow);

/**
 * 解析 v-show 指令
 */
vshow.parse = function () {
	var el = this.el;
	setVisibleDisplay(el);

	var elseEl = getNextSiblingElement(el);
	if (
		elseEl &&
		(hasAttr(elseEl, 'v-else') || elseEl.__directive === 'v-else')
	) {
		this.elseEl = elseEl;
		setVisibleDisplay(elseEl);
	}

	this.bind();
}

/**
 * 更新视图
 * @param   {Boolean}  isShow
 */
vshow.update = function (isShow) {
	var el = this.el;
	var elseEl = this.elseEl;

	setStyleDisplay(el, isShow ? this.el[visibleDisplay] : 'none');

	if (elseEl) {
		setStyleDisplay(elseEl, !isShow ? this.el[visibleDisplay] : 'none');
	}
}