import Watcher from './watcher';

/**
 * 指令通用构造函数
 * 提供生成数据订阅和变化更新功能
 * @param  {Object}   parser  [解析模块实例]
 */
export default function Directive (parser) {
	this.parser = parser;
	this.$scope = parser.$scope;
}

var dp = Directive.prototype;

/**
 * 安装/解析指令，订阅数据、更新视图
 */
dp.install = function () {
	var parser = this.parser;
	// 生成数据订阅实例
	var watcher = this.watcher = new Watcher(parser.vm, parser.desc, this.update, this);
	// 更新初始视图
	this.update(watcher.value);
}

/**
 * 销毁/卸载指令
 */
dp.uninstall = function () {
	this.watcher.destory();
	this.parser = this.$scope = null;
}

/**
 * 更新指令视图
 * @param   {Mix}     newValue  [依赖数据新值]
 * @param   {Mix}     oldVlaue  [依赖数据旧值]
 * @param   {Object}  args      [数组操作参数信息]
 */
dp.update = function (newValue, oldVlaue, args) {
	var parser = this.parser;
	parser.update.call(parser, newValue, oldVlaue, args);
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