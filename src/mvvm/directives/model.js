import { warn, defRec } from '../../util';
import Parser, { linkParser } from '../parser';
import { isNormal } from '../expression/index';
import { hasAttr, getAttr, addEvent } from '../../dom';
import { text, radio, select, checkbox } from './duplex/index';

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

	// v-model 仅支持静态指令表达式
	if (!isNormal(desc.expression)) {
		return warn('v-model directive value can be use by static expression');
	}

	desc.duplex = true;
	this.number = hasAttr(el, 'number');

	// select 需要指令实例挂载到元素上
	if (tagName === 'select') {
		defRec(el, '__vmodel__', this);
		this.multi = hasAttr(el, 'multiple');
		this.forceUpdate = select.forceUpdate.bind(this);
	}

	this.bindDuplex(type);
}

/**
 * 双向数据绑定
 * @param   {String}  type
 */
vmodel.bindDuplex = function (type) {
	var form;

	switch (type) {
		case 'text':
		case 'password':
		case 'textarea':
			form = text;
			break;
		case 'radio':
			form = radio;
			break;
		case 'checkbox':
			form = checkbox;
			break;
		case 'select':
			form = select;
			break;
	}

	// 表单刷新函数
	this.update = form.update.bind(this);

	// 订阅数据 & 更新初始值
	this.bind();

	// 绑定表单变化事件
	form.bind.call(this);
}

/**
 * 表单元素事件绑定
 * @param   {String}    type
 * @param   {Function}  callback
 */
vmodel.on = function (type, callback) {
	addEvent(this.el, type, callback, false);
}