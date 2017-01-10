import {
	each,
	extend,
	isFunc
} from '../util';

const regSuper = /\b\.Super\b/;
const _toString = Function.prototype.toString;

/**
 * 对子类方法挂载 Super
 * @param   {Function}  Super   [Super 函数]
 * @param   {Mix}       method  [子类属性或者方法]
 * @return  {Mix}
 */
function bindSuper (Super, method) {
	if (
		isFunc(method) &&
		regSuper.test(_toString.call(method))
	) {
		return function () {
			this.Super = Super;
			method.apply(this, arguments);
		}
	} else {
		return method;
	}
}

/*
 * Root 实现类式继承
 * @param   {Object}    proto  [生成类的属性或方法]
 * @return  {Function}  Class  [继承后的类]
 */
function Root () {}
Root.extend = function (proto) {
	let parent = this.prototype;

	/**
	 * 子类对父类方法的调用
	 * @param  {String}  method     [父类方法]
	 * @param  {Object}  oldConfig  [原配置参数]
	 * @param  {Object}  newConfig  [新配置参数]
	 */
	function Super (method, oldConfig, newConfig) {
		let func = parent[method];
		if (isFunc(func)) {
			func.call(this, extend(true, newConfig, oldConfig));
		}
	}

	/**
	 * 返回(继承后)的类
	 */
	function Class () {}
	let classProto = Class.prototype = Object.create(parent);

	each(proto, function (value, property) {
		classProto[property] = bindSuper(Super, value);
	});

	proto = null;
	Class.extend = this.extend;
	classProto.constructor = Class;

	return Class;
}

export default Root;
