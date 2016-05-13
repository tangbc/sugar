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
	 * 编译模块
	 * @param  {DOMElement}  element  [视图的挂载原生 DOM]
	 * @param  {Object}      model    [数据模型对象]
	 */
	function Compiler(element, model) {
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
		// 根节点转文档碎片
		this.$fragment = util.nodeToFragment(this.$element);

		// 数据模型对象
		this.$data = model;
		// DOM 注册索引
		this.$data.$els = {};
		// 子取值域索引
		this.$data.$scope = {};

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

	var cp = Compiler.prototype;

	cp.init = function() {
		this.complieElement(this.$fragment, true);
	}

	/**
	 * 编译文档碎片/节点
	 * @param   {Fragment|DOMElement}  element   [文档碎片/节点]
	 * @param   {Boolean}              root      [是否是编译根节点]
	 * @param   {Object}               fors      [vfor 数据]
	 */
	cp.complieElement = function(element, root, fors) {
		var node, childNodes = element.childNodes;

		if (root && this.hasDirective(element)) {
			this.$unCompileNodes.push([element, fors]);
		}

		for (var i = 0; i < childNodes.length; i++) {
			node = childNodes[i];

			if (this.hasDirective(node)) {
				this.$unCompileNodes.push([node, fors]);
			}

			if (node.childNodes.length && !this.isLateCompile(node)) {
				this.complieElement(node, false, fors);
			}
		}

		if (root) {
			this.compileAll();
		}
	}

	/**
	 * 节点是否含有合法指令
	 * @param   {DOMElement}  node
	 * @return  {Number}
	 */
	cp.hasDirective = function(node) {
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
	cp.compileAll = function() {
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
	cp.complieDirectives = function(info) {
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
				util.def(node, '_vfor_directives', attrs.length);
				attrs = [_vfor];
				_vfor = null;
			}

			// 编译节点指令
			util.each(attrs, function(attr) {
				this.compile(node, attr, fors);
			}, this);
		}
		else if (this.isTextNode(node)) {
			this.compileText(node, fors);
		}
	}

	/**
	 * 编译元素节点指令
	 * @param   {DOMElement}   node
	 * @param   {Object}       attr
	 * @param   {Array}        fors
	 */
	cp.compile = function(node, attr, fors) {
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
					util.def(node, '_directive', 'v-else');
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
	 * 编译文本节点 {{text}} or {{{html}}}
	 * @param   {DOMElement}   node
	 * @param   {Object}       fors
	 */
	cp.compileText = function(node, fors) {
		var text = node.textContent.trim().replace(/\n/g, '');
		var exp, match, matches, formatStr, pieces, tokens = [];
		var regtext = /\{\{(.+?)\}\}/g, reghtml = /\{\{\{(.+?)\}\}\}/g;
		var isText = regtext.test(text), isHtml = reghtml.test(text);

		// html match
		if (isHtml) {
			matches = text.match(reghtml);
			match = matches[0];
			exp = match.replace(/\s\{|\{|\{|\}|\}|\}/g, '');
			if (match.length !== text.length) {
				util.warn(match + ' compile for HTML can not have a prefix or suffix!');
				return;
			}
			this.vhtml.parse.call(this.vhtml, fors, node, exp);
		}
		// text match
		else if (isText) {
			formatStr = text.replace(regtext, function(m) {
				return '_%su' + m + '_$su';
			});
			pieces = formatStr.split(/\_\%su(.+?)\_\$su/g);

			// 文本节点转化为常量和变量的组合表达式
			// 'a {{b}} c' => '"a " + b + " c"'
			util.each(pieces, function(piece) {
				// {{text}}
				if (regtext.test(piece)) {
					tokens.push('(' + piece.replace(/\s\{|\{|\}|\}/g, '') + ')');
				}
				// 字符常量
				else if (piece) {
					tokens.push('"' + piece + '"');
				}
			});

			this.vtext.parse.call(this.vtext, fors, node, tokens.join('+'));
		}
	}

	/**
	 * 停止编译节点的剩余指令，如 vfor 的根节点
	 * @param   {DOMElement}  node
	 */
	cp.blockCompile = function(node) {
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
	cp.isElementNode = function(element) {
		return element.nodeType === 1;
	}

	/**
	 * 是否是文本节点
	 * @param   {DOMElement}   element
	 * @return  {Boolean}
	 */
	cp.isTextNode = function(element) {
		return element.nodeType === 3;
	}

	/**
	 * 是否是合法指令
	 * @param   {String}   directive
	 * @return  {Boolean}
	 */
	cp.isDirective = function(directive) {
		return directive.indexOf('v-') === 0;
	}

	/**
	 * 节点的子节点是否延迟编译
	 * vif, vfor 的子节点为处理指令时单独编译
	 * @param   {DOMElement}   node
	 * @return  {Boolean}
	 */
	cp.isLateCompile = function(node) {
		return dom.hasAttr(node, 'v-if') || dom.hasAttr(node, 'v-for');
	}

	/**
	 * 检查根节点是否编译完成
	 */
	cp.checkCompleted = function() {
		if (this.$unCompileNodes.length === 0 && !this.$rootComplied) {
			this.rootCompleted();
		}
	}

	/**
	 * 根节点编译完成，更新视图
	 */
	cp.rootCompleted = function() {
		var element = this.$element;
		this.$rootComplied = true;
		dom.empty(element).appendChild(this.$fragment);
	}

	return Compiler;
});