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
	 * 根据数据更新更新 radio 值
	 * @param  {String}  data
	 */
	update (data) {
		let el = this.el;
		el.checked = el.value === _toString(data);
	}
}
