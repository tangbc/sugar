/**
 * 简单的数据绑定视图层库
 */
var util = require('../util');
var Compiler = require('./compiler');

/**
 * MVVM 构造函数，封装 Complier
 * @param  {DOMElement}  element  [视图的挂载原生 DOM]
 * @param  {Object}      model    [数据模型对象]
 * @param  {Function}    context  [事件及 watch 的回调上下文]
 */
function MVVM(element, model, context) {
	var ctx = this.context = context || this;

	// 将事件函数 this 指向调用者
	util.each(model, function(value, key) {
		if (util.isFunc(value)) {
			model[key] = value.bind(ctx);
		}
	});

	// 初始数据备份
	this.backup = util.copy(model);

	// ViewModel 实例
	this.vm = new Compiler(element, model);

	// 数据模型
	this.$ = this.vm.$data;
}

var mvp = MVVM.prototype;

/**
 * 获取指定数据模型
 * @param   {String}  key  [数据模型字段]
 * @return  {Mix}
 */
mvp.get = function(key) {
	return util.isString(key) ? this.$[key] : this.$;
}

/**
 * 设置数据模型的值，key 为 json 时则批量设置
 * @param  {String}  key    [数据模型字段]
 * @param  {Mix}     value  [值]
 */
mvp.set = function(key, value) {
	var vm = this.$;
	// 设置单个
	if (util.isString(key)) {
		vm[key] = value;
	}

	// 批量设置
	if (util.isObject(key)) {
		util.each(key, function(v, k) {
			vm[k] = v;
		});
	}
}

/**
 * 重置数据模型至初始状态
 * @param   {Array|String}  key  [数据模型字段，或字段数组，空则重置所有]
 */
mvp.reset = function(key) {
	var vm = this.$;
	var backup = this.backup;

	// 重置单个
	if (util.isString(key)) {
		vm[key] = backup[key];
	}
	// 重置多个
	else if (util.isArray(key)) {
		util.each(key, function(v) {
			vm[v] = backup[v];
		});
	}
	// 重置所有
	else {
		util.each(vm, function(v, k) {
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
mvp.watch = function(model, callback, deep) {
	this.vm.watcher.watchModel(model, function(path, last, old) {
		callback.call(this, path, last, old);
	}, this.context, null, deep);
}

module.exports = MVVM;
