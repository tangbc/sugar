var Root = require('./root');
var cache = require('./cache');
var util = require('../util');
var messager = require('./messager');

/**
 * Module 系统组件模块基础类，实现所有模块的通用方法
 */
var Module = Root.extend({
	/**
	 * _ 记录模块信息
	 * @type {Object}
	 */
	_: {},

	/**
	 * 创建一个子模块实例
	 * @param  {String}  name    [子模块名称，同一模块下创建的子模块名称不能重复]
	 * @param  {Class}   Class   [生成子模块实例的类]
	 * @param  {Object}  config  [<可选>子模块配置参数]
	 * @return {Object}          [返回创建的子模块实例]
	 */
	create: function(name, Class, config) {
		if (!util.isString(name)) {
			util.warn('module\'s name must be a type of String: ', name);
			return;
		}
		if (!util.isFunc(Class)) {
			util.warn('module\'s Class must be a type of Function: ', Class);
			return;
		}
		if (config && !util.isObject(config)) {
			util.warn('module\'s config must be a type of Object: ', config);
			return;
		}

		var cls = this._;

		// 建立模块关系信息
		if (!util.hasOwn(cls, 'childArray')) {
			// 子模块实例缓存数组
			cls['childArray'] = [];
			// 子模块命名索引
			cls['childMap'] = {};
		}

		// 判断是否已经创建过
		if (cls['childMap'][name]) {
			util.warn('Module\'s name already exists: ', name);
			return;
		}

		// 生成子模块实例
		var instance = new Class(config);

		// 记录子模块实例信息和父模块实例的对应关系
		var info = {
			// 子模块实例名称
			'name': name,
			// 子模块实例id
			'id'  : cache.id++,
			// 父模块实例 id，0 为顶级模块实例
			'pid' : cls.id || 0
		}
		instance._ = info;

		// 存入系统实例缓存队列
		cache[info.id] = instance;
		cache.length++;

		// 缓存子模块实例
		cls['childArray'].push(instance);
		cls['childMap'][name] = instance;

		// 调用模块实例的 init 方法，传入配置参数和父模块
		if (util.isFunc(instance.init)) {
			instance.init(config, this);
		}

		return instance;
	},

	/**
	 * 获取当前模块的父模块实例（模块创建者）
	 */
	getParent: function() {
		var cls = this._;
		var pid = cls && cls.pid;
		return cache[pid] || null;
	},

	/**
	 * 获取当前模块创建的指定名称的子模块实例
	 * @param  {String}  name  [子模块名称]
	 * @return {Object}
	 */
	getChild: function(name) {
		var cls = this._;
		return cls && cls['childMap'] && cls['childMap'][name] || null;
	},

	/**
	 * 返回当前模块的所有子模块实例
	 * @param  {Boolean}  returnArray  [返回的集合是否为数组形式，否则返回映射结构]
	 * @return {Mix}
	 */
	getChilds: function(returnArray) {
		var cls = this._;
		returnArray = util.isBool(returnArray) && returnArray;
		return returnArray ? (cls['childArray'] || []) : (cls['childMap'] || {});
	},

	/**
	 * 移除当前模块实例下的指定子模块的记录
	 * @param  {String}   name  [子模块名称]
	 * @return {Boolean}
	 */
	_removeChild: function(name) {
		var cls = this._;
		var cMap = cls['childMap'] || {};
		var cArray = cls['childArray'] || [];
		var child = cMap[name];

		if (!child) {
			return;
		}

		for (var i = 0, len = cArray.length; i < len; i++) {
			if (cArray[i].id === child.id) {
				delete cMap[name];
				cArray.splice(i, 1);
				break;
			}
		}
	},

	/**
	 * 模块销毁函数，只删除缓存队列中的记录和所有子模块集合
	 * @param  {Mix}  notify  [是否向父模块发送销毁消息]
	 */
	destroy: function(notify) {
		var cls = this._;
		var name = cls.name;

		// 调用销毁前函数，可进行必要的数据保存
		if (util.isFunc(this.beforeDestroy)) {
			this.beforeDestroy();
		}

		// 递归调用子模块的销毁函数
		var childs = this.getChilds(true);
		util.each(childs, function(child) {
			if (util.isFunc(child.destroy)) {
				child.destroy(-1);
			}
		});

		// 从父模块删除（递归调用时不需要）
		var parent = this.getParent();
		if (notify !== -1 && parent) {
			parent._removeChild(name);
		}

		// 从系统缓存队列中销毁相关记录
		var id = cls.id;
		if (util.hasOwn(cache, id)) {
			delete cache[id];
			cache.length--;
		}

		// 调用销毁后函数，可进行销毁界面和事件
		if (util.isFunc(this.afterDestroy)) {
			this.afterDestroy();
		}

		// 向父模块通知销毁消息
		if (notify === true) {
			this.fire('subDestroyed', name);
		}
	},

	/**
	 * 当前模块作用域的定时器
	 * @param {Function}  callback  [定时器回调函数]
	 * @param {Number}    time      [<可选>回调等待时间（毫秒）不填为0]
	 * @param {Array}     param     [<可选>回调函数的参数]
	 */
	setTimeout: function(callback, time, param) {
		var self = this;
		time = util.isNumber(time) ? time : 0;

		// callback 为属性值
		if (util.isString(callback)) {
			callback = this[callback];
		}

		// 不合法的回调函数
		if (!util.isFunc(callback)) {
			util.warn('callback must be a type of Function: ', callback);
			return;
		}

		// 参数必须为数组或 arguments 对象
		if (param && !util.isFunc(param.callee) && !util.isArray(param)) {
			param = [param];
		}

		return setTimeout(function() {
			callback.apply(self, param);
			self = callback = time = param = null;
		}, time);
	},

	/**
	 * 冒泡（由下往上）方式发送消息，由子模块发出，逐层父模块接收
	 * @param  {String}    name      [发送的消息名称]
	 * @param  {Mix}       param     [<可选>附加消息参数]
	 * @param  {Function}  callback  [<可选>发送完毕的回调函数，可在回调中指定回应数据]
	 */
	fire: function(name, param, callback) {
		if (!util.isString(name)) {
			util.warn('message\'s name must be a type of String: ', name);
			return;
		}

		// 不传 param
		if (util.isFunc(param)) {
			callback = param;
			param = null;
		}

		// callback 为属性值
		if (util.isString(callback)) {
			callback = this[callback];
		}

		// 不传 callback
		if (!callback) {
			callback = null;
		}

		messager.fire(this, name, param, callback, this);
	},

	/**
	 * 广播（由上往下）方式发送消息，由父模块发出，逐层子模块接收
	 */
	broadcast: function(name, param, callback) {
		if (!util.isString(name)) {
			util.warn('message\'s name must be a type of String: ', name);
			return false;
		}

		// 不传 param
		if (util.isFunc(param)) {
			callback = param;
			param = null;
		}

		// callback 为属性值
		if (util.isString(callback)) {
			callback = this[callback];
		}

		// 不传 callback
		if (!callback) {
			callback = null;
		}

		messager.broadcast(this, name, param, callback, this);
	},

	/**
	 * 向指定模块实例发送消息
	 * @param   {String}    receiver  [消息接受模块实例的名称以.分隔，要求完整的层级]
	 * @param   {String}    name      [发送的消息名称]
	 * @param   {Mix}       param     [<可选>附加消息参数]
	 * @param   {Function}  callback  [<可选>发送完毕的回调函数，可在回调中指定回应数据]]
	 */
	notify: function(receiver, name, param, callback) {
		if (!util.isString(receiver)) {
			util.warn('receiver\'s name must be a type of String: ', name);
			return false;
		}

		if (!util.isString(name)) {
			util.warn('message\'s name must be a type of String: ', name);
			return false;
		}

		// 不传 param
		if (util.isFunc(param)) {
			callback = param;
			param = null;
		}

		// callback 为属性值
		if (util.isString(callback)) {
			callback = this[callback];
		}

		// 不传 callback
		if (!callback) {
			callback = null;
		}

		messager.notify(this, receiver, name, param, callback, this);
	}
});

module.exports = Module;
