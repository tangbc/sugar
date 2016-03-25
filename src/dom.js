/**
 * dom操作模块
 */
define(function() {
	var dom = Object.create(null);

	/**
	 * 清空element的所有子节点
	 * @param   {DOMElement}  element
	 */
	dom.empty = function(element) {
		while (element.firstChild) {
			element.removeChild(element.firstChild);
		}
	}

	/**
	 * 设置节点属性
	 * @param   {DOMElement}  node
	 * @param   {String}      name
	 * @param   {String}      value
	 */
	dom.setAttr = function(node, name, value) {
		node.setAttribute(name, value);
	}

	/**
	 * 获取节点属性值
	 * @param   {DOMElement}  node
	 * @param   {String}      name
	 * @return  {String}
	 */
	dom.getAttr = function(node, name) {
		return node.getAttribute(name) || '';
	}

	/**
	 * 判断节点是否存在属性
	 * @param   {DOMElement}  node
	 * @param   {String}      name
	 * @return  {Boolean}
	 */
	dom.hasAttr = function(node, name) {
		return node.hasAttribute(name);
	}

	/**
	 * 移除节点属性
	 * @param   {DOMElement}  node
	 * @param   {String}      name
	 */
	dom.removeAttr = function(node, name) {
		node.removeAttribute(name);
	}

	/**
	 * 节点添加classname
	 * @param  {DOMElement}  node
	 * @param  {String}      classname
	 */
	dom.addClass = function(node, classname) {
		var current, list = node.classList;
		if (list) {
			list.add(classname);
		}
		else {
			current = ' ' + this.getAttr(node, 'class') + ' ';
			if (current.indexOf(' ' + classname + ' ') === -1) {
				this.setAttr(node, 'class', (current + classname).trim());
			}
		}
	}

	/**
	 * 节点删除classname
	 * @param  {DOMElement}  node
	 * @param  {String}      classname
	 */
	dom.removeClass = function(node, classname) {
		var current, target, list = node.classList;
		if (list) {
			list.remove(classname);
		}
		else {
			target = ' ' + classname + ' ';
			current = ' ' + this.getAttr(node, 'class') + ' ';
			while (current.indexOf(target) !== -1) {
				current = current.replace(target, ' ');
			}
			this.setAttr(node, 'class', current.trim());
		}

		if (!node.className) {
			this.removeAttr(node, 'class');
		}
	}

	/**
	 * 节点事件绑定
	 * @param   {DOMElement}   node
	 * @param   {String}       evt
	 * @param   {Function}     callback
	 * @param   {Boolean}      capture
	 */
	dom.addEvent = function(node, evt, callback, capture) {
		node.addEventListener(evt, callback, capture);
	}

	/**
	 * 解除节点事件绑定
	 * @param   {DOMElement}   node
	 * @param   {String}       evt
	 * @param   {Function}     callback
	 * @param   {Boolean}      capture
	 */
	dom.removeEvent = function(node, evt, callback, capture) {
		node.removeEventListener(evt, callback, capture);
	}

	return dom;
});