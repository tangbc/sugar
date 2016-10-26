import Root from './root';
import cache from './cache';
import messager from './messager';
import { each, isFunc, isBool, isString, warn, hasOwn, clearObject } from '../util';

const childMap = 'map';
const childArray = 'array';

/**
 * Module 系统组件模块基础类，实现所有模块的通用方法
 */
let Module = Root.extend({
	/**
	 * __rd__ 记录模块信息
	 * @type {Object}
	 */
	__rd__: {},

	/**
	 * 创建一个子模块实例
	 * @param  {String}  name    [子模块名称，同一模块下创建的子模块名称不能重复]
	 * @param  {Class}   Class   [生成子模块实例的类]
	 * @param  {Object}  config  [<可选>子模块配置参数]
	 * @return {Object}          [返回创建的子模块实例]
	 */
	create: function (name, Class, config) {
		if (!isString(name)) {
			return warn('Module name ['+ name +'] must be a type of String');
		}
		if (!isFunc(Class)) {
			return warn('Module Class ['+ Class +'] must be a type of Component');
		}

		let record = this.__rd__;

		// 建立模块关系信息
		if (!hasOwn(record, childArray)) {
			// 子模块实例缓存数组
			record[childArray] = [];
			// 子模块命名索引
			record[childMap] = {};
		}

		// 判断是否已经创建过
		if (record[childMap][name]) {
			return warn('Module ['+ name +'] is already exists!');
		}

		// 生成子模块实例
		let instance = new Class(config);

		// 记录子模块实例信息和父模块实例的对应关系
		let subRecord = {
			// 子模块实例名称
			name: name,
			// 子模块实例id
			id: cache.id++,
			// 父模块实例 id，0 为顶级模块实例
			pid: record.id || 0
		}
		instance.__rd__ = subRecord;

		// 存入系统实例缓存队列
		cache[subRecord.id] = instance;
		cache.length++;

		// 缓存子模块实例
		record[childArray].push(instance);
		record[childMap][name] = instance;

		// 调用模块实例的 init 方法，传入配置参数和父模块
		if (isFunc(instance.init)) {
			instance.init(config, this);
		}

		return instance;
	},

	/**
	 * 获取当前模块的父模块实例（模块创建者）
	 */
	getParent: function () {
		let record = this.__rd__;
		let pid = record && record.pid;
		return cache[pid] || null;
	},

	/**
	 * 获取当前模块创建的指定名称的子模块实例
	 * @param  {String}  name  [子模块名称]
	 * @return {Object}
	 */
	getChild: function (name) {
		let record = this.__rd__;
		return record && record[childMap] && record[childMap][name] || null;
	},

	/**
	 * 返回当前模块的所有子模块实例
	 * @param  {Boolean}  returnArray  [返回的集合是否为数组形式，否则返回映射结构]
	 * @return {Mix}
	 */
	getChilds: function (returnArray) {
		let record = this.__rd__;
		returnArray = isBool(returnArray) && returnArray;
		return returnArray ? (record[childArray] || []) : (record[childMap] || {});
	},

	/**
	 * 移除当前模块实例下的指定子模块的记录
	 * @param  {String}   name  [子模块名称]
	 * @return {Boolean}
	 */
	_removeChild: function (name) {
		let record = this.__rd__;
		let cMap = record[childMap] || {};
		let cArray = record[childArray] || [];
		let child = cMap[name];

		for (let i = 0, len = cArray.length; i < len; i++) {
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
	destroy: function (notify) {
		let record = this.__rd__;
		let name = record.name;

		// 调用销毁前函数，可进行必要的数据保存
		if (isFunc(this.beforeDestroy)) {
			this.beforeDestroy();
		}

		// 递归调用子模块的销毁函数
		let childs = this.getChilds(true);
		each(childs, function (child) {
			if (isFunc(child.destroy)) {
				child.destroy(1);
			}
		});

		// 从父模块删除（递归调用时不需要）
		let parent = this.getParent();
		if (notify !== 1 && parent) {
			parent._removeChild(name);
		}

		// 从系统缓存队列中销毁相关记录
		let id = record.id;
		if (hasOwn(cache, id)) {
			delete cache[id];
			cache.length--;
		}

		// 调用销毁后函数，可进行销毁界面和事件
		if (isFunc(this._afterDestroy)) {
			this._afterDestroy();
		}

		// 向父模块通知销毁消息
		if (notify === true) {
			this.fire('subDestroyed', name);
		}

		// 移除所有属性
		clearObject(this);
	},

	/**
	 * 冒泡（由下往上）方式发送消息，由子模块发出，逐层父模块接收
	 * @param  {String}    name      [发送的消息名称]
	 * @param  {Mix}       param     [<可选>附加消息参数]
	 * @param  {Function}  callback  [<可选>发送完毕的回调函数，可在回调中指定回应数据]
	 */
	fire: function (name, param, callback) {
		// 不传 param
		if (isFunc(param)) {
			callback = param;
			param = null;
		}

		// callback 为属性值
		if (isString(callback)) {
			callback = this[callback];
		}

		messager.fire(this, name, param, callback, this);
	},

	/**
	 * 广播（由上往下）方式发送消息，由父模块发出，逐层子模块接收
	 */
	broadcast: function (name, param, callback) {
		// 不传 param
		if (isFunc(param)) {
			callback = param;
			param = null;
		}

		// callback 为属性值
		if (isString(callback)) {
			callback = this[callback];
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
	notify: function (receiver, name, param, callback) {
		// 不传 param
		if (isFunc(param)) {
			callback = param;
			param = null;
		}

		// callback 为属性值
		if (isString(callback)) {
			callback = this[callback];
		}

		messager.notify(this, receiver, name, param, callback, this);
	}
});

export default Module;
