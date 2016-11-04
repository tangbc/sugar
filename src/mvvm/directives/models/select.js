import { formatValue, indexOf } from './index';
import { isArray, warn, _toString } from '../../../util';

/**
 * 获取多选 select 的选中值
 * @param   {Select}   select
 * @param   {Boolean}  number
 * @return  {Array}
 */
function getSelecteds (select, number) {
	let sels = [];
	let options = select.options;

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
	bind () {
		let multi = this.multi;
		let number = this.number;
		let directive = this.directive;

		this.on('change', function () {
			let setVal = multi ?
				getSelecteds(this, number) :
				formatValue(this.value, number);

			directive.set(setVal);
		});

		// 在 更新 select 时将 selectedIndex 设为 -1 的情况下
		// 假如当前 select dom 片段的父元素被移动(append)到文档或其他节点之后
		// 在部分浏览器如 IE9, PhantomJS 中，selectedIndex 将会从 -1 又变回 0
		// 这将导致 v-for option 在列表渲染完成后无法正确的设置 select 的选中值
		// 因为编译阶段都是在文档碎片上执行，所以必须在编译完成后再次强制初始选中状态
		this.vm.after(this.forceUpdate, this);
	},

	/**
	 * 根据数据更新 select 选中值
	 * @param  {Array|String}  data
	 */
	update (data) {
		let el = this.el;
		let multi = this.multi;
		let exp = this.desc.expression;

		// 初始选中项设为空（默认情况下会是第一项）
		// 在 v-model 中 select 的选中项总是以数据(data)为准
		el.selectedIndex = -1;

		if (multi && !isArray(data)) {
			return warn('<select> cannot be multiple when the model set ['+ exp +'] as not Array');
		}

		if (!multi && isArray(data)) {
			return warn('The model ['+ exp +'] cannot set as Array when <select> has no multiple propperty');
		}

		let options = el.options;
		for (let i = 0; i < options.length; i++) {
			let option = options[i];
			let value = option.value;
			option.selected = multi ? indexOf(value, data) > -1 : value === _toString(data);
		}
	},

	/**
	 * 强制更新 select 的值，用于动态的 option
	 */
	forceUpdate () {
		this.update(this.directive.get());
	}
}
