import text from './text';
import radio from './radio';
import select from './select';
import checkbox from './checkbox';
import { isString, isNumber } from '../../../util';

/**
 * 导出 model 类型
 */
export {
	text,
	radio,
	select,
	checkbox
};

/**
 * 将 value 转化为字符串
 * undefined 和 null 都转成空字符串
 * @param   {Mix}     value
 * @return  {String}
 */
export function _toString (value) {
	return value == null ? '' : value.toString();
}

/**
 * value 转成 Number 类型
 * 如转换失败原样返回
 * @param   {String|Mix}  value
 * @return  {Number|Mix}
 */
export function toNumber (value) {
	if (isString(value)) {
		let val = Number(value);
		return isNumber(val) ? val : value;
	} else {
		return value;
	}
}

/**
 * 表单数据格式化
 * @param   {String}   value
 * @param   {Boolean}  convertToNumber
 * @return  {Number}
 */
export function formatValue (value, convertToNumber) {
	return convertToNumber ? toNumber(value) : value;
}

/**
 * 非全等比较的数组查找
 * @param   {Mix}     item
 * @param   {Array}   array
 * @return  {Number}
 */
export function indexOf (item, array) {
	for (var i = 0; i < array.length; i++) {
		/* jshint ignore:start */
		if (array[i] == item) {
			return i;
		}
		/* jshint ignore:end */
	}

	return -1;
}
