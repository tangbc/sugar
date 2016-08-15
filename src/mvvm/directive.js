import Watcher from './watcher';

/**
 * 指令通用构造函数
 * 提供生成数据订阅和变化更新功能
 * @param  {Object}   parser  [解析实例]
 */
export default function Directive (parser) {
	this.parser = parser;
	this.$scope = parser.$scope;
}

var dp = Directive.prototype;

/**
 * 安装/解析指令
 */
dp.install = function () {
	var parser = this.parser;

	// 生成数据订阅实例
	var watcher = this.watcher = new Watcher(parser.vm, parser.desc, this.update, this);
	// 更新初始视图
	this.update(watcher.value);
}

/**
 * 更新指令视图
 * @param   {Mix}     newValue  [新值]
 * @param   {Mix}     oldVlaue  [旧值]
 * @param   {Object}  arg       [数组操作参数信息]
 */
dp.update = function (newValue, oldVlaue, arg) {
	var parser = this.parser;
	parser.update.call(parser, newValue, oldVlaue, arg);
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