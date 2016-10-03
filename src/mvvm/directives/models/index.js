import text from './text';
import radio from './radio';
import select from './select';
import checkbox from './checkbox';
import { toNumber } from '../../../util';

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
	for (let i = 0; i < array.length; i++) {
		/* jshint ignore:start */
		if (array[i] == item) {
			return i;
		}
		/* jshint ignore:end */
	}

	return -1;
}
