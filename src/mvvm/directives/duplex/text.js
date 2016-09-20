import { formatValue, toNumber } from '../../../util';

/**
 * 异步延迟函数
 * @param   {Function}  func
 * @param   {Number}    delay
 * @return  {TimeoutId}
 */
function debounceDelay (func, delay) {
	return setTimeout(function () {
		func.call(func);
	}, toNumber(delay));
}

export default {
	/**
	 * 绑定 text 变化事件
	 */
	bind: function () {
		var self = this;
		var lazy = this.lazy;
		var number = this.number;
		var debounce = this.debounce;
		var directive = this.directive;

		/**
		 * 表单值变化设置数据值
		 * @param  {String}  value  [表单值]
		 */
		function setModelValue (value) {
			if (debounce) {
				debounceDelay(function () {
					self.onDebounce = true;
					directive.set(formatValue(value, number));
				}, debounce);
			} else {
				directive.set(formatValue(value, number));
			}
		}

		// 解决中文输入时 input 事件在未选择词组时的触发问题
		// https://developer.mozilla.org/zh-CN/docs/Web/Events/compositionstart
		var composeLock;

		this.on('compositionstart', function () {
			composeLock = true;
		});

		this.on('compositionend', function () {
			composeLock = false;
			if (!lazy) {
				setModelValue(this.value);
			}
		});

		// input 事件(实时触发)
		this.on('input', function () {
			if (!composeLock && !lazy) {
				setModelValue(this.value);
			}
		});

		// change 事件(失去焦点触发)
		this.on('change', function () {
			setModelValue(this.value);
		});
	},

	/**
	 * 更新 text 值
	 * @param   {String}  value
	 */
	update: function (value) {
		var el = this.el;
		if (el.value !== value && !this.onDebounce) {
			el.value = value;
		}
	}
}
