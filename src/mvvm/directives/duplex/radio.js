import { formatValue, isNumber } from '../../../util';

export default {
	bind: function () {
		var dir = this.$dir;
		var number = this.number;

		this.on('change', function () {
			dir.set(formatValue(this.value, number));
		});
	},

	update: function (value) {
		var el = this.el;
		el.checked = el.value === (isNumber(value) ? String(value) : value);
	}
}