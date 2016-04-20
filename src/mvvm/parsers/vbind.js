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
		var deps = this.getDeps(fors, expression);
		var type, attrs, dir = util.removeSpace(directive);

		// 单个 attribute: v-bind:class="xxx"
		if (dir.indexOf(':') !== -1) {
			// 属性类型
			type = util.getKeyValue(dir);

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
			attrs = util.convertJson(expression);

			util.each(attrs, function(exp, attr) {
				var model = exp;
				var newDeps = this.getDeps(fors, model);

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

		var map, scope, getter, value;
		var cache = {}, jsonDeps = [], jsonAccess = [];

		// 不是 classJson
		if (!isJson) {
			scope = this.getScope(fors, exp);
			getter = this.getEval(fors, exp);
			value = getter.call(scope, scope);

			// 单个变化的字段 cls
			if (util.isString(value)) {
				this.updateClass(node, value);
			}
			// 数组形式 ['cls-a', 'cls-b']
			else if (util.isArray(value)) {
				util.each(value, function(cls) {
					this.updateClass(node, cls);
				}, this);
			}
			// 对象形式 classObject
			else if (util.isObject(value)) {
				this.parseClassObject(node, value, deps, exp);

				// 监测整个 classObject 被替换
				watcher.watch(deps, function(path, newObject, oldObject) {
					// 移除旧的 class
					util.each(oldObject, function(b, cls) {
						this.updateClass(node, false, false, cls);
					}, this);

					// 重新绑定
					this.parseClassObject(node, newObject, deps, exp);
				}, this);

				// 已在 parseClassObject 做监测
				return;
			}
		}
		// classJson
		else {
			// classname 与取值字段的映射
			map = util.convertJson(exp);

			util.each(map, function(field, cls) {
				var isAdd, model = map[cls];
				var access = deps.acc[deps.dep.indexOf(model)];

				scope = this.getScope(fors, field);
				getter = this.getEval(fors, field);
				isAdd = getter.call(scope, scope);

				jsonDeps.push(model);
				jsonAccess.push(access);
				cache[access || model] = cls;

				this.updateClass(node, isAdd, false, cls);

				scope = getter = null;
			}, this);
		}


		// cls 和 [clsa, clsb] 的依赖监测
		if (!isJson) {
			watcher.watch(deps, function(path, last, old) {
				this.updateClass(node, last, old);
			}, this);
		}
		// classJson 的依赖监测
		else {
			this.watchClassObject(node, {
				'dep': jsonDeps,
				'acc': jsonAccess
			}, cache);
		}
	}

	/**
	 * 绑定 classObject
	 * @param   {DOMElement}   node
	 * @param   {Object}       obj
	 * @param   {Object}       deps
	 * @param   {String}       exp
	 */
	vbind.parseClassObject = function(node, obj, deps, exp) {
		var cache = {}, jsonDeps = [], jsonAccess = [];

		util.each(obj, function(isAdd, cls) {
			var model = exp;
			var access = deps.acc[deps.dep.indexOf(model)];
			var valAccess = access ? (access + '*' + cls) : (model + '*' + cls);

			jsonDeps.push(model);
			jsonAccess.push(valAccess);
			cache[valAccess] = cls;

			this.updateClass(node, isAdd, false, cls);
		}, this);

		// 监测依赖变化
		this.watchClassObject(node, {
			'dep': jsonDeps,
			'acc': jsonAccess
		}, cache);
	}

	/**
	 * 监测 classObject 或 classJson 的依赖
	 * @param   {DOMElement}   node
	 * @param   {Object}       deps
	 * @param   {Object}       cache
	 */
	vbind.watchClassObject = function(node, deps, cache) {
		this.vm.watcher.watch(deps, function(path, last, old) {
			this.updateClass(node, last, old, cache[path]);
		}, this);
	}

	/**
	 * 刷新节点 classname
	 */
	vbind.updateClass = function() {
		var updater = this.vm.updater;
		updater.updateClassName.apply(updater, arguments);
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

		var map, cache = {};
		var scope, getter, styles

		// styleObject
		if (!isJson) {
			scope = this.getScope(fors, exp);
			getter = this.getEval(fors, exp);
			styles = getter.call(scope, scope);

			this.parseStyleObject(node, styles, deps);

			// 监测整个 styleObject 被替换
			watcher.watch(deps, function(path, newObject, oldObject) {
				// 移除旧的 style
				util.each(oldObject, function(property, style) {
					this.updateStyle(node, style, null);
				}, this);

				// 重新绑定
				this.parseStyleObject(node, newObject, deps);
			}, this);
		}
		// styleJson
		else {
			// style 与取值字段的映射
			map = util.convertJson(exp);

			util.each(map, function(field, style) {
				var model = field, property;
				var access = deps.acc[deps.dep.indexOf(model)];

				scope = this.getScope(fors, model);
				getter = this.getEval(fors, model);
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
	 * 绑定 styleObject
	 * @param   {DOMElement}  node
	 * @param   {Object}      styles
	 * @param   {Object}      deps
	 */
	vbind.parseStyleObject = function(node, styles, deps) {
		var cache = {}, jsonDeps = [], jsonAccess = [];

		util.each(styles, function(property, style) {
			var model = deps.dep[0];
			var access = deps.acc[0] || model;
			var valAccess = access + '*' + style;

			jsonDeps.push(model);
			jsonAccess.push(valAccess);
			cache[valAccess] = style;

			this.updateStyle(node, style, property);
		}, this);

		// styleObject 依赖监测
		this.vm.watcher.watch({
			'dep': jsonDeps,
			'acc': jsonAccess
		}, function(path, last, old) {
			this.updateStyle(node, cache[path], last);
		}, this);
	}

	/**
	 * 刷新节点行内样式 inlineStyle
	 */
	vbind.updateStyle = function() {
		var updater = this.vm.updater;
		updater.updateStyle.apply(updater, arguments);
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
		var scope = this.getScope(fors, expression);
		var getter = this.getEval(fors, expression);
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
		updater.updateAttribute.apply(updater, arguments);
	}

	return Vbind;
});