/**
 * 简单的数据绑定mvvm库
 */
define([
	'./util',
	'./mvvm-observer'
], function(util, Observer) {

	/**
	 * MVVM构造器
	 * @param  {DOMElement}  element  [视图的挂载原生DOM]
	 * @param  {Object}      model    [数据模型]
	 */
	function MVVM(element, model) {
		var nType = element.nodeType;
		if (nType !== 1 && nType !== 9) {
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
		this.$fragment = null;

		// VM数据
		this.$data = new Object();
		// DOM对象注册索引
		this.$data.$els = {};
		// 未编译指令数目
		this.$unCompileCount = 0;
		// 未编译的节点
		this.$unCompileNodes = [];
		// 编译状态 0未开始 1开始 2已结束
		this.$compileStatus = 0;

		this.init();
	}
	MVVM.prototype = {
		constructor: MVVM,

		/**
		 * 初始化方法
		 */
		init: function() {
			var fragment = this.$fragment = this.nodeToFragment(this.$element);
			// 解析文档碎片
			this.parseFragment(fragment, true);
		},

		/**
		 * DOMElement转换成文档片段
		 * @param   {DOMElement}  element  [DOM节点]
		 */
		nodeToFragment: function(element) {
			var fragment = util.DOC.createDocumentFragment();
			var cloneNode = element.cloneNode(true);

			var childNode;
			while (childNode = cloneNode.firstChild) {
				fragment.appendChild(childNode);
			}

			return fragment;
		},

		/**
		 * 解析文档碎片
		 * @param   {Fragment}  fragment  [文档碎片]
		 * @param   {Boolean}   root      [是否是根节点]
		 */
		parseFragment: function(fragment, root) {
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

				if (node.childNodes.length) {
					this.parseFragment(node, false);
				}
			}

			if (root) {
				this.compileAllNodes();
			}
		},

		/**
		 * 获取节点的指令数
		 * @param   {DOMElement}  node  [节点]
		 * @return  {Number}            [指令数]
		 */
		getDirectivesCount: function(node) {
			var count = 0, nodeAttrs;
			if (node.nodeType === 1) {
				nodeAttrs = node.attributes;
				for (var i = 0; i < nodeAttrs.length; i++) {
					if (nodeAttrs[i].name.indexOf('v-') === 0) {
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
		 * @param   {DOMElement}  node  [单一节点]
		 */
		collectDirectives: function(node) {
			// 将node的节点集合转为数组
			var attrs = [];
			var nodeAttrs = node.attributes;
			for (var i = 0; i < nodeAttrs.length; i++) {
				attrs.push(nodeAttrs[i]);
			}

			// 编译node上的所有指令
			util.each(attrs, function(attr) {
				this.compileDirective(node, attr);
			}, this);
		},

		/**
		 * 编译节点的一条指令
		 * @param   {DOMElement}  node       [节点]
		 * @param   {Array}       directive  [单一指令]
		 */
		compileDirective: function(node, directive) {
			var name = directive.name;
			var value = directive.value;

			// 计数自减并移除指令标记
			this.reduceCount().removeAttr(node, name);

			if (name.charAt(0) === '$') {
				util.error('model\'s name cannot start with the character $', name);
				return;
			}

			// 动态指令：v-bind:xxx
			if (name.indexOf('v-bind') === 0) {
				this.handleBind(node, value, name);
			}
			// 静态指令
			else {
				switch (name) {
					case 'v-el'    :this.registerElement(node, value, name); break;
					case 'v-text'  :this.handleText(node, value, name); break;
					case 'v-html'  :this.handleHtml(node, value, name); break;
					case 'v-show'  :this.handleShow(node, value, name); break;
					case 'v-if'    :this.handleIf(node, value, name); break;
					case 'v-on'    :this.handleOn(node, value, name); break;
					case 'v-duplex':this.handleDuplex(node, value, name); break;
					case 'v-for'   :this.handleFor(node, value, name); break;
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
		 * 检查是否编译完成
		 */
		checkCompleted: function() {
			var completed = (this.$compileStatus !== 0) && (this.$unCompileCount === 0);
			if (completed) {
				this.$compileStatus = 2;
				this.complieCompleted();
			}
		},

		/**
		 * 所有指令编译完成，更新视图呈现
		 */
		complieCompleted: function() {
			var element = this.$element;
			// 移除所有子节点
			this.empty(element);
			// 编译后的文档碎片追加到根节点
			element.appendChild(this.$fragment);
		},

		/**
		 * 清空element的所有子节点
		 * @param   {DOMElement}  element  [DOM节点]
		 */
		empty: function(element) {
			while (element.firstChild) {
				element.removeChild(element.firstChild);
			}
		},

		/**
		 * 移除元素的属性
		 * @param   {DOMElement}  node  [节点]
		 * @param   {String}      name  [属性名称]
		 */
		removeAttr: function(node, name) {
			node.removeAttribute(name);
			return this;
		},

		/**
		 * 获取计算后的样式值
		 * @param   {DOMElement}  node   [节点]
		 * @param   {String}      style  [样式]
		 * @return  {String}             [样式值]
		 */
		getComputedStyle: function(node, style) {
			return util.GLOBAL.getComputedStyle(node, false)[style];
		},

		/**
		 * 字符串转文档碎片
		 * @param   {String}    htmlString  [html布局字符]
		 * @return  {Fragment}              [文档碎片]
		 */
		stringToFragment: function(htmlString) {
			var div, fragment;
			var hasTag = /<[^>]+>/g.test(htmlString);

			// 存在html标签
			if (hasTag) {
				div = util.DOC.createElement('div');
				div.innerHTML = htmlString;
				fragment = this.nodeToFragment(div);
			}
			// 纯文本节点
			else {
				fragment = util.DOC.createDocumentFragment();
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
		 * 设置指令的当前值
		 * @param  {String}  directive  [指令名称]
		 * @param  {Mix}     value      [设置值]
		 */
		setValue: function(directive, value) {
			this.$data[directive] = value;
			return this;
		},

		/**
		 * 指令处理方法：v-el（唯一不需要在model中声明的指令）
		 */
		registerElement: function(node, dir) {
			this.$data.$els[dir] = node;
		},

		/**
		 * 指令处理方法：v-text
		 */
		handleText: function(node, dir) {
			var init = this.getInitValue(dir);
			this.setValue(dir, init).updateNodeTextContent(node, init);

			new Observer(this.$data, [dir], function(path, last) {
				this.updateNodeTextContent(node, last);
			}, this);
		},

		/**
		 * 指令处理方法：DOM文本
		 */
		handleHtml: function(node, dir) {
			var init = this.getInitValue(dir);
			this.setValue(dir, init).updateNodeHtmlContent(node, init);

			new Observer(this.$data, [dir], function(path, last) {
				this.updateNodeHtmlContent(node, last);
			}, this);
		},

		/**
		 * @TODO: dir支持表达式控制
		 * 指令处理方法：控制节点的显示隐藏
		 */
		handleShow: function(node, dir) {
			var init = this.getInitValue(dir);
			this.setValue(dir, init).updateNodeDisplay(node, init);

			new Observer(this.$data, [dir], function(path, last) {
				this.updateNodeDisplay(node, last);
			}, this);
		},

		/**
		 * @TODO: dir支持表达式控制
		 * 指令处理方法：控制节点内容的渲染
		 */
		handleIf: function(node, dir) {
			var init = this.getInitValue(dir);
			this.setValue(dir, init).updateNodeRenderContent(node, init);
		},

		/**
		 * 指令处理方法：动态地绑定一个或多个attribute
		 */
		handleBind: function(node, dir, attr) {
			// util.log(node, dir, attr);
		},

		handleOn: function(node, dir) {},

		handleDuplex: function(node, dir) {},

		handleFor: function(node, dir) {},

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
		 * @TODO: 预判断node的display类型
		 * 更新节点的显示隐藏 realize v-show
		 * @param   {DOMElement}  node        [节点]
		 * @param   {Mix}         expression  [控制表达式]
		 */
		updateNodeDisplay: function(node, expression) {
			var current = this.getComputedStyle(node, 'display');
			node.$originalDisplayType = current;
			node.style.display = expression ? (node.$originalDisplayType || 'block') : 'none';
			return this;
		},

		/**
		 * 更新节点内容的渲染 realize v-if
		 * @param   {DOMElement}  node        [节点]
		 * @param   {Mix}         expression  [控制表达式]
		 */
		updateNodeRenderContent: function(node, expression) {
			//
		}
	}

	return MVVM;
});