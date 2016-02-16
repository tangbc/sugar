/**
 * 简单的数据绑定vm库
 */
define([
	'./util',
	'./vm-watcher'
], function(util, Watcher) {

	/**
	 * VM构造函数
	 * @param  {DOMElement}  element  [视图的挂载原生DOM]
	 * @param  {Object}      model    [数据模型对象]
	 */
	function VM(element, model) {
		if (!this.isElement(element)) {
			util.error('element must be a type of DOMElement: ', element);
			return;
		}

		if (!util.isObject(model)) {
			util.error('model must be a type of Object: ', model);
			return;
		}

		// 参数缓存
		this.$element = element;
		this.$model = model;

		// 初始碎片
		this.$fragment = this.nodeToFragment(element);

		// VM数据
		this.$data = util.copy(model);
		// DOM对象注册索引
		this.$data.$els = {};

		// 未编译指令数目
		this.$unCompileCount = 0;
		// 未编译的节点
		this.$unCompileNodes = [];
		// 编译状态 0未开始 1开始 2已结束
		this.$compileStatus = 0;
		// 是否是延迟编译状态(if指令节点)
		this.$lateComplie = false;

		this.watcher = new Watcher(this.$data);

		this.init();
	}
	VM.prototype = {
		constructor: VM,

		init: function() {
			this.parseElement(this.$fragment, true);
		},

		/**
		 * DOMElement转换成文档片段
		 * @param   {DOMElement}  element  [DOM节点]
		 */
		nodeToFragment: function(element) {
			var fragment = this.createFragment();
			var cloneNode = element.cloneNode(true);

			var childNode;
			while (childNode = cloneNode.firstChild) {
				fragment.appendChild(childNode);
			}

			return fragment;
		},

		/**
		 * 解析文档碎片/节点
		 * @param   {Fragment|DOMElement}  fragment  [文档碎片/节点]
		 * @param   {Boolean}              root      [是否是编译的根节点]
		 */
		parseElement: function(fragment, root) {
			var node, dirCount;
			var childNodes = fragment.childNodes;
			// 解析所有的子节点
			for (var i = 0; i < childNodes.length; i++) {
				node = childNodes[i];
				dirCount = this.getDirectivesCount(node);
				this.$unCompileCount += dirCount;

				if (dirCount) {
					this.$unCompileNodes.push(node);
				}

				if (node.childNodes.length && this.isCompliableNodeChilds(node)) {
					this.parseElement(node, false);
				}
			}

			if (root) {
				this.compileAllNodes();
			}
		},

		/**
		 * 获取节点的指令数
		 * @param   {DOMElement}  node
		 * @return  {Number}
		 */
		getDirectivesCount: function(node) {
			var count = 0, nodeAttrs;
			if (this.isElement(node)) {
				nodeAttrs = node.attributes;
				for (var i = 0; i < nodeAttrs.length; i++) {
					if (this.isDirective(nodeAttrs[i].name)) {
						count++;
					}
				}
			}
			return count;
		},

		/**
		 * 编译所有的指令节点
		 */
		compileAllNodes: function() {
			this.$compileStatus = 1;

			util.each(this.$unCompileNodes, function(node) {
				this.collectDirectives(node);
				return null;
			}, this);
		},

		/**
		 * 收集并编译节点指令
		 * @param   {DOMElement}  node
		 */
		collectDirectives: function(node) {
			// 将node的节点集合转为数组
			var atr, attrs = [];
			var nodeAttrs = node.attributes;

			for (var i = 0; i < nodeAttrs.length; i++) {
				atr = nodeAttrs[i];
				if (this.isDirective(atr.name)) {
					attrs.push(atr);
				}
			}

			// 编译node上的所有指令
			util.each(attrs, function(attr) {
				this.compileDirective(node, attr);
			}, this);
		},

		/**
		 * 编译节点的一条指令
		 * @param   {DOMElement}  node       [节点]
		 * @param   {Array}       directive  [指令]
		 */
		compileDirective: function(node, directive) {
			var name = directive.name;
			var args = [node, directive.value, name];

			// 计数自减并移除指令标记
			this.reduceCount().removeAttr(node, name);

			if (name.charAt(0) === '$') {
				util.error('model\'s name cannot start with the character $', name);
				return;
			}

			// 动态指令：v-bind:xxx
			if (name.indexOf('v-bind') === 0) {
				this.handleBind.apply(this, args);
			}
			// 动态指令：v-on:xxx
			else if (name.indexOf('v-on') === 0) {
				this.handleOn.apply(this, args);
			}
			// 静态指令
			else {
				switch (name) {
					case 'v-el'   : this.registerElement.apply(this, args); break;
					case 'v-text' : this.handleText.apply(this, args); break;
					case 'v-html' : this.handleHtml.apply(this, args); break;
					case 'v-show' : this.handleShow.apply(this, args); break;
					case 'v-if'   : this.handleIf.apply(this, args); break;
					case 'v-model': this.handleModel.apply(this, args); break;
					case 'v-for'  : this.handleFor.apply(this, args); break;
				}
			}

			this.checkCompleted();
		},

		/**
		 * 未编译数减一
		 */
		reduceCount: function() {
			this.$unCompileCount--;
			return this;
		},

		/**
		 * 是否是DOM元素
		 * @param   {DOMElement}   element
		 * @return  {Boolean}
		 */
		isElement: function(element) {
			var type = element.nodeType;
			return type === 1 || type === 9;
		},

		/**
		 * 是否是合法的指令
		 * @param   {String}   directive  [指令名称]
		 * @return  {Boolean}
		 */
		isDirective: function(directive) {
			return directive.indexOf('v-') === 0;
		},

		/**
		 * node的子节点是否需要递归编译，v-if子节点为后期编译
		 * @param   {DOMElement}   node
		 * @return  {Boolean}
		 */
		isCompliableNodeChilds: function(node) {
			var nodeAttrs = node.attributes;
			for (var i = 0; i < nodeAttrs.length; i++) {
				if (nodeAttrs[i].name === 'v-if') {
					return false;
				}
			}
			return true;
		},

		/**
		 * 检查是否编译完成
		 */
		checkCompleted: function() {
			var completed = (this.$compileStatus !== 0) && (this.$unCompileCount === 0);
			if (completed) {
				this.$compileStatus = 2;
				if (this.$lateComplie) {
					this.$lateComplie = false;
				}
				else {
					this.complieCompleted();
				}
			}
		},

		/**
		 * 所有指令编译完成，更新视图呈现
		 */
		complieCompleted: function() {
			var element = this.$element;
			this.empty(element);
			element.appendChild(this.$fragment);
		},

		/**
		 * 返回一个空文档碎片
		 * @return  {Fragment}
		 */
		createFragment: function() {
			return util.DOC.createDocumentFragment();
		},

		/**
		 * 清空element的所有子节点
		 * @param   {DOMElement}  element
		 */
		empty: function(element) {
			while (element.firstChild) {
				element.removeChild(element.firstChild);
			}
		},

		/**
		 * 设置节点的属性
		 * @param   {DOMElement}  node  [节点]
		 * @param   {String}      name  [属性名称]
		 * @param   {String}      value [属性值]
		 */
		setAttr: function(node, name, value) {
			node.setAttribute(name, value);
			return this;
		},

		/**
		 * 获取节点的属性值
		 * @param   {DOMElement}  node  [节点]
		 * @param   {String}      name  [属性名称]
		 * @return  {String}
		 */
		getAttr: function(node, name) {
			return node.getAttribute(name) || '';
		},

		/**
		 * 移除节点的属性
		 * @param   {DOMElement}  node  [节点]
		 * @param   {String}      name  [属性名称]
		 */
		removeAttr: function(node, name) {
			node.removeAttribute(name);
			return this;
		},

		/**
		 * 节点添加classname
		 * @param  {DOMElement}  node
		 * @param  {String}      classname
		 */
		addClass: function(node, classname) {
			var list = node.classList, current;
			if (list) {
				list.add(classname);
			}
			else {
				current = ' ' + this.getAttr(node, 'class') + ' ';
				if (current.indexOf(' ' + classname + ' ') === -1) {
					this.setAttr(node, 'class', (current + classname).trim());
				}
			}
			return this;
		},

		/**
		 * 节点删除classname
		 * @param  {DOMElement}  node
		 * @param  {String}      classname
		 */
		removeClass: function(node, classname) {
			var current, target;
			var list = node.classList;
			if (list) {
				list.remove(classname);
			}
			else {
				current = ' ' + this.getAttr(node, 'class') + ' ';
				target = ' ' + classname + ' ';
				while (current.indexOf(target) !== -1) {
					current = current.replace(target, ' ');
				}
				this.setAttr(node, 'class', current.trim());
			}

			if (!node.className) {
				this.removeAttr(node, 'class');
			}
			return this;
		},

		/**
		 * 去掉字符串中所有空格
		 * @param   {String}  string
		 * @return  {String}
		 */
		removeSpace: function(string) {
			return string.replace(/\s/g, '');
		},

		/**
		 * 字符串转文档碎片
		 * @param   {String}    htmlString  [html布局字符]
		 * @return  {Fragment}
		 */
		stringToFragment: function(htmlString) {
			var div, fragment;

			// 存在html标签
			if (/<[^>]+>/g.test(htmlString)) {
				div = util.DOC.createElement('div');
				div.innerHTML = htmlString;
				fragment = this.nodeToFragment(div);
			}
			// 纯文本节点
			else {
				fragment = this.createFragment();
				fragment.appendChild(util.DOC.createTextNode(htmlString));
			}

			return fragment;
		},

		/**
		 * 获取指令初始值
		 * @param   {String}  directive  [指令名称]
		 * @return  {Mix}                [初始值]
		 */
		getInitValue: function(directive) {
			return this.$model[directive];
		},

		/**
		 * 设置VM数据指令的当前值
		 * @param  {String}  directive  [指令名称]
		 * @param  {Mix}     value      [设置值]
		 */
		setValue: function(directive, value) {
			this.$data[directive] = value;
			return this;
		},

		/**
		 * 获取字符表达式的值
		 * @param   {String}   expression    [字符表达式]
		 * @param   {Boolean}  returnArray   [是否返回数组]
		 * @return  {String}
		 */
		getTargetValue: function(expression, returnArray) {
			var array = expression.split(':');
			return returnArray ? array : array.pop();
		},

		/**
		 * 字符表达式转为数组
		 * @param   {String}  expression   [字符表达式]
		 * @return  {Array}
		 */
		stringToPropsArray: function(expression) {
			var ret = [], props, leng = expression.length;
			if (expression.charAt(0) === '{' && expression.charAt(leng - 1) === '}') {
				props = expression.substr(1, leng - 2).split(',');
				util.each(props, function(prop) {
					var vals = this.getTargetValue(prop, true);
					var name = vals[0], value = vals[1];
					if (name && value) {
						ret.push({
							'name' : name,
							'value': value
						});
					}
				}, this);
			}
			return ret;
		},

		/********** 指令处理方法 **********/

		/**
		 * 指令处理方法：v-el（唯一不需要在model中声明的指令）
		 */
		registerElement: function(node, dir) {
			this.$data.$els[dir] = node;
		},

		/**
		 * 指令处理方法：v-text DOM文本
		 */
		handleText: function(node, dir) {
			var init = this.getInitValue(dir);
			this.setValue(dir, init).updateNodeTextContent(node, init);

			this.watcher.add(dir, function(path, last) {
				this.updateNodeTextContent(node, last);
			}, this);
		},

		/**
		 * 指令处理方法：v-html DOM布局
		 */
		handleHtml: function(node, dir) {
			var init = this.getInitValue(dir);
			this.setValue(dir, init).updateNodeHtmlContent(node, init);

			this.watcher.add(dir, function(path, last) {
				this.updateNodeHtmlContent(node, last);
			}, this);
		},

		/**
		 * @TODO: dir支持表达式控制
		 * 指令处理方法：v-show 控制节点的显示隐藏
		 */
		handleShow: function(node, dir) {
			var init = this.getInitValue(dir);
			this.setValue(dir, init).updateNodeDisplay(node, init);

			this.watcher.add(dir, function(path, last) {
				this.updateNodeDisplay(node, last);
			}, this);
		},

		/**
		 * @TODO: dir支持表达式控制
		 * 指令处理方法：v-if 控制节点内容的渲染
		 */
		handleIf: function(node, dir) {
			var init = this.getInitValue(dir);
			this.setValue(dir, init).updateNodeRenderContent(node, init, true);

			this.watcher.add(dir, function(path, last) {
				this.updateNodeRenderContent(node, last, false);
			}, this);
		},

		/**
		 * 指令处理方法：v-bind 动态绑定一个或多个attribute
		 * 除class外，一个attribute只能有一个value
		 */
		handleBind: function(node, value, attr) {
			var prop;
			var directive = this.removeSpace(attr);
			var expression = this.removeSpace(value);
			var props = this.stringToPropsArray(expression);

			// 单个attribute
			if (directive.indexOf(':') !== -1) {
				prop = this.getTargetValue(directive);

				if (prop === 'class') {
					// 多个class的json结构
					if (props.length) {
						util.each(props, function(prop) {
							this._bindClassName(node, prop.value, prop.name);
						}, this);
					}
					// 单个class，classname由expression的值决定
					else {
						this._bindClassName(node, expression);
					}
				}
				else {
					this._bindAttribute(node, prop, expression);
				}
			}
			// 多个attributes "v-bind={id:xxxx, name: yyy, data-id: zzz}"
			else {
				if (props.length) {
					util.each(props, function(prop) {
						this._bindAttribute(node, prop.name, prop.value);
					}, this);
				}
			}
		},

		/**
		 * 绑定节点class
		 * @param   {DOMElement}  node        [节点]
		 * @param   {String}      bindField   [数据绑定字段]
		 * @param   {String}      classname   [类名]
		 */
		_bindClassName: function(node, bindField, classname) {
			var init = this.getInitValue(bindField);
			this.setValue(bindField, init).updateNodeClassName(node, init, null, classname);

			this.watcher.add(bindField, function(path, last, old) {
				this.updateNodeClassName(node, last, old, classname);
			}, this);
		},

		/**
		 * 绑定节点属性
		 * @param   {DOMElement}  node       [节点]
		 * @param   {String}      attr       [属性名]
		 * @param   {String}      bindField  [数据绑定字段]
		 */
		_bindAttribute: function(node, attr, bindField) {
			var init = this.getInitValue(bindField);
			this.setValue(bindField, init).updateNodeAttribute(node, attr, init);

			this.watcher.add(bindField, function(path, last) {
				this.updateNodeAttribute(node, attr, last);
			}, this);
		},

		/**
		 * 指令处理方法：v-on 动态绑定一个或多个事件
		 */
		handleOn: function(node, dir) {
			// util.log(node, dir);
		},

		/**
		 * 指令处理方法：v-model 表单控件双向绑定
		 */
		handleModel: function(node, dir) {},

		/**
		 * 指令处理方法：v-for 基于源数据重复元素板块
		 */
		handleFor: function(node, dir) {},

		/********** 指令实现方法 **********/

		/**
		 * 更新节点的文本内容 realize v-text
		 * @param   {DOMElement}  node  [节点]
		 * @param   {String}      text  [文本]
		 */
		updateNodeTextContent: function(node, text) {
			if (text && util.isString(text)) {
				node.textContent = text;
			}
			return this;
		},

		/**
		 * 更新节点的html内容 realize v-html
		 * @param   {DOMElement}  node        [节点]
		 * @param   {String}      htmlString  [更新内容]
		 */
		updateNodeHtmlContent: function(node, htmlString) {
			if (htmlString && util.isString(htmlString)) {
				this.empty(node);
				node.appendChild(this.stringToFragment(htmlString));
			}
			return this;
		},

		/**
		 * 更新节点的显示隐藏 realize v-show
		 * @param   {DOMElement}  node    [节点]
		 * @param   {Boolean}     show    [是否显示]
		 */
		updateNodeDisplay: function(node, show) {
			var display, inlineStyle, styles;

			if (!node._vm_visible_display) {
				inlineStyle = this.removeSpace(this.getAttr(node, 'style'));

				if (inlineStyle && inlineStyle.indexOf('display') !== -1) {
					styles = inlineStyle.split(';');

					util.each(styles, function(style) {
						if (style.indexOf('display') !== -1) {
							display = this.getTargetValue(style);
						}
					}, this);
				}

				if (display !== 'none') {
					node._vm_visible_display = display;
				}
			}

			node.style.display = show ? (node._vm_visible_display || '') : 'none';
			return this;
		},

		/**
		 * 更新节点内容的渲染 realize v-if
		 * @param   {DOMElement}  node    [节点]
		 * @param   {Boolean}     render  [是否渲染]
		 * @param   {Boolean}     init    [是否是初始化编译]
		 */
		updateNodeRenderContent: function(node, render, init) {
			if (!node._vm_render_content) {
				node._vm_render_content = node.innerHTML;
			}

			if (!render) {
				this.empty(node);
			}
			else {
				if (!init) {
					node.appendChild(this.stringToFragment(node._vm_render_content));
				}

				this.$lateComplie = true;
				this.parseElement(node, true);
			}
			return this;
		},

		/**
		 * 更新节点的attribute realize v-bind
		 * @param   {DOMElement}  node       [节点]
		 * @param   {String}      attribute  [属性名]
		 * @param   {String}      value      [属性值]
		 */
		updateNodeAttribute: function(node, attribute, value) {
			if (value === null) {
				this.removeAttr.apply(this, arguments);
			}
			else {
				// 表单元素设置value不能用setAttribute
				// https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute
				if (attribute === 'value') {
					node.value = value;
				}
				else {
					this.setAttr.apply(this, arguments);
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
				if (newValue) {
					this.addClass(node, classname);
				}
				else {
					this.removeClass(node, classname);
				}
			}
			// 未指定classname，变化值由newValue的值决定
			else {
				if (newValue) {
					this.addClass(node, newValue);
				}

				if (oldValue) {
					this.removeClass(node, oldValue);
				}
			}
		}
	}

	return VM;
});