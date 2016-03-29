/**
 * 简单的数据绑定视图层库
 */
define([
	'../dom',
	'../util',
	'./parser'
], function(dom, util, Parser) {

	/**
	 * VM编译模块
	 * @param  {DOMElement}  element  [视图的挂载原生DOM]
	 * @param  {Object}      model    [数据模型对象]
	 */
	function VMCompiler(element, model) {
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
		// 元素转为文档碎片
		this.$fragment = util.nodeToFragment(this.$element);

		// VM数据模型
		this.$data = model;
		// DOM对象注册索引
		this.$data.$els = {};

		// 未编译节点缓存队列
		this.$unCompileNodes = [];
		// 根节点是否已完成编译
		this.$rootComplied = false;

		// 解析器
		this.parser = new Parser(this);

		// vmodel限制使用的表单元素
		this.$inputs = 'input|select|textarea'.split('|');

		this.init();
	}

	var vp = VMCompiler.prototype;

	vp.init = function() {
		this.complieElement(this.$fragment, true);
	}

	/**
	 * 编译文档碎片/节点
	 * @param   {Fragment|DOMElement}  element   [文档碎片/节点]
	 * @param   {Boolean}              root      [是否是编译根节点]
	 * @param   {Array}                fors      [vfor数据]
	 */
	vp.complieElement = function(element, root, fors) {
		var node, childNodes = element.childNodes;

		if (root && this.hasDirective(element)) {
			this.$unCompileNodes.push([element, fors]);
		}

		for (var i = 0; i < childNodes.length; i++) {
			node = childNodes[i];

			if (this.hasDirective(node)) {
				this.$unCompileNodes.push([node, fors]);
			}

			if (node.childNodes.length && !this.isLateCompileNode(node)) {
				this.complieElement(node, false, fors);
			}
		}

		if (root) {
			this.compileAllNodes();
		}
	}

	/**
	 * 节点是否含有合法指令
	 * @param   {DOMElement}  node
	 * @return  {Number}
	 */
	vp.hasDirective = function(node) {
		var result, nodeAttrs;
		var text = node.textContent;
		var reg = /(\{\{.*\}\})|(\{\{\{.*\}\}\})/;

		if (this.isElementNode(node)) {
			nodeAttrs = node.attributes;
			for (var i = 0; i < nodeAttrs.length; i++) {
				if (this.isDirective(nodeAttrs[i].name)) {
					result = true;
					break;
				}
			}
		}
		else if (this.isTextNode(node) && reg.test(text)) {
			result = true;
		}
		return result;
	}

	/**
	 * 编译节点缓存队列
	 */
	vp.compileAllNodes = function() {
		util.each(this.$unCompileNodes, function(info) {
			this.complieDirectives(info);
			return null;
		}, this);

		this.checkCompleted();
	}

	/**
	 * 收集并编译节点指令
	 * @param   {Array}  info   [node, fors]
	 */
	vp.complieDirectives = function(info) {
		var node = info[0], fors = info[1];
		var atr, name, vfor, attrs = [], nodeAttrs;

		if (this.isElementNode(node)) {
			// node节点集合转为数组
			nodeAttrs = node.attributes

			for (var i = 0; i < nodeAttrs.length; i++) {
				atr = nodeAttrs[i];
				name = atr.name;
				if (this.isDirective(name)) {
					if (name === 'v-for') {
						vfor = atr;
					}
					attrs.push(atr);
				}
			}

			// vfor编译时标记节点的指令数
			if (vfor) {
				util.defineProperty(node, '_vfor_directives', attrs.length);
				attrs = [vfor];
				vfor = null;
			}

			// 编译节点指令
			util.each(attrs, function(attr) {
				this.compile(node, attr, fors);
			}, this);
		}
		else if (this.isTextNode(node)) {
			this.compileTextNode(node, fors);
		}
	}

	/**
	 * 编译元素节点指令
	 * @param   {DOMElement}      node
	 * @param   {Object}          directive
	 * @param   {Array}           fors
	 */
	vp.compile = function(node, directive, fors) {
		var parser = this.parser;
		var name = directive.name;
		var value = directive.value;
		var args = [node, directive.value, name, fors];

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
	}

	/**
	 * 编译文本节点
	 * @param   {DOMElement}   node
	 * @param   {Array}        fors
	 */
	vp.compileTextNode = function(node, fors) {
		var text = node.textContent;
		var regtext = new RegExp('{{(.+?)}}', 'g');
		var regHtml = new RegExp('{{{(.+?)}}}', 'g');
		var matches = text.match(regHtml);
		var match, splits, field, htmlCompile;

		// html match
		if (matches) {
			match = matches[0];
			htmlCompile = true;
			field = match.replace(/\s\{|\{|\{|\}|\}|\}/g, '');
		}
		// text match
		else {
			matches = text.match(regtext);
			match = matches[0];
			field = match.replace(/\s|\{|\{|\}|\}/g, '');
		}

		splits = text.split(match);
		node._vm_text_prefix = splits[0];
		node._vm_text_suffix = splits[splits.length - 1];

		if (htmlCompile) {
			this.parser.parseVHtml(node, field, 'v-html-plain', fors);
		}
		else {
			this.parser.parseVText(node, field, 'v-text-plain', fors);
		}
	}

	/**
	 * 停止编译节点的剩余指令，如vfor的根节点
	 * @param   {DOMElement}  node
	 */
	vp.blockCompileNode = function(node) {
		util.each(this.$unCompileNodes, function(info) {
			if (node === info[0]) {
				return null;
			}
		});
	}

	/**
	 * 是否是元素节点
	 * @param   {DOMElement}   element
	 * @return  {Boolean}
	 */
	vp.isElementNode = function(element) {
		return element.nodeType === 1;
	}

	/**
	 * 是否是文本节点
	 * @param   {DOMElement}   element
	 * @return  {Boolean}
	 */
	vp.isTextNode = function(element) {
		return element.nodeType === 3;
	}

	/**
	 * 是否是合法指令
	 * @param   {String}   directive
	 * @return  {Boolean}
	 */
	vp.isDirective = function(directive) {
		return directive.indexOf('v-') === 0;
	}

	/**
	 * 节点的子节点是否延迟编译
	 * vif, vfor的子节点为处理指令时单独编译
	 * @param   {DOMElement}   node
	 * @return  {Boolean}
	 */
	vp.isLateCompileNode = function(node) {
		return dom.hasAttr(node, 'v-if') || dom.hasAttr(node, 'v-for');
	}

	/**
	 * 检查根节点是否编译完成
	 */
	vp.checkCompleted = function() {
		if (this.$unCompileNodes.length === 0 && !this.$rootComplied) {
			this.rootComplieCompleted();
		}
	}

	/**
	 * 根节点编译完成，更新视图
	 */
	vp.rootComplieCompleted = function() {
		var element = this.$element;
		dom.empty(element);
		this.$rootComplied = true;
		element.appendChild(this.$fragment);
	}

	/**
	 * 设置VM数据值
	 * @param  {String}  field
	 * @param  {Mix}     value
	 */
	vp.setValue = function(field, value) {
		this.$data[field] = value;
	}

	/**
	 * 获取当前VM数据值
	 * @param  {String}  field
	 * @param  {Mix}     value
	 */
	vp.getValue = function(field) {
		return this.$data[field];
	}


	/**
	 * MVVM构造函数，封装VMComplier
	 * @param  {DOMElement}  element  [视图的挂载原生DOM]
	 * @param  {Object}      model    [数据模型对象]
	 * @param  {Function}    context  [VM事件及watch的回调上下文]
	 */
	function MVVM(element, model, context) {
		this.context = context;

		// 将函数this指向调用者
		util.each(model, function(value, key) {
			if (util.isFunc(value)) {
				model[key] = value.bind(context);
			}
		});

		// 初始数据备份
		this._backup = util.copy(model);

		// 内部MVVM实例
		this._vm = new VMCompiler(element, model);

		// VM数据模型
		this.$ = this._vm.$data;
	}

	var mvp = MVVM.prototype;

	/**
	 * 获取指定数据模型
	 * @param   {String}  key  [数据模型字段]
	 * @return  {Mix}
	 */
	mvp.get = function(key) {
		return util.isString(key) ? this.$[key] : this.$;
	}

	/**
	 * 设置数据模型的值，key为JSON时则批量设置
	 * @param  {String}  key    [数据模型字段]
	 * @param  {Mix}     value  [值]
	 */
	mvp.set = function(key, value) {
		var vm = this.$;
		// 批量设置
		if (util.isObject(key)) {
			util.each(key, function(v, k) {
				vm[k] = v;
			});
		}
		else if (util.isString(key)) {
			vm[key] = value;
		}
	}

	/**
	 * 重置数据模型至初始状态
	 * @param   {Array|String}  key  [数据模型字段，或字段数组，空则重置所有]
	 */
	mvp.reset = function(key) {
		var vm = this.$;
		var backup = this._backup;

		// 重置单个
		if (util.isString(key)) {
			vm[key] = backup[key];
		}
		// 重置多个
		else if (util.isArray(key)) {
			util.each(key, function(v, k) {
				vm[k] = backup[k];
			});
		}
		// 重置所有
		else {
			util.each(vm, function(v, k) {
				vm[k] = backup[k];
			});
		}
	}

	/**
	 * 对数据模型的字段添加监测
	 * @param   {String}    model     [数据模型字段]
	 * @param   {Function}  callback  [触发回调，参数为model, last, old]
	 */
	mvp.watch = function(model, callback) {
		this._vm.parser.watcher.add(model, function(path, last, old) {
			callback.call(this, model, last, old);
		}, this.context);
	}

	return MVVM;
});