import ajax from './ajax';
import core from './core';
import util from '../util';
import Component from './component';

/**
 * Sugar
 * @type  {Object}
 */
let Sugar = Object.create(null);

/**
 * 添加属性扩展方法
 * @type  {Function}
 */
Sugar.extend = function () {
	util.extend.apply(this, arguments);
}

Sugar.extend({ ajax, core, util, Component });

export default Sugar;
