/**
 * sugar 构造函数入口
 */

import sync from './sync';
import ajax from './ajax';
import core from './core';
import util from '../util';
import Module from './module';
import Component from './component';

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
	 * 系统核心实例
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

export default new Sugar();
