import { warn, def } from '../../util';
import Parser, { linkParser } from '../parser';
import { isNormal } from '../expression/index';
import { hasAttr, getAttr, addEvent } from '../../dom';
import { text, radio, select, checkbox } from './models/index';

// 双向数据绑定限制的表单元素
const validForms = ['input', 'select', 'textarea'];


/**
 * v-model 指令解析模块
 */
export function VModel () {
	Parser.apply(this, arguments);
}

let vmodel = linkParser(VModel);

/**
 * 解析 v-model 指令
 */
vmodel.parse = function () {
	let el = this.el;
	let desc = this.desc;
	let tagName = el.tagName.toLowerCase();
	let type = tagName === 'input' ? getAttr(el, 'type') : tagName;

	if (validForms.indexOf(tagName) < 0) {
		return warn('v-model only for using in ' + validForms.join(', '));
	}

	// v-model 仅支持静态指令表达式
	if (!isNormal(desc.expression)) {
		return warn('v-model directive value can be use by static expression');
	}

	// 双向数据绑定
	desc.duplex = true;
	this.bindDuplex(type);
}

/**
 * 双向数据绑定
 * @param  {String}  type
 */
vmodel.bindDuplex = function (type) {
	let form;
	let el = this.el;

	switch (type) {
		case 'text':
		case 'password':
		case 'textarea':
			form = text;
			// 可以使用 trim 属性来清除首尾空格
			this.trim = hasAttr(el, 'trim');
			// 可以使用 lazy 属性来控制 input 事件是否同步数据
			this.lazy = hasAttr(el, 'lazy');
			// 可以使用 debounce 来设置更新数据的延迟时间
			this.debounce = getAttr(el, 'debounce');
			break;
		case 'radio':
			form = radio;
			break;
		case 'checkbox':
			form = checkbox;
			break;
		case 'select':
			form = select;
			// select 需要将指令实例挂载到元素上
			def(el, '__vmodel__', this);
			// 是否多选
			this.multi = hasAttr(el, 'multiple');
			// 动态 option 强制刷新取值方法
			this.forceUpdate = select.forceUpdate.bind(this);
			break;
	}

	// 提示未指定类型的表单元素
	if (!form) {
		return warn('Do not use incorrect form-type with v-model: ', el);
	}

	// 是否将绑定值转化成数字
	this.number = hasAttr(el, 'number');

	// 表单刷新函数
	this.update = form.update.bind(this);

	// 订阅数据 & 更新初始值
	this.bind();

	// 绑定表单变化事件
	if (!this.desc.once) {
		form.bind.call(this);
	}
}

/**
 * 表单元素事件绑定
 * @param  {String}    type
 * @param  {Function}  callback
 */
vmodel.on = function (type, callback) {
	addEvent(this.el, type, callback, false);
}
