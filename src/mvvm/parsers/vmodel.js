var Parser = require('../parser');
var dom = require('../../dom');
var util = require('../../util');

/**
 * 格式化表单输出值
 * @param   {DOMElement}   node
 * @param   {Mix}          value
 * @return  {Mix}
 */
function formatValue(node, value) {
	return dom.hasAttr(node, 'number') ? +value : value;
}

/**
 * 获取 select 的选中值
 * @param   {Select}  select
 * @return  {Array}
 */
function getSelecteds(select) {
	var options = select.options;
	var getNumber = dom.hasAttr(select, 'number');
	var i, option, value, leng = options.length, sels = [];

	for (i = 0; i < leng; i++) {
		option = options[i];
		value = option.value;
		if (option.selected) {
			sels.push(getNumber ? +value : formatValue(option, value));
		}
	}

	return sels;
}


function Vmodel(vm) {
	this.vm = vm;
	Parser.call(this);
}
var vmodel = Vmodel.prototype = Object.create(Parser.prototype);

/**
 * 解析 v-model 指令
 * @param   {Object}      fors    [vfor 数据]
 * @param   {DOMElement}  node    [指令节点]
 * @param   {String}      field   [双向绑定的字段]
 */
vmodel.parse = function(fors, node, field) {
	var vm = this.vm;
	var inputs = vm.$inputs;
	var tagName = node.tagName.toLowerCase();
	var type = tagName === 'input' ? dom.getAttr(node, 'type') : tagName;

	if (inputs.indexOf(tagName) === -1) {
		util.warn('v-model only for using in ' + inputs.join(', '));
		return;
	}

	util.def(node, '_vmodel', field);

	var deps = this.getDeps(fors, field);
	var scope = this.getScope(fors, field);
	var getter = this.getEval(fors, field);

	// v-model 只支持静态指令
	var paths = util.makePaths(deps.acc[0] || deps.dep[0]);
	var duplex = util.getDeepValue(this.vm.$data, paths);

	var value = getter.call(scope, scope);
	var bind = util.getExpKey(field) || field;
	var args = [node, value, deps, duplex, bind];

	// 根据不同表单类型绑定数据监测方法
	switch (type) {
		case 'text'    :
		case 'password':
		case 'textarea': this.parseText.apply(this, args); break;
		case 'radio'   : this.parseRadio.apply(this, args); break;
		case 'checkbox': this.parseCheckbox.apply(this, args); break;
		case 'select'  : this.parseSelect.apply(this, args); break;
	}
}

/**
 * v-model for text, textarea
 */
vmodel.parseText = function(node, value, deps, duplex, field) {
	var vm = this.vm;
	var updater = vm.updater;

	// 更新视图
	updater.updateTextValue(node, value);

	// 订阅依赖监听
	vm.watcher.watch(deps, function(path, last) {
		updater.updateTextValue(node, last);
	}, this);

	// 绑定事件
	this.bindTextEvent(node, duplex, field);
}

/**
 * text, textarea 绑定数据监测
 * @param   {Input}    node
 * @param   {Object}   duplex
 * @param   {String}   field
 */
vmodel.bindTextEvent = function(node, duplex, field) {
	var composeLock;

	// 解决中文输入时 input 事件在未选择词组时的触发问题
	// https://developer.mozilla.org/zh-CN/docs/Web/Events/compositionstart
	dom.addEvent(node, 'compositionstart', function() {
		composeLock = true;
	});
	dom.addEvent(node, 'compositionend', function() {
		composeLock = false;
	});

	// input 事件(实时触发)
	dom.addEvent(node, 'input', function() {
		if (!composeLock) {
			duplex[field] = this.value;
		}
	});

	// change 事件(失去焦点触发)
	dom.addEvent(node, 'change', function() {
		duplex[field] = this.value;
	});
}

/**
 * v-model for radio
 */
vmodel.parseRadio = function(node, value, deps, duplex, field) {
	var vm = this.vm;
	var updater = vm.updater;

	// 如果已经定义了默认值
	if (dom.hasAttr(node, 'checked')) {
		duplex[field] = value = formatValue(node, node.value);
	}

	// 更新视图
	updater.updateRadioChecked(node, value);

	// 订阅依赖监听
	vm.watcher.watch(deps, function(path, last) {
		updater.updateRadioChecked(node, last);
	}, this);

	// 绑定事件
	this.bindRadioEvent(node, duplex, field);
}

/**
 * radio 绑定数据监测
 * @param   {Input}    node
 * @param   {Object}   duplex
 * @param   {String}   field
 */
vmodel.bindRadioEvent = function(node, duplex, field) {
	dom.addEvent(node, 'change', function() {
		duplex[field] = formatValue(this, this.value);
	});
}

/**
 * v-model for checkbox
 */
vmodel.parseCheckbox = function(node, value, deps, duplex, field) {
	var vm = this.vm;
	var updater = vm.updater;

	// 如果已经定义了默认值
	if (dom.hasAttr(node, 'checked')) {
		if (util.isBool(value)) {
			duplex[field] = value = true;
		}
		else if (util.isArray(value)) {
			value.push(formatValue(node, node.value));
		}
	}

	// 更新视图
	updater.updateCheckboxChecked(node, value);

	// 订阅依赖监听
	vm.watcher.watch(deps, function(path, last) {
		updater.updateCheckboxChecked(node, last);
	}, this);

	// 绑定事件
	this.bindCheckboxEvent(node, duplex, field, value);
}

/**
 * checkbox 绑定数据监测
 * @param   {Input}           node
 * @param   {Object}          duplex
 * @param   {String}          field
 * @param   {Array|Boolean}   value
 */
vmodel.bindCheckboxEvent = function(node, duplex, field, value) {
	dom.addEvent(node, 'change', function() {
		var index, checked = this.checked;
		var val = formatValue(this, this.value);

		if (util.isBool(value)) {
			duplex[field] = checked;
		}
		else if (util.isArray(value)) {
			index = value.indexOf(val);
			// hook
			if (checked) {
				if (index === -1) {
					value.push(val);
				}
			}
			// unhook
			else {
				if (index !== -1) {
					value.splice(index, 1);
				}
			}
		}
	});
}

/**
 * v-model for select
 */
vmodel.parseSelect = function(node, value, deps, duplex, field) {
	var isDefined, selects;
	var updater = this.vm.updater;
	var multi = dom.hasAttr(node, 'multiple');

	// 数据模型定义为单选
	if (util.isString(value)) {
		if (multi) {
			util.warn('<select> cannot be multiple when the model set \'' + field + '\' as not Array!');
			return;
		}
		isDefined = Boolean(value);
	}
	// 数据模型定义为多选
	else if (util.isArray(value)) {
		if (!multi) {
			util.warn('the model \'' + field + '\' cannot set as Array when <select> has no multiple propperty!');
			return;
		}
		isDefined = value.length > 0;
	}
	else {
		util.warn('the model ' + field + ' use in <select> must be a type of String or Array!');
		return;
	}

	// 数据模型中定义初始的选中状态
	if (isDefined) {
		updater.updateSelectChecked(node, value, multi);
	}
	// 模板中定义初始状态
	else {
		selects = getSelecteds(node);
		duplex[field] =  multi ? selects : selects[0];
	}

	// 订阅依赖监测
	this.vm.watcher.watch(deps, function(path, last) {
		updater.updateSelectChecked(node, last, multi);
	});

	// 绑定事件
	this.bindSelectEvent(node, duplex, field, multi);
}

/**
 * select 绑定数据监测
 * @param   {Input}     node
 * @param   {Object}    duplex
 * @param   {String}    field
 * @param   {Boolean}   multi
 */
vmodel.bindSelectEvent = function(node, duplex, field, multi) {
	dom.addEvent(node, 'change', function() {
		var selects = getSelecteds(this);
		duplex[field] =  multi ? selects : selects[0];
	});
}

module.exports = Vmodel;
