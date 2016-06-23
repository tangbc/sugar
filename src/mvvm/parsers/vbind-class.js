var Parser = require('../parser');
var util = require('../../util');

function VClass(vm) {
	this.vm = vm;
	Parser.call(this);
}
var vclass = VClass.prototype = Object.create(Parser.prototype);

/**
 * 解析 v-bind-class
 * @param   {Object}      fors        [vfor 数据]
 * @param   {DOMElement}  node        [指令节点]
 * @param   {String}      expression  [指令表达式]
 */
vclass.parse = function(fors, node, expression) {
	// 提取依赖
	var deps = this.getDeps(fors, expression);
	// 取值域
	var scope = this.getScope(fors, expression);
	// 取值函数
	var getter = this.getEval(fors, expression);
	// 别名映射
	var maps = fors && util.copy(fors.maps);

	var value = getter.call(scope, scope);

	this.updateClass(node, value);

	// 监测依赖
	this.vm.watcher.watch(deps, function(path, last, old) {
		scope = this.updateScope(scope, maps, deps, arguments);

		if (util.isArray(value)) {
			value = [old];
		}
		// 移除旧 class
		this.updateClass(node, value, true);

		// 更新当前值
		value = getter.call(scope, scope);

		// 添加新 class
		this.updateClass(node, value);
	}, this);
}

/**
 * 绑定 classname
 * @param   {DOMElement}           node
 * @param   {String|Array|Object}  classValue
 * @param   {Boolean}              remove
 */
vclass.updateClass = function(node, classValue, remove) {
	// single class
	if (util.isString(classValue)) {
		this.update(node, (remove ? null : classValue), (remove ? classValue : null));
	}
	// [classA, classB]
	else if (util.isArray(classValue)) {
		util.each(classValue, function(cls) {
			this.update(node, (remove ? null : cls), (remove ? cls : null));
		}, this);
	}
	// classObject
	else if (util.isObject(classValue)) {
		util.each(classValue, function(isAdd, cls) {
			this.update(node, (remove ? false : isAdd), false, cls);
		}, this);
	}
}

/**
 * 更新节点的 classname
 * @param   {DOMElement}          node
 * @param   {String|Boolean}      newcls
 * @param   {String|Boolean}      oldcls
 * @param   {String}              classname
 */
vclass.update = function() {
	var updater = this.vm.updater;
	updater.updateClassName.apply(updater, arguments);
}

module.exports = VClass;
