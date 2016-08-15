import Watcher from '../watcher';
import Parser, { linkParser } from '../parser';
import { addEvent, removeEvent } from '../../dom';
import { removeSpace, each, getKeyValue, defRec, isFunc, extend } from '../../util';

const regBigBrackets = /^\{.*\}$/;
const regSmallBrackets = /(\(.*\))/;
const regQuotes = /(^'*)|('*$)|(^"*)|("*$)/g;
const regJsonFormat = /[^,]+:[^:]+((?=,[^:]+:)|$)/g;

/**
 * 分解字符串函数参数
 * @param   {String}  funcString
 * @return  {Object}
 */
function stringToParams (funcString) {
	var args, func;
	var exp = removeSpace(funcString);
	var matches = exp.match(regSmallBrackets);
	var result = matches && matches[0];

	// 有函数名和参数
	if (result) {
		func = exp.substr(0, exp.indexOf(result));
		args = '[' + result.substr(1, result.length - 2) + ']';
	} else {
		func = exp;
	}

	return { func, args };
}

/**
 * 字符 json 转为键值对象
 * @param   {String}  jsonString
 * @return  {Object}
 */
function convertJson (jsonString) {
	var json, string = jsonString.trim();

	if (regBigBrackets.test(string)) {
		json = {};
		let leng = string.length;
		string = string.substr(1, leng - 2).replace(/\s/g, '');
		let props = string.match(regJsonFormat);

		each(props, function (prop) {
			var vals = getKeyValue(prop, true);
			var name = vals[0], value = vals[1];
			if (name && value) {
				name = name.replace(regQuotes, '');
				json[name] = value;
			}
		});
	}

	return json;
}

/**
 * 格式化事件信息
 * @param   {String}  arg
 * @param   {String}  expression
 * @return  {Array}
 */
function formatEvent (arg, expression) {
	var pos = arg.indexOf('.');

	var type, dress = '';
	if (pos > -1) {
		type = arg.substr(0, pos);
		dress = arg.substr(pos + 1,  arg.length);
	} else {
		type = arg;
	}

	var info = stringToParams(expression);
	var func = info.func, args = info.args;

	return { type, dress, func, args };
}

/**
 * 收集绑定的事件
 * @param   {Object}  desc
 * @return  {Array}
 */
function collectEvents (desc) {
	var binds = [];
	var args = desc.args;
	var expression = desc.expression;

	if (args) {
		binds.push(formatEvent(args, expression));
	} else {
		let json = convertJson(expression);
		each(json, function (value, key) {
			binds.push(formatEvent(key, value));
		});
	}

	return binds;
}

/**
 * 获取事件修饰符对象
 * 支持 4 种事件修饰符 .self .stop .prevent .capture
 * @param   {String}  type
 * @param   {String}  dress
 */
function getDress (type, dress) {
	var self = dress.indexOf('self') > -1;
	var stop = dress.indexOf('stop') > -1;
	var prevent = dress.indexOf('prevent') > -1;
	var capture = dress.indexOf('capture') > -1;
	var keyCode = type.indexOf('key') === 0 ? +dress : null;
	return { self, stop, prevent, capture, keyCode }
}


/**
 * v-on 指令解析模块
 */
export function VOn () {
	this.guid = 1000;
	this.proxys = {};
	this.actuals = {};
	Parser.apply(this, arguments);
}

var von = linkParser(VOn);

/**
 * 解析 v-on 指令
 */
von.parse = function () {
	each(collectEvents(this.desc), function (bind) {
		this.parseEvent(bind);
	}, this);
}

/**
 * 获取事件/参数的监测信息
 * @param   {String}  expression
 * @return  {Object}
 */
von.getExpDesc = function (expression) {
	return extend({}, this.desc, {
		'expression': expression
	});
}

/**
 * 解析事件处理函数
 * @param   {Object}  bind
 */
von.parseEvent = function (bind) {
	var args = bind.args;
	var type = bind.type;
	var dress = bind.dress;
	var capture = dress.indexOf('capture') > -1;
	var desc = this.getExpDesc(bind.func);

	var funcWatcher = new Watcher(this.vm, desc, function (newFunc, oldFunc) {
		this.off(type, oldFunc, capture);
		this.bindEvent(type, dress, newFunc, args);
	}, this);

	this.bindEvent(type, dress, funcWatcher.value, args);
}

/**
 * 添加一个事件绑定，同时处理参数的变更
 * @param   {String}    type       [事件类型]
 * @param   {String}    dress      [事件修饰符]
 * @param   {Function}  func       [回调函数]
 * @param   {String}    argString  [参数字符串]
 */
von.bindEvent = function (type, dress, func, argString) {
	var { self, stop, prevent, capture, keyCode } = getDress(type, dress);

	// 挂载 $event
	defRec((this.$scope || this.vm.$data), '$event', '__e__');

	// 处理回调参数以及依赖监测
	var args = [];
	if (argString) {
		let desc = this.getExpDesc(argString);
		let argsWatcher = new Watcher(this.vm, desc, function (newArgs) {
			args = newArgs;
		}, this);
		args = argsWatcher.value;
	}

	// 事件代理函数
	var el = this.el;
	var eventProxy = function _eventProxy (e) {
		// 是否限定只能在当前节点触发事件
		if (self && e.target !== el) {
			return;
		}

		// 是否指定按键触发
		if (keyCode && keyCode !== e.keyCode) {
			return;
		}

		// 未指定参数，则原生事件对象作为唯一参数
		if (!args.length) {
			args.push(e);
		} else {
			// 更新/替换事件对象
			each(args, function (param, index) {
				if (param === '__e__') {
					args[index] = e;
				}
			});
		}

		// 是否阻止默认事件
		if (prevent) {
			e.preventDefault();
		}

		// 是否阻止冒泡
		if (stop) {
			e.stopPropagation();
		}

		func.apply(this, args);
	}


	// 添加绑定
	this.on(type, eventProxy, capture);

	// 缓存事件
	this.stash(eventProxy, func);
}

/**
 * 缓存 vm 事件与代理事件的关系
 * @param   {Function}  proxy
 * @param   {Function}  actual
 */
von.stash = function (proxy, actual) {
	var guid = this.guid++;
	this.proxys[guid] = proxy;
	this.actuals[guid] = actual;
}

/**
 * 绑定一个事件
 */
von.on = function (type, callback, capture) {
	if (isFunc(callback)) {
		addEvent(this.el, type, callback, capture);
	}
}

/**
 * 解绑一个事件
 * @param   {String}    type
 * @param   {Function}  callback
 * @param   {Boolean}   capture
 */
von.off = function (type, callback, capture) {
	var guid;
	var proxys = this.proxys;
	var actuals = this.actuals;

	each(actuals, function (actual, id) {
		if (actual === callback) {
			guid = id;
			return false;
		}
	});

	if (guid) {
		removeEvent(this.el, type, proxys[guid], capture);
		delete proxys[guid];
		delete actuals[guid];
	}
}