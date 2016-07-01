/**
 * Core 核心模块，用于顶层组件模块的创建
 * ================================
 */

import util from '../util';
import cache from './cache';
import Module from './module';
import messager from './messager';

var Core = Module.extend({
	/**
	 * 获取顶级组件实例
	 * @param  {String}  name  [组件实例名称]
	 * @return {Object}
	 */
	get: function(name) {
		return this.getChild(name);
	},

	/**
	 * 全局广播消息，由 core 实例发出，系统全部实例接收
	 * @param  {String}   name   [发送的消息名称]
	 * @param  {Mix}      param  [<可选>附加消息参数]
	 * @return {Boolean}
	 */
	globalCast: function(name, param) {
		if (!util.isString(name)) {
			return util.warn('message\'s name must be a type of String: ', name);
		}

		messager.globalCast(name, param);
	}
});

var core = cache['0'] = new Core();

export default core;
