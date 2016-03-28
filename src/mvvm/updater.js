/**
 * updater 视图刷新模块
 */
define([
	'../dom',
	'../util'
], function(dom, util) {

	function Updater(vm) {
		this.vm = vm;
		// 事件绑定回调集合
		this.$listeners = {};
	}

	var up = Updater.prototype;

	/**
	 * 更新节点的文本内容 realize v-text
	 * @param   {DOMElement}  node
	 * @param   {String}      text
	 */
	up.updateNodeTextContent = function(node, text) {
		node.textContent = (node._vm_text_prefix || '') + String(text) + (node._vm_text_suffix || '');
	}

	/**
	 * 更新节点的html内容 realize v-html
	 * isPlain用于判断v-html在纯文本节点使用{{{$index}}}的情况
	 * 因为用了replaceChild后下标变更时将无法找回原有的节点进行更新下标
	 * @param   {DOMElement}  node
	 * @param   {String}      html
	 * @param   {Boolean}     isPlain    [是否是纯文本节点]
	 */
	up.updateNodeHtmlContent = function(node, html, isPlain) {
		var vm = this.vm;
		html = String(html);

		if (vm.isElementNode(node)) {
			dom.empty(node);
			node.appendChild(util.stringToFragment(html));
		}
		else if (vm.isTextNode(node)) {
			if (isPlain) {
				this.updateNodeTextContent(node, html);
			}
			else {
				html = (node._vm_text_prefix || '') + html + (node._vm_text_suffix || '');
				// @todo: <p>****{{{html}}}***</p> 这种与文本参杂的情况也将无法找回原有节点
				node.parentNode.replaceChild(util.stringToFragment(html), node);
			}
		}
	}

	/**
	 * 更新节点的显示隐藏 realize v-show/v-else
	 * @param   {DOMElement}  node
	 * @param   {Boolean}     show    [是否显示]
	 */
	up.updateNodeDisplay = function(node, show) {
		var siblingNode = node.nextSibling;

		this.setNodeVisibleDisplay(node);
		this.updateNodeStyle(node, 'display', show ? node._visible_display : 'none');

		// v-else
		if (siblingNode && (dom.hasAttr(siblingNode, 'v-else') || siblingNode._directive === 'v-else')) {
			this.setNodeVisibleDisplay(siblingNode);
			this.updateNodeStyle(siblingNode, 'display', show ? 'none' : siblingNode._visible_display);
		}
	}

	/**
	 * 缓存节点行内样式值
	 * 行内样式display=''不会影响由classname中的定义
	 * _visible_display用于缓存节点行内样式的display显示值
	 * @param  {DOMElement}  node
	 */
	up.setNodeVisibleDisplay = function(node) {
		var inlineStyle, styles, display;

		if (!node._visible_display) {
			inlineStyle = util.removeSpace(dom.getAttr(node, 'style'));

			if (inlineStyle && inlineStyle.indexOf('display') !== -1) {
				styles = inlineStyle.split(';');

				util.each(styles, function(style) {
					if (style.indexOf('display') !== -1) {
						display = util.getStringKeyValue(style);
					}
				});
			}

			if (display !== 'none') {
				node._visible_display = display || '';
			}
		}
	}

	/**
	 * 更新节点内容的渲染 realize v-if/v-else
	 * @param   {DOMElement}  node
	 * @param   {Boolean}     isRender  [是否渲染]
	 */
	up.updateNodeRenderContent = function(node, isRender) {
		var siblingNode = node.nextSibling;

		this.setNodeRenderContent(node);
		this.toggleNodeRenderContent.apply(this, arguments);

		// v-else
		if (siblingNode && (dom.hasAttr(siblingNode, 'v-else') || siblingNode._directive === 'v-else')) {
			this.setNodeRenderContent(siblingNode);
			this.toggleNodeRenderContent(siblingNode, !isRender);
		}
	}

	/**
	 * 缓存节点渲染内容并清空
	 */
	up.setNodeRenderContent = function(node) {
		if (!node._render_content) {
			node._render_content = node.innerHTML;
		}
		dom.empty(node);
	}

	/**
	 * 切换节点内容渲染
	 */
	up.toggleNodeRenderContent = function(node, isRender) {
		var fragment;
		// 渲染
		if (isRender) {
			fragment = util.stringToFragment(node._render_content);
			this.vm.complieElement(fragment, true);
			node.appendChild(fragment);
		}
	}

	/**
	 * 更新节点的attribute realize v-bind
	 * @param   {DOMElement}  node
	 * @param   {String}      attribute
	 * @param   {String}      value
	 */
	up.updateNodeAttribute = function(node, attribute, value) {
		if (value === null) {
			dom.removeAttr.apply(this, arguments);
		}
		else {
			// setAttribute不适合用于表单元素的value
			// https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute
			if (attribute === 'value' && (this.vm.$inputs.indexOf(node.tagName.toLowerCase()) !== -1)) {
				node.value = value;
			}
			else {
				dom.setAttr.apply(this, arguments);
			}
		}
	}

	/**
	 * 更新节点的classname realize v-bind:class
	 * @param   {DOMElement}          node
	 * @param   {String|Boolean}      newValue
	 * @param   {String|Boolean}      oldValue
	 * @param   {String}              classname
	 */
	up.updateNodeClassName = function(node, newValue, oldValue, classname) {
		// 指定classname，变化值由newValue布尔值决定
		if (classname) {
			if (newValue === true) {
				dom.addClass(node, classname);
			}
			else if (newValue === false) {
				dom.removeClass(node, classname);
			}
		}
		// 未指定classname，变化值由newValue的值决定
		else {
			if (newValue) {
				dom.addClass(node, newValue);
			}

			if (oldValue) {
				dom.removeClass(node, oldValue);
			}
		}
	}

	/**
	 * 更新节点的style realize v-bind:style
	 * @param   {DOMElement}  node
	 * @param   {String}      propperty  [属性名称]
	 * @param   {String}      value      [样式值]
	 */
	up.updateNodeStyle = function(node, propperty, value) {
		node.style[propperty] = value;
	}

	/**
	 * 更新节点绑定事件的回调函数 realize v-on
	 * @param   {DOMElement}  node
	 * @param   {String}      evt
	 * @param   {Function}    func     [回调函数]
	 * @param   {Function}    oldFunc  [旧回调函数]
	 * @param   {Array}       params   [参数]
	 * @param   {String}      field    [对应监测字段/路径]
	 * @param   {Number}      index    [vfor下标]
	 */
	up.updateNodeEvent = function(node, evt, func, oldFunc, params, field, index) {
		var listeners = this.$listeners;
		var modals, self, stop, prevent, capture = false;

		// 支持4种事件修饰符.self.stop.prevent.capture
		if (evt.indexOf('.') !== -1) {
			modals = evt.split('.');
			evt = modals.shift();
			self = modals && modals.indexOf('self') !== -1;
			stop = modals && modals.indexOf('stop') !== -1;
			prevent = modals && modals.indexOf('prevent') !== -1;
			capture = modals && modals.indexOf('capture') !== -1;
		}

		if (oldFunc) {
			dom.removeEvent(node, evt, listeners[field], capture);
		}

		if (util.isFunc(func)) {
			// 缓存事件回调
			listeners[field] = function _listener(e) {
				var args = [];

				// 是否限定只能在当前节点触发事件
				if (self && e.target !== node) {
					return;
				}

				// 组合事件参数
				util.each(params, function(param) {
					args.push(param === '$event' ? e : param === '$index' ? index : param);
				});

				// 未指定参数，则原生事件对象作为唯一参数
				if (!args.length) {
					args.push(e);
				}

				func.apply(this, args);

				// 是否阻止冒泡
				if (stop) {
					e.stopPropagation();
				}
				// 是否阻止默认事件
				if (prevent) {
					e.preventDefault();
				}
			}

			dom.addEvent(node, evt, listeners[field], capture);
		}
		else {
			util.warn('The model: ' + field + '\'s value for using v-on must be a type of Function!');
		}
	}

	/**
	 * 更新text或textarea的value realize v-model
	 * @param   {Input}  text
	 * @param   {String} value
	 */
	up.updateNodeFormTextValue = function(text, value) {
		if (text.value !== value) {
			text.value = value;
		}
	}

	/**
	 * 更新radio的激活状态 realize v-model
	 * @param   {Input}  radio
	 * @param   {String} value
	 */
	up.updateNodeFormRadioChecked = function(radio, value) {
		radio.checked = radio.value === (util.isNumber(value) ? String(value) : value);
	}

	/**
	 * 更新checkbox的激活状态 realize v-model
	 * @param   {Input}          checkbox
	 * @param   {Array|Boolean}  values      [激活数组或状态]
	 */
	up.updateNodeFormCheckboxChecked = function(checkbox, values) {
		if (!util.isArray(values) && !util.isBoolean(values)) {
			util.warn('checkbox v-model value must be a type of Boolean or Array!');
			return;
		}
		checkbox.checked = util.isBoolean(values) ? values : (values.indexOf(checkbox.value) !== -1);
	}

	/**
	 * 更新select的激活状态 realize v-model
	 * @param   {Select}         select
	 * @param   {Array|String}   selected  [选中值]
	 * @param   {Boolean}        multi
	 */
	up.updateNodeFormSelectChecked = function(select, selected, multi) {
		var options = select.options;
		var i, option, value, leng = options.length;

		for (i = 0; i < leng; i++) {
			option = options[i];
			value = option.value;
			option.selected = multi ? selected.indexOf(value) !== -1 : selected === value;
		}
	}

	return Updater;
});