/**
 * updater 视图刷新模块
 */
define([
	'./util',
	'./dom'
], function(util, dom) {

	function Updater(vm) {
		this.vm = vm;
		// 事件绑定回调集合
		this.$listeners = {};
	}
	Updater.prototype =  {
		constructor: Updater,

		/**
		 * 更新节点的文本内容 realize v-text
		 * @param   {DOMElement}  node
		 * @param   {String}      text
		 */
		updateNodeTextContent: function(node, text) {
			node.textContent = (node._vm_text_prefix || '') + String(text) + (node._vm_text_suffix || '');
		},

		/**
		 * 更新节点的html内容 realize v-html
		 * @param   {DOMElement}  node
		 * @param   {String}      html
		 */
		updateNodeHtmlContent: function(node, html) {
			dom.empty(node);
			node.appendChild(util.stringToFragment(String(html)));
		},

		/**
		 * 更新节点的显示隐藏 realize v-show
		 * 行内样式display=''不会影响由classname中的定义
		 * _vm_visible_display用于缓存节点行内样式的display显示值
		 * @param   {DOMElement}  node
		 * @param   {Boolean}     show    [是否显示]
		 */
		updateNodeDisplay: function(node, show) {
			var display, inlineStyle, styles;

			if (!node._vm_visible_display) {
				inlineStyle = util.removeSpace(this.getAttr(node, 'style'));

				if (inlineStyle && inlineStyle.indexOf('display') !== -1) {
					styles = inlineStyle.split(';');

					util.each(styles, function(style) {
						if (style.indexOf('display') !== -1) {
							display = util.getStringKeyValue(style);
						}
					});
				}

				if (display !== 'none') {
					node._vm_visible_display = display;
				}
			}

			node.style.display = show ? (node._vm_visible_display || '') : 'none';
		},

		/**
		 * 更新节点内容的渲染 realize v-if
		 * @param   {DOMElement}  node
		 * @param   {Boolean}     render  [是否渲染]
		 * @param   {Boolean}     init    [是否是初始化编译]
		 */
		updateNodeRenderContent: function(node, render, init) {
			if (!node._vm_render_content) {
				node._vm_render_content = node.innerHTML;
			}

			if (!render) {
				dom.empty(node);
			}
			else {
				if (!init) {
					node.appendChild(util.stringToFragment(node._vm_render_content));
				}

				// 重新编译节点内容
				this.vm.parseElement(node, true);
			}
		},

		/**
		 * 更新节点的attribute realize v-bind
		 * @param   {DOMElement}  node
		 * @param   {String}      attribute
		 * @param   {String}      value
		 */
		updateNodeAttribute: function(node, attribute, value) {
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
		},

		/**
		 * 更新节点的classname realize v-bind:class
		 * @param   {DOMElement}          node
		 * @param   {String|Boolean}      newValue
		 * @param   {String|Boolean}      oldValue
		 * @param   {String}              classname
		 */
		updateNodeClassName: function(node, newValue, oldValue, classname) {
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
		},

		/**
		 * 更新节点的style realize v-bind:style
		 * @param   {DOMElement}  node
		 * @param   {String}      propperty  [属性名称]
		 * @param   {String}      value      [样式值]
		 */
		updateNodeStyle: function(node, propperty, value) {
			node.style[propperty] = value;
		},

		/**
		 * 更新节点绑定事件的回调函数
		 * @param   {DOMElement}  node
		 * @param   {String}      evt
		 * @param   {Function}    newFunc  [新callback]
		 * @param   {Function}    oldFunc  [旧callback]
		 * @param   {Array}       params   [回调参数]
		 * @param   {String}      field    [回调对应监测字段]
		 */
		updateNodeEvent: function(node, evt, newFunc, oldFunc, params, field) {
			var listeners = this.$listeners;
			var targetListener = listeners[field];

			if (util.isFunc(newFunc)) {
				listeners[field] = function(e) {
					var args = [];
					util.each(params, function(param) {
						args.push(param === '$event' ? e : param);
					});

					// 未指定参数，则原生事件对象作为唯一参数
					if (!args.length) {
						args.push(e);
					}

					newFunc.apply(this, args);
				}

				dom.addEvent(node, evt, listeners[field]);
			}

			if (util.isFunc(oldFunc)) {
				dom.removeEvent(node, evt, targetListener);
			}
		},

		/**
		 * 更新text或textarea的value
		 * @param   {Input}  text
		 * @param   {String} value
		 */
		updateNodeFormTextValue: function(text, value) {
			if (text.value !== value) {
				text.value = value;
			}
		},

		/**
		 * 更新radio的激活状态
		 * @param   {Input}  radio
		 * @param   {String} value
		 */
		updateNodeFormRadioChecked: function(radio, value) {
			radio.checked = radio.value === (util.isNumber(value) ? String(value) : value);
		},

		/**
		 * 更新checkbox的激活状态
		 * @param   {Input}          checkbox
		 * @param   {Array|Boolean}  values      [激活数组或状态]
		 */
		updateNodeFormCheckboxChecked: function(checkbox, values) {
			if (!util.isArray(values) && !util.isBoolean(values)) {
				util.warn('checkbox v-model value must be a type of Boolean or Array!');
				return;
			}
			checkbox.checked = util.isBoolean(values) ? values : (values.indexOf(checkbox.value) !== -1);
		},

		/**
		 * 更新select的激活状态
		 * @param   {Select}         select
		 * @param   {Array|String}   selected  [选中值]
		 * @param   {Boolean}        multi
		 */
		updateNodeFormSelectCheck: function(select, selected, multi) {
			var options = select.options;
			var i, option, value, leng = options.length;

			for (i = 0; i < leng; i++) {
				option = options[i];
				value = option.value;
				option.selected = multi ? selected.indexOf(value) !== -1 : selected === value;
			}
		}
	}

	return Updater;
});