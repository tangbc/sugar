import { formatValue, isArray, warn } from '../../../util';

/**
 * 获取 select 的选中值
 * @param   {Select}   select
 * @param   {Boolean}  number
 * @return  {Array}
 */
function getSelecteds (select, number) {
	var sels = [];
	var options = select.options;

	for (let i = 0; i < options.length; i++) {
		let option = options[i];
		let value = option.value;
		if (option.selected) {
			sels.push(formatValue(value, number));
		}
	}

	return sels;
}

export default {
	/**
	 * 绑定 select 变化事件
	 */
	bind: function () {
		var multi = this.multi;
		var number = this.number;
		var directive = this.directive;

		this.on('change', function () {
			var sels = getSelecteds(this, number);
			directive.set(multi ? sels : sels[0]);
		});

		// 避免 selectedIndex 设为 -1 时再被重置回 0
		// 从而导致 select.value 重新强制选中第一项，
		// 在部分浏览器如 IE9, PhantomJS 等 selectedIndex 设为 -1 的情况下，
		// 假如当前 select 片段的父元素被移动到其他地方的时候，
		// selectedIndex 将会从 -1 又变回 0, 因为编译阶段都是在文档碎片上执行，
		// 所以必须在片段编译完成并添加到文档后再次强制更新初始值
		this.vm.after(this.forceUpdate, this);
	},

	/**
	 * 更新 select 值
	 * @param   {Array|String}  values
	 */
	update: function (values) {
		var el = this.el;
		var options = el.options;
		var multi = this.multi;
		var exp = this.desc.expression;

		// 初始选中项设为空（默认情况下会是第一项）
		// 在 v-model 中 select 的选中项总是以数据(values)为准
		el.selectedIndex = -1;

		if (multi && !isArray(values)) {
			return warn('<select> cannot be multiple when the model set ['+ exp +'] as not Array');
		}

		if (!multi && isArray(values)) {
			return warn('The model ['+ exp +'] cannot set as Array when <select> has no multiple propperty');
		}

		for (let i = 0; i < options.length; i++) {
			let option = options[i];
			let val = formatValue(option.value, this.number);
			option.selected = multi ? values.indexOf(val) > -1 : values === val;
		}
	},

	/**
	 * 强制更新 select 的值，用于动态的 option
	 * @param   {Booleam}  reset  [是否清除默认选中状态]
	 */
	forceUpdate: function (reset) {
		var directive = this.directive;
		var values = directive.get();

		if (reset) {
			values = this.multi ? [] : '';
			directive.set(values);
		}

		this.update(values);
	}
}
