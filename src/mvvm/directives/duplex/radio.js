import { formatValue, isNumber } from '../../../util';

export default {
	bind: function () {
		var number = this.number;
		var directive = this.directive;

		this.on('change', function () {
			directive.set(formatValue(this.value, number));
		});
	},

	update: function (value) {
		var el = this.el;
		el.checked = el.value === (isNumber(value) ? String(value) : value);
	}
}