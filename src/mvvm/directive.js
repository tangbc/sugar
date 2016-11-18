import Watcher from './watcher';

/**
 * 指令通用模块
 * 提供生成数据订阅和变化更新功能
 * @param  {Object}   parser  [指令解析模块实例]
 */
export default function Directive (parser) {
	this.parser = parser;
	this.scope = parser.scope;
}

let dp = Directive.prototype;

/**
 * 安装/解析指令，订阅数据、更新视图
 */
dp.mount = function () {
	let parser = this.parser;
	// 生成数据订阅实例
	let watcher = this.watcher = new Watcher(parser.vm, parser.desc, this.update, this);
	// 更新初始视图
	this.update(watcher.value);
}

/**
 * 销毁/卸载指令
 */
dp.destroy = function () {
	this.watcher.destroy();
	this.parser = this.scope = null;
}

/**
 * 更新指令视图
 * @param   {Mix}      newVal     [依赖数据新值]
 * @param   {Mix}      oldVal     [依赖数据旧值]
 * @param   {Boolean}  fromDeep   [数组内部更新]
 * @param   {Object}   methodArg  [数组操作参数信息]
 */
dp.update = function () {
	let parser = this.parser;
	parser.update.apply(parser, arguments);
}

/**
 * 获取依赖数据当前值
 * @return  {Mix}
 */
dp.get = function () {
	return this.watcher.value;
}

/**
 * 设置依赖数据的值（用于双向数据绑定）
 * @param  {Mix}  value
 */
dp.set = function (value) {
	this.watcher.setValue(value);
}
