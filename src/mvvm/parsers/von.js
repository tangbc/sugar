define([
	'../parser',
	'../../util'
], function(Parser, util) {

	function Von(vm) {
		this.vm = vm;
		Parser.call(this);
	}
	var von = Von.prototype = Object.create(Parser.prototype);

	/**
	 * 解析 v-on 指令
	 * @param   {Object}      fors        [vfor 数据]
	 * @param   {DOMElement}  node        [指令节点]
	 * @param   {String}      expression  [指令表达式]
	 * @param   {String}      directive   [指令名称]
	 */
	von.parse = function(fors, node, expression, directive) {
		var deps = this.getDeps(fors, expression);
		var dir = util.removeSpace(directive);

		// 单个事件 v-on:click
		if (dir.indexOf(':') !== -1) {
			this.parseSingle(node, expression, dir, fors, deps);
		}
		// 多个事件 v-on="{click: xxx, mouseenter: yyy, mouseleave: zzz}"
		else {
			this.parseMulti(node, expression, fors, deps);
		}
	}

	/**
	 * 解析单个 v-on:type
	 * @param   {DOMElement}  node
	 * @param   {String}      expression
	 * @param   {String}      directive
	 * @param   {Object}      fors
	 * @param   {Array}       deps
	 */
	von.parseSingle = function(node, expression, directive, fors, deps) {
		var vm = this.vm;
		// 取值域
		var scope = this.getScope(fors, expression);
		// 事件类型
		var type = util.getKeyValue(directive);
		// 事件信息
		var info = util.stringToParams(expression);
		// 事件取值字段名称
		var field = info[0];
		// 事件参数
		var params = this.evalParams(fors, info[1]);

		this.bindEvent(node, fors, scope, type, field, params, deps);

		// 监测依赖变化，绑定新回调，旧回调将被移除
		vm.watcher.watch(deps, function(path, last, old) {
			this.update(node, type, last, old, params, path);
		}, this);
	}

	/**
	 * 解析多个 v-on=eventJson
	 * @param   {DOMElement}  node
	 * @param   {String}      expression
	 * @param   {Object}      fors
	 * @param   {Array}       deps
	 */
	von.parseMulti = function(node, expression, fors, deps) {
		var vm = this.vm;
		var cache = {}, jsonDeps = [], jsonAccess = [];
		var events = util.convertJson(expression);

		util.each(events, function(fn, ev) {
			// 事件信息
			var info = util.stringToParams(fn);
			// 事件取值字段名称
			var field = info[0] || fn;
			// 事件参数
			var params = this.evalParams(fors, info[1]);
			// 访问路径
			var access = deps.acc[deps.dep.indexOf(field)];
			// 取值域
			var scope = this.getScope(fors, field);

			jsonDeps.push(field);
			jsonAccess.push(access);
			cache[access] = {
				'type'  : ev,
				'params': params,
			}

			this.bindEvent(node, fors, scope, ev, field, params, deps);
		}, this);

		// 监测依赖变化，绑定新回调，旧回调将被移除
		vm.watcher.watch({
			'dep': jsonDeps,
			'acc': jsonAccess
		}, function(path, last, old) {
			var ev = cache[path];
			this.update(node, ev.type, last, old, ev.params, path);
		}, this);
	}

	/**
	 * 绑定一个事件
	 * @param   {DOMElement}  node
	 * @param   {Object}      fors
	 * @param   {Object}      scope
	 * @param   {String}      type
	 * @param   {String}      field
	 * @param   {Array}       params
	 * @param   {Array}       deps
	 */
	von.bindEvent = function(node, fors, scope, type, field, params, deps) {
		// 取值函数
		var getter = this.getEval(fors, field);
		// 事件函数
		var func = getter.call(scope, scope);
		// 访问路径，用于解绑
		var access = deps.acc[deps.dep.indexOf(field)] || field;

		this.update(node, type, func, null, params, access);
	}

	/**
	 * 对函数参数求值
	 * @param   {Object}  fors
	 * @param   {Object}  scope
	 * @param   {Array}   params
	 * @return  {Array}
	 */
	von.evalParams = function(fors, params) {
		var _params = [];

		util.each(params, function(param) {
			var p = param, exp, getter, scope;

			if (util.isString(p) && p !== '$event') {
				exp = this.replaceScope(p);

				if (exp.indexOf('scope.') !== -1) {
					scope = this.getScope(fors, p);
					getter = this.createGetter(exp);
					p = getter.call(scope, scope);
				}
			}

			_params.push(p);
		}, this);

		return _params;
	}

	/**
	 * 更新绑定事件
	 */
	von.update = function() {
		var updater = this.vm.updater;
		updater.updateEvent.apply(updater, arguments);
	}

	return Von;
});