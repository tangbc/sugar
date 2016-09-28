import { observeArray } from './index';
import { each, def } from '../../util';

var arrayProto = Array.prototype;
var setProto = Object.setPrototypeOf;
var mutatedProto = Object.create(arrayProto);

// 重写数组操作方法
const rewrites = ['pop', 'push', 'sort', 'shift', 'splice', 'unshift', 'reverse'];

/**
 * 重写 array 操作方法
 */
each(rewrites, function (method) {
	var original = arrayProto[method];

	def(mutatedProto, method, function () {
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
def(arrayProto, '$set', function (index, value) {
	// 超出数组长度默认追加到最后
	if (index >= this.length) {
		index = this.length;
	}
	return this.splice(index, 1, value)[0];
});

/**
 * 添加 $remove 方法
 */
def(arrayProto, '$remove', function (item) {
	var index = this.indexOf(item);
	if (index > -1) {
		return this.splice(index, 1);
	}
});

/**
 * 修改 array 原型
 * @param   {Array}  array
 */
export function setMutationProto (array) {
	if (setProto) {
		setProto(array, mutatedProto);
	} else {
		array.__proto__ = mutatedProto;
	}
}
