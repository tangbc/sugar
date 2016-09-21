import { formatValue, toNumber, _toString } from '../../../util';

/**
 * 异步延迟函数
 * @param   {Function}   func
 * @param   {Number}     delay
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
			var val = formatValue(value, number);

			if (debounce) {
				debounceDelay(function () {
					self.onDebounce = true;
					directive.set(val);
				}, debounce);
			} else {
				directive.set(val);
			}
		}

		// 解决输入板在未选择词组时 input 事件的触发问题
		// https://developer.mozilla.org/zh-CN/docs/Web/Events/compositionstart
		var composeLock;
		this.on('compositionstart', function () {
			composeLock = true;
		});
		this.on('compositionend', function () {
			composeLock = false;
			if (!lazy) {
				// 在某些浏览器下 compositionend 会在 input 事件之后触发
				// 所以必须在 compositionend 之后进行一次更新以确保数据的同步
				setModelValue(this.value);
			}
		});

		this.on('input', function () {
			if (!composeLock && !lazy) {
				setModelValue(this.value);
			}
		});

		this.on('blur', function () {
			setModelValue(this.value);
		});

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
		var val = _toString(value);
		if (el.value !== val && !this.onDebounce) {
			el.value = val;
		}
	}
}
