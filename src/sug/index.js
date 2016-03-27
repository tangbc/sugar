define([
	'./ajax',
	'./core',
	'./module',
	'./container'
], function(ajax, core, Module, Container) {

	function Sugar() {
		/**
		 * Ajax
		 * @type  {Object}
		 */
		this.ajax = ajax;

		/**
		 * 系统核心模块实例
		 * @type  {Object}
		 */
		this.core = core;

		/**
		 * 基础模块类
		 * @type  {Class}
		 */
		this.Module = Module;

		/**
		 * 视图基础模块类
		 * @type  {Class}
		 */
		this.Container = Container;
	}

	return new Sugar();
});