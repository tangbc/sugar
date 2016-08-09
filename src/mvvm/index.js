import Compiler from './compiler';
import { each, copy, isFunc, isArray, isString, isObject } from '../util';

/**
 * MVVM 构造函数入口
 * @param  {Object}  option  [数据参数对象]
 */
function MVVM (option) {
	this.context = option.context || this;

	// 将事件函数 this 指向调用者
	each(option.model, function (value, key) {
		if (isFunc(value)) {
			option.model[key] = value.bind(this.context);
		}
	}, this);

	// 初始数据备份
	this.backup = copy(option.model);

	// ViewModel 实例
	this.vm = new Compiler(option);

	// 数据模型
	this.$data = this.vm.$data;
}

var mvp = MVVM.prototype;

/**
 * 获取指定数据模型
 * 如果获取的模型为对象或数组，将会保持引用关系
 * @param   {String}  key  [数据模型字段]
 * @return  {Mix}
 */
mvp.get = function (key) {
	return isString(key) ? this.$data[key] : this.$data;
}

/**
 * 获取指定数据模型的副本
 * 如果获取的模型为对象或数组，原数据将不会保持引用关系，只返回一个拷贝的副本
 * @param   {String}  key  [数据模型字段]
 * @return  {Mix}
 */
mvp.getItem = function (key) {
	return copy(this.get(key));
}

/**
 * 设置数据模型的值，key 为 json 时则批量设置
 * @param  {String}  key    [数据模型字段]
 * @param  {Mix}     value  [值]
 */
mvp.set = function (key, value) {
	var vm = this.$data;
	// 设置单个
	if (isString(key)) {
		vm[key] = value;
	}

	// 批量设置
	if (isObject(key)) {
		each(key, function (v, k) {
			vm[k] = v;
		});
	}
}

/**
 * 重置数据模型至初始状态
 * @param   {Array|String}  key  [数据模型字段，或字段数组，空则重置所有]
 */
mvp.reset = function (key) {
	var vm = this.$data;
	var backup = this.backup;

	// 重置单个
	if (isString(key)) {
		vm[key] = backup[key];
	}
	// 重置多个
	else if (isArray(key)) {
		each(key, function (v) {
			vm[v] = backup[v];
		});
	}
	// 重置所有
	else {
		each(vm, function (v, k) {
			vm[k] = backup[k];
		});
	}
}

/**
 * 对数据模型的字段添加监测
 * @param   {String}    model     [数据模型字段]
 * @param   {Function}  callback  [监测变化回调]
 * @param   {Boolean}   deep      [数组深层监测]
 */
mvp.watch = function (model, callback, deep) {
	this.vm.watcher.watchModel(model, function (path, last, old) {
		callback.call(this, path, last, old);
	}, this.context, null, deep);
}

/**
 * 销毁 mvvm 实例
 */
mvp.destroy = function () {
	this.vm.destroy();
	this.context = this.vm = this.backup = this.$data = null;
}

export default MVVM;
