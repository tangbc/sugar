import { observeArray } from './index';
import { each, defRec } from '../../util';

// 重写数组操作方法
const rewriteArrayMethods = [
	'pop',
	'push',
	'sort',
	'shift',
	'splice',
	'unshift',
	'reverse'
];

var arrayProto = Array.prototype;
var arrayMethods = Object.create(arrayProto);

/**
 * 重写 array 操作方法
 */
each(rewriteArrayMethods, function (method) {
	var original = arrayProto[method];

	defRec(arrayMethods, method, function () {
		var args = [];
		var ob = this.__ob__;

		for (let i = 0; i < arguments.length; i++) {
			args.push(arguments[i]);
		}

		ob.dep.beforeNotify();

		var result = original.apply(this, args);

		var inserts;
		switch (method) {
			case 'push':
			case 'unshift':
				inserts = args;
				break;
			case 'splice':
				inserts = args.slice(2);
				break;
		}

		if (inserts && inserts.length) {
			observeArray(inserts);
		}

		ob.dep.notify({method, args});

		return result;
	});
});

/**
 * 添加 $set 方法
 * 提供需要修改的数组项下标 index 和新值 value
 */
defRec(arrayMethods, '$set', function (index, value) {
	// 超出数组长度默认追加到最后
	if (index >= this.length) {
		index = this.length;
	}
	return this.splice(index, 1, value)[0];
});

/**
 * 添加 $remove 方法
 */
defRec(arrayMethods, '$remove', function (item) {
	var index = this.indexOf(item);
	if (index > -1) {
		return this.splice(index, 1);
	}
});

/**
 * 修改 array 的原型
 * @param   {Array}  array
 */
export function changeArrayProto (array) {
	array.__proto__ = arrayMethods;
}
