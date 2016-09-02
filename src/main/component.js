import ajax from './ajax';
import Module from './module';
import MVVM from '../mvvm/index';
import { addClass, setAttr, addEvent, removeEvent } from '../dom';
import {
	each,
	warn,
	isFunc,
	extend,
	hasOwn,
	isArray,
	isObject,
	isString,
	clearObject,
	createElement,
	stringToFragment
} from '../util';

/**
 * 设置/读取配置对象
 * @param  {Object}   data   [配置对象]
 * @param  {String}   name   [配置名称, 支持/分隔层次]
 * @param  {Mix}      value  [不传为读取配置信息]
 * @return {Mix}             [返回读取的配置值]
 */
function config (data, name, value) {
	if (name) {
		let ns = name.split('/');

		while (ns.length > 1 && hasOwn(data, ns[0])) {
			data = data[ns.shift()];
		}

		name = ns[0];
	} else {
		return data;
	}

	if (typeof value !== 'undefined') {
		data[name] = value;
		return true;
	} else {
		return data[name];
	}
}

/**
 * 事件 id 唯一计数
 * @type  {Number}
 */
let componentEventGuid = 1000;
let identifier = '__eventid__';


/**
 * Component 基础视图组件
 */
var Component = Module.extend({
	/**
	 * init 组件初始化
	 * @param  {Object}  config  [组件参数配置]
	 * @param  {Object}  parent  [父组件对象]
	 */
	init: function (config, parent) {
		this._config = this.cover(config, {
			/********* 组件位置定义 *********/
			'target' : null,  // 组件目标容器 <DOM|CssStringSelector>
			'replace': false, // 组件是否替换目标容器 <Boolean>

			/********* 组件属性定义 *********/
			'tag'  : 'div', // dom 元素的标签
			'css'  : null,  // 元素的 css <Object>
			'attr' : null,  // 元素的 attr <Object>
			'class': '',    // 元素的 class <String>

			/********* 组件布局定义 *********/
			'view'    : '',   // 视图布局内容 <HTMLString>
			'template': '',   // 静态模板 uri <UrlString>
			'tplParam': null, // 模板拉取请求参数 <Object>

			/********* 组件 MVVM 定义 *********/
			'model'   : null, // mvvm 数据模型对象 <Object>
			'methods' : null, // 事件声明函数对象  <Object>
			'computed': null, // mvvm 计算属性对象 <Object>
			'customs' : null, // 自定义指令刷新函数对象 <Object>

			/********* 声明式嵌套子组件定义 *********/
			'childs': null, // <Object>

			// 视图渲染完成后的回调函数
			'cbRender': 'afterRender'
		});

		// 组件元素
		this.el = null;
		// mvvm 实例
		this.vm = null;
		// 组件是否已经创建完成
		this.$ready = false;
		// DOM 事件绑定记录
		this.$listeners = {};

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
	 * 加载模板布局文件
	 */
	_loadTemplate: function () {
		var c = this.getConfig();
		var uri = c.template;

		ajax.load(uri, c.tplParam, function (err, data) {
			var view;

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
	 * 渲染组件视图、初始化配置
	 */
	_render: function () {
		// 判断是否已创建过
		if (this.$ready) {
			return this;
		}

		this.$ready = true;

		var c = this.getConfig();

		var target = c.target;
		var isAppend = target instanceof HTMLElement;

		if (isAppend) {
			this.el = createElement(c.tag);
		} else {
			this.el = document.querySelector(target);
		}

		// 添加 class
		var cls = c.class;
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
			this.el.appendChild(stringToFragment(c.view));
		}

		// 初始化 mvvm 对象
		var model = c.model;
		if (isObject(model)) {
			this.vm = new MVVM({
				'view'    : this.el,
				'model'   : model,
				'methods' : c.methods,
				'computed': c.computed,
				'customs' : c.customs,
				'context' : this
			});
		}

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
		var cb = this[c.cbRender];
		if (isFunc(cb)) {
			cb.call(this);
		}
	},

	/**
	 * 批量创建子组件
	 * @param   {Function}  ChildComp  [子组件类]
	 * @param   {String}    symbol     [子组件名称]
	 */
	_buildBatchChilds: function (ChildComp, symbol) {
		var target = this.queryAll(symbol.toLowerCase());

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
	 * 创建一个子组件实例
	 * @param   {DOMElement}  target
	 * @param   {String}      childName
	 * @param   {Function}    ChildComp
	 */
	_createChild: function (target, childName, ChildComp) {
		// 默认全部替换子组件标记
		var childConfig = { target, 'replace': true };

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
	 * 组件销毁后的回调函数
	 */
	_afterDestroy: function () {
		var vm = this.vm;
		var el = this.el;
		var parent = el.parentNode;

		// 销毁 mvvm 实例
		if (vm) {
			vm.destroy();
		}

		// 销毁 dom 对象
		if (parent) {
			parent.removeChild(el);
		}

		this.el = this.vm = null;
		clearObject(this.$listeners);
	},

	/**
	 * 组件配置参数合并、覆盖
	 * @param  {Object}  child   [子类组件配置参数]
	 * @param  {Object}  parent  [父类组件配置参数]
	 * @return {Object}          [合并后的配置参数]
	 */
	cover: function (child, parent) {
		if (!parent) {
			warn('Failed to cover config, 2 arguments required');
		}
		return extend(true, {}, parent, child);
	},

	/**
	 * 获取组件配置参数
	 * @param  {String}  name  [参数字段名称，支持/层级]
	 */
	getConfig: function (name) {
		return config(this._config, name);
	},

	/**
	 * 设置组件配置参数
	 * @param {String}  name   [配置字段名]
	 * @param {Mix}     value  [值]
	 */
	setConfig: function (name, value) {
		return config(this._config, name, value);
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
	 * 元素添加绑定事件
	 */
	on: function (node, type, callback, capture) {
		var self = this;
		var guid = componentEventGuid++;

		if (isString(callback)) {
			callback = this[callback];
		}

		callback[identifier] = guid;
		var eventAgent = function (e) {
			callback.call(self, e);
		}

		this.$listeners[guid] = eventAgent;
		addEvent(node, type, eventAgent, capture);
	},

	/**
	 * 元素解除绑定事件
	 */
	off: function (node, type, callback, capture) {
		if (isString(callback)) {
			callback = this[callback];
		}

		var guid = callback[identifier];
		var eventAgent = this.$listeners[guid];
		if (eventAgent) {
			removeEvent(node, type, eventAgent, capture);
		}
	}
});

export default Component;
