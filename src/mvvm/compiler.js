import { DirectiveParsers } from './directives/index';
import { createObserver, setComputedProperty } from './observe/index';
import { def, each, warn, isObject, isFunc, nodeToFragment } from '../util';
import { hasAttr, isElement, isTextNode, removeAttr, empty, getAttr } from '../dom';

const regNewline = /\n/g;
const regText = /\{\{(.+?)\}\}/g;
const regMustache = /(\{\{.*\}\})/;
const noNeedParsers = ['velse', 'vpre', 'vcloak', 'vonce', 'vhook'];

/**
 * 是否是合法指令
 * @param   {String}   directive
 * @return  {Boolean}
 */
function isDirective (directive) {
	return directive.indexOf('v-') === 0;
}

/**
 * 是否是 v-once 指令
 * 节点以及所有子节点的指令只渲染，无数据绑定
 * @param   {Element}  node
 * @return  {Boolean}
 */
function isOnceNode (node) {
	return isElement(node) && hasAttr(node, 'v-once');
}

/**
 * 节点的子节点是否延迟编译
 * 单独处理 vif, vfor 和 vpre 子节点的编译
 * @param   {Element}  node
 * @return  {Boolean}
 */
function hasLateCompileChilds (node) {
	return hasAttr(node, 'v-if') || hasAttr(node, 'v-for') || hasAttr(node, 'v-pre');
}

/**
 * 节点是否含有合法指令
 * @param   {Element}  node
 * @return  {Number}
 */
function hasDirective (node) {
	if (isElement(node) && node.hasAttributes()) {
		let nodeAttrs = node.attributes;

		for (let i = 0; i < nodeAttrs.length; i++) {
			if (isDirective(nodeAttrs[i].name)) {
				return true;
			}
		}

	} else if (isTextNode(node) && regMustache.test(node.textContent)) {
		return true;
	}
}

/**
 * 获取指令信息
 * @param   {Attr}    attribute
 * @return  {Object}
 */
function getDirectiveDesc (attribute) {
	let attr = attribute.name;
	let expression = attribute.value;
	let directive, args, pos = attr.indexOf(':');

	if (pos > -1) {
		args = attr.substr(pos + 1);
		directive = attr.substr(0, pos);
	} else {
		directive = attr;
	}

	return { args, attr, directive, expression };
}

/**
 * 缓存指令钩子函数名称
 * @param  {Elemnt}  node
 */
function saveDirectiveHooks (node) {
	if (!node.__afterHook__) {
		def(node, '__afterHook__', getAttr(node, 'v-hook:after'));
	}

	if (!node.__beforeHook__) {
		def(node, '__beforeHook__', getAttr(node, 'v-hook:before'));
	}
}

/**
 * 统一变更回调函数
 * 保证多个相同依赖的变更只触发一次
 * @param   {Function}  func
 * @param   {Object}    context
 * @return  {Function}
 */
function makeUnifyCallback (func, context) {
	let _path, _newVal, _oldVal;
	return function (param, newVal, oldVal) {
		let path = param.path;
		if (path !== _path || newVal !== _newVal || oldVal !== _oldVal) {
			func.apply(context, arguments);
			_path = path;
			_newVal = newVal;
			_oldVal = oldVal;
		}
	}
}


/**
 * ViewModel 编译模块
 * @param  {Object}  option  [参数对象]
 */
function Compiler (option) {
	let model = option.model;
	let element = option.view;
	let computed = option.computed;
	let watchAll = option.watchAll;

	if (!isElement(element)) {
		return warn('view must be a type of DOMElement: ', element);
	}

	if (!isObject(model)) {
		return warn('model must be a type of Object: ', model);
	}

	// 编译节点缓存队列
	this.$queue = [];
	// 数据模型对象
	this.$data = model;
	// 缓存根节点
	this.$element = element;
	// DOM 注册索引
	this.$regEles = {};
	// 指令实例缓存
	this.$directives = [];
	// 钩子和统一回调作用域
	this.$context = option.context || this;

	// 监测数据模型
	this.$ob = createObserver(this.$data);
	// 设置计算属性
	if (computed) {
		setComputedProperty(this.$data, computed);
	}

	// 编译完成后的回调集合
	this.$afters = [];
	// v-if, v-for DOM 插删钩子函数
	this.$hooks = option.hooks || {};
	// 自定义指令刷新函数
	this.$customs = option.customs || {};
	// 监听变更统一回调
	this.$unifyCb = isFunc(watchAll) ? makeUnifyCallback(watchAll, this.$context) : null;

	// 是否立刻编译根元素
	if (!option.lazy) {
		this.mount();
	}
}

let cp = Compiler.prototype;

/**
 * 挂载/编译根元素
 */
cp.mount = function () {
	this.$done = false;
	this.$fragment = nodeToFragment(this.$element);
	this.compile(this.$fragment, true);
}

/**
 * 收集节点所有需要编译的指令
 * 并在收集完成后编译指令队列
 * @param  {Element}  element  [编译节点]
 * @param  {Boolean}  root     [是否是根节点]
 * @param  {Object}   scope    [vfor 取值域]
 * @param  {Boolean}  once     [是否只渲染首次]
 */
cp.compile = function (element, root, scope, once) {
	let children = element.childNodes;
	let parentOnce = !!once || isOnceNode(element);

	if (root && hasDirective(element)) {
		this.$queue.push([element, scope]);
	}

	def(element, '__vonce__', parentOnce);

	for (let i = 0; i < children.length; i++) {
		let node = children[i];
		let nodeType = node.nodeType;

		// 指令只能应用在文本或元素节点
		if (nodeType !== 1 && nodeType !== 3) {
			continue;
		}

		let selfOnce = parentOnce || isOnceNode(node);

		if (hasDirective(node)) {
			this.$queue.push([node, scope]);
			def(node, '__vonce__', selfOnce);
		}

		if (node.hasChildNodes() && !hasLateCompileChilds(node)) {
			this.compile(node, false, scope, selfOnce);
		}
	}

	if (root) {
		this.compileAll();
	}
}

/**
 * 编译节点缓存队列
 */
cp.compileAll = function () {
	each(this.$queue, function (tuple) {
		this.compileNode(tuple);
		return null;
	}, this);

	this.completed();
}

/**
 * 收集并编译节点指令
 * @param  {Array}  tuple  [node, scope]
 */
cp.compileNode = function (tuple) {
	let node = tuple[0];
	let scope = tuple[1];

	if (isElement(node)) {
		let vfor, attrs = [];
		let hasModel, hasBind, index;
		let nodeAttrs = node.attributes;

		for (let i = 0; i < nodeAttrs.length; i++) {
			let attr = nodeAttrs[i];
			let name = attr.name;

			// 收集合法指令
			if (isDirective(name)) {
				if (name === 'v-for') {
					vfor = attr;
				} else if (name === 'v-model') {
					hasModel = true;
					index = attrs.length;
				} else if (name.indexOf('v-bind') === 0) {
					hasBind = true;
				} else if (name.indexOf('v-hook') === 0) {
					saveDirectiveHooks(node);
				}

				attrs.push(attr);
			}
		}

		// 当 v-bind 和 v-model 共存时，即使 v-model 写在 v-bind 的后面
		// 在 IE9+ 和 Edge 中遍历 attributes 时 v-model 仍然会先于 v-bind
		// 所以当二者共存时，v-model 需要放到最后编译以保证表单 value 的正常获取
		/* istanbul ignore next */
		if (
			!vfor &&
			hasBind &&
			hasModel &&
			attrs.length > 1 &&
			(index !== attrs.length - 1)
		) {
			let vmodel = attrs.splice(index, 1)[0];
			attrs.push(vmodel);
			vmodel = null;
		}

		// vfor 指令与其他指令共存时只需编译 vfor
		if (vfor) {
			def(node, '__dirs__', attrs.length);
			attrs = [vfor];
			vfor = null;
		}

		// 解析节点指令
		each(attrs, function (attribute) {
			this.parse(node, attribute, scope);
		}, this);

	} else if (isTextNode(node)) {
		this.parseText(node, scope);
	}
}

/**
 * 解析元素节点指令
 * @param  {Element}  node
 * @param  {Object}   attr
 * @param  {Object}   scope
 */
cp.parse = function (node, attr, scope) {
	let once = node.__vonce__;
	let desc = getDirectiveDesc(attr);
	let directive = desc.directive;

	let dir = 'v' + directive.substr(2);
	let Parser = DirectiveParsers[dir];

	// 移除指令标记
	removeAttr(node, desc.attr);

	// 不需要实例化解析的指令
	if (noNeedParsers.indexOf(dir) > -1) {
		return;
	}

	if (Parser) {
		desc.once = once;
		let dirParser = new Parser(this, node, desc, scope);

		if (once) {
			dirParser.destroy();
		} else if (!scope) {
			this.$directives.push(dirParser);
		}
	} else {
		warn('[' + directive + '] is an unknown directive!');
	}
}

/**
 * 解析文本指令 {{ text }}
 * @param  {Element}  node
 * @param  {Object}   scope
 */
cp.parseText = function (node, scope) {
	let tokens = [], desc = {};
	let once = node.parentNode && node.parentNode.__vonce__;
	let text = node.textContent.trim().replace(regNewline, '');

	let pieces = text.split(regText);
	let matches = text.match(regText);

	// 文本节点转化为常量和变量的组合表达式
	// 'a {{b}} c' => '"a " + b + " c"'
	each(pieces, function (piece) {
		if (matches.indexOf('{{' + piece + '}}') > -1) {
			tokens.push('(' + piece + ')');
		} else if (piece) {
			tokens.push('"' + piece + '"');
		}
	});

	desc.once = once;
	desc.expression = tokens.join('+');

	let directive = new DirectiveParsers.vtext(this, node, desc, scope);

	if (once) {
		directive.destroy();
	} else if (!scope) {
		this.$directives.push(directive);
	}
}

/**
 * 停止编译节点的剩余指令
 * 如含有其他指令的 vfor 节点
 * 应保留指令信息并放到循环列表中编译
 * @param  {Element}  node
 */
cp.block = function (node) {
	each(this.$queue, function (tuple) {
		if (node === tuple[0]) {
			return null;
		}
	});
}

/**
 * 添加编译完成后的回调函数
 * @param  {Function}  callback
 * @param  {Object}    context
 */
cp.after = function (callback, context) {
	this.$afters.push([callback, context]);
}

/**
 * 检查根节点是否编译完成
 */
cp.completed = function () {
	if (this.$queue.length === 0 && !this.$done) {
		this.$done = true;
		this.$element.appendChild(this.$fragment);

		// 触发编译完成后的回调函数
		each(this.$afters, function (after) {
			after[0].call(after[1]);
			return null;
		});
	}
}

/**
 * 销毁函数，销毁指令，清空根节点
 */
cp.destroy = function () {
	this.$data = null;
	empty(this.$element);
	each(this.$directives, function (directive) {
		directive.destroy();
		return null;
	});
}

export default Compiler;
