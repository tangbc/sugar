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
	},

	/**
	 * 更新 select 值
	 * @param   {Array|String}  sels
	 */
	update: function (sels) {
		var el = this.el;
		var options = el.options;

		for (let i = 0; i < options.length; i++) {
			let option = options[i];
			let val = formatValue(option.value, this.number);
			option.selected = this.multi ? sels.indexOf(val) > -1 : sels === val;
		}
	},

	/**
	 * 强制更新 select 的值，用于动态的 option
	 */
	forceUpdate: function () {
		this.update(this.directive.get());
	}
}