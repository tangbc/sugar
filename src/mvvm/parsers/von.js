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
		var vm = this.vm;
		var watcher = this.vm.watcher;
		var jsonDeps = [], jsonAccess = [];

		var deps = this.getDependents(fors, expression);
		var scope = this.getScope(vm, fors, expression);

		var evt = util.removeSpace(directive);
		var events, cache = {}, type, info, name, params;

		// 单个事件 v-on:click
		if (evt.indexOf(':') !== -1) {
			// 事件类型
			type = util.getStringKeyValue(evt);
			// 事件信息
			info = util.stringToParameters(expression);
			// 事件名称
			name = info[0];
			// 事件参数
			params = this.evalParams(fors, info[1]);

			this.bindEvent(node, fors, scope, type, name, params);

			// 监测依赖变化，绑定新回调，旧回调将被移除
			watcher.watch(deps, function(path, last, old) {
				this.update(node, type, last, old, params, path);
			}, this);
		}
		// 多个事件 v-on="{click: xxx, mouseenter: yyy, mouseleave: zzz}"
		else {
			events = util.convertJsonString(expression);

			util.each(events, function(fn, ev) {
				var access;

				// 事件信息
				info = util.stringToParameters(fn);
				// 事件名称
				name = info[0] || fn;
				// 事件参数
				params = this.evalParams(fors, info[1]);
				// 访问路径
				access = deps[1][deps[0].indexOf(name)];

				jsonDeps.push(name);
				jsonAccess.push(access);
				cache[access] = {
					'type'  : ev,
					'params': params,
				}

				this.bindEvent(node, fors, scope, ev, name, params);
			}, this);

			// 监测依赖变化，绑定新回调，旧回调将被移除
			watcher.watch([jsonDeps, jsonAccess], function(path, last, old) {
				var ev = cache[path];
				this.update(node, ev.type, last, old, ev.params, path);
			}, this);
		}
	}

	/**
	 * 绑定一个事件
	 * @param   {DOMElement}  node
	 * @param   {Object}      fors
	 * @param   {Object}      scope
	 * @param   {String}      type
	 * @param   {String}      name
	 * @param   {Array}       params
	 */
	von.bindEvent = function(node, fors, scope, type, name, params) {
		// 取值函数
		var getter = this.getEvalFunc(fors, name);
		// 事件函数
		var func = getter.call(scope, scope);
		// 访问路径，用于解绑
		var access = fors && (fors.access + '*') + util.getExpKey(name) || name;

		this.update(node, type, func, null, params, access);
	}

	/**
	 * 对函数参数求值
	 * @param   {Object}  vm
	 * @param   {Object}  fors
	 * @param   {Object}  scope
	 * @param   {Array}   params
	 * @return  {Array}
	 */
	von.evalParams = function(fors, params) {
		var _params = [], vm = this.vm;

		util.each(params, function(param) {
			var p = param, exp, getter, scope;

			if (p !== '$event') {
				exp = this.replaceScope(fors, p);

				if (exp.indexOf('scope.') !== -1) {
					scope = this.getScope(vm, fors, p);
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
		updater.updateNodeEvent.apply(updater, arguments);
	}

	return Von;
});