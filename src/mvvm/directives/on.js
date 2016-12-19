import Watcher from '../watcher';
import Parser, { linkParser } from '../parser';
import { addEvent, removeEvent } from '../../dom';
import { removeSpace, each, def, extend, clearObject, warn, isFunc } from '../../util';

const regKeyCode = /^(\d)*$/;
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
	let args, func;
	let exp = removeSpace(funcString);
	let matches = exp.match(regSmallBrackets);
	let result = matches && matches[0];

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
	let json = {}, string = jsonString.trim();

	if (regBigBrackets.test(string)) {
		let leng = string.length;
		string = string.substr(1, leng - 2).replace(/\s/g, '');
		let props = string.match(regJsonFormat);

		each(props, function (prop) {
			let vals = prop.split(':');
			let name = vals[0], value = vals[1];
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
	let pos = arg.indexOf('.');

	let type, dress = '';
	if (pos > -1) {
		type = arg.substr(0, pos);
		dress = arg.substr(pos + 1,  arg.length);
	} else {
		type = arg;
	}

	let info = stringToParams(expression);
	let func = info.func, args = info.args;

	return { type, dress, func, args };
}

/**
 * 收集绑定的事件
 * @param   {Object}  desc
 * @return  {Array}
 */
function collectEvents (desc) {
	let binds = [];
	let args = desc.args;
	let expression = desc.expression;

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
 * 支持 6 种事件修饰符
 * .self .stop .prevent .capture .keyCode .one
 * @param  {String}  type
 * @param  {String}  dress
 */
function getDress (type, dress) {
	let dresses = dress.split('.');

	let self = dresses.indexOf('self') > -1;
	let stop = dresses.indexOf('stop') > -1;
	let one = dresses.indexOf('one') > -1;
	let prevent = dresses.indexOf('prevent') > -1;
	let capture = dresses.indexOf('capture') > -1;

	let keyCode;
	if (type.indexOf('key') === 0) {
		each(dresses, function (value) {
			if (regKeyCode.test(value)) {
				keyCode = +value;
				return false;
			}
		});
	}

	return { self, stop, prevent, capture, keyCode, one };
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
	this.cache = {};
	this.funcWatchers = [];
	this.argsWatchers = [];
	Parser.apply(this, arguments);
}

let von = linkParser(VOn);

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
		expression: expression
	});
}

/**
 * 解析事件处理函数
 * @param  {Object}  bind
 */
von.parseEvent = function (bind) {
	let func = bind.func;
	let args = bind.args;
	let type = bind.type;
	let dress = bind.dress;
	let capture = dress.indexOf('capture') > -1;

	if (func === '$remove') {
		return this.bindRemoveEvent(type, dress);
	}

	let desc = this.getExpDesc(func);
	let funcWatcher = new Watcher(this.vm, desc, function (newFunc, oldFunc) {
		this.off(type, oldFunc, capture);
		this.bindEvent(type, dress, newFunc, args);
	}, this);

	let listener = funcWatcher.value;

	if (!isFunc(listener)) {
		funcWatcher.destroy();
		return warn('Directive ['+ this.desc.attr +'] must be a type of Function');
	}

	this.bindEvent(type, dress, listener, args);

	if (desc.once) {
		funcWatcher.destroy();
	} else {
		this.funcWatchers.push(funcWatcher);
	}
}

/**
 * 隐性绑定删除($remove) vfor 选项事件
 * @param  {String}  type   [事件类型]
 * @param  {String}  dress  [事件修饰符]
 */
von.bindRemoveEvent = function (type, dress) {
	let scope = this.scope;

	if (!scope) {
		return warn('The specify event $remove must be used in v-for scope');
	}

	let alias = scope.__alias__;
	this.bindEvent(type, dress, function $remove () {
		scope.__viterator__.$remove(scope[alias]);
	}, '['+ alias +']');
}

/**
 * 添加一个事件绑定，同时处理参数的变更
 * @param  {String}    type       [事件类型]
 * @param  {String}    dress      [事件修饰符]
 * @param  {Function}  func       [回调函数]
 * @param  {String}    argString  [参数字符串]
 */
von.bindEvent = function (type, dress, func, argString) {
	let { self, stop, prevent, capture, keyCode, one } = getDress(type, dress);

	// 挂载 $event
	def((this.scope || this.vm.$data), '$event', '__e__');

	// 处理回调参数以及依赖监测
	let args = [];
	if (argString) {
		let desc = this.getExpDesc(argString);
		let argsWatcher = new Watcher(this.vm, desc, function (newArgs) {
			args = newArgs;
		}, this);

		args = argsWatcher.value;

		if (desc.once) {
			argsWatcher.destroy();
		} else {
			this.argsWatchers.push(argsWatcher);
		}
	}

	// 事件代理函数
	let el = this.el;
	let listenerAgent = function _listenerAgent (e) {
		if (
			(self && e.target !== el) || // 是否限定只能在当前节点触发事件
			(keyCode && keyCode !== e.keyCode) // 键盘事件时是否指定键码触发
		) {
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

	let listener;
	let guid = vonGuid++;

	// 回调函数是否只需触发一次
	let that = this;
	if (one) {
		listener = function _oneListener (e) {
			listenerAgent(e);
			that.off(type, listener, capture);
		}

		listener[identifier] = guid;
	} else {
		func[identifier] = guid;
		listener = listenerAgent;
	}

	// 缓存事件
	this.cache[guid] = listener;

	// 添加绑定
	this.on(type, listener, capture);
}

/**
 * 绑定一个事件
 * @param  {String}    type
 * @param  {Function}  callback
 * @param  {Boolean}   capture
 */
von.on = function (type, callback, capture) {
	addEvent(this.el, type, callback, capture);
}

/**
 * 解绑一个事件
 * @param  {String}    type
 * @param  {Function}  callback
 * @param  {Boolean}   capture
 */
von.off = function (type, callback, capture) {
	let cache = this.cache;
	let guid = callback[identifier];
	let listenerAgent = cache[guid];

	if (listenerAgent) {
		removeEvent(this.el, type, listenerAgent, capture);
		delete cache[guid];
	}
}

/**
 * von 指令特定的销毁函数
 */
von._destroy = function () {
	clearObject(this.cache);

	each(this.funcWatchers, function (watcher) {
		watcher.destroy();
	});

	each(this.argsWatchers, function (watcher) {
		watcher.destroy();
	});
}
