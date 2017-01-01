import { observeArray } from './index';
import { each, def } from '../../util';

let hasProto = '__proto__' in {};
let arrayProto = Array.prototype;
let mutatedProto = Object.create(arrayProto);

/**
 * 重写/定义数组变异方法
 */
each([
	'pop',
	'push',
	'sort',
	'shift',
	'splice',
	'unshift',
	'reverse'
], function (method) {
	let original = arrayProto[method];

	def(mutatedProto, method, function () {
		let args = [];
		let ob = this.__ob__;

		for (let i = 0; i < arguments.length; i++) {
			args.push(arguments[i]);
		}

		ob.dep.beforeNotify();

		let result = original.apply(this, args);

		let inserts;
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

		ob.dep.notify({method, args, source: this});

		return result;
	});
});

/**
 * 添加数组选项设置/替换方法（全局修改）
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
 * 添加数组选项删除方法（全局修改）
 */
def(arrayProto, '$remove', function (item) {
	let index = this.indexOf(item);
	if (index > -1) {
		return this.splice(index, 1);
	}
});

/**
 * 逐个修改数组变异方法
 * IE9, IE10 不支持修改 __proto__
 * @param   {Array}  array
 */
let mutatedKeys = Object.getOwnPropertyNames(mutatedProto);
/* istanbul ignore next */
function defMutationProto (array) {
	for (let i = 0; i < mutatedKeys.length; i++) {
		let key = mutatedKeys[i];
		def(array, key, mutatedProto[key]);
	}
}

/**
 * 修改数组原型，将变异方法挂载到数组上
 * @param  {Array}  array
 */
export function setMutationProto (array) {
	/* istanbul ignore else */
	if (hasProto) {
		array.__proto__ = mutatedProto;
	} else {
		defMutationProto(array);
	}
}
