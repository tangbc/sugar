import Depend from './depend';
import { copy } from '../util';
import { createGetter, createSetter } from './expression';

/**
 * watcher 数据订阅模块
 */
export default function Watcher (vm, expression, callback, context) {
	this.vm = vm;
	this.callback = callback;
	this.context = context || this;

	var hasSet = context && context.$host.desc.duplex;

	// 缓存取值函数
	this.getter = createGetter(expression);
	// 缓存设值函数
	this.setter = hasSet ? createSetter(expression) : null;

	// 缓存表达式初始值以及提取依赖
	this.value = this.get();
	// 旧值缓存
	this.oldValue = null;
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
 * 获取表达式的取值 & 提取依赖
 */
wp.get = function () {
	var value;
	this.beforeGet();
	value = this.getValue();
	this.afterGet();
	return value;
}

/**
 * 依赖提取之前将当前 watcher 挂载到依赖对象
 */
wp.beforeGet = function () {
	Depend.watcher = this;
}

/**
 * 解除依赖挂载
 */
wp.afterGet = function () {
	Depend.watcher = null;
}

/**
 * 设置取值域的值
 * @param  {Mix}  value
 */
wp.set = function (value) {
	var scope = this.getScope();
	if (this.setter) {
		this.setter.call(scope, scope, value);
	}
}

/**
 * 将依赖订阅到该 watcher
 */
wp.addDepend = function (depend) {
	if (!this.depends) {
		this.depends = [];
	}

	if (this.depends.indexOf(depend) < 0) {
		depend.addWatcher(this);
		this.depends.push(depend);
	}
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