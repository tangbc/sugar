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
 * @param  {Object}  extra  [扩展对象]
 */
Sugar.extend = function (extra) {
	util.extend.call(this, extra);
}

Sugar.extend({ ajax, core, util, Component });

export default Sugar;
