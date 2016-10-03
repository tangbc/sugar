import { formatValue } from './index';
import { _toString } from '../../../util';

export default {
	/**
	 * 绑定 radio 变化事件
	 */
	bind () {
		let number = this.number;
		let directive = this.directive;

		this.on('change', function () {
			directive.set(formatValue(this.value, number));
		});
	},

	/**
	 * 更新 radio 值
	 * @param  {String}  value
	 */
	update (value) {
		let el = this.el;
		el.checked = el.value === _toString(value);
	}
}
