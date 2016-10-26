import Depend from '../depend';
import Watcher from '../watcher';
import { setMutationProto } from './array';
import { def, isArray, each, isObject, hasOwn, isFunc, warn, noop } from '../../util';

/**
 * 监测对象
 * @param  {Object}  object
 */
function observeObject (object) {
	each(object, function (value, key) {
		observe(object, key, value);
	});
}

/**
 * 监测数组
 * @param  {Array}   array
 * @param  {String}  key
 */
export function observeArray (array, key) {
	setMutationProto(array);
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

	def(data, '__ob__', this);
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
 * @param  {Object}  object
 * @param  {String}  key
 * @param  {Mix}     value
 */
export function observe (object, key, value) {
	let dep = new Depend(key);
	let descriptor = Object.getOwnPropertyDescriptor(object, key);
	let getter = descriptor && descriptor.get;
	let setter = descriptor && descriptor.set;

	let childOb = createObserver(value, key);

	Object.defineProperty(object, key, {
		get: function Getter () {
			let val = getter ? getter.call(object) : value;

			if (Depend.watcher) {
				dep.depend();
				if (childOb) {
					childOb.dep.depend();
				}
			}

			if (isArray(val)) {
				each(val, function (item) {
					let ob = item && item.__ob__;
					if (ob) {
						ob.dep.depend();
					}
				});
			}

			return val;
		},
		set: function Setter (newValue) {
			let oldValue = getter ? getter.call(object) : value;

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
	let watcher = new Watcher(vm, {
		expression: getter.bind(vm)
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
