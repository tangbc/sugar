import { formatValue } from '../../../util';

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
	bind: function () {
		var dir = this.$dir;
		var multi = this.multi;
		var number = this.number;

		this.on('change', function () {
			var sels = getSelecteds(this, number);
			dir.set(multi ? sels : sels[0]);
		});
	},

	update: function (sels) {
		var el = this.el;
		var options = el.options;

		for (let i = 0; i < options.length; i++) {
			let option = options[i];
			let val = formatValue(option.value, this.number);
			option.selected = this.multi ? sels.indexOf(val) > -1 : sels === val;
		}
	},

	updateOption: function () {
		var value = this.$dir.get();
		this.update(value);
	}
}