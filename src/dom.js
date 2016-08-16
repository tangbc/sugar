/**
 * 是否是元素节点
 * @param   {DOMElement}   element
 * @return  {Boolean}
 */
export function isElement (element) {
	return element.nodeType === 1;
}

/**
 * 是否是文本节点
 * @param   {DOMElement}   element
 * @return  {Boolean}
 */
export function isTextNode (element) {
	return element.nodeType === 3;
}

/**
 * 清空 element 的所有子节点
 * @param   {DOMElement}  element
 */
export function empty (element) {
	while (element.firstChild) {
		element.removeChild(element.firstChild);
	}
	return element;
}

/**
 * 获取节点属性值
 * @param   {DOMElement}  node
 * @param   {String}      name
 * @return  {String}
 */
export function getAttr (node, name) {
	return node.getAttribute(name) || '';
}

/**
 * 移除节点属性
 * @param   {DOMElement}  node
 * @param   {String}      name
 */
export function removeAttr (node, name) {
	node.removeAttribute(name);
}

/**
 * 设置节点属性
 * @param   {DOMElement}  node
 * @param   {String}      name
 * @param   {String}      value
 */
export function setAttr (node, name, value) {
	if (typeof value === 'boolean') {
		node[name] = value;
	} else if (value === null) {
		removeAttr(node, name);
	} else if (value !== getAttr(node, name)) {
		node.setAttribute(name, value);
	}
}

/**
 * 判断节点是否存在属性
 * @param   {DOMElement}  node
 * @param   {String}      name
 * @return  {Boolean}
 */
export function hasAttr (node, name) {
	return node.hasAttribute(name);
}

/**
 * 节点是否存在 classname
 * @param  {DOMElement}  node
 * @param  {String}      classname
 * @return {Boolean}
 */
export function hasClass (node, classname) {
	var current, list = node.classList;

	/* istanbul ignore else */
	if (list) {
		return list.contains(classname);
	} else {
		current = ' ' + getAttr(node, 'class') + ' ';
		return current.indexOf(' ' + classname + ' ') > -1;
	}
}

/**
 * 节点添加 classname
 * @param  {DOMElement}  node
 * @param  {String}      classname
 */
export function addClass (node, classname) {
	var current, list = node.classList;

	if (!classname || hasClass(node, classname)) {
		return;
	}

	/* istanbul ignore else */
	if (list) {
		list.add(classname);
	} else {
		current = ' ' + getAttr(node, 'class') + ' ';

		if (current.indexOf(' ' + classname + ' ') === -1) {
			setAttr(node, 'class', (current + classname).trim());
		}
	}
}

/**
 * 节点删除 classname
 * @param  {DOMElement}  node
 * @param  {String}      classname
 */
export function removeClass (node, classname) {
	if (!classname) {
		return;
	}

	var current, target, list = node.classList;

	if (!classname || !hasClass(node, classname)) {
		return;
	}

	/* istanbul ignore else */
	if (list) {
		list.remove(classname);
	} else {
		target = ' ' + classname + ' ';
		current = ' ' + getAttr(node, 'class') + ' ';

		while (current.indexOf(target) > -1) {
			current = current.replace(target, ' ');
		}

		setAttr(node, 'class', current.trim());
	}

	if (!node.className) {
		removeAttr(node, 'class');
	}
}

/**
 * 节点事件绑定
 * @param   {DOMElement}   node
 * @param   {String}       evt
 * @param   {Function}     callback
 * @param   {Boolean}      capture
 */
export function addEvent (node, evt, callback, capture) {
	node.addEventListener(evt, callback, capture);
}

/**
 * 解除节点事件绑定
 * @param   {DOMElement}   node
 * @param   {String}       evt
 * @param   {Function}     callback
 * @param   {Boolean}      capture
 */
export function removeEvent (node, evt, callback, capture) {
	node.removeEventListener(evt, callback, capture);
}

/**
 * 获取节点的下一个兄弟元素节点
 * @param  {Element}  node
 */
export function getNextElement (node) {
	var el = node.nextSibling;

	if (el && isElement(el)) {
		return el;
	}

	while (el) {
		el = el.nextSibling;

		if (el && isElement(el)) {
			return el;
		}
	}

	return null;
}