/**
 * parser 指令解析模块
 */
define([
	'../dom',
	'../util',
	'./updater',
	'./watcher'
], function(dom, util, Updater, Watcher) {

	function Parser(vm) {
		this.vm = vm;
		this.updater = new Updater(vm);
		this.watcher = new Watcher(this.vm.$data);
	}

	var pp = Parser.prototype;

	/**
	 * v-el
	 */
	pp.parseVEl = function(node, value, name, fors) {
		var item, alias, scope, key, splits;

		if (fors) {
			splits = value.split('.');
			alias = splits[0];

			// vel在vfor循环中只能在当前循环体中赋值
			if (alias !== fors[4]) {
				util.warn('The directive \'v-el\' in v-for must be defined in current loop body!');
				return;
			}

			scope = fors[3];
			item = scope[alias];

			if (util.isObject(item)) {
				key = splits[splits.length - 1];
				item[key] = node;
			}
		}
		else {
			this.vm.$data.$els[value] = node;
		}
	}

	/**
	 * v-text, {{text}} DOM文本
	 */
	pp.parseVText = function(node, value, name, fors) {
		var access, replace;
		var watcher = this.watcher;
		var updater = this.updater;
		var inFor = fors && this.isForValue(value, fors);
		var text = inFor ? this.getVforValue(value, fors) : this.vm.getValue(value);

		if (inFor) {
			access = this.getVforAccess(value, fors);
			replace = this.replaceVforIndex(value, fors[1]);
			if (replace) {
				text = replace;
				// 监测数组下标变更，shift, unshift
				watcher.watcherIndex(access, function(index) {
					updater.updateNodeTextContent(node, this.replaceVforIndex(value, index));
				}, this);
			}
			else {
				// 监测当前vfor对象的访问路径
				watcher.watchAccess(access, function(last) {
					updater.updateNodeTextContent(node, last);
				}, this);
			}
		}
		else {
			// 监测数据模型定义的字段
			watcher.add(value, function(path, last) {
				updater.updateNodeTextContent(node, last);
			}, this);
		}

		updater.updateNodeTextContent(node, text);
	}

	/**
	 * v-html DOM布局
	 */
	pp.parseVHtml = function(node, value, name, fors) {
		var access, replace, isPlain;
		var updater = this.updater;
		var watcher = this.watcher;
		var inFor = fors && this.isForValue(value, fors);
		var html = inFor ? this.getVforValue(value, fors) : this.vm.getValue(value);

		if (inFor) {
			access = this.getVforAccess(value, fors);
			replace = this.replaceVforIndex(value, fors[1]);
			if (replace) {
				html = replace;
				isPlain = true;
				// v-html如果使用了下标替换则前缀和后缀将编译到与下标同一文本节点
				watcher.watcherIndex(access, function(index) {
					updater.updateNodeHtmlContent(node, this.replaceVforIndex(value, index), isPlain);
				}, this);
			}
			else {
				watcher.watchAccess(access, function(last) {
					updater.updateNodeHtmlContent(node, last);
				}, this);
			}
		}
		else {
			watcher.add(value, function(path, last) {
				updater.updateNodeHtmlContent(node, last);
			}, this);
		}

		updater.updateNodeHtmlContent(node, html, isPlain);
	}

	/**
	 * v-show 控制节点的显示隐藏
	 */
	pp.parseVShow = function(node, value, name, fors) {
		var access;
		var updater = this.updater;
		var watcher = this.watcher;
		var inFor = fors && this.isForValue(value, fors);
		var result = inFor ? this.getVforValue(value, fors) : this.vm.getValue(value);

		if (inFor) {
			access = this.getVforAccess(value, fors);
			watcher.watchAccess(access, function(last) {
				updater.updateNodeDisplay(node, last);
			}, this);
		}
		else {
			watcher.add(value, function(path, last) {
				updater.updateNodeDisplay(node, last);
			}, this);
		}

		updater.updateNodeDisplay(node, result);
	}

	/**
	 * v-if 控制节点内容的渲染
	 */
	pp.parseVIf = function(node, value, name, fors) {
		var access;
		var updater = this.updater;
		var watcher = this.watcher;
		var inFor = fors && this.isForValue(value, fors);
		var result = inFor ? this.getVforValue(value, fors) : this.vm.getValue(value);

		if (inFor) {
			access = this.getVforAccess(value, fors);
			watcher.watchAccess(access, function(last) {
				updater.updateNodeRenderContent(node, last);
			}, this);
		}
		else {
			this.watcher.add(value, function(path, last) {
				updater.updateNodeRenderContent(node, last);
			}, this);
		}

		updater.updateNodeRenderContent(node, result);
	}

	/**
	 * v-else vshow和vif的else板块
	 */
	pp.parseVElse = function(node) {
		util.defineProperty(node, '_directive', 'v-else');
	}

	/**
	 * v-bind 动态绑定一个或多个attribute
	 * 除class外，一个attribute只能有一个value
	 */
	pp.parseVBind = function(node, value, attr, fors) {
		var directive = util.removeSpace(attr);
		var expression = util.removeSpace(value);
		var val, props = util.jsonStringToArray(expression);

		// 单个attribute v-bind:class="xxx"
		if (directive.indexOf(':') !== -1) {
			val = util.getStringKeyValue(directive);
			// class
			if (val === 'class') {
				// 多个class的json结构
				if (props.length) {
					util.each(props, function(prop) {
						this.bindClassName(node, prop.value, prop.name, fors);
					}, this);
				}
				// 单个class，classname由expression的值决定
				else {
					this.bindClassName(node, expression, null, fors);
				}
			}
			// 行内样式
			else if (val === 'style') {
				// 多个inline-style的json结构
				if (props.length) {
					util.each(props, function(prop) {
						this.bindInlineStyle(node, prop.value, prop.name, fors);
					}, this);
				}
				// 单个inline-style
				else {
					this.bindInlineStyle(node, expression, null, fors);
				}
			}
			// 其他属性
			else {
				this.bindNormalAttribute(node, expression, val, fors);
			}
		}
		// 多个attributes "v-bind={id:xxxx, name: yyy, data-id: zzz}"
		else {
			util.each(props, function(prop) {
				var name = prop.name;
				var value = prop.value;
				if (name === 'class') {
					this.bindClassName(node, value, null, fors);
				}
				else if (name === 'style') {
					this.bindInlineStyle(node, value, null, fors);
				}
				else {
					this.bindNormalAttribute(node, value, name, fors);
				}
			}, this);
		}
	}

	/**
	 * 绑定节点class
	 * @param   {DOMElement}   node
	 * @param   {String}       field
	 * @param   {String}       classname
	 * @param   {Array}        fors
	 */
	pp.bindClassName = function(node, field, classname, fors) {
		var updater = this.updater;
		var value, isObject, isSingle;
		var inFor = fors && this.isForValue(field, fors);

		if (inFor) {
			this.bindClassNameVfor(node, field, classname, fors);
		}
		else {
			value = this.vm.getValue(field);
			isObject = util.isObject(value);
			isSingle = util.isString(value) || util.isBoolean(value);

			// single class
			if (isSingle) {
				updater.updateNodeClassName(node, value, null, classname);
			}
			// classObject
			else if (isObject) {
				this.bindClassNameObject(node, value);
			}
			else {
				util.warn('model \'s '+ field + ' for binding class must be a type of Object, String or Boolean!');
				return;
			}

			this.watcher.add(field, function(path, last, old) {
				if (isObject) {
					// 替换整个classObject
					if (util.isObject(last)) {
						this.bindClassNameObject(node, last, old);
					}
					// 只修改classObject的一个字段
					else if (util.isBoolean(last)) {
						updater.updateNodeClassName(node, last, null, path.split('*').pop());
					}
				}
				else {
					updater.updateNodeClassName(node, last, old, classname);
				}
			}, this);
		}
	}

	/**
	 * vbind-class in v-for
	 */
	pp.bindClassNameVfor = function(node, field, classname, fors) {
		var updater = this.updater;
		var watcher = this.watcher;
		var value = this.getVforValue(field, fors);
		var access = this.getVforAccess(field, fors);

		// 指定classname，由field的布尔值决定是否添加
		if (classname) {
			watcher.watchAccess(access, function(last, old) {
				updater.updateNodeClassName(node, last, old, classname);
			}, this);

			updater.updateNodeClassName(node, value, null, classname);
		}
		else {
			// single class
			if (util.isString(value)) {
				watcher.watchAccess(access, function(last, old) {
					dom.addClass(node, last);
					dom.removeClass(node, old);
				}, this);

				dom.addClass(node, value);
			}
			// classObject
			else if (util.isObject(value)) {
				// 监测classObject单个字段
				this.watchClassNameObject(node, access, value);

				// 监测替换整个classObject
				watcher.watchAccess(access, function(last, old) {
					this.bindClassNameObject(node, last, old);
					this.watchClassNameObject(node, access, last);
				}, this);

				this.bindClassNameObject(node, value);
			}
			else {
				util.warn(access + ' for binding class must be a type of Object, String or Boolean!');
			}
		}
	}

	/**
	 * 监测classObject的每个字段
	 * @todo: 这里当shift和unshift后无法在watcher的displaceCallback中正确的移位
	 * 因为每条vfor数据的classObject的字段会不一样，watcher的移位判断规则需要改进，借助Object.keys
	 * @param   {String}  access
	 * @param   {Object}  classObject
	 */
	pp.watchClassNameObject = function(node, access, classObject) {
		util.each(classObject, function(bool, cls) {
			this.watcher.watchAccess(access + '*' + cls, function(last, old) {
				this.updater.updateNodeClassName(node, last, null, cls);
			}, this);
		}, this);
	}

	/**
	 * 通过classObject批量绑定/移除class
	 * @param   {DOMElement}  node
	 * @param   {object}      newObject  [新classname对象]
	 * @param   {Object}      oldObject  [旧classname对象]
	 */
	pp.bindClassNameObject = function(node, newObject, oldObject) {
		var updater = this.updater;

		// 新增值
		util.each(newObject, function(isAdd, cls) {
			updater.updateNodeClassName(node, isAdd, null, cls);
		}, this);

		// 移除旧值
		util.each(oldObject, function(isAdd, cls) {
			updater.updateNodeClassName(node, false, null, cls);
		}, this);
	}

	/**
	 * 绑定节点style
	 * @param   {DOMElement}  node
	 * @param   {String}      field   [数据绑定字段]
	 * @param   {String}      propperty   [行内样式属性]
	 * @param   {Array}       fors
	 */
	pp.bindInlineStyle = function(node, field, propperty, fors) {
		var updater = this.updater;
		var value, isObject, isString;
		var inFor = fors && this.isForValue(field, fors);

		if (inFor) {
			this.bindInlineStyleVfor(node, field, fors);
		}
		else {
			value = this.vm.getValue(field);
			isObject = util.isObject(value);
			isString = util.isString(value);

			// styleString
			if (isString) {
				updater.updateNodeStyle(node, propperty, value);
			}
			// styleObject
			else if (isObject) {
				this.bindInlineStyleObject(node, value);
			}
			else {
				util.warn('model \'s '+ field + ' for binding style must be a type of Object or String!');
				return;
			}

			this.watcher.add(field, function(path, last, old) {
				if (isObject) {
					// 替换整个styleObject
					if (util.isObject(last)) {
						this.bindInlineStyleObject(node, last, old);
					}
					// 只修改styleObject的一个字段
					else if (util.isString(last)) {
						updater.updateNodeStyle(node, path.split('*').pop(), last);
					}
				}
				else {
					updater.updateNodeStyle(node, propperty, last);
				}
			}, this);
		}
	}

	/**
	 * vbind-style in v-for
	 */
	pp.bindInlineStyleVfor = function(node, field, fors) {
		var updater = this.updater;
		var watcher = this.watcher;
		var key = this.getVforKey(field);
		var style = this.getVforValue(field, fors);
		var access = this.getVforAccess(field, fors);

		if (util.isString(style)) {
			watcher.watchAccess(access, function(last, old) {
				updater.updateNodeStyle(node, key, last);
			}, this);

			updater.updateNodeStyle(node, key, style);
		}
		// styleObject
		else if (util.isObject(style)) {
			// 监测单个字段修改
			this.watchInlineStyleObject(node, access, style);

			// 监测替换整个styleObject
			watcher.watchAccess(access, function(last, old) {
				this.bindInlineStyleObject(node, last, old);
				this.watchInlineStyleObject(node, access, last);
			}, this);

			this.bindInlineStyleObject(node, style);
		}
		else {
			util.warn(access + ' for binding style must be a type of Object or String!');
		}
	}

	/**
	 * 监测styleObject的每个字段
	 * @todo: 问题同watchClassNameObject
	 * @param   {String}  access
	 * @param   {Object}  classObject
	 */
	pp.watchInlineStyleObject = function(node, access, styleObject) {
		util.each(styleObject, function(value, propperty) {
			this.watcher.watchAccess(access + '*' + propperty, function(last, old) {
				this.updater.updateNodeStyle(node, propperty, last);
			}, this);
		}, this);
	}

	/**
	 * 通过styleObject批量绑定/移除行内样式
	 * @param   {DOMElement}  node
	 * @param   {object}      newObject  [新style对象]
	 * @param   {object}      oldObject  [旧style对象]
	 */
	pp.bindInlineStyleObject = function(node, newObject, oldObject) {
		var updater = this.updater;

		// 新值
		util.each(newObject, function(value, propperty) {
			updater.updateNodeStyle(node, propperty, value);
		}, this);

		// 移除旧值
		util.each(oldObject, function(value, propperty) {
			updater.updateNodeStyle(node, propperty, null);
		}, this);
	}

	/**
	 * 绑定节点属性
	 * @param   {DOMElement}  node
	 * @param   {String}      field
	 * @param   {String}      attr
	 * @param   {Array}       fors
	 */
	pp.bindNormalAttribute = function(node, field, attr, fors) {
		var access, replace;
		var watcher = this.watcher;
		var updater = this.updater;
		var inFor = fors && this.isForValue(field, fors);
		var value = inFor ? this.getVforValue(field, fors) : this.vm.getValue(field);

		if (inFor) {
			access = this.getVforAccess(field, fors);
			// 除class和style外的属性可支持$index的替换
			replace = this.replaceVforIndex(field, fors[1]);
			if (replace) {
				value = replace;
				watcher.watcherIndex(access, function(index) {
					updater.updateNodeAttribute(node, attr, this.replaceVforIndex(field, index));
				}, this);
			}
			else {
				watcher.watchAccess(access, function(last, old) {
					updater.updateNodeAttribute(node, attr, last);
				}, this);
			}
		}
		else {
			watcher.add(field, function(path, last) {
				updater.updateNodeAttribute(node, attr, last);
			}, this);
		}

		updater.updateNodeAttribute(node, attr, value);
	}

	/**
	 * v-on 动态绑定一个或多个事件
	 */
	pp.parseVOn = function(node, value, attr, fors) {
		var val, params, props;
		var evt = util.removeSpace(attr);
		var func = util.removeSpace(value);

		// 单个事件 v-on:click
		if (evt.indexOf(':') !== -1) {
			val = util.getStringKeyValue(evt);
			params = util.stringToParameters(func);
			this.parseVOnEvent(node, params[0], params[1], val, fors);
		}
		// 多个事件 v-on="{click: xxx, mouseenter: yyy, mouseleave: zzz}"
		else {
			props = util.jsonStringToArray(func);
			util.each(props, function(prop) {
				val = prop.name;
				params = util.stringToParameters(prop.value);
				this.parseVOnEvent(node, params[0], params[1], val, fors);
			}, this);
		}
	}

	/**
	 * 节点绑定事件
	 * @todo: 存在$index时数组操作时同步更新参数中的下标
	 */
	pp.parseVOnEvent = function(node, field, args, evt, fors) {
		var access;
		var watcher = this.watcher;
		var updater = this.updater;
		var inFor = fors && this.isForValue(field, fors);
		var func = inFor ? this.getVforValue(field, fors) : this.vm.getValue(field);

		if (inFor) {
			access = this.getVforAccess(field, fors);
			watcher.watchAccess(access, function(last, old) {
				updater.updateNodeEvent(node, evt, last, old, args, access, fors[1]);
			}, this);
		}
		else {
			watcher.add(field, function(path, last, old) {
				updater.updateNodeEvent(node, evt, last, old, args, field, fors[1]);
			}, this);
		}

		// 即使不在vfor中取值也需要获取访问路径
		if (fors && !access) {
			field = fors[2] + '*' + evt;
		}

		updater.updateNodeEvent(node, evt, func, null, args, field, fors && fors[1]);
	}

	/**
	 * v-model 表单控件双向绑定
	 */
	pp.parseVModel = function(node, field) {
		var inputs = this.vm.$inputs;
		var tagName = node.tagName.toLowerCase();
		var type = tagName === 'input' ? dom.getAttr(node, 'type') : tagName;

		if (inputs.indexOf(tagName) === -1) {
			util.warn('v-model only for using in ' + inputs.join(', '));
			return;
		}

		util.defineProperty(node, '_vmodel', field);

		// 根据不同表单类型绑定数据监测方法
		switch (type) {
			case 'text'    :
			case 'textarea': this.parseVModelText.apply(this, arguments); break;
			case 'radio'   : this.parseVModelRadio.apply(this, arguments); break;
			case 'checkbox': this.parseVModelCheckbox.apply(this, arguments); break;
			case 'select'  : this.parseVModelSelect.apply(this, arguments); break;
		}
	}

	/**
	 * v-model for text, textarea
	 */
	pp.parseVModelText = function(node, field, name, fors) {
		var access;
		var updater = this.updater;
		var watcher = this.watcher;
		var inFor = fors && this.isForValue(field, fors);
		var text = inFor ? this.getVforValue(field, fors) : this.vm.getValue(field);

		if (inFor) {
			access = this.getVforAccess(field, fors);
			watcher.watchAccess(access, function(last) {
				updater.updateNodeFormTextValue(node, last);
			});
		}
		else {
			watcher.add(field, function(path, last) {
				updater.updateNodeFormTextValue(node, last);
			}, this);
		}

		updater.updateNodeFormTextValue(node, text);

		this.bindVModelTextEvent(node, field, inFor, fors);
	}

	/**
	 * text, textarea绑定数据监测事件
	 * @param   {Input}    node
	 * @param   {String}   field
	 * @param   {Boolean}  inFor
	 * @param   {Array}    fors
	 */
	pp.bindVModelTextEvent = function(node, field, inFor, fors) {
		var self = this, composeLock = false;

		// 解决中文输入时input事件在未选择词组时的触发问题
		// https://developer.mozilla.org/zh-CN/docs/Web/Events/compositionstart
		dom.addEvent(node, 'compositionstart', function() {
			composeLock = true;
		});
		dom.addEvent(node, 'compositionend', function() {
			composeLock = false;
		});

		// input事件(实时触发)
		dom.addEvent(node, 'input', function() {
			if (!composeLock) {
				self.setVModelValue(field, this.value, inFor, fors);
			}
		});

		// change事件(失去焦点触发)
		dom.addEvent(node, 'change', function() {
			self.setVModelValue(field, this.value, inFor, fors);
		});
	}

	/**
	 * v-model for radio
	 */
	pp.parseVModelRadio = function(node, field, name, fors) {
		var access;
		var updater = this.updater;
		var watcher = this.watcher;
		var inFor = fors && this.isForValue(field, fors);
		var value = inFor ? this.getVforValue(field, fors) : this.vm.getValue(field);

		if (inFor) {
			access = this.getVforAccess();
			watcher.watchAccess(access, function(last) {
				updater.updateNodeFormRadioChecked(node, last);
			});
		}
		else {
			watcher.add(field, function(path, last) {
				updater.updateNodeFormRadioChecked(node, last);
			}, this);
		}

		updater.updateNodeFormRadioChecked(node, value);

		this.bindVModelRadioEvent(node, field, inFor, fors);
	}

	/**
	 * radio绑定数据监测事件
	 * @param   {Input}   node
	 * @param   {String}  field
	 */
	pp.bindVModelRadioEvent = function(node, field, inFor, fors) {
		var self = this;
		dom.addEvent(node, 'change', function() {
			self.setVModelValue(field, this.value, inFor, fors);
		});
	}

	/**
	 * v-model for checkbox
	 */
	pp.parseVModelCheckbox = function(node, field, name, fors) {
		var watcher = this.watcher;
		var updater = this.updater;
		var access, scope, key, alias, infos;
		var inFor = fors && this.isForValue(field, fors);
		var value = inFor ? this.getVforValue(field, fors) : this.vm.getValue(field);

		if (inFor) {
			scope = util.extend(fors[3]);
			key = this.getVforKey(field);
			alias = field.substr(0, field.indexOf(key) - 1);
			infos = [scope, key, alias];

			access = this.getVforAccess(field, fors);
			watcher.watchAccess(access, function() {
				updater.updateNodeFormCheckboxChecked(node, scope[alias][key]);
			}, this);
		}
		else {
			watcher.add(field, function() {
				updater.updateNodeFormCheckboxChecked(node, this.vm.getValue(field));
			}, this);
		}

		updater.updateNodeFormCheckboxChecked(node, value);

		this.bindVModelCheckboxEvent(node, field, inFor, infos);
	}

	/**
	 * checkbox绑定数据监测事件
	 * @param   {Input}    node
	 * @param   {String}   field
	 * @param   {Boolean}  inFor
	 * @param   {Array}    infos
	 */
	pp.bindVModelCheckboxEvent = function(node, field, inFor, infos) {
		var self = this, scope, alias, key;

		if (inFor) {
			scope = infos[0];
			key = infos[1];
			alias = infos[2];
		}

		dom.addEvent(node, 'change', function() {
			var index, value = this.value, checked = this.checked;
			var array = inFor ? scope[alias][key] : self.vm.getValue(field);

			// 多个checkbox
			if (util.isArray(array)) {
				index = array.indexOf(value);
				if (checked) {
					if (index === -1) {
						array.push(value);
					}
				}
				else {
					if (index !== -1) {
						array.splice(index, 1);
					}
				}
			}
			// 单个checkbox
			else if (util.isBoolean(array)) {
				// scope[alias][key] = checked;
				self.setVModelValue(field, checked, inFor, infos);
			}
		});
	}

	/**
	 * v-model for select
	 */
	pp.parseVModelSelect = function(node, field, name, fors) {
		var access;
		var updater = this.updater;
		var watcher = this.watcher;
		var inFor = fors && this.isForValue(field, fors);
		var selectValue = inFor ? this.getVforValue(field, fors) : this.vm.getValue(field);

		var options = node.options;
		var multi = dom.hasAttr(node, 'multiple');
		var option, i, leng = options.length, selects = [], isDefined;

		// 数据模型定义为单选
		if (util.isString(selectValue)) {
			if (multi) {
				util.warn('select cannot be multiple when your model set \'' + field + '\' not Array!');
				return;
			}
			isDefined = Boolean(selectValue);
		}
		// 定义为多选
		else if (util.isArray(selectValue)) {
			if (!multi) {
				util.warn('your model \'' + field + '\' cannot set as Array when select has no multiple propperty!');
				return;
			}
			isDefined = selectValue.length > 0;
		}
		else {
			util.warn(field + ' must be a type of String or Array!');
			return;
		}

		// 数据模型中定义初始的选中状态
		if (isDefined) {
			updater.updateNodeFormSelectChecked(node, selectValue, multi);
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
			this.setVModelValue(field, multi ? selects : selects[0], inFor, fors);
		}

		if (inFor) {
			access = this.getVforAccess(field, fors);
			watcher.watchAccess(access, function(last) {
				updater.updateNodeFormSelectChecked(node, last, multi);
			}, this);
		}
		else {
			watcher.add(field, function(path, last) {
				updater.updateNodeFormSelectChecked(node, last, multi);
			}, this);
		}

		this.bindVModelSelectEvent(node, field, multi, inFor, fors);
	}

	/**
	 * select绑定数据监测事件
	 * @param   {Select}   node
	 * @param   {String}   field
	 * @param   {Boolean}  multi
	 * @param   {Boolean}  inFor
	 * @param   {Array}    fors
	 */
	pp.bindVModelSelectEvent = function(node, field, multi, inFor, fors) {
		var self = this;
		dom.addEvent(node, 'change', function() {
			var selects = self.getSelectValue(this);
			self.setVModelValue(field, multi ? selects : selects[0], inFor, fors);
		});
	}

	/**
	 * 获取SELECT的选中值
	 * @param   {Select}  select
	 * @return  {Array}
	 */
	pp.getSelectValue = function(select) {
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

	/**
	 * 强制更新select/option在vfor中的值
	 * @param   {Select}  select
	 */
	pp.froceUpdateOption = function(select, fors) {
		var model = select._vmodel;
		var inFor = fors && this.isForValue(model, fors);
		var value = inFor ? this.getVforValue(model, fors) : this.vm.getValue(model);
		this.updater.updateNodeFormSelectChecked(select, value, dom.hasAttr(select, 'multiple'));
	}

	/**
	 * 设置v-model对应数据模型字段的值
	 * @param  {String}   field
	 * @param  {String}   value
	 * @param  {Boolean}  inFor
	 * @param  {Array}    fors
	 */
	pp.setVModelValue = function(field, value, inFor, fors) {
		var key;
		if (inFor) {
			key = this.getVforKey(field);
			fors[0][key] = value;
		}
		else {
			this.vm.setValue(field, value);
		}
	}

	/**
	 * v-for 基于源数据重复的动态列表
	 */
	pp.parseVFor = function(node, value, attr, fors) {
		var match = value.match(/(.*) in (.*)/);
		var alias = match[1];
		var field = match[2];
		var scope = {}, level = 0;
		var watcher = this.watcher;
		var parent = node.parentNode;
		var key = this.getVforKey(field);
		var isOption = node.tagName === 'OPTION';
		var template, infos, array = this.vm.getValue(field);

		if (key) {
			scope = fors[3];
			level = fors[5];
			array = fors[0][key];
			field = fors[2] + '*' + key;
		}

		if (!util.isArray(array)) {
			parent.removeChild(node);
			return;
		}

		template = this.buildVforTemplate(node, array, field, scope, alias, level);

		node.parentNode.replaceChild(template, node);

		if (isOption) {
			this.froceUpdateOption(parent, fors);
		}

		// differ数组信息
		infos = [field, scope, alias, level];

		// 监测根列表数据的变化
		if (!fors) {
			watcher.add(field, function(path, last, old) {
				// 更新数组的某一项
				if (path !== field) {
					watcher.triggerAccess(path, last, old);
				}
				// 更新整个根数组
				else {
					this.differVfors(parent, node, last, old, infos);
				}
			}, this);
		}
		// 嵌套vfor
		else {
			watcher.watchAccess(field, function(last, old) {
				this.differVfors(parent, node, last, old, infos);
			}, this);
		}
	}

	/**
	 * 根据源数组构建循环板块集合
	 * @param   {DOMElement}  node   [重复模板]
	 * @param   {Array}       array  [源数组]
	 * @param   {String}      field  [访问路径]
	 * @param   {Object}      scope  [循环中对象取值范围]
	 * @param   {String}      alias  [当前循环对象别名]
	 * @param   {Number}      level  [当前循环层级]
	 * @return  {Fragment}           [板块集合]
	 */
	pp.buildVforTemplate = function(node, array, field, scope, alias, level) {
		var vm = this.vm;
		var fragments = util.createFragment();

		level++;

		// 构建重复片段
		util.each(array, function(item, index) {
			var path = field + '*' + index;
			var cloneNode = node.cloneNode(true);
			var fors = [item, index, path, scope, alias, level];

			// 阻止重复编译除vfor以外的指令
			if (node._vfor_directives > 1) {
				vm.blockCompileNode(node);
			}

			// 可在编译过程中获取当前循环对象的所有信息
			// 当编译结束之后别名对应的取值对象是循环体的最后一项
			scope[alias] = item;
			// 传入vfor数据编译板块
			vm.complieElement(cloneNode, true, fors);
			// 定义私有标记属性
			util.defineProperty(cloneNode, '_vfor_alias', alias);

			fragments.appendChild(cloneNode);
		}, this);

		return fragments;
	}

	/**
	 * 数组操作同步更新vfor循环体
	 * @param   {DOMElement}  parent    [父节点]
	 * @param   {DOMElement}  node      [初始模板片段]
	 * @param   {Array}       newArray  [新的数据重复列表]
	 * @param   {String}      method    [数组操作]
	 * @param   {Array}       infos    [differ信息]
	 */
	pp.differVfors = function(parent, node, newArray, method, infos) {
		var firstChild, lastChild;
		var watcher = this.watcher;
		var field = infos[0], alias = infos[2];

		switch (method) {
			case 'push':
				this.pushVforArray.apply(this, arguments);
				break;
			case 'pop':
				lastChild = this.getVforLastChild(parent, alias);
				parent.removeChild(lastChild);
				break;
			case 'unshift':
				watcher.backwardArray(field);
				this.unshiftVforArray.apply(this, arguments);
				break;
			case 'shift':
				firstChild = this.getVforFirstChild(parent, alias);
				watcher.forwardArray(field);
				parent.removeChild(firstChild);
				break;
			// @todo: splice, sort, reverse操作和直接赋值暂时都重新编译
			default:
				this.recompileVforArray.apply(this, arguments);
		}
	}

	/**
	 * 获取vfor循环体的第一个子节点
	 * @param   {DOMElement}  parent  [父节点]
	 * @param   {String}      alias   [循环体对象别名]
	 * @return  {FirstChild}
	 */
	pp.getVforFirstChild = function(parent, alias) {
		var i, firstChild, child;
		var childNodes = parent.childNodes;
		for (i = 0; i < childNodes.length; i++) {
			child = childNodes[i];
			if (child._vfor_alias === alias) {
				firstChild = child;
				break;
			}
		}
		return firstChild;
	}

	/**
	 * 获取vfor循环体的最后一个子节点
	 * @param   {DOMElement}  parent   [父节点]
	 * @param   {String}      alias    [循环体对象别名]
	 * @return  {LastChild}
	 */
	pp.getVforLastChild = function(parent, alias) {
		var i, lastChild, child;
		var childNodes = parent.childNodes;
		for (i = childNodes.length - 1; i > -1 ; i--) {
			child = childNodes[i];
			if (child._vfor_alias === alias) {
				lastChild = child;
				break;
			}
		}
		return lastChild;
	}

	/**
	 * 在循环体数组的最后追加一条数据 array.push
	 */
	pp.pushVforArray = function(parent, node, newArray, method, infos) {
		var lastChild;
		var last = newArray.length - 1;
		var fragment = util.createFragment();
		var cloneNode = node.cloneNode(true);
		var field = infos[0], scope = infos[1], alias = infos[2], level = infos[3];
		var fors = [newArray[last], last, field + '*' + last, scope, alias, level];

		// 循环体定义
		scope[alias] = newArray[last];

		// 解析节点
		this.vm.complieElement(cloneNode, true, fors);
		fragment.appendChild(cloneNode);

		lastChild = this.getVforLastChild(parent, alias);
		parent.insertBefore(fragment, lastChild.nextSibling);
	}

	/**
	 * 在循环体数组最前面追加一条数据 array.unshift
	 */
	pp.unshiftVforArray = function(parent, node, newArray, method, infos) {
		var firstChild;
		var fragment = util.createFragment();
		var cloneNode = node.cloneNode(true);
		var field = infos[0], scope = infos[1], alias = infos[2], level = infos[3];
		var fors = [newArray[0], 0, field + '*' + 0, scope, alias, level, method];

		// 循环体定义
		scope[alias] = newArray[0];

		// 解析节点
		this.vm.complieElement(cloneNode, true, fors);
		fragment.appendChild(cloneNode);

		firstChild = this.getVforFirstChild(parent, alias);
		parent.insertBefore(fragment, firstChild);
	}

	/**
	 * 重新编译循环体数组
	 */
	pp.recompileVforArray = function(parent, node, newArray, method, infos) {
		var template, alias = infos[2];
		var childNodes = parent.childNodes;
		var scapegoat, child, args = [node, newArray];

		// 重新构建循环板块
		util.AP.push.apply(args, infos);
		template = this.buildVforTemplate.apply(this, args);

		// 移除旧板块
		for (var i = 0; i < childNodes.length; i++) {
			child = childNodes[i];
			if (child._vfor_alias === alias) {
				if (!scapegoat) {
					scapegoat = child;
				}
				else {
					i--;
					parent.removeChild(child);
				}
			}
		}

		if (scapegoat) {
			parent.replaceChild(template, scapegoat);
		}
		else {
			parent.appendChild(template);
		}

	}

	/**
	 * 是否是在vfor中取值
	 * @param   {String}   field  [model字段或者vfor字段]
	 * @param   {Array}    fors   [vfor数据]
	 * @return  {Boolean}
	 */
	pp.isForValue = function(field, fors) {
		var pos = field.indexOf('.');
		var alias = pos === -1 ? (field === fors[4] ? field : null) : field.substr(0, pos);
		return field.indexOf('$index') === -1 ? (alias ? util.hasOwn(fors[3], alias) : false) : true;
	}

	/**
	 * 获取vfor中循环对象的键名
	 * @param   {String}  field
	 * @param   {Object}  item
	 * @return  {String}
	 */
	pp.getVforKey = function(field) {
		var pos = field.lastIndexOf('.');
		return pos === -1 ? '' : field.substr(pos + 1);
	}

	/**
	 * 获取vfor中循环对象的值，当前循环取值或跨层级取值
	 */
	pp.getVforValue = function(value, fors) {
		var splits = value.split('.');
		var sl = splits.length;
		var alias = splits[0], key = splits[sl - 1];
		var scopeMap = fors[3], scope = (scopeMap && scopeMap[alias]) || fors[0];
		return sl === 1 ? scope : scope[key];
	}

	/**
	 * 获取vfor中当前循环对象的监测访问路径
	 */
	pp.getVforAccess = function(value, fors) {
		var path = fors[2], alias, access;
		var splits, leng, level, key, suffix;

		if (value.indexOf('$index') !== -1) {
			access = path;
		}
		else {
			splits = value.split('.');
			leng = splits.length;
			level = fors[5];
			alias = splits[0];
			key = splits[leng - 1];
			suffix = leng === 1 ? '' : '*' + key;
			access = alias === fors[4] ? (fors[2] + suffix) : (path.split('*', level).join('*') + suffix);
		}

		return access;
	}

	/**
	 * 替换vfor循环体表达式中的下标
	 * @param   {String}          expression
	 * @param   {String|Number}   index
	 * @return  {String}
	 */
	pp.replaceVforIndex = function(expression, index) {
		return expression.indexOf('$index') === -1 ? null : expression.replace(/\$index/g, index);
	}

	return Parser;
});