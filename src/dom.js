/**
 * dom 操作模块
 * ===========
 */

export default {
	/**
	 * 清空 element 的所有子节点
	 * @param   {DOMElement}  element
	 */
	empty: function(element) {
		while (element.firstChild) {
			element.removeChild(element.firstChild);
		}
		return element;
	},

	/**
	 * 设置节点属性
	 * @param   {DOMElement}  node
	 * @param   {String}      name
	 * @param   {String}      value
	 */
	setAttr: function(node, name, value) {
		if (typeof value === 'boolean') {
			node[name] = value;
		}
		else if (value !== this.getAttr(node, name)) {
			node.setAttribute(name, value);
		}
	},

	/**
	 * 获取节点属性值
	 * @param   {DOMElement}  node
	 * @param   {String}      name
	 * @return  {String}
	 */
	getAttr: function(node, name) {
		return node.getAttribute(name) || '';
	},

	/**
	 * 判断节点是否存在属性
	 * @param   {DOMElement}  node
	 * @param   {String}      name
	 * @return  {Boolean}
	 */
	hasAttr: function(node, name) {
		return node.hasAttribute(name);
	},

	/**
	 * 移除节点属性
	 * @param   {DOMElement}  node
	 * @param   {String}      name
	 */
	removeAttr: function(node, name) {
		node.removeAttribute(name);
	},

	/**
	 * 节点添加 classname
	 * @param  {DOMElement}  node
	 * @param  {String}      classname
	 */
	addClass: function(node, classname) {
		var current, list = node.classList;

		if (this.hasClass(node, classname)) {
			return;
		}

		/* istanbul ignore else */
		if (list) {
			list.add(classname);
		}
		else {
			current = ' ' + this.getAttr(node, 'class') + ' ';
			if (current.indexOf(' ' + classname + ' ') === -1) {
				this.setAttr(node, 'class', (current + classname).trim());
			}
		}
	},

	/**
	 * 节点删除 classname
	 * @param  {DOMElement}  node
	 * @param  {String}      classname
	 */
	removeClass: function(node, classname) {
		var current, target, list = node.classList;

		if (!this.hasClass(node, classname)) {
			return;
		}

		/* istanbul ignore else */
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
	},

	/**
	 * 节点是否存在 classname
	 * @param  {DOMElement}  node
	 * @param  {String}      classname
	 * @return {Boolean}
	 */
	hasClass: function(node, classname) {
		var current, list = node.classList;
		/* istanbul ignore else */
		if (list) {
			return list.contains(classname);
		}
		else {
			current = ' ' + this.getAttr(node, 'class') + ' ';
			return current.indexOf(' ' + classname + ' ') !== -1;
		}
	},

	/**
	 * 节点事件绑定
	 * @param   {DOMElement}   node
	 * @param   {String}       evt
	 * @param   {Function}     callback
	 * @param   {Boolean}      capture
	 */
	addEvent: function(node, evt, callback, capture) {
		node.addEventListener(evt, callback, capture);
	},

	/**
	 * 解除节点事件绑定
	 * @param   {DOMElement}   node
	 * @param   {String}       evt
	 * @param   {Function}     callback
	 * @param   {Boolean}      capture
	 */
	removeEvent: function(node, evt, callback, capture) {
		node.removeEventListener(evt, callback, capture);
	}
}