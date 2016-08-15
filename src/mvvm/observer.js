import Depend from './depend';
import { defRec, isArray, each, isObject, hasOwn } from '../util';

// 重写的数组操作方法
const rewriteArrayMethods = [
	'pop',
	'push',
	'sort',
	'shift',
	'splice',
	'unshift',
	'reverse'
];

var arrayProto = Array.prototype;
var arrayMethods = Object.create(arrayProto);

/**
 * 重写 array 数组操作方法
 */
each(rewriteArrayMethods, function (method) {
	var original = arrayProto[method];

	defRec(arrayMethods, method, function () {
		var ob = this.__ob__;
		var result, inserts, args = [];

		for (let i = 0; i < arguments.length; i++) {
			args.push(arguments[i]);
		}

		ob.dep.beforeNotify();

		result = original.apply(this, args);

		switch (method) {
			case 'push':
			case 'unshift':
				inserts = args;
				break;
			case 'splice':
				inserts = args.slice(2);
				break;
		}

		if (inserts && inserts.length) {
			ob.observeArray(inserts);
		}

		ob.dep.notify({method, args});

		return result;
	});
});

/**
 * 添加 $set 方法，提供需要修改的数组项下标 index 和新值 value
 */
defRec(arrayMethods, '$set', function (index, value) {
	// 超出数组长度默认在最后添加（相当于 push）
	if (index >= this.length) {
		index = this.length;
	}

	return this.splice(index, 1, value)[0];
});

/**
 * 添加 $remove 方法
 */
defRec(arrayMethods, '$remove', function (item) {
	var index = this.indexOf(item);
	if (index > -1) {
		return this.splice(index, 1);
	}
});

/**
 * 修改 array 的原型
 * @param   {Array}  array
 */
function changeArrayProto (array) {
	array.__proto__ = arrayMethods;
}


/**
 * 数据监测模块
 */
function Observer (data, key) {
	this.dep = new Depend(key);

	if (isArray(data)) {
		this.observeArray(data, key);
	} else {
		this.observeObject(data);
	}

	defRec(data, '__ob__', this);
}


/**
 * 获取对象属性描述符
 * @param   {Object}  object
 * @param   {String}  key
 * @return  {Object}
 */
function getDescriptor (object, key) {
	return Object.getOwnPropertyDescriptor(object, key);
}

/**
 * 创建一个对象监测
 * @param   {Object|Array}  target
 * @param   {String}        key
 * @return  {Object}
 */
export function createObserver (target, key) {
	if (isObject(target) || isArray(target)) {
		return hasOwn(target, '__ob__') ? target.__ob__ : new Observer(target, key);
	}
}

/**
 * 监测 object[key] 的变化
 * @param   {Object}  object
 * @param   {String}  key
 * @param   {Mix}     value
 */
export function observe (object, key, value) {
	var dep = new Depend(key);
	var desc = getDescriptor(object, key);
	var getter = desc && desc.get;
	var setter = desc && desc.set;

	var childOb = createObserver(value, key);

	Object.defineProperty(object, key, {
		get: function Getter () {
			var watcher = Depend.watcher;
			var deep = watcher && watcher.deep;
			var val = getter ? getter.call(object) : value;

			if (watcher) {
				dep.depend();
				if (childOb) {
					childOb.dep.depend();
				}
			}

			// 数组或者对象的子项依赖
			if (isArray(val) || (deep && isObject(val))) {
				each(val, function (item) {
					var ob = item && item.__ob__;
					if (ob) {
						ob.dep.depend();
					}
				});
			}

			return val;
		},
		set: function Setter (newValue) {
			var oldValue = getter ? getter.call(object) : value;

			if (newValue === oldValue) {
				return;
			}

			dep.beforeNotify();

			if (setter) {
				setter.call(object, newValue);
			} else {
				value = newValue;
			}

			childOb = createObserver(newValue, key);
			dep.notify();
		}
	});
}


var op = Observer.prototype;

/**
 * 监测对象
 * @param   {Object}  object
 */
op.observeObject = function (object) {
	each(object, function (value, key) {
		observe(object, key, value);
	});
}

/**
 * 监测数组
 * @param   {Array}   array
 * @param   {String}  key
 */
op.observeArray = function (array, key) {
	changeArrayProto(array);
	each(array, function (item) {
		createObserver(item, key);
	});
}