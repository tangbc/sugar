import util from '../../util';
import Parser from '../parser';

/**
 * v-bind for style 指令解析模块
 */
function VStyle(vm) {
	this.vm = vm;
	Parser.call(this);
}
var vstyle = VStyle.prototype = Object.create(Parser.prototype);

/**
 * 解析 v-bind-style
 * @param   {Object}      fors        [vfor 数据]
 * @param   {DOMElement}  node        [指令节点]
 * @param   {String}      expression  [指令表达式]
 */
vstyle.parse = function(fors, node, expression) {
	// 提取依赖
	var deps = this.getDeps(fors, expression);
	// 取值域
	var scope = this.getScope(fors, expression);
	// 取值函数
	var getter = this.getEval(fors, expression);
	// 别名映射
	var maps = fors && util.copy(fors.maps);
	// 取值对象
	var styleObject = getter.call(scope, scope);

	this.updateStyle(node, styleObject);

	// 监测依赖变化
	this.vm.watcher.watch(deps, function(path, last, old) {
		// 替换整个 styleObject
		if (util.isObject(old)) {
			// 移除旧样式(设为 null)
			util.each(old, function(v, style) {
				old[style] = null;
			});
			this.updateStyle(node, util.extend(last, old));
		}
		else {
			scope = this.updateScope(scope, maps, deps, arguments);
			this.updateStyle(node, getter.call(scope, scope));
		}
	}, this);
}

/**
 * 绑定 styleObject
 * @param   {DOMElement}  node
 * @param   {Object}      styleObject
 * @param   {Boolean}     remove        [是否全部移除]
 */
vstyle.updateStyle = function(node, styleObject, remove) {
	if (!util.isObject(styleObject)) {
		return util.warn('Bind for style must be a type of Object', styleObject);
	}

	util.each(styleObject, function(value, style) {
		this.update(node, style, (remove ? null : value));
	}, this);
}

/**
 * 更新节点 style
 * @param   {DOMElement}   node
 * @param   {String}       style
 * @param   {String}       value
 */
vstyle.update = function() {
	var updater = this.vm.updater;
	updater.updateStyle.apply(updater, arguments);
}

export default VStyle;
