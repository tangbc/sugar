import text from './duplex/text';
import radio from './duplex/radio';
import select from './duplex/select';
import checkbox from './duplex/checkbox';

import { warn, def } from '../../util';
import { isNormal } from '../expression';
import Parser, { linkParser } from '../parser';
import { hasAttr, getAttr, addEvent } from '../../dom';

// 双向数据绑定限制的表单元素
const validForms = [
	'input',
	'select',
	'textarea'
];


/**
 * v-model 指令解析模块
 */
export function VModel () {
	Parser.apply(this, arguments);
}

var vmodel = linkParser(VModel);

/**
 * 解析 v-model 指令
 */
vmodel.parse = function () {
	var el = this.el;
	var desc = this.desc;
	var tagName = el.tagName.toLowerCase();
	var type = tagName === 'input' ? getAttr(el, 'type') : tagName;

	if (validForms.indexOf(tagName) < 0) {
		return warn('v-model only for using in ' + validForms.join(', '));
	}

	// v-model 暂支持静态指令表达式
	if (!isNormal(desc.expression)) {
		return warn('v-model directive value can be use by static expression');
	}


	desc.duplex = true;
	this.number = hasAttr(el, 'number');

	// select 需要挂载指令实例到元素上
	if (tagName === 'select') {
		def(el, '__vmodel__', this);
		this.multi = hasAttr(el, 'multiple');
		this.updateOption = select.updateOption.bind(this);
	}

	this.bindDuplex(type);
}

/**
 * 双向数据绑定
 * @param   {String}  type
 */
vmodel.bindDuplex = function (type) {
	var model;

	switch (type) {
		case 'text':
		case 'password':
		case 'textarea':
			model = text;
			break;
		case 'radio':
			model = radio;
			break;
		case 'checkbox':
			model = checkbox;
			break;
		case 'select':
			model = select;
			break;
	}

	this.update = model.update.bind(this);
	this.bind();
	model.bind.apply(this);
}

/**
 * 事件绑定
 * @param   {String}    type
 * @param   {Function}  callback
 */
vmodel.on = function (type, callback) {
	addEvent(this.el, type, callback, false);
}