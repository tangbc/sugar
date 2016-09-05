import Watcher from './watcher';
import Compiler from './compiler';
import { each, copy, isFunc, isArray, isString, isObject, config } from '../util';

/**
 * MVVM 构造函数入口
 * @param  {Object}  option    [数据参数对象]
 * @param  {Element}   - view      [视图对象]
 * @param  {Object}    - model     [数据对象]
 * @param  {Object}    - methods   [<可选>事件声明函数对象]
 * @param  {Object}    - computed  [<可选>计算属性对象]
 * @param  {Object}    - customs   [<可选>自定义指令刷新函数对象]
 * @param  {Object}    - context   [<可选>回调上下文]
 */
export default function MVVM (option) {
	this.context = option.context || option.model;

	// 将事件函数 this 指向调用者
	each(option.model, function (value, key) {
		if (isFunc(value)) {
			option.model[key] = value.bind(this.context);
		}
	}, this);

	// 整合事件函数声明对象
	each(option.methods, function (callback, func) {
		option.model[func] = callback.bind(this.context);
	}, this);

	// 初始数据备份，用于 reset
	this.backup = copy(option.model);

	// ViewModel 实例
	this.vm = new Compiler(option);

	// 数据模型
	this.$data = this.vm.$data;
}

var mvp = MVVM.prototype;

/**
 * 获取指定数据模型值
 * 如果获取的模型为对象或数组
 * 返回数据与原数据保持引用关系
 * @param   {String}  key  [<可选>数据模型字段]
 * @return  {Mix}
 */
mvp.get = function (key) {
	var data = this.$data;
	return isString(key) ? config(data, key) : data;
}

/**
 * 获取指定数据模型值
 * 如果获取的模型为对象或数组
 * 返回数据与原数据将不会保持引用关系
 * @param   {String}  key  [<可选>数据模型字段]
 * @return  {Mix}
 */
mvp.getCopy = function (key) {
	return copy(this.get(key));
}

/**
 * 设置数据模型的值，key 为 json 时则批量设置
 * @param  {String}  key    [数据模型字段]
 * @param  {Mix}     value  [值]
 */
mvp.set = function (key, value) {
	var data = this.$data;

	// 设置单个
	if (isString(key)) {
		config(data, key, value);
	}
	// 批量设置
	else if (isObject(key)) {
		each(key, function (v, k) {
			config(data, k, v);
		});
	}
}

/**
 * 重置数据和视图为初始状态
 * @param   {Array|String}  key  [<可选>数据模型字段，或字段数组，空则重置所有]
 */
mvp.reset = function (key) {
	var data = this.$data;
	var backup = this.backup;

	// 重置单个
	if (isString(key)) {
		data[key] = backup[key];
	}
	// 重置多个
	else if (isArray(key)) {
		each(key, function (v) {
			data[v] = backup[v];
		});
	}
	// 重置所有
	else {
		each(data, function (v, k) {
			data[k] = backup[k];
		});
	}
}

/**
 * 监测表达式值的变化
 * @param   {String}    expression  [监测的表达式]
 * @param   {Function}  callback    [监测变化回调]
 * @param   {Boolean}   deep        [<可选>深层依赖监测]
 */
mvp.watch = function (expression, callback, deep) {
	return new Watcher(this, {
		'deep': deep,
		'expression': expression
	}, callback.bind(this.context));
}

/**
 * 销毁函数
 */
mvp.destroy = function () {
	this.vm.destroy();
	this.vm = this.context = this.backup = this.$data = null;
}
