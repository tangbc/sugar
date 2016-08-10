import Depend from './depend';
import { createGetter } from './expression';
import { isFunc, extend, each, copy } from '../util';

/**
 * watcher 数据订阅模块
 */
export default function Watcher (directive) {
	this.$host = directive;
	this.vm = directive.vm;
	this.$scope = directive.$scope;
	this.callback = directive.update;

	// 复制指令信息
	extend(this, directive.desc);
	// 缓存取值函数
	this.getter = createGetter(this.expression);
	// 缓存表达式初始值以及提取依赖
	this.value = this.get();
	// 旧值
	this.oldValue = null;
}

var wp = Watcher.prototype;

/**
 * 获取表达式的取值
 */
wp.getValue = function () {
	var scope = this.$scope || this.vm.$data;
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
	var newValue = this.getValue();

	this.value = newValue;
	this.callback.call(this.$host, newValue, oldValue, arg);
}