define([
	'./sync',
	'./ajax',
	'./core',
	'../util',
	'./module',
	'./component'
], function(sync, ajax, core, util, Module, Component) {

	function Sugar() {
		/**
		 * 异步状态锁
		 * @type  {Object}
		 */
		this.sync = sync;

		/**
		 * 工具方法
		 * @type  {Object}
		 */
		this.util = util;

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
		 * 视图组件基础模块
		 * @type  {Class}
		 */
		this.Component = Component;
	}

	return new Sugar();
});