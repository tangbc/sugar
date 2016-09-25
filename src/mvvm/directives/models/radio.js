import { formatValue, _toString } from './index';

export default {
	/**
	 * 绑定 radio 变化事件
	 */
	bind () {
		var number = this.number;
		var directive = this.directive;

		this.on('change', function () {
			directive.set(formatValue(this.value, number));
		});
	},

	/**
	 * 更新 radio 值
	 * @param   {String}  value
	 */
	update (value) {
		var el = this.el;
		el.checked = el.value === _toString(value);
	}
}
