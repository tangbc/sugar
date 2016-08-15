import Depend from './depend';
import { copy, each, extend } from '../util';
import { createGetter, createSetter } from './expression';

/**
 * 遍历对象/数组每一个可枚举属性
 * @param   {Object|Array}  target  [遍历值]
 * @param   {Boolean}       root    [是否是根对象/数组]
 */
var walkeds = [];
function walkThrough (target, root) {
	var ob = target.__ob__;
	var guid = ob && ob.dep.guid;

	if (guid) {
		if (walkeds.indexOf(guid) > -1) {
			return;
		} else {
			walkeds.push(guid);
		}
	}

	each(target, function (value) {
		walkThrough(value, false);
	});

	if (root) {
		walkeds.length = 0;
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
	// 依赖实例缓存
	this.depends = [];
	this.newDepends = [];

	var expression = desc.expression;
	// 缓存取值函数
	this.getter = createGetter(expression);
	// 缓存设值函数
	this.setter = desc.duplex ? createSetter(expression) : null;

	// 缓存表达式旧值
	this.oldValue = null;
	// 表达式初始值 & 提取依赖
	this.value = this.get();
}

var wp = Watcher.prototype;

/**
 * 获取取值域
 * @return  {Object}
 */
wp.getScope = function () {
	return this.context.$scope || this.vm.$data;
}

/**
 * 获取表达式的取值
 */
wp.getValue = function () {
	var scope = this.getScope();
	return this.getter.call(scope, scope);
}

/**
 * 设置订阅数据的值
 * @param  {Mix}  value
 */
wp.setValue = function (value) {
	var scope = this.getScope();
	if (this.setter) {
		this.setter.call(scope, scope, value);
	}
}

/**
 * 获取表达式的取值 & 提取依赖
 */
wp.get = function () {
	var value;
	this.beforeGet();

	value = this.getValue();

	// 深层依赖获取
	if (this.deep) {
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
	var guid = depend.guid;
	var newIds = this.newDepIds;

	if (newIds.indexOf(guid) < 0) {
		newIds.push(guid);
		this.newDepends.push(depend);
		if (this.depIds.indexOf(guid) < 0) {
			depend.addWatcher(this);
		}
	}
}

/**
 * 更新/解除依赖挂载
 */
wp.afterGet = function () {
	Depend.watcher = null;

	// 清除无用的依赖
	each(this.depends, function (depend) {
		if (this.newDepIds.indexOf(depend.guid) < 0) {
			depend.removeWatcher(this);
		}
	}, this);

	// 重设依赖缓存
	this.depIds = copy(this.newDepIds);
	this.newDepIds.length = 0;

	this.depends = copy(this.newDepends);
	this.newDepends.length = 0;
}

/**
 * 更新前调用方法
 */
wp.beforeUpdate = function () {
	this.oldValue = copy(this.value);
}

/**
 * 依赖变化，更新取值
 * @param   {Object}  arg  [数组操作参数信息]
 */
wp.update = function (arg) {
	var oldValue = this.oldValue;
	var newValue = this.value = this.get();

	if (oldValue !== newValue) {
		this.callback.call(this.context, newValue, oldValue, arg);
	}
}

/**
 * 销毁函数
 */
wp.destory = function () {
	this.value = null;
	this.getter = this.setter = null;
	this.vm = this.callback = this.context = null;
}