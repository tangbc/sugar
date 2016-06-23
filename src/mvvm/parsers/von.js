var Parser = require('../parser');
var util = require('../../util');

/**
 * 分解字符串函数参数
 * @param   {String}  funcString
 * @return  {Object}
 */
function stringToParams(funcString) {
	var args, func;
	var exp = util.removeSpace(funcString);
	var matches = exp.match(/(\(.*\))/);
	var result = matches && matches[0];

	// 有函数名和参数
	if (result) {
		func = exp.substr(0, exp.indexOf(result));
		args = '[' + result.substr(1, result.length - 2) + ']';
	}
	// 只有函数名
	else {
		func = exp;
	}

	return {
		'func': func,
		'args': args
	}
}

/**
 * 字符 json 转为键值对象
 * @param   {String}  jsonString
 * @return  {Object}
 */
function convertJson(jsonString) {
	var json, props;
	var string = jsonString.trim(), i = string.length;

	if (/^\{.*\}$/.test(string)) {
		json = {};
		string = string.substr(1, i - 2).replace(/\s/g, '');
		props = string.match(/[^,]+:[^:]+((?=,[^:]+:)|$)/g);

		util.each(props, function(prop) {
			var vals = util.getKeyValue(prop, true);
			var name = vals[0], value = vals[1];
			if (name && value) {
				name = name.replace(/(^'*)|('*$)|(^"*)|("*$)/g, '');
				json[name] = value;
			}
		});
	}

	return json;
}


function Von(vm) {
	this.vm = vm;
	// 事件绑定回调集合
	this.$listeners = {};
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
	// 单个事件
	if (directive.indexOf(':') !== -1) {
		this.parseSingle.apply(this, arguments);
	}
	// 多个事件
	else {
		this.parseJson.apply(this, arguments);
	}
}

/**
 * 解析单个 v-on:type
 */
von.parseSingle = function(fors, node, expression, directive) {
	// 事件信息
	var info = stringToParams(expression);
	// 事件类型
	var type = util.getKeyValue(directive);
	// 事件取值字段名称
	var field = info.func;
	// 参数字符串
	var paramString = info.args;

	// 获取事件函数
	var deps = this.getDeps(fors, field);
	var scope = this.getScope(fors, field);
	var getter = this.getEval(fors, field);
	var func = getter.call(scope, scope);

	// 绑定事件 & 参数求值
	this.bindEvent(fors, node, field, type, func, paramString);

	// 监测依赖变化，绑定新回调，旧回调将被移除
	this.vm.watcher.watch(deps, function(path, lastCallback, oldCallback) {
		// 解除绑定
		this.update(node, type, this.$listeners[path], false, true);
		// 绑定新回调
		this.bindEvent(fors, node, path, type, lastCallback, paramString);
	}, this);
}

/**
 * 解析多个 v-on=eventJson
 */
von.parseJson = function(fors, node, expression) {
	util.each(convertJson(expression), function(exp, type) {
		this.parseSingle(fors, node, exp, type);
	}, this);
}

/**
 * 绑定一个事件
 * @param   {Object}      fors
 * @param   {DOMElement}  node
 * @param   {String}      field
 * @param   {String}      evt
 * @param   {Function}    func
 * @param   {String}      paramString
 */
von.bindEvent = function(fors, node, field, evt, func, paramString) {
	var listeners = this.$listeners;
	var identifier = fors && fors.access || field;
	var modals, self, stop, prevent, keyCode, capture = false;

	if (!util.isFunc(func)) {
		return;
	}

	// 支持 4 种事件修饰符 .self .stop .prevent .capture
	if (evt.indexOf('.') !== -1) {
		modals = evt.split('.');
		evt = modals.shift();
		self = modals && modals.indexOf('self') !== -1;
		stop = modals && modals.indexOf('stop') !== -1;
		prevent = modals && modals.indexOf('prevent') !== -1;
		capture = modals && modals.indexOf('capture') !== -1;
		keyCode = evt.indexOf('key') === 0 ? +modals[0] : null;
	}

	// 处理回调参数以及依赖监测
	var deps, maps, scope, getter, args = [];
	if (paramString) {
		// 取值依赖
		deps = this.getDeps(fors, paramString);
		// 别名映射
		maps = fors && util.copy(fors.maps);
		// 取值域
		scope = this.getScope(fors, paramString);
		// 添加别名标记
		util.defRec(scope, '$event', '$event');
		// 取值函数
		getter = this.getEval(fors, paramString);
		// 事件参数
		args = getter.call(scope, scope);

		this.vm.watcher.watch(deps, function() {
			scope = this.updateScope(scope, maps, deps, arguments);
			args = getter.call(scope, scope);
		}, this);
	}

	// 事件代理函数
	var eventProxy = function _eventProxy(e) {
		// 是否限定只能在当前节点触发事件
		if (self && e.target !== node) {
			return;
		}

		// 是否指定按键触发
		if (keyCode && keyCode !== e.keyCode) {
			return;
		}

		// 未指定参数，则原生事件对象作为唯一参数
		if (!args.length) {
			args.push(e);
		}
		else {
			// 更新/替换事件对象
			util.each(args, function(param, index) {
				if (param === '$event' || param instanceof Event) {
					args[index] = e;
				}
			});
		}

		// 是否阻止冒泡
		if (stop) {
			e.stopPropagation();
		}

		// 是否阻止默认事件
		if (prevent) {
			e.preventDefault();
		}

		func.apply(this, args);
	}

	listeners[identifier] = eventProxy;

	// 添加绑定
	this.update(node, evt, eventProxy, capture);
}

/**
 * 更新绑定事件
 * @param   {DOMElement}   node
 * @param   {String}       evt
 * @param   {Function}     callback
 * @param   {Boolean}      capture
 */
von.update = function() {
	var updater = this.vm.updater;
	updater.updateEvent.apply(updater, arguments);
}

module.exports = Von;
