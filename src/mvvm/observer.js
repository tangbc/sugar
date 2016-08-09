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

		if (inserts) {
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

function changeArrayProto (array) {
	array.__proto__ = arrayMethods;
}


/**
 * 数据监测模块
 */
function Observer (data) {
	this.dep = new Depend();

	if (isArray(data)) {
		this.observeArray(data);
	} else {
		this.observeObject(data);
	}

	defRec(data, '__ob__', this);
}

var op = Observer.prototype;

/**
 * 监测对象
 * @param   {Object}  object
 */
op.observeObject = function (object) {
	each(object, function (value, key) {
		observe(object, key, value);
	}, this);
}

/**
 * 监测数组
 * @param   {Array}  array
 */
op.observeArray = function (array) {
	changeArrayProto(array);
	each(array, function (item) {
		createObserver(item);
	});
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
 * @return  {Object}
 */
export function createObserver (target) {
	if (isObject(target) || isArray(target)) {
		return hasOwn(target, '__ob__') ? target.__ob__ : new Observer(target);
	}
}

/**
 * 监测 object[key] 的变化
 * @param   {Object}  object
 * @param   {String}  key
 * @param   {Mix}     value
 */
export function observe (object, key, value) {
	var dep = new Depend();
	var desc = getDescriptor(object, key);
	var getter = desc && desc.get;
	var setter = desc && desc.set;

	var childOb = createObserver(value);

	Object.defineProperty(object, key, {
		get: function Getter () {
			var val = getter ? getter.call(object) : value;

			if (Depend.watcher) {
				dep.depend();
				if (childOb) {
					childOb.dep.depend();
				}
			}

			if (isArray(val)) {
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

			childOb = createObserver(newValue);
			dep.notify();
		}
	});
}
