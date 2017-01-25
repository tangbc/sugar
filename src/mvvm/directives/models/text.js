import { formatValue } from './index';
import { toNumber, _toString } from '../../../util';

/**
 * 保证 func 在上次执行后的 delay 时间内不会被触发第二次
 * @param  {Function}  func
 * @param  {Number}    delay
 */
let beginTime = 0;
function debounceDelay (func, delay) {
	beginTime = Date.now();
	setTimeout(function () {
		if (Date.now() - beginTime >= delay) {
			func.call(func);
		}
	}, delay);
}

const userAgent = window.navigator.userAgent.toLowerCase();
const isMsie9 = userAgent && userAgent.indexOf('msie 9.0') > 0;

export default {
	/**
	 * 绑定 text 变化事件
	 */
	bind () {
		let self = this;
		let trim = this.trim;
		let lazy = this.lazy;
		let number = this.number;
		let debounce = this.debounce;
		let directive = this.directive;

		/**
		 * 表单值变化设置数据值
		 * @param  {String}  value  [表单值]
		 */
		function setModelValue (value) {
			if (trim) {
				value = value.trim();
			}

			let val = formatValue(value, number);

			if (debounce) {
				debounceDelay(function () {
					self.onDebounce = true;
					directive.set(val);
				}, toNumber(debounce));
			} else {
				directive.set(val);
			}
		}

		// 解决输入板在未选择词组时 input 事件的触发问题
		// https://developer.mozilla.org/zh-CN/docs/Web/Events/compositionstart
		let composeLock;
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

		// 在 IE9 中，backspace, delete 和剪切事件不会触发 input 事件
		/* istanbul ignore next */
		if (isMsie9) {
			this.on('cut', function () {
				setModelValue(this.value);
			});

			this.on('keyup', function (e) {
				let keyCode = e.keyCode;
				if (keyCode === 8 || keyCode === 46) {
					setModelValue(this.value);
				}
			});
		}
	},

	/**
	 * 根据数据更新更新 text 值
	 * @param  {String}  data
	 */
	update (data) {
		let el = this.el;
		let val = _toString(data);
		if (el.value !== val && !this.onDebounce) {
			el.value = val;
		}
	}
}
