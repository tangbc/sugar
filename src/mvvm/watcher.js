import Depend from './depend';
import { copy, each, extend, isFunc } from '../util';
import { createGetter, createSetter } from './expression/index';

/**
 * 遍历对象/数组每一个可枚举属性
 * @param  {Object|Array}  target  [遍历值/对象或数组]
 * @param  {Boolean}       root    [是否是根对象/数组]
 */
let walkedObs = [];
function walkThrough (target, root) {
	let ob = target && target.__ob__;
	let guid = ob && ob.dep.guid;

	if (guid) {
		if (walkedObs.indexOf(guid) > -1) {
			return;
		} else {
			walkedObs.push(guid);
		}
	}

	each(target, function (value) {
		walkThrough(value, false);
	});

	if (root) {
		walkedObs.length = 0;
	}
}

/**
 * 数据订阅模块
 * @param  {Object}    vm
 * @param  {Object}    desc
 * @param  {Function}  callback
 * @param  {Object}    context
 */
export default function Watcher (vm, desc, callback, context) {
	this.vm = vm;
	extend(this, desc);
	this.callback = callback;
	this.context = context || this;

	// 依赖 id 缓存
	this.depIds = [];
	this.newDepIds = [];
	this.shallowIds = [];
	// 依赖实例缓存
	this.depends = [];
	this.newDepends = [];

	let once = desc.once;
	let expression = desc.expression;
	let preSetFunc = isFunc(expression);

	// 缓存取值函数
	this.getter = preSetFunc ? expression : createGetter(expression);
	// 缓存设值函数（双向数据绑定）
	this.setter = !once && desc.duplex ? createSetter(expression) : null;

	// 缓存表达式旧值
	this.oldVal = null;
	// 表达式初始值 & 提取依赖
	this.value = once ? this.getValue() : this.get();
}

let wp = Watcher.prototype;

/**
 * 获取取值域
 * @return  {Object}
 */
wp.getScope = function () {
	return this.context.scope || this.vm.$data;
}

/**
 * 获取表达式的取值
 */
wp.getValue = function () {
	let scope = this.getScope();
	return this.getter.call(scope, scope);
}

/**
 * 设置订阅数据的值
 * @param  {Mix}  value
 */
wp.setValue = function (value) {
	let scope = this.getScope();
	if (this.setter) {
		this.setter.call(scope, scope, value);
	}
}

/**
 * 获取表达式的取值 & 提取依赖
 */
wp.get = function () {
	this.beforeGet();

	let value = this.getValue();

	// 深层依赖获取
	if (this.deep) {
		// 先缓存浅依赖的 ids
		this.shallowIds = copy(this.newDepIds);
		walkThrough(value, true);
	}

	this.afterGet();

	return value;
}

/**
 * 设置当前依赖对象
 */
wp.beforeGet = function () {
	Depend.watcher = this;
}

/**
 * 将依赖订阅到该 watcher
 */
wp.addDepend = function (depend) {
	let guid = depend.guid;
	let newIds = this.newDepIds;

	if (newIds.indexOf(guid) < 0) {
		newIds.push(guid);
		this.newDepends.push(depend);
		if (this.depIds.indexOf(guid) < 0) {
			depend.addWatcher(this);
		}
	}
}

/**
 * 移除订阅的依赖监测
 * @param  {Function}  filter
 */
wp.removeDepends = function (filter) {
	each(this.depends, function (depend) {
		if (filter) {
			if (filter.call(this, depend)) {
				depend.removeWatcher(this);
			}
		} else {
			depend.removeWatcher(this);
		}
	}, this);
}

/**
 * 更新/解除依赖挂载
 */
wp.afterGet = function () {
	Depend.watcher = null;

	// 清除无用的依赖
	this.removeDepends(function (depend) {
		return this.newDepIds.indexOf(depend.guid) < 0;
	});

	// 重设依赖缓存
	this.depIds = copy(this.newDepIds);
	this.newDepIds.length = 0;

	this.depends = copy(this.newDepends);
	this.newDepends.length = 0;
}

/**
 * 更新前调用方法
 * 用于旧值的缓存处理，对象或数组只存副本
 */
wp.beforeUpdate = function () {
	this.oldVal = copy(this.value);
}

/**
 * 依赖变化，更新取值
 * @param  {Object}  args    [数组操作参数信息]
 * @param  {Object}  depend  [变更依赖对象 id]
 */
wp.update = function (args, depend) {
	let oldVal = this.oldVal;
	let unifyCb = this.vm.$unifyCb;
	let newVal = this.value = this.get();

	// 多维数组的情况下判断数组操作是否为源数组所发出的
	let source = args && args.source;
	if (source && source !== newVal && this.directive === 'v-for') {
		return;
	}

	let callback = this.callback;
	if (callback && (oldVal !== newVal)) {
		callback.call(this.context, newVal, oldVal, (this.deep && this.shallowIds.indexOf(depend.guid) < 0), args);
		if (source) {
			args.source = null;
		}
	}

	// 通知统一监听回调
	if (unifyCb) {
		unifyCb({ action: args, path: depend.path }, newVal, oldVal);
	}
}

/**
 * 销毁函数
 */
wp.destroy = function () {
	this.value = null;
	this.removeDepends();
	this.getter = this.setter = null;
	this.vm = this.callback = this.context = null;
}
