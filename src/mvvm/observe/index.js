import Depend from '../depend';
import Watcher from '../watcher';
import { changeArrayProto } from './array';
import { defRec, isArray, each, isObject, hasOwn, isFunc, warn, noop } from '../../util';

/**
 * 监测对象
 * @param   {Object}  object
 */
function observeObject (object) {
	each(object, function (value, key) {
		observe(object, key, value);
	});
}

/**
 * 监测数组
 * @param   {Array}   array
 * @param   {String}  key
 */
export function observeArray (array, key) {
	changeArrayProto(array);
	each(array, function (item) {
		createObserver(item, key);
	});
}

/**
 * 数据监测模块
 * @param  {Object}  data  [监测对象/数组]
 * @param  {String}  key   [监测字段名称]
 */
function Observer (data, key) {
	this.dep = new Depend(key);

	if (isArray(data)) {
		observeArray(data, key);
	} else {
		observeObject(data);
	}

	defRec(data, '__ob__', this);
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
 * 监测 object[key] 的变化 & 依赖收集
 * @param   {Object}  object
 * @param   {String}  key
 * @param   {Mix}     value
 */
export function observe (object, key, value) {
	var dep = new Depend(key);
	var descriptor = Object.getOwnPropertyDescriptor(object, key);
	var getter = descriptor && descriptor.get;
	var setter = descriptor && descriptor.set;

	var childOb = createObserver(value, key);

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

			childOb = createObserver(newValue, key);
			dep.notify();
		}
	});
}


/**
 * 生成计算属性取值函数
 * @param   {Object}    vm
 * @param   {Function}  getter
 * @return  {Function}
 */
function createComputedGetter (vm, getter) {
	var watcher = new Watcher(vm, {
		'expression': getter.bind(vm)
	});

	return function computedGetter () {
		if (Depend.watcher) {
			each(watcher.depends, function (dep) {
				dep.depend();
			});
		}
		return watcher.value;
	}
}

/**
 * 设置 vm 的计算属性
 * @param  {Object}  vm
 * @param  {Object}  computed
 */
export function setComputedProperty (vm, computed) {
	each(computed, function (getter, property) {
		if (!isFunc(getter)) {
			return warn('computed property ['+ property +'] must be a getter function!');
		}

		Object.defineProperty(vm, property, {
			set: noop,
			get: createComputedGetter(vm, getter)
		});
	});
}