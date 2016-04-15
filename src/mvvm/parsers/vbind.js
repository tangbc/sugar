define([
	'../parser',
	'../../util'
], function(Parser, util) {

	function Vbind(vm) {
		this.vm = vm;
		Parser.call(this);
	}
	var vbind = Vbind.prototype = Object.create(Parser.prototype);

	/**
	 * 解析 v-bind 指令
	 * @param   {Array}       fors        [vfor 数据]
	 * @param   {DOMElement}  node        [指令节点]
	 * @param   {String}      expression  [指令表达式]
	 * @param   {String}      directive   [指令名称]
	 */
	vbind.parse = function(fors, node, expression, directive) {
		var vm = this.vm;

		var deps = this.getDependents(fors, expression);
		var scope = this.getScope(vm, fors, expression);
		var getter = this.getEvalFunc(fors, expression);

		var type, map;
		var attrs = getter.call(scope, scope);
		var dir = util.removeSpace(directive);

		// 单个 attribute: v-bind:class="xxx"
		if (dir.indexOf(':') !== -1) {
			type = util.getStringKeyValue(dir);

			switch (type) {
				case 'class':
					this.parseClass(node, attrs, deps, expression);
					break;
				case 'style':
					this.parseStyle(node, attrs, deps, expression);
					break;
				default:
					this.parseAttr(node, type, attrs, deps);
			}
		}
		// 多个 attributes: "v-bind={id:xxxx, name: yyy, data-id: zzz}"
		else {
			map = util.convertJsonString(expression);

			util.each(attrs, function(value, attr) {
				var model = map[attr];
				var index = deps[0].indexOf(model);
				var access = deps[1][index];
				var newDeps = [[model], [access]];

				switch (attr) {
					case 'class':
						this.parseClass(node, value, newDeps, model);
						break;
					case 'style':
						this.parseStyle(node, value, newDeps, model);
						break;
					default:
						this.parseAttr(node, attr, value, newDeps);
				}
			}, this);
		}
	}

	/**
	 * 绑定/更新节点 classname
	 * @param   {DOMElement}           node
	 * @param   {String|Object|Array}  classes
	 * @param   {Array}                deps
	 * @param   {String}               expression
	 */
	vbind.parseClass = function(node, classes, deps, expression) {
		var watcher = this.vm.watcher;
		var isObject = util.isObject(classes);
		var map, jsonDeps = [], jsonAccess = [], cache = {};

		// 单个
		if (util.isString(classes)) {
			this.updateClass(node, classes);
		}
		// 数组形式 ['cls-a', 'cls-b']
		else if (util.isArray(classes)) {
			util.each(classes, function(cls) {
				this.updateClass(node, cls);
			}, this);
		}
		// 对象形式 {'cls-a': isA, 'cls-b': isB}
		else if (isObject) {
			// classJson, classObject 形式的依赖需要单独提取
			// 因为通过取值函数获取的 classes 是求值后的结果，无法找回依赖模型和路径
			map = util.convertJsonString(expression);

			util.each(classes, function(isAdd, cls) {
				var model, access;
				// classJson
				if (map) {
					model = map[cls];
					access = deps[1][deps[0].indexOf(model)];
				}
				// classObject
				else {
					model = expression;
					access = deps[1][deps[0].indexOf(model)];
					access = access ? (access + '*' + cls) : (expression + '*' + cls);
				}

				jsonDeps.push(model);
				jsonAccess.push(access);
				cache[access || model] = cls;

				this.updateClass(node, isAdd, false, cls);
			}, this);

			// classJson, classObject 的依赖监测
			watcher.watch([jsonDeps, jsonAccess], function(path, last, old) {
				this.updateClass(node, last, old, cache[path]);
			}, this);
		}

		// 非对象的依赖监测
		if (!isObject) {
			watcher.watch(deps, function(path, last, old) {
				this.updateClass(node, last, old);
			}, this);
		}
	}

	/**
	 * 刷新节点 classname
	 */
	vbind.updateClass = function() {
		var updater = this.vm.updater;
		updater.updateNodeClassName.apply(updater, arguments);
	}

	/**
	 * 绑定/更新节点 inlineStyle
	 * 与 classes 不同，styles 只能为 styleObject 或 styleJson
	 * @param   {DOMElement}   node
	 * @param   {Object}       styles
	 * @param   {Array}        deps
	 * @param   {String}       expression
	 */
	vbind.parseStyle = function(node, styles, deps, expression) {
		var watcher = this.vm.watcher;
		var cache = {}, jsonDeps = [], jsonAccess = [];
		var isJson = /^\{.*\}$/.test(expression.trim());

		if (!util.isObject(styles)) {
			util.warn('v-bind for style must be a json or styleObject!');
			return;
		}

		// styleJson
		if (isJson) {
			util.each(styles, function(property, style) {
				var index, access;

				util.each(deps[0], function(model, i) {
					if (model === style || util.getExpKey(model) === style) {
						index = i;
						return false;
					}
				});

				access = deps[1][index] || deps[0][index];

				cache[access] = style;

				this.updateStyle(node, style, property);
			}, this);

			// styleJson 依赖监测
			watcher.watch(deps, function(path, last, old) {
				this.updateStyle(node, cache[path], last);
			}, this);
		}
		// styleObject
		else {
			util.each(styles, function(property, style) {
				// 依赖访问路径或者 model
				var depAccess = deps[1][0] || deps[0][0];
				var access = depAccess + '*' + style;

				cache[access] = style;
				jsonDeps.push(deps[0][0]);
				jsonAccess.push(access);

				this.updateStyle(node, style, property);
			}, this);

			// styleObject 依赖监测
			watcher.watch([jsonDeps, jsonAccess], function(path, last, old) {
				this.updateStyle(node, cache[path], last);
			}, this);
		}
	}

	/**
	 * 刷新节点行内样式 inlineStyle
	 */
	vbind.updateStyle = function() {
		var updater = this.vm.updater;
		updater.updateNodeStyle.apply(updater, arguments);
	}

	/**
	 * 绑定/更新节点的普通 attribute
	 * @param   {DOMElement}   node
	 * @param   {String}       attr
	 * @param   {String}       value
	 * @param   {Array}        deps
	 */
	vbind.parseAttr = function(node, attr, value, deps) {
		this.updateAttr(node, attr, value);

		// 监测依赖
		this.vm.watcher.watch(deps, function(path, last, old) {
			this.updateAttr(node, attr, last);
		}, this);
	}

	/**
	 * 刷新节点的属性 attribute
	 */
	vbind.updateAttr = function() {
		var updater = this.vm.updater;
		updater.updateNodeAttribute.apply(updater, arguments);
	}

	return Vbind;
});