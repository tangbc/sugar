import Watcher from '../watcher';
import Parser, { linkParser } from '../parser';
import { addEvent, removeEvent } from '../../dom';
import { removeSpace, each, getKeyValue, defRec, extend, clearObject, warn } from '../../util';

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
 * 字符串 json 转为键值对象
 * @param   {String}  jsonString
 * @return  {Object}
 */
function convertJson (jsonString) {
	var json = {}, string = jsonString.trim();

	if (regBigBrackets.test(string)) {
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
 * @return  {Object}
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
 * 事件 id 唯一计数
 * @type  {Number}
 */
let vonGuid = 2000;
let identifier = '__vonid__';


/**
 * v-on 指令解析模块
 * 不需要实例化 Directive
 */
export function VOn () {
	this.agents = {};
	this.funcWatchers = [];
	this.argsWatchers = [];
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
	var func = bind.func;
	var args = bind.args;
	var type = bind.type;
	var dress = bind.dress;
	var capture = dress.indexOf('capture') > -1;

	if (func === '$remove') {
		return this.removeItem(type, dress);
	}

	var desc = this.getExpDesc(func);
	var funcWatcher = new Watcher(this.vm, desc, function (newFunc, oldFunc) {
		this.off(type, oldFunc, capture);
		this.bindEvent(type, dress, newFunc, args);
	}, this);

	this.bindEvent(type, dress, funcWatcher.value, args);

	// 缓存数据订阅对象
	this.funcWatchers.push(funcWatcher);
}

/**
 * 隐性绑定删除($remove) vfor 选项事件
 * @param   {String}  type   [事件类型]
 * @param   {String}  dress  [事件修饰符]
 */
von.removeItem = function (type, dress) {
	var scope = this.$scope;

	if (!scope) {
		return warn('The specify event $remove must be used in v-for scope');
	}

	var alias = scope.__alias__;
	this.bindEvent(type, dress, function $remove () {
		scope.__viterator__.$remove(scope[alias]);
	}, '['+ alias +']');
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
		this.argsWatchers.push(argsWatcher);
	}

	// 事件代理函数
	var el = this.el;
	var eventAgent = function _eventAgent (e) {
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
				if (param === '__e__' || param instanceof Event) {
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

	var guid = vonGuid++;
	func[identifier] = guid;
	this.agents[guid] = eventAgent;

	// 添加绑定
	this.on(type, eventAgent, capture);
}

/**
 * 绑定一个事件
 * @param   {String}    type
 * @param   {Function}  callback
 * @param   {Boolean}   capture
 */
von.on = function (type, callback, capture) {
	addEvent(this.el, type, callback, capture);
}

/**
 * 解绑一个事件
 * @param   {String}    type
 * @param   {Function}  callback
 * @param   {Boolean}   capture
 */
von.off = function (type, callback, capture) {
	var agents = this.agents;
	var guid = callback[identifier];
	var eventAgent = agents[guid];

	if (eventAgent) {
		removeEvent(this.el, type, eventAgent, capture);
		delete agents[guid];
	}
}

/**
 * von 指令特定的销毁函数
 */
von._destroy = function () {
	clearObject(this.agents);

	each(this.funcWatchers, function (watcher) {
		watcher.destory();
	});

	each(this.argsWatchers, function (watcher) {
		watcher.destory();
	});
}
