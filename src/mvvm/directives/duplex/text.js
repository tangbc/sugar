import { formatValue } from '../../../util';

export default {
	/**
	 * 绑定 text 变化事件
	 */
	bind: function () {
		var self = this;
		var number = this.number;
		var directive = this.directive;

		// 解决中文输入时 input 事件在未选择词组时的触发问题
		// https://developer.mozilla.org/zh-CN/docs/Web/Events/compositionstart
		var composeLock;
		this.on('compositionstart', function () {
			composeLock = true;
		});
		this.on('compositionend', function () {
			composeLock = false;
		});

		// input 事件(实时触发)
		this.on('input', function () {
			if (!composeLock) {
				directive.set(formatValue(this.value, number));
			}
		});

		// change 事件(失去焦点触发)
		this.on('change', function () {
			directive.set(formatValue(this.value, number));
		});
	},

	/**
	 * 更新 text 值
	 * @param   {String}  value
	 */
	update: function (value) {
		var el = this.el;
		if (el.value !== value) {
			el.value = value;
		}
	}
}