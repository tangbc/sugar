import Watcher from './watcher';

/**
 * 指令通用构造函数
 * @param  {Object}   host   [指令实例]
 * @param  {Element}  node   [应用节点]
 * @param  {Object}   desc   [指令信息]
 * @param  {Object}   scope  [vfor 取值域]
 */
export default function Directive (host, node, desc, scope) {
	this.el = node;
	this.$host = host;
	this.desc = desc;
	this.vm = host.vm;
	this.$scope = scope;
}

/**
 * 安装/解析指令
 */
Directive.prototype.install = function () {
	// 生成数据订阅实例
	this.watcher = new Watcher(this);

	// 更新初始视图
	this.update(this.watcher.value);
}

/**
 * 更新指令视图
 * @param   {Mix}     newValue  [新值]
 * @param   {Mix}     oldVlaue  [旧值]
 * @param   {Object}  arg       [数组操作参数信息]
 */
Directive.prototype.update = function (newValue, oldVlaue, arg) {
	var host = this.$host;
	host.update.call(host, newValue, oldVlaue, arg);
}