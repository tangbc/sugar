/**
 * parser 指令解析模块
 */
define([
	'./util',
	'./vm-updater',
	'./vm-watcher'
], function(util, Updater, Watcher) {

	function Parser(vm) {
		this.vm = vm;
		this.updater = new Updater(vm);
		this.watcher = new Watcher(this.vm.$data);
	}
	Parser.prototype =  {
		constructor: Parser,

		/**
		 * v-el
		 */
		parseVEl: function(node, value, name, fors) {
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
		},

		/**
		 * v-text, {{text}} DOM文本
		 */
		parseVText: function(node, value, name, fors) {
			var access, text;
			var watcher = this.watcher;
			var updater = this.updater;

			if (fors) {
				access = this.getVforAccess(value, fors);
				text = this.replaceVforIndex(value, fors[1]);
				if (text) {
					// 监测数组下标变更
					watcher.watcherIndex(access, function(index) {
						updater.updateNodeTextContent(node, this.replaceVforIndex(value, index));
					}, this);
				}
				else {
					text = this.getVforValue(value, fors);
					// 监测访问路径
					watcher.watchAccess(access, function(last) {
						updater.updateNodeTextContent(node, last);
					}, this);
				}
			}
			else {
				text = this.vm.getData(value);
				watcher.add(value, function(path, last) {
					updater.updateNodeTextContent(node, last);
				}, this);
			}

			updater.updateNodeTextContent(node, text);
		},

		/**
		 * v-html DOM布局
		 */
		parseVHtml: function(node, value, name, fors) {
			var access, html, isPlain;
			var updater = this.updater;
			var watcher = this.watcher;

			if (fors) {
				access = this.getVforAccess(value, fors);
				html = this.replaceVforIndex(value, fors[1]);
				if (html) {
					isPlain = true;
					// 监测数组下标变更，v-html如果使用了下标替换则前缀和后缀将编译到与下标同一文本节点
					watcher.watcherIndex(access, function(index) {
						updater.updateNodeHtmlContent(node, this.replaceVforIndex(value, index), isPlain);
					}, this);
				}
				else {
					html = this.getVforValue(value, fors);
					// 监测访问路径
					watcher.watchAccess(access, function(last) {
						updater.updateNodeHtmlContent(node, last);
					}, this);
				}
			}
			else {
				html = this.vm.getData(value);
				watcher.add(value, function(path, last) {
					updater.updateNodeHtmlContent(node, last);
				}, this);
			}

			updater.updateNodeHtmlContent(node, html, isPlain);
		},

		/**
		 * v-show 控制节点的显示隐藏
		 */
		parseVShow: function(node, value) {
			var init = this.vm.getData(value);
			updater.updateNodeDisplay(node, init);

			this.watcher.add(value, function(path, last) {
				updater.updateNodeDisplay(node, last);
			}, this);
		},

		/**
		 * v-if 控制节点内容的渲染
		 */
		parseVIf: function(node, value) {
			var init = this.vm.getData(value);
			updater.updateNodeRenderContent(node, init, true);

			this.watcher.add(value, function(path, last) {
				updater.updateNodeRenderContent(node, last, false);
			}, this);
		},

		/**
		 * v-bind 动态绑定一个或多个attribute
		 * 除class外，一个attribute只能有一个value
		 */
		parseVBind: function(node, value, attr, fors) {
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
					this.bindNormalAttribute(node, expression, val);
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
		},

		/**
		 * 绑定节点class
		 * @param   {DOMElement}      node
		 * @param   {String}          bindField
		 * @param   {String}          classname
		 * @param   {Array}           fors
		 */
		bindClassName: function(node, bindField, classname, fors) {
			var init = this.vm.getData(bindField);
			var isObject = util.isObject(init);
			var isSingle = util.isString(init) || util.isBoolean(init);

			// single class
			if (isSingle) {
				updater.updateNodeClassName(node, init, null, classname);
			}
			// classObject
			else if (isObject) {
				this.bindClassNameObject(node, init);
			}
			else {
				if (fors) {
					this.bindClassNameVfor(node, bindField, fors);
				}
				else {
					util.warn('model \'s '+ bindField + ' for binding class must be a type of Object, String or Boolean!');
				}
				return;
			}

			this.watcher.add(bindField, function(path, last, old) {
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
		},

		/**
		 * classname in v-for
		 */
		bindClassNameVfor: function(node, bindField, fors) {
			var item = fors[0], index = fors[1], access = fors[2];
			var replace, key = this.getVforKey(bindField), classname = item[key];
			var path = access + '*' + key, watcher = this.watcher;

			if (util.isString(classname)) {
				replace = this.replaceVforIndex(classname, index);

				if (replace) {
					classname = replace;
				}
				else {
					watcher.watchAccess(path, function(last, old) {
						this.addClass(node, last);
						this.removeClass(node, old);
					}, this);
				}

				this.addClass(node, classname);
			}
			// classObject
			else if (util.isObject(classname)) {
				this.bindClassNameObject(node, classname);

				// 监测classObject一个字段修改
				util.each(classname, function(isAdd, cls) {
					watcher.watchAccess(path + '*' + cls, function(last, old) {
						updater.updateNodeClassName(node, last, null, cls);
					}, this);
				}, this);

				// 监测替换整个classObject
				watcher.watchAccess(path, function(last, old) {
					this.bindClassNameObject(node, last, old);
				}, this);
			}
			else {
				util.warn(path + ' for binding class must be a type of Object, String or Boolean!');
			}
		},

		/**
		 * 通过classObject批量绑定或移除class
		 * @param   {DOMElement}  node
		 * @param   {object}      classObject  [定义classname组合的json]
		 * @param   {Object}      oldObject    [旧classname组合的json]
		 */
		bindClassNameObject: function(node, classObject, oldObject) {
			// 新增值
			util.each(classObject, function(isAdd, cls) {
				updater.updateNodeClassName(node, isAdd, null, cls);
			}, this);

			// 移除旧值
			util.each(oldObject, function(isAdd, cls) {
				updater.updateNodeClassName(node, false, null, cls);
			}, this);
		},

		/**
		 * 绑定节点style
		 * @param   {DOMElement}  node
		 * @param   {String}      bindField   [数据绑定字段]
		 * @param   {String}      propperty   [行内样式属性]
		 * @param   {Array}       fors
		 */
		bindInlineStyle: function(node, bindField, propperty, fors) {
			var init = this.vm.getData(bindField);
			var isObject = util.isObject(init);
			var isString = util.isString(init);

			// styleString
			if (isString) {
				updater.updateNodeStyle(node, propperty, init);
			}
			// styleObject
			else if (isObject) {
				this.bindInlineStyleObject(node, init);
			}
			else {
				if (fors) {
					this.bindInlineStyleVfor(node, bindField, fors);
				}
				else {
					util.warn('model \'s '+ bindField + ' for binding style must be a type of Object or String!');
				}
				return;
			}

			this.watcher.add(bindField, function(path, last, old) {
				if (isObject) {
					// 替换整个styleObject，保留旧样式定义
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
		},

		/**
		 * inline-style in v-for
		 */
		bindInlineStyleVfor: function(node, bindField, fors) {
			var item = fors[0], index = fors[1], access = fors[2];
			var key = this.getVforKey(bindField), style = item[key];
			var replace, path = access + '*' + key, watcher = this.watcher;

			if (util.isString(style)) {
				replace = this.replaceVforIndex(style, index);

				if (replace) {
					style = replace;
				}
				else {
					// 监测访问路径
					watcher.watchAccess(path, function(last, old) {
						updater.updateNodeStyle(node, key, last);
					}, this);
				}

				updater.updateNodeStyle(node, key, style);
			}
			// styleObject
			else if (util.isObject(style)) {
				this.bindInlineStyleObject(node, style);

				// 监测单个字段修改
				util.each(style, function(value, propperty) {
					watcher.watchAccess(path + '*' + propperty, function(last, old) {
						updater.updateNodeStyle(node, propperty, last);
					}, this);
				}, this);

				// 监测替换整个styleObject
				watcher.watchAccess(path, function(last, old) {
					this.bindInlineStyleObject(node, last, old);
				}, this);
			}
			else {
				util.warn(path + ' for binding style must be a type of Object or String!');
			}
		},

		/**
		 * 通过styleObject批量绑定或移除行内样式
		 * @param   {DOMElement}  node
		 * @param   {object}      styleObject  [定义style组的json]
		 * @param   {object}      oldObject    [旧style组的json]
		 */
		bindInlineStyleObject: function(node, styleObject, oldObject) {
			// 新值
			util.each(styleObject, function(value, propperty) {
				updater.updateNodeStyle(node, propperty, value);
			}, this);

			// 移除旧值
			util.each(oldObject, function(value, propperty) {
				updater.updateNodeStyle(node, propperty, null);
			}, this);
		},

		/**
		 * 绑定节点属性
		 * @param   {DOMElement}  node
		 * @param   {String}      bindField  [数据绑定字段]
		 * @param   {String}      attr
		 * @param   {Array}       fors
		 */
		bindNormalAttribute: function(node, bindField, attr, fors) {
			var value, key, replace, item, index, path;

			if (fors) {
				item = fors[0], index = fors[1], path = fors[2];
				key = this.getVforKey(bindField);
				replace = this.replaceVforIndex(key, index);
				if (replace) {
					value = replace;
				}
				else {
					value = item[key];
					// 监测访问路径
					this.watcher.watchAccess(path + '*' + key, function(last, old) {
						updater.updateNodeAttribute(node, key, last);
					}, this);
				}
			}
			else {
				value = this.vm.getData(bindField);

				this.watcher.add(bindField, function(path, last) {
					updater.updateNodeAttribute(node, attr, last);
				}, this);
			}

			updater.updateNodeAttribute(node, attr, value);
		},

		/**
		 * v-on 动态绑定一个或多个事件
		 */
		parseVOn: function(node, value, attr) {
			var val, param, props;
			var evt = util.removeSpace(attr);
			var func = util.removeSpace(value);

			// 单个事件 v-on:click
			if (evt.indexOf(':') !== -1) {
				val = util.getStringKeyValue(evt);
				param = util.stringToParameters(func);
				this.parseOnEvent(node, param[0], param[1], val);
			}
			// 多个事件 v-on="{click: xxx, mouseenter: yyy, mouseleave: zzz}"
			else {
				props = util.jsonStringToArray(func);
				util.each(props, function(prop) {
					val = prop.name;
					param = util.stringToParameters(prop.value);
					this.parseOnEvent(node, param[0], param[1], val);
				}, this);
			}
		},

		/**
		 * 节点绑定事件
		 */
		parseVOnEvent: function(node, bindField, args, evt) {
			var init = this.vm.getData(bindField);
			updater.updateNodeEvent(node, evt, init, null, args, bindField);

			this.watcher.add(bindField, function(path, last, old) {
				updater.updateNodeEvent(node, evt, last, old, args, bindField);
			}, this);
		},

		/**
		 * v-model 表单控件双向绑定
		 */
		parseVModel: function(node) {
			var inputs = this.vm.$inputs;
			var tagName = node.tagName.toLowerCase();
			var type = tagName === 'input' ? this.getAttr(node, 'type') : tagName;

			if (inputs.indexOf(tagName) === -1) {
				util.warn('v-model only for use in ' + inputs.join(', '));
				return;
			}

			// 根据不同表单类型绑定数据监测方法
			switch (type) {
				case 'text'    :
				case 'textarea': this.parseVModelText.apply(this, arguments); break;
				case 'radio'   : this.parseVModelRadio.apply(this, arguments); break;
				case 'checkbox': this.parseVModelCheckbox.apply(this, arguments); break;
				case 'select'  : this.parseVModelSelect.apply(this, arguments); break;
			}
		},

		/**
		 * v-model for text, textarea
		 */
		parsevModelText: function(node, value) {
			var init = this.vm.getData(value);
			this.bindModelTextEvent(node, value);
			updater.updateNodeFormTextValue(node, init);

			this.watcher.add(value, function(path, last) {
				updater.updateNodeFormTextValue(node, last);
			}, this);
		},

		/**
		 * text, textarea绑定数据监测事件
		 * @param   {Input}   node
		 * @param   {String}  field
		 */
		bindvModelTextEvent: function(node, field) {
			var self = this, composeLock = false;

			// 解决中文输入时input事件在未选择词组时的触发问题
			// https://developer.mozilla.org/zh-CN/docs/Web/Events/compositionstart
			this.addEvent(node, 'compositionstart', function() {
				composeLock = true;
			});
			this.addEvent(node, 'compositionend', function() {
				composeLock = false;
			});

			// input事件(实时触发)
			this.addEvent(node, 'input', function() {
				if (!composeLock) {
					self.setData(field, this.value);
				}
			});

			// change事件(失去焦点触发)
			this.addEvent(node, 'change', function() {
				self.setData(field, this.value);
			});

			return this;
		},

		/**
		 * v-model for radio
		 */
		parseVModelRadio: function(node, value) {
			var init = this.vm.getData(value);
			this.bindModelRadioEvent(node, value);
			updater.updateNodeFormRadioChecked(node, init);

			this.watcher.add(value, function(path, last) {
				updater.updateNodeFormRadioChecked(node, last);
			}, this);
		},

		/**
		 * radio绑定数据监测事件
		 * @param   {Input}   node
		 * @param   {String}  field
		 */
		bindModelRadioEvent: function(node, field) {
			var self = this;

			this.addEvent(node, 'change', function() {
				self.setData(field, this.value);
			});

			return this;
		},

		/**
		 * v-model for checkbox
		 */
		parseVModelCheckbox: function(node, value) {
			var init = this.vm.getData(value);
			this.bindCheckboxEvent(node, value);
			updater.updateNodeFormCheckboxChecked(node, init);

			this.watcher.add(value, function() {
				updater.updateNodeFormCheckboxChecked(node, this.vm.getData(value));
			}, this);
		},

		/**
		 * checkbox绑定数据监测事件
		 * @param   {Input}   node
		 * @param   {String}  field
		 */
		bindCheckboxEvent: function(node, field) {
			var self = this;
			var array = this.vm.getData(field);

			this.addEvent(node, 'change', function() {
				var index, value = this.value, checked = this.checked;

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
					self.setData(field, checked);
				}
			});

			return this;
		},

		/**
		 * v-model for select
		 */
		parseVModelSelect: function(node, value) {
			var self = this;
			var options = node.options;
			var init = this.vm.getData(value);
			var multi = this.hasAttr(node, 'multiple');
			var option, i, leng = options.length, selects = [], isDefined;

			// 数据模型定义为单选
			if (util.isString(init)) {
				if (multi) {
					util.warn('select cannot be multiple when your model set \'' + value + '\' to noArray!');
					return;
				}
				isDefined = Boolean(init);
			}
			// 定义为多选
			else if (util.isArray(init)) {
				if (!multi) {
					util.warn('your model \'' + value + '\' cannot set as Array when select has no multiple propperty!');
					return;
				}
				isDefined = init.length > 0;
			}
			else {
				util.warn(value + ' must be a type of String or Array!');
				return;
			}

			// 数据模型中定义初始的选中状态
			if (isDefined) {
				updater.updateNodeFormSelectCheck(node, init, multi);
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

				this.setData(value, multi ? selects : selects[0]);
			}

			this.bindSelectEvent(node, value, multi);

			this.watcher.add(value, function() {
				updater.updateNodeFormSelectCheck(node, this.vm.getData(value), multi);
			}, this);
		},

		/**
		 * select绑定数据监测事件
		 * @param   {Select}   node
		 * @param   {String}   field
		 * @param   {Boolean}  multi
		 */
		bindSelectEvent: function(node, field, multi) {
			var self = this;

			this.addEvent(node, 'change', function() {
				var options = this.options;
				var i, option, leng = options.length, selects = [];

				for (i = 0; i < leng; i++) {
					option = options[i];
					if (option.selected) {
						selects.push(option.value);
					}
				}

				self.setData(field, multi ? selects : selects[0]);
			});

			return this;
		},

		/**
		 * v-for 基于源数据重复的动态列表
		 */
		parseVFor: function(node, value, attr, fors) {
			var match = value.match(/(.*) in (.*)/);
			var alias = match[1];
			var field = match[2];
			var scope = {}, level = 0;
			var watcher = this.watcher;
			var parent = node.parentNode;
			var key = this.getVforKey(field);
			var template, infos, array = this.vm.getData(field);

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

			parent.replaceChild(template, node);

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
		},

		/**
		 * 根据源数组构建循环板块集合
		 * @param   {DOMElement}  node   [重复节点]
		 * @param   {Array}       array  [源数组]
		 * @param   {String}      field  [访问路径]
		 * @param   {Object}      scope  [循环中对象取值范围]
		 * @param   {String}      alias  [当前循环对象别名]
		 * @param   {Number}      level  [当前循环层级]
		 * @return  {Fragment}           [板块集合]
		 */
		buildVforTemplate: function(node, array, field, scope, alias, level) {
			var fragments = util.createFragment();

			level++;

			// 构建重复片段
			util.each(array, function(item, index) {
				var path = field + '*' + index;
				var cloneNode = node.cloneNode(true);
				var fors = [item, index, path, scope, alias, level];

				// 缓存取值范围
				scope[alias] = item;
				// 解析/编译板块
				this.vm.parseElement(cloneNode, true, fors);
				// 定义私有标记属性
				util.defineProperty(cloneNode, '_vfor_alias', alias);

				fragments.appendChild(cloneNode);
			}, this);

			return fragments;
		},

		/**
		 * 数组操作同步更新vfor循环体
		 * @param   {DOMElement}  parent    [父节点]
		 * @param   {DOMElement}  node      [初始模板片段]
		 * @param   {Array}       newArray  [新的数据重复列表]
		 * @param   {String}      method    [数组操作]
		 * @param   {Array}       infos    [differ信息]
		 */
		differVfors: function(parent, node, newArray, method, infos) {
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
		},

		/**
		 * 获取vfor循环体的第一个子节点
		 * @param   {DOMElement}  parent  [父节点]
		 * @param   {String}      alias   [循环体对象别名]
		 * @return  {FirstChild}
		 */
		getVforFirstChild: function(parent, alias) {
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
		},

		/**
		 * 获取vfor循环体的最后一个子节点
		 * @param   {DOMElement}  parent   [父节点]
		 * @param   {String}      alias    [循环体对象别名]
		 * @return  {LastChild}
		 */
		getVforLastChild: function(parent, alias) {
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
		},

		/**
		 * 在循环体数组的最后追加一条数据 array.push
		 */
		pushVforArray: function(parent, node, newArray, method, infos) {
			var lastChild;
			var last = newArray.length - 1;
			var fragment = util.createFragment();
			var cloneNode = node.cloneNode(true);
			var field = infos[0], scope = infos[1], alias = infos[2], level = infos[3];
			var fors = [newArray[last], last, field + '*' + last, scope, alias, level];

			// 循环体定义
			scope[alias] = newArray[last];

			// 解析节点
			this.vm.parseElement(cloneNode, true, fors);
			fragment.appendChild(cloneNode);

			lastChild = this.getVforLastChild(parent, alias);
			parent.insertBefore(fragment, lastChild.nextSibling);
		},

		/**
		 * 在循环体数组最前面追加一条数据 array.unshift
		 */
		unshiftVforArray: function(parent, node, newArray, method, infos) {
			var firstChild;
			var fragment = util.createFragment();
			var cloneNode = node.cloneNode(true);
			var field = infos[0], scope = infos[1], alias = infos[2], level = infos[3];
			var fors = [newArray[0], 0, field + '*' + 0, scope, alias, level, method];

			// 循环体定义
			scope[alias] = newArray[0];

			// 解析节点
			this.vm.parseElement(cloneNode, true, fors);
			fragment.appendChild(cloneNode);

			firstChild = this.getVforFirstChild(parent, alias);
			parent.insertBefore(fragment, firstChild);
		},

		/**
		 * 重新编译循环体数组
		 */
		recompileVforArray: function(parent, node, newArray, method, infos) {
			var template, alias = infos[2];
			var childNodes = parent.childNodes;
			var flag, child, args = [node, newArray];

			// 重新构建循环板块
			util.AP.push.apply(args, infos);
			template = this.buildVforTemplate.apply(this, args);

			// 移除旧板块
			for (var i = 0; i < childNodes.length; i++) {
				child = childNodes[i];
				if (child._vfor_alias === alias) {
					if (!flag) {
						flag = child;
					}
					else {
						i--;
						parent.removeChild(child);
					}
				}
			}

			parent.replaceChild(template, flag);
		},

		/**
		 * 获取vfor中循环对象的键名
		 * @param   {String}  field
		 * @param   {Object}  item
		 * @return  {String}
		 */
		getVforKey: function(field) {
			var pos = field.lastIndexOf('.');
			return pos === -1 ? '' : field.substr(pos + 1);
		},

		/**
		 * 获取vfor中循环对象的值，当前循环取值或跨层级取值
		 */
		getVforValue: function(value, fors) {
			var splits = value.split('.');
			var sl = splits.length;
			var alias = splits[0], key = splits[sl - 1];
			var scopeMap = fors[3], scope = (scopeMap && scopeMap[alias]) || fors[0];
			return sl === 1 ? scope : scope[key];
		},

		/**
		 * 获取vfor中当前循环对象的监测访问路径
		 */
		getVforAccess: function(value, fors) {
			var path = fors[2], access;
			var splits, leng, level, key, suffix;

			if (value === '$index') {
				access = path;
			}
			else {
				splits = value.split('.');
				leng = splits.length;
				level = fors[5], alias = splits[0]
				key = splits[leng - 1]
				suffix = leng === 1 ? '' : '*' + key;
				access = alias === fors[4] ? (fors[2] + suffix) : (path.split('*', level).join('*') + suffix);
			}

			return access;
		},

		/**
		 * 替换vfor循环体表达式中的下标
		 * @param   {String}          expression
		 * @param   {String|Number}   index
		 * @return  {String}
		 */
		replaceVforIndex: function(expression, index) {
			return expression.indexOf('$index') === -1 ? null : expression.replace(/\$index/g, index);
		}
	}

	return Parser;
});