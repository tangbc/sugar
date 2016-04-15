/**
 * compiler 元素编译/指令提取模块
 */
define([
	'../dom',
	'../util',
	'./updater',
	'./watcher',
	// parse directive modules
	'./parsers/von',
	'./parsers/vel',
	'./parsers/vif',
	'./parsers/vfor',
	'./parsers/vtext',
	'./parsers/vhtml',
	'./parsers/vshow',
	'./parsers/vbind',
	'./parsers/vmodel'
], function(dom, util, Updater, Watcher, Von, Vel, Vif, Vfor, Vtext, Vhtml, Vshow, Vbind,  Vmodel) {

	/**
	 * VM 编译模块
	 * @param  {DOMElement}  element  [视图的挂载原生 DOM]
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

		// VM 数据模型
		this.$data = model;
		// DOM 对象注册索引
		this.$data.$els = {};

		// 未编译节点缓存队列
		this.$unCompileNodes = [];
		// 根节点是否已完成编译
		this.$rootComplied = false;

		// 视图刷新模块
		this.updater = new Updater(this);
		// 数据订阅模块
		this.watcher = new Watcher(this.$data);
		// 指令解析模块
		this.von = new Von(this);
		this.vel = new Vel(this);
		this.vif = new Vif(this);
		this.vfor = new Vfor(this);
		this.vtext = new Vtext(this);
		this.vhtml = new Vhtml(this);
		this.vshow = new Vshow(this);
		this.vbind = new Vbind(this);
		this.vmodel = new Vmodel(this);

		// v-model 限制使用的表单元素
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
		var atr, name, _vfor, attrs = [], nodeAttrs;

		if (this.isElementNode(node)) {
			// node 节点集合转为数组
			nodeAttrs = node.attributes

			for (var i = 0; i < nodeAttrs.length; i++) {
				atr = nodeAttrs[i];
				name = atr.name;
				if (this.isDirective(name)) {
					if (name === 'v-for') {
						_vfor = atr;
					}
					attrs.push(atr);
				}
			}

			// vfor 编译时标记节点的指令数
			if (_vfor) {
				util.defineProperty(node, '_vfor_directives', attrs.length);
				attrs = [_vfor];
				_vfor = null;
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
	 * @param   {DOMElement}   node
	 * @param   {Object}       attr
	 * @param   {Array}        fors
	 */
	vp.compile = function(node, attr, fors) {
		var dir = attr.name;
		var exp = attr.value;
		var args = [fors, node, exp, dir];

		// 移除指令标记
		dom.removeAttr(node, dir);

		if (!exp && dir !== 'v-else') {
			util.warn('The directive value of ' + dir + ' is empty!');
			return;
		}

		// 动态指令：v-bind:xxx
		if (dir.indexOf('v-bind') === 0) {
			this.vbind.parse.apply(this.vbind, args);
		}
		// 动态指令：v-on:xxx
		else if (dir.indexOf('v-on') === 0) {
			this.von.parse.apply(this.von, args);
		}
		// 静态指令
		else {
			switch (dir) {
				case 'v-el':
					this.vel.parse.apply(this.vel, args);
					break;
				case 'v-text':
					this.vtext.parse.apply(this.vtext, args);
					break;
				case 'v-html':
					this.vhtml.parse.apply(this.vhtml, args);
					break;
				case 'v-show':
					this.vshow.parse.apply(this.vshow, args);
					break;
				case 'v-if':
					this.vif.parse.apply(this.vif, args);
					break;
				case 'v-else':
					util.defineProperty(node, '_directive', 'v-else');
					break;
				case 'v-model':
					this.vmodel.parse.apply(this.vmodel, args);
					break;
				case 'v-for':
					this.vfor.parse.apply(this.vfor, args);
					break;
				default: util.warn(dir + ' is an unknown directive!');
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
			this.vhtml.parse.call(this.vhtml, fors, node, field);
		}
		else {
			this.vtext.parse.call(this.vtext, fors, node, field);
		}
	}

	/**
	 * 停止编译节点的剩余指令，如 vfor 的根节点
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
	 * vif, vfor 的子节点为处理指令时单独编译
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

	return VMCompiler;
});