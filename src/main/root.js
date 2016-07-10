import util from '../util';

/**
 * 对子类方法挂载 Super
 * @param   {Function}  Super   [Super 函数]
 * @param   {Mix}       method  [子类属性或者方法]
 * @return  {Mix}
 */
function bindSuper (Super, method) {
	if (util.isFunc(method) && /\b\.Super\b/.test(Function.prototype.toString.call(method))) {
		return function () {
			this.Super = Super;
			method.apply(this, arguments);
		}
	}
	else {
		return method;
	}
}

/*
 * Root 实现类式继承
 * @param  {Object}    proto  [生成类的新原型属性或方法]
 * @return {Function}  Class  [继承后的类]
 */
function Root () {}
Root.extend = function (proto) {
	var parent = this.prototype;

	/**
	 * 子类对父类的调用
	 * @param {String}  method  [调用的父类方法]
	 * @param {Array}   args    [调用参数]
	 */
	function Super (method, args) {
		var func = parent[method];
		if (util.isFunc(func)) {
			func.apply(this, args);
		}
	}

	/**
	 * 返回(继承后)的类
	 */
	function Class () {}
	var classProto = Class.prototype = Object.create(parent);

	util.each(proto, function (value, property) {
		classProto[property] = bindSuper(Super, value);
	});

	proto = null;
	Class.extend = this.extend;
	classProto.constructor = Class;

	return Class;
}

export default Root;
