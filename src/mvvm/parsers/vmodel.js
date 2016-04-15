define([
	'../parser',
	'../../dom',
	'../../util'
], function(Parser, dom, util) {

	function Vmodel(vm) {
		this.vm = vm;
		Parser.call(this);
	}
	var vmodel = Vmodel.prototype = Object.create(Parser.prototype);

	/**
	 * 解析 v-model 指令
	 * @param   {Array}       fors    [vfor 数据]
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

		util.defineProperty(node, '_vmodel', field);

		var deps = this.getDependents(fors, field);
		var scope = this.getScope(vm, fors, field);
		var getter = this.getEvalFunc(fors, field);

		var value = getter.call(scope, scope);
		var bind = util.getExpKey(field) || field;
		var args = [node, value, deps, scope, bind];

		// 根据不同表单类型绑定数据监测方法
		switch (type) {
			case 'text'    :
			case 'textarea': this.parseText.apply(this, args); break;
			case 'radio'   : this.parseRadio.apply(this, args); break;
			case 'checkbox': this.parseCheckbox.apply(this, args); break;
			case 'select'  : this.parseSelect.apply(this, args); break;
		}
	}

	/**
	 * v-model for text, textarea
	 */
	vmodel.parseText = function(node, value, deps, scope, field) {
		var vm = this.vm;
		var updater = vm.updater;

		// 更新视图
		updater.updateNodeFormTextValue(node, value);

		// 订阅依赖监听
		vm.watcher.watch(deps, function(path, last) {
			updater.updateNodeFormTextValue(node, last);
		}, this);

		// 绑定事件
		this.bindTextEvent(node, scope, field);
	}

	/**
	 * text, textarea 绑定数据监测
	 * @param   {Input}    node
	 * @param   {Object}   scope
	 * @param   {String}   field
	 */
	vmodel.bindTextEvent = function(node, scope, field) {
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
				scope[field] = this.value;
			}
		});

		// change 事件(失去焦点触发)
		dom.addEvent(node, 'change', function() {
			scope[field] = this.value;
		});
	}

	/**
	 * v-model for radio
	 */
	vmodel.parseRadio = function(node, value, deps, scope, field) {
		var vm = this.vm;
		var updater = vm.updater;

		// 更新视图
		updater.updateNodeFormRadioChecked(node, value);

		// 订阅依赖监听
		vm.watcher.watch(deps, function(path, last) {
			updater.updateNodeFormRadioChecked(node, last);
		}, this);

		// 绑定事件
		this.bindRadioEvent(node, scope, field);
	}

	/**
	 * radio 绑定数据监测
	 * @param   {Input}    node
	 * @param   {Object}   scope
	 * @param   {String}   field
	 */
	vmodel.bindRadioEvent = function(node, scope, field) {
		dom.addEvent(node, 'change', function() {
			scope[field] = this.value;
		});
	}

	/**
	 * v-model for checkbox
	 */
	vmodel.parseCheckbox = function(node, value, deps, scope, field) {
		var vm = this.vm;
		var updater = vm.updater;

		// 更新视图
		updater.updateNodeFormCheckboxChecked(node, value);

		// 订阅依赖监听
		vm.watcher.watch(deps, function(path, last) {
			updater.updateNodeFormCheckboxChecked(node, last);
		}, this);

		// 绑定事件
		this.bindCheckboxEvent(node, scope, field, value);
	}

	/**
	 * checkbox 绑定数据监测
	 * @param   {Input}           node
	 * @param   {Object}          scope
	 * @param   {String}          field
	 * @param   {Array|Boolean}   value
	 */
	vmodel.bindCheckboxEvent = function(node, scope, field, value) {
		dom.addEvent(node, 'change', function() {
			var index, checked = this.checked, val = this.value;

			if (util.isBoolean(value)) {
				scope[field] = checked;
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
	vmodel.parseSelect = function(node, value, deps, scope, field) {
		var updater = this.vm.updater;
		var options = node.options;
		var multi = dom.hasAttr(node, 'multiple');
		var option, i, leng = options.length, selects = [], isDefined;

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
			updater.updateNodeFormSelectChecked(node, value, multi);
		}
		// 模板中定义初始状态
		else {
			// 获取选中状态
			for (i = 0; i < leng; i++) {
				option = options[i];
				if (option.selected) {
					selects.push(option.value);
				}
			}
			scope[field] = multi ? selects : selects[0];
		}

		// 订阅依赖监测
		this.vm.watcher.watch(deps, function(path, last) {
			updater.updateNodeFormSelectChecked(node, last, multi);
		});

		// 绑定事件
		this.bindSelectEvent(node, scope, field, multi);
	}

	/**
	 * select 绑定数据监测
	 * @param   {Input}     node
	 * @param   {Object}    scope
	 * @param   {String}    field
	 * @param   {Boolean}   multi
	 */
	vmodel.bindSelectEvent = function(node, scope, field, multi) {
		var self = this;
		dom.addEvent(node, 'change', function() {
			var selects = self.getSelected(this);
			scope[field] = multi ? selects : selects[0];
		});
	}

	/**
	 * 获取 select 的选中值
	 * @param   {Select}  select
	 * @return  {Array}
	 */
	vmodel.getSelected = function(select) {
		var options = select.options;
		var i, option, leng = options.length, sels = [];

		for (i = 0; i < leng; i++) {
			option = options[i];
			if (option.selected) {
				sels.push(option.value);
			}
		}

		return sels;
	}

	return Vmodel;
});