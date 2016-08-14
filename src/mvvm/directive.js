import Watcher from './watcher';
import { extend } from '../util';

/**
 * 指令通用构造函数
 * 提供生成数据订阅和变化更新功能
 * @param  {Object}   host   [指令实例]
 * @param  {Object}   desc   [指令信息]
 * @param  {Object}   scope  [vfor 取值域]
 */
export default function Directive (host, desc, scope) {
	this.$host = host;
	this.vm = host.vm;
	extend(this, desc);
	this.$scope = scope;
}

var dp = Directive.prototype;

/**
 * 安装/解析指令
 */
dp.install = function () {
	// 生成数据订阅实例
	this.watcher = new Watcher(this.vm, this.expression, this.update, this);
	// 更新初始视图
	this.update(this.watcher.value);
}

/**
 * 更新指令视图
 * @param   {Mix}     newValue  [新值]
 * @param   {Mix}     oldVlaue  [旧值]
 * @param   {Object}  arg       [数组操作参数信息]
 */
dp.update = function (newValue, oldVlaue, arg) {
	var host = this.$host;
	host.update.call(host, newValue, oldVlaue, arg);
}

/**
 * 获取依赖数据值
 * @return  {Mix}
 */
dp.get = function () {
	return this.watcher.value;
}

/**
 * 设置依赖数据的值(用于双向数据绑定)
 * @param  {Mix}  value
 */
dp.set = function (value) {
	this.watcher.set(value);
}