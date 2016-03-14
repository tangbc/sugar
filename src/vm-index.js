/**
 * 简单的数据绑定视图层库
 */
define([
	'./util',
	'./vm-parser',
	'./dom'
], function(util, Parser, dom) {

	/**
	 * VM构造函数
	 * @param  {DOMElement}  element  [视图的挂载原生DOM]
	 * @param  {Object}      model    [数据模型对象]
	 */
	function VM(element, model) {
		if (!this.isElementNode(element)) {
			util.error('element must be a type of DOMElement: ', element);
			return;
		}

		if (!util.isObject(model)) {
			util.error('model must be a type of Object: ', model);
			return;
		}

		// 缓存根节点
		this.$element = element;
		// 根节点转为文档碎片
		this.$fragment = util.nodeToFragment(element);

		// VM数据模型
		this.$data = model;
		// DOM对象注册索引
		this.$data.$els = {};

		// 未编译指令数目
		this.$unCompileCount = 0;
		// 未编译节点缓存队列
		this.$unCompileNodes = [];
		// 根节点是否已完成编译
		this.$rootComplied = false;

		// 解析器
		this.parser = new Parser(this);

		// vmodel限制使用的表单元素
		this.$inputs = ['input', 'select', 'textarea'];

		this.init();
	}
	VM.prototype = {
		constructor: VM,

		init: function() {
			this.parseElement(this.$fragment, true);
		},

		/**
		 * 解析文档碎片/节点
		 * @param   {Fragment|DOMElement}  element   [文档碎片/节点]
		 * @param   {Boolean}              root      [是否是编译根节点]
		 * @param   {Array}                fors      [vfor数据]
		 */
		parseElement: function(element, root, fors) {
			var node, dirCount;
			var childNodes = element.childNodes;

			// 解析所有的子节点
			for (var i = 0; i < childNodes.length; i++) {
				node = childNodes[i];
				dirCount = this.getDirectivesCount(node);
				this.$unCompileCount += dirCount;

				if (dirCount) {
					this.$unCompileNodes.push([node, fors]);
				}

				if (node.childNodes.length && !this.isLateCompileNode(node)) {
					this.parseElement(node, false, fors);
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
			var text = node.textContent;
			var reg = /(\{\{.*\}\})|(\{\{\{.*\}\}\})/;

			if (this.isElementNode(node)) {
				nodeAttrs = node.attributes;
				for (var i = 0; i < nodeAttrs.length; i++) {
					if (this.isDirective(nodeAttrs[i].name)) {
						count++;
					}
				}
			}
			else if (this.isTextNode(node) && reg.test(text)) {
				count++;
			}
			return count;
		},

		/**
		 * 编译节点缓存队列
		 */
		compileAllNodes: function() {
			util.each(this.$unCompileNodes, function(info) {
				this.collectDirectives(info);
				return null;
			}, this);
		},

		/**
		 * 收集并编译节点指令
		 * @param   {Array}  info   [node, fors]
		 */
		collectDirectives: function(info) {
			var atr, attrs = [], nodeAttrs;
			var node = info[0], fors = info[1];

			if (this.isElementNode(node)) {
				// node节点集合转为数组
				nodeAttrs = node.attributes

				for (var i = 0; i < nodeAttrs.length; i++) {
					atr = nodeAttrs[i];
					if (this.isDirective(atr.name)) {
						attrs.push(atr);
					}
				}

				// 编译节点指令
				util.each(attrs, function(attr) {
					this.compileDirective(node, attr, fors);
				}, this);
			}
			else if (this.isTextNode(node)) {
				this.compileTextNode(node, fors);
			}
		},

		/**
		 * 编译元素节点指令
		 * @param   {DOMElement}      node
		 * @param   {Object}          directive
		 * @param   {Array}           fors
		 */
		compileDirective: function(node, directive, fors) {
			var parser = this.parser;
			var name = directive.name;
			var value = directive.value;
			var args = [node, directive.value, name, fors];

			this.reduceCount();
			// 移除指令标记
			dom.removeAttr(node, name);

			if (!value && name !== 'v-else') {
				util.warn('The directive value of ' + name + ' is empty!');
				return;
			}

			// 动态指令：v-bind:xxx
			if (name.indexOf('v-bind') === 0) {
				parser.parseVBind.apply(parser, args);
			}
			// 动态指令：v-on:xxx
			else if (name.indexOf('v-on') === 0) {
				parser.parseVOn.apply(parser, args);
			}
			// 静态指令
			else {
				switch (name) {
					case 'v-el':
						parser.parseVEl.apply(parser, args);
						break;
					case 'v-text':
						parser.parseVText.apply(parser, args);
						break;
					case 'v-html':
						parser.parseVHtml.apply(parser, args);
						break;
					case 'v-show':
						parser.parseVShow.apply(parser, args);
						break;
					case 'v-if':
						parser.parseVIf.apply(parser, args);
						break;
					case 'v-else':
						parser.parseVElse.apply(parser, args);
						break;
					case 'v-model':
						parser.parseVModel.apply(parser, args);
						break;
					case 'v-for':
						parser.parseVFor.apply(parser, args);
						break;
					default: util.warn(name + ' is an unknown directive!');
				}
			}

			if (!fors) {
				this.checkCompleted();
			}
		},

		/**
		 * 编译文本节点
		 * @param   {DOMElement}   node
		 * @param   {Array}        fors
		 */
		compileTextNode: function(node, fors) {
			var text = node.textContent;
			var regtext = new RegExp('{{(.+?)}}', 'g');
			var regHtml = new RegExp('{{{(.+?)}}}', 'g');
			var matches = text.match(regHtml);
			var match, splits, field, htmlCompile;

			// html match
			if (matches) {
				match = matches[0];
				htmlCompile = true;
				field = match.replace(/\{|\{|\{|\}|\}|\}/g, '');
			}
			// text match
			else {
				matches = text.match(regtext);
				match = matches[0];
				field = match.replace(/\{|\{|\}|\}/g, '');
			}

			this.reduceCount();

			splits = text.split(match);
			node._vm_text_prefix = splits[0];
			node._vm_text_suffix = splits[splits.length - 1];

			if (htmlCompile) {
				this.parser.parseVHtml(node, field, 'v-html-plain', fors);
			}
			else {
				this.parser.parseVText(node, field, 'v-text-plain', fors);
			}

			if (!fors) {
				this.checkCompleted();
			}
		},

		/**
		 * 未编译数减一
		 */
		reduceCount: function() {
			this.$unCompileCount--;
		},

		/**
		 * 是否是元素节点
		 * @param   {DOMElement}   element
		 * @return  {Boolean}
		 */
		isElementNode: function(element) {
			return element.nodeType === 1;
		},

		/**
		 * 是否是文本节点
		 * @param   {DOMElement}   element
		 * @return  {Boolean}
		 */
		isTextNode: function(element) {
			return element.nodeType === 3;
		},

		/**
		 * 是否是合法指令
		 * @param   {String}   directive
		 * @return  {Boolean}
		 */
		isDirective: function(directive) {
			return directive.indexOf('v-') === 0;
		},

		/**
		 * 节点的子节点是否延迟编译
		 * vif, vfor的子节点为处理指令时单独编译
		 * @param   {DOMElement}   node
		 * @return  {Boolean}
		 */
		isLateCompileNode: function(node) {
			return dom.hasAttr(node, 'v-if') || dom.hasAttr(node, 'v-for');
		},

		/**
		 * 检查根节点是否编译完成
		 */
		checkCompleted: function() {
			if (this.$unCompileCount === 0 && !this.$rootComplied) {
				this.rootComplieCompleted();
			}
		},

		/**
		 * 根节点编译完成，更新视图
		 */
		rootComplieCompleted: function() {
			var element = this.$element;
			dom.empty(element);
			this.$rootComplied = true;
			element.appendChild(this.$fragment);
		},

		/**
		 * 设置VM数据值
		 * @param  {String}  field
		 * @param  {Mix}     value
		 */
		setData: function(field, value) {
			this.$data[field] = value;
		},

		/**
		 * 获取当前VM数据值
		 * @param  {String}  field
		 * @param  {Mix}     value
		 */
		getData: function(field) {
			return this.$data[field];
		}
	}

	return VM;
});