import ajax from './ajax';
import Module from './module';
import MVVM from '../mvvm/index';
import DOM, { addClass, setAttr, addEvent, removeEvent } from '../dom';
import {
	each,
	warn,
	config,
	isFunc,
	extend,
	isArray,
	isObject,
	isString,
	_toString,
	clearObject,
	createElement
} from '../util';

/**
 * 事件 id 唯一计数
 * @type  {Number}
 */
let componentEventGuid = 1000;
let identifier = '__eventid__';


/**
 * Component 基础视图组件
 */
let Component = Module.extend({
	/**
	 * init 组件初始化
	 * @param  {Object}  config  [组件参数配置]
	 * @param  {Object}  parent  [父组件对象]
	 */
	init: function (config) {
		this.__config__ = extend(true, {
			/********* 组件位置定义 *********/
			target: null, // 组件目标容器 <DOM|CssStringSelector>
			replace: false, // 组件是否替换目标容器 <Boolean>

			/********* 组件属性定义 *********/
			tag: 'div', // dom 元素的标签
			css: null, // 元素的 css <Object>
			attr: null, // 元素的 attr <Object>
			class: '', // 元素的 class <String>

			/********* 组件布局定义 *********/
			view: '', // 视图布局内容 <HTMLString>
			template: '', // 静态模板 uri <UrlString>
			tplParam: null, // 模板拉取请求参数 <Object>

			/********* 组件 MVVM 定义 *********/
			model: null,  // mvvm 数据模型对象 <Object>
			methods: null,  // 事件声明函数对象  <Object>
			watches: null,  // 批量 watch 数据对象  <Object>
			watchAll: null,  // model 变化统一回调函数  <Function>
			computed: null,  // mvvm 计算属性对象 <Object>
			customs: null,  // 自定义指令刷新函数对象 <Object>
			hooks: null,  // DOM 增删钩子函数对象 <Object>
			lazy: false, // 是否手动编译根元素 <Boolean>

			/********* 声明式嵌套子组件定义 *********/
			childs: null, // <Object>

			// 视图渲染完成后的回调函数
			cbRender: 'afterRender'
		}, config);

		// 组件元素
		this.el = null;
		// mvvm 实例
		this.vm = null;
		// 通用 DOM 处理方法
		this.$ = new DOM();

		// (Private) 组件初始显示状态
		this.__visible__ = '';
		// (Private) 组件是否已经创建完成
		this.__ready__ = false;
		// (Private) DOM 事件绑定记录
		this.__listeners__ = {};

		// 调用渲染前函数
		if (isFunc(this.beforeRender)) {
			this.beforeRender();
		}

		// 拉取模板
		if (this.getConfig('template')) {
			this._loadTemplate();
		} else {
			this._render();
		}
	},

	/**
	 * (Private) 加载模板布局文件
	 */
	_loadTemplate: function () {
		let c = this.getConfig();
		let uri = c.template;

		ajax.load(uri, c.tplParam, function (err, data) {
			let view;

			if (err) {
				view = err.status + ': ' + uri;
				warn(err);
			} else {
				view = data.result;
			}

			this.setConfig('view', view);
			this._render();
		}, this);
	},

	/**
	 * (Private) 渲染组件视图、初始化配置
	 */
	_render: function () {
		// 判断是否已创建过
		if (this.__ready__) {
			return this;
		}

		this.__ready__ = true;

		let c = this.getConfig();

		let target = c.target;
		let isAppend = target instanceof HTMLElement;

		// 组件 el 创建
		if (isAppend) {
			this.el = createElement(c.tag);
		} else {
			this.el = document.querySelector(target);
		}

		// 添加 class
		let cls = c.class;
		if (cls && isString(cls)) {
			each(cls.split(' '), function (classname) {
				addClass(this.el, classname);
			}, this);
		}

		// 添加 css
		if (isObject(c.css)) {
			each(c.css, function (value, property) {
				this.el.style[property] = value;
			}, this);
		}

		// 添加 attr
		if (isObject(c.attr)) {
			each(c.attr, function (value, name) {
				setAttr(this.el, name, value);
			}, this);
		}

		// 添加页面视图布局
		if (c.view) {
			this.el.innerHTML = _toString(c.view);
		}

		// 初始化 mvvm 对象
		let model = c.model;
		if (isObject(model)) {
			this.vm = new MVVM({
				view: this.el,
				model: model,
				methods: c.methods,
				watches: c.watches,
				watchAll: c.watchAll,
				computed: c.computed,
				customs: c.customs,
				hooks: c.hooks,
				context: this,
				lazy: c.lazy
			});
		}

		// 组件初始显示状态
		let display = this.el.style.display;
		this.__visible__ = display === 'none' ? '' : display;

		// 创建子组件
		each(c.childs, this._buildBatchChilds, this);

		// 追加到目标容器
		if (isAppend) {
			if (c.replace) {
				target.parentNode.replaceChild(this.el, target);
			} else {
				target.appendChild(this.el);
			}
		}

		// 组件视图渲染完成回调方法
		let cb = this[c.cbRender];
		if (isFunc(cb)) {
			cb.call(this);
		}
	},

	/**
	 * (Private) 批量创建子组件
	 * @param   {Function}  ChildComp  [子组件类]
	 * @param   {String}    symbol     [子组件名称]
	 */
	_buildBatchChilds: function (ChildComp, symbol) {
		let target = this.queryAll(symbol.toLowerCase());

		if (!target.length) {
			target = this.queryAll('[name='+ symbol +']');
		}

		switch (target.length) {
			case 0:
				warn('Cannot find target element for sub component ['+ symbol +']');
				break;
			case 1:
				this._createChild(target[0], symbol, ChildComp);
				break;
			default: {
				for (let i = 0; i < target.length; i++) {
					this._createChild(target[i], symbol + i, ChildComp);
				}
			}
		}
	},

	/**
	 * (Private) 创建一个子组件实例
	 * @param   {DOMElement}  target
	 * @param   {String}      childName
	 * @param   {Function}    ChildComp
	 */
	_createChild: function (target, childName, ChildComp) {
		// 默认全部替换子组件标记
		let childConfig = { target, 'replace': true };

		// 直接传入子组件
		if (isFunc(ChildComp)) {
			this.create(childName, ChildComp, childConfig);
		}
		// 传子组件和其配置参数 [component, config]
		else if (isArray(ChildComp)) {
			this.create(childName, ChildComp[0], extend(ChildComp[1], childConfig));
		}
	},

	/**
	 * (Private) 组件销毁后的回调函数
	 */
	_afterDestroy: function () {
		let vm = this.vm;
		let el = this.el;
		let parent = el.parentNode;

		// 销毁 mvvm 实例
		if (vm) {
			vm.destroy();
		}

		// 销毁 dom 对象
		if (parent) {
			parent.removeChild(el);
		}

		this.el = this.vm = null;
		clearObject(this.__listeners__);
	},

	/**
	 * 获取组件配置参数
	 * @param  {String}  name  [参数字段名称，支持/层级]
	 */
	getConfig: function (name) {
		return config(this.__config__, name);
	},

	/**
	 * 设置组件配置参数
	 * @param {String}  name   [配置字段名]
	 * @param {Mix}     value  [值]
	 */
	setConfig: function (name, value) {
		return config(this.__config__, name, value);
	},

	/**
	 * 返回当前组件中第一个匹配特定选择器的元素
	 * @param  {String}     selector  [子元素选择器]
	 * @return {DOMObject}
	 */
	query: function (selector) {
		return this.el.querySelector(selector);
	},

	/**
	 * 返回当前组件中匹配一个特定选择器的所有的元素
	 * @param  {String}    selectors  [子元素选择器]
	 * @return {NodeList}
	 */
	queryAll: function (selectors) {
		return this.el.querySelectorAll(selectors);
	},

	/**
	 * 显示组件
	 */
	show: function () {
		this.el.style.display = this.__visible__;
		return this;
	},

	/**
	 * 隐藏组件
	 */
	hide: function () {
		this.el.style.display = 'none';
		return this;
	},

	/**
	 * 元素添加绑定事件
	 */
	on: function (node, type, callback, capture) {
		let self = this;
		let guid = componentEventGuid++;

		if (isString(callback)) {
			callback = this[callback];
		}

		callback[identifier] = guid;
		let eventAgent = function (e) {
			callback.call(self, e);
		}

		this.__listeners__[guid] = eventAgent;
		addEvent(node, type, eventAgent, capture);

		return this;
	},

	/**
	 * 元素解除绑定事件
	 */
	off: function (node, type, callback, capture) {
		if (isString(callback)) {
			callback = this[callback];
		}

		let guid = callback[identifier];
		let eventAgent = this.__listeners__[guid];
		if (eventAgent) {
			removeEvent(node, type, eventAgent, capture);
		}

		return this;
	}
});

export default Component;
