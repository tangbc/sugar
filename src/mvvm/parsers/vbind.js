define([
	'../parser',
	'../../util'
], function(Parser, util) {

	// 匹配 {'class': xxx} 形式
	var regJson = /^\{.*\}$/;

	function Vbind(vm) {
		this.vm = vm;
		Parser.call(this);
	}
	var vbind = Vbind.prototype = Object.create(Parser.prototype);

	/**
	 * 解析 v-bind 指令
	 * @param   {Object}      fors        [vfor 数据]
	 * @param   {DOMElement}  node        [指令节点]
	 * @param   {String}      expression  [指令表达式]
	 * @param   {String}      directive   [指令名称]
	 */
	vbind.parse = function(fors, node, expression, directive) {
		var deps = this.getDependents(fors, expression);
		var type, attrs, dir = util.removeSpace(directive);

		// 单个 attribute: v-bind:class="xxx"
		if (dir.indexOf(':') !== -1) {
			// 属性类型
			type = util.getStringKeyValue(dir);

			switch (type) {
				case 'class':
					this.parseClass(node, fors, deps, expression);
					break;
				case 'style':
					this.parseStyle(node, fors, deps, expression);
					break;
				default:
					this.parseAttr(node, fors, type, deps, expression);
			}
		}
		// 多个 attributes: "v-bind={id:xxxx, name: yyy, data-id: zzz}"
		else {
			attrs = util.convertJsonString(expression);

			util.each(attrs, function(exp, attr) {
				var model = exp;
				var newDeps = this.getDependents(fors, model);

				switch (attr) {
					case 'class':
						this.parseClass(node, fors, newDeps, model);
						break;
					case 'style':
						this.parseStyle(node, fors, newDeps, model);
						break;
					default:
						this.parseAttr(node, fors, attr, newDeps, model);
				}
			}, this);
		}
	}

	/**
	 * 绑定/更新节点 classname
	 * @param   {DOMElement}   node
	 * @param   {Object}       fors
	 * @param   {Array}        deps
	 * @param   {String}       expression
	 */
	vbind.parseClass = function(node, fors, deps, expression) {
		var vm = this.vm;
		var watcher = vm.watcher;
		var exp = expression.trim();
		var isJson = regJson.test(exp);

		var map, watchDef;
		var scope, getter, value;
		var jsonDeps = [], jsonAccess = [], cache = {};

		// 不是 classJson
		if (!isJson) {
			scope = this.getScope(vm, fors, exp);
			getter = this.getEvalFunc(fors, exp);
			value = getter.call(scope, scope);

			// 单个变化的字段 cls
			if (util.isString(value)) {
				watchDef = true;
				this.updateClass(node, value);
			}
			// 数组形式 ['cls-a', 'cls-b']
			else if (util.isArray(value)) {
				watchDef = true;
				util.each(value, function(cls) {
					this.updateClass(node, cls);
				}, this);
			}
			// 对象形式 classObject
			else if (util.isObject(value)) {
				util.each(value, function(isAdd, cls) {
					var model = exp;
					var access = deps[1][deps[0].indexOf(model)];
					var valAccess = access ? (access + '*' + cls) : (model + '*' + cls);

					jsonDeps.push(model);
					jsonAccess.push(valAccess);
					cache[valAccess] = cls;

					this.updateClass(node, isAdd, false, cls);
				}, this);
			}
		}
		// classJson
		else {
			// classname 与取值字段的映射
			map = util.convertJsonString(exp);

			util.each(map, function(field, cls) {
				var isAdd, model = map[cls];
				var access = deps[1][deps[0].indexOf(model)];

				scope = this.getScope(vm, fors, field);
				getter = this.getEvalFunc(fors, field);
				isAdd = getter.call(scope, scope);

				jsonDeps.push(model);
				jsonAccess.push(access);
				cache[access || model] = cls;

				this.updateClass(node, isAdd, false, cls);

				scope = getter = null;
			}, this);
		}


		// cls 和 [clsa, clsb] 的依赖监测
		if (watchDef) {
			watcher.watch(deps, function(path, last, old) {
				this.updateClass(node, last, old);
			}, this);
		}
		// classObject 和 classJson 的依赖监测
		else {
			watcher.watch([jsonDeps, jsonAccess], function(path, last, old) {
				this.updateClass(node, last, old, cache[path]);
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
	 * 与 v-bind:style 只能为 styleObject 或 styleJson
	 * @param   {DOMElement}   node
	 * @param   {Object}       fors
	 * @param   {Array}        deps
	 * @param   {String}       expression
	 */
	vbind.parseStyle = function(node, fors, deps, expression) {
		var vm = this.vm;
		var watcher = vm.watcher;
		var exp = expression.trim();
		var isJson = regJson.test(exp);

		var scope, getter, styles;
		var map, cache = {}, jsonDeps = [], jsonAccess = [];

		// styleObject
		if (!isJson) {
			scope = this.getScope(vm, fors, exp);
			getter = this.getEvalFunc(fors, exp);
			styles = getter.call(scope, scope);

			util.each(styles, function(property, style) {
				var model = deps[0][0];
				var access = deps[1][deps[0].indexOf(model)] || model;
				var valAccess = access + '*' + style;

				jsonDeps.push(model);
				jsonAccess.push(valAccess);
				cache[valAccess] = style;

				this.updateStyle(node, style, property);
			}, this);

			// styleObject 依赖监测
			watcher.watch([jsonDeps, jsonAccess], function(path, last, old) {
				this.updateStyle(node, cache[path], last);
			}, this);
		}
		// styleJson
		else {
			// style 与取值字段的映射
			map = util.convertJsonString(exp);

			util.each(map, function(field, style) {
				var model = field, property;
				var access = deps[1][deps[0].indexOf(model)];

				scope = this.getScope(vm, fors, model);
				getter = this.getEvalFunc(fors, model);
				property = getter.call(scope, scope);

				cache[access || model] = style;

				this.updateStyle(node, style, property);

				scope = getter = null;
			}, this);

			// styleJson 依赖监测
			watcher.watch(deps, function(path, last, old) {
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
	 * @param   {Object}       fors
	 * @param   {String}       attr
	 * @param   {Array}        deps
	 * @param   {String}       expression
	 */
	vbind.parseAttr = function(node, fors, attr, deps, expression) {
		var vm = this.vm;
		var scope = this.getScope(vm, fors, expression);
		var getter = this.getEvalFunc(fors, expression);
		var value = getter.call(scope, scope);

		this.updateAttr(node, attr, value);

		// 监测依赖
		vm.watcher.watch(deps, function(path, last, old) {
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