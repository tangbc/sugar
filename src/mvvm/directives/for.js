import { hasAttr } from '../../dom';
import { observe } from '../observe/index';
import Parser, { linkParser } from '../parser';
import { warn, createFragment, each, def, isFunc } from '../../util';

const vforAlias = '__vfor__';
const vforGuid = '__vforid__';
const regForExp = /(.*) (?:in|of) (.*)/;
const partlyMethods = 'push|pop|shift|unshift|splice'.split('|');

/**
 * 获取添加前和删除后的钩子函数
 * @param   {Object}   vm
 * @param   {Element}  node
 * @return  {Object}
 */
export function getHooks (vm, node) {
	let after, before;
	let hooks = vm.$hooks;
	let afterHook = node.__afterHook__;
	let beforeHook = node.__beforeHook__;

	if (afterHook) {
		after = hooks[afterHook];
	}

	if (beforeHook) {
		before = hooks[beforeHook];
	}

	return { after, before };
}

/**
 * 生成一段不重复的 id
 * @return  {String}
 */
function makeVforGuid () {
	return Math.random().toString(36).substr(2);
}


/**
 * v-for 指令解析模块
 */
export function VFor () {
	Parser.apply(this, arguments);
}

let vfor = linkParser(VFor);

/**
 * 解析 v-for 指令
 */
vfor.parse = function () {
	let el = this.el;
	let desc = this.desc;
	let parent = el.parentNode;
	let expression = desc.expression;
	let match = expression.match(regForExp);

	if (!match) {
		return warn('The format of v-for must be like "item in/of items"!');
	}

	if (parent.nodeType !== 1) {
		return warn('v-for cannot use in the root element!');
	}

	if (hasAttr(el, 'v-if')) {
		return warn('Do not use v-if and v-for on the same element! Consider filtering the source Array instead.');
	}

	let alias = match[1];
	let iterator = match[2];

	this.length = 0;
	this.scopes = [];
	this.init = true;
	this.alias = alias;
	this.partly = false;
	this.partlyArgs = [];

	this.$parent = parent;
	this.end = el.nextSibling;
	this.start = el.previousSibling;

	this.bodyDirs = el.__dirs__;
	this.tpl = el.cloneNode(true);
	this.hooks = getHooks(this.vm, el);
	this.isOption = el.tagName === 'OPTION' && parent.tagName === 'SELECT';

	desc.expression = iterator;
	this.bind();
	this.updateModel();
}

/**
 * 更新 select 绑定
 */
vfor.updateModel = function () {
	if (this.isOption) {
		let selectModel = this.$parent.__vmodel__;
		if (selectModel) {
			selectModel.forceUpdate();
		}
	}
}

/**
 * 调用状态钩子函数
 * @param  {String}   type   [钩子类型]
 * @param  {Element}  frag   [元素板块]
 * @param  {Number}   index  [下标]
 */
vfor.hook = function (type, frag, index) {
	let hook = this.hooks[type];
	if (isFunc(hook)) {
		hook.call(this.vm.$context, frag, index, frag[vforGuid]);
		frag = null;
	}
}

/**
 * 更新视图
 * @param  {Array}    newArray   [新数组]
 * @param  {Array}    oldArray   [旧数组]
 * @param  {Boolean}  fromDeep   [数组内部更新]
 * @param  {Object}   methodArg  [数组操作参数信息]
 */
vfor.update = function (newArray, oldArray, fromDeep, methodArg) {
	this.length = newArray && newArray.length;

	// 初始化列表
	if (this.init) {
		this.$parent.replaceChild(this.buildList(newArray), this.el);
		this.el = null;
		this.init = false;
	} else {
		// 数组操作部分更新
		if (methodArg && partlyMethods.indexOf(methodArg.method) > -1) {
			this.partly = true;
			this.updatePartly(newArray, methodArg);
			this.partly = false;
		} else {
			this.recompileList(newArray);
			this.updateModel();
		}
	}
}

/**
 * 数组操作部分更新列表
 * @param  {Array}   list
 * @param  {Object}  arg
 */
vfor.updatePartly = function (list, arg) {
	let partlyArgs = [];
	let args = arg.args;
	let method = arg.method;
	let scopes = this.scopes;

	// 更新处理 DOM 片段
	this[method].call(this, list, args);

	// 更新 scopes
	switch (method) {
		case 'pop':
		case 'shift':
			break;
		case 'push':
		case 'unshift':
			partlyArgs = this.partlyArgs;
			break;
		case 'splice':
			partlyArgs = args.slice(0, 2);
			Array.prototype.push.apply(partlyArgs, this.partlyArgs);
			break;
	}

	scopes[method].apply(scopes, partlyArgs);
	this.partlyArgs.length = 0;

	// 同步更新下标序号
	each(scopes, function (scope, index) {
		scope.$index = index;
	});
}

/**
 * 重新构建列表
 * @param  {Array}  list
 */
vfor.recompileList = function (list) {
	let count = 0;
	let parent = this.$parent;
	let childs = parent.childNodes;

	// 清空循环列表
	for (let i = 0; i < childs.length; i++) {
		let child = childs[i];
		if (child[vforAlias] === this.alias) {
			this.hook('before', child, count++);
			parent.removeChild(child);
			i--;
		}
	}

	// 移除所有取值域缓存
	this.scopes.length = 0;

	let listFragment = this.buildList(list);
	parent.insertBefore(listFragment, this.end);
}

/**
 * 构建循环板块
 * @param   {Array}     list        [列表数组]
 * @param   {Number}    startIndex  [下标起点]
 * @return  {Fragment}
 */
vfor.buildList = function (list, startIndex) {
	let vm = this.vm;
	let tpl = this.tpl;
	let start = startIndex || 0;
	let listFragment = createFragment();
	let iterator = this.directive.watcher.value;

	each(list, function (item, i) {
		let index = start + i;
		let alias = this.alias;
		let frag = tpl.cloneNode(true);
		let parentScope = this.scope || vm.$data;
		let scope = Object.create(parentScope);

		scope.$parent = parentScope;

		// 绑定别名
		observe(scope, alias, item);
		// 绑定下标
		observe(scope, '$index', index);

		// 挂载别名
		def(scope, '__alias__', alias);
		// 挂载迭代器
		def(scope, '__viterator__', iterator);

		if (this.partly) {
			this.partlyArgs.push(scope);
		} else {
			this.scopes.push(scope);
		}

		// 阻止重复编译除 vfor 以外的指令
		if (this.init && this.bodyDirs > 1) {
			vm.block(this.el);
		}

		// 片段挂载别名
		def(frag, vforAlias, alias);
		// 挂载唯一 id
		def(frag, vforGuid, makeVforGuid());

		// 编译片段
		vm.compile(frag, true, scope, this.desc.once);

		listFragment.appendChild(frag);

		this.hook('after', frag, index);
	}, this);

	return listFragment;
}

/**
 * 获取完整的列表数据
 * @return  {Array}
 */
vfor.getChilds = function () {
	let list = [];
	let childs = this.$parent.childNodes;

	for (let i = 0; i < childs.length; i++) {
		let child = childs[i];

		if (child[vforAlias] === this.alias) {
			list.push(child);
		}
	}

	return list;
}

/**
 * 获取循环列表第一项
 * @return  {Element}
 */
vfor.getFirst = function () {
	let start = this.start;
	return start && start.nextSibling || this.$parent.firstChild;
}

/**
 * 获取循环列表最后一项
 * @return  {Element}
 */
vfor.getLast = function () {
	let end = this.end;
	return end && end.previousSibling || this.$parent.lastChild;
}

/**
 * 获取循环列表指定下标项
 * @param   {Number}    index
 * @return  {Element}
 */
vfor.getChild = function (index) {
	return this.getChilds()[index] || null;
}

/**
 * 删除一条选项
 * @param  {Element}  child
 */
vfor.removeChild = function (child) {
	if (child) {
		this.$parent.removeChild(child);
	}
}

/**
 * 删除循环列表的第一个元素 array.shift()
 */
vfor.shift = function () {
	let first = this.getFirst();
	if (first) {
		this.hook('before', first, 0);
		this.removeChild(first);
	}
}

/**
 * 删除循环列表的最后一个元素 array.pop()
 */
vfor.pop = function () {
	let last = this.getLast();
	if (last) {
		this.hook('before', last, this.length);
		this.removeChild(last);
	}
}

/**
 * 在循环列表结尾追加元素 array.push(item)
 * @param  {Array}  list
 * @param  {Array}  args
 */
vfor.push = function (list, args) {
	let item = this.buildList(args, list.length - 1);
	this.$parent.insertBefore(item, this.end);
}

/**
 * 在循环列表开头追加元素 array.unshift(item)
 * @param  {Array}  list
 * @param  {Array}  args
 */
vfor.unshift = function (list, args) {
	let first = this.getFirst();
	let item = this.buildList(args, 0);
	this.$parent.insertBefore(item, first);
}

/**
 * 循环列表的增删改 splice(start, deleteCount, inserts)
 * @param  {Array}  list
 * @param  {Array}  args
 */
vfor.splice = function (list, args) {
	// 从数组的哪一位开始修改内容。如果超出了数组的长度，则从数组末尾开始添加内容。
	let start = args[0];
	// 整数，表示要移除的数组元素的个数。
	// 如果 deleteCount 是 0，则不移除元素。这种情况下，至少应添加一个新元素。
	// 如果 deleteCount 大于 start 之后的元素的总数，则从 start 后面的元素都将被删除（含第 start 位）。
	let deleteCont = args[1];
	// 要添加进数组的元素。如果不指定，则 splice() 只删除数组元素。
	let insertItems = args.slice(2);
	let insertLength = insertItems.length;

	// 不删除也不添加
	if (deleteCont === 0 && !insertLength) {
		return;
	}

	// 只删除 splice(2, 1);
	let deleteOnly = deleteCont && !insertLength;
	// 只插入 splice(2, 0, 'xxx')
	let insertOnly = !deleteCont && insertLength;
	// 删除并插入 splice(2, 1, 'xxx')
	let deleAndInsert = deleteCont && insertLength;

	// 删除指定选项
	if (deleteOnly || deleAndInsert) {
		let oldList = this.getChilds();
		each(oldList, function (child, index) {
			// 删除范围内
			if (index >= start && index < start + deleteCont) {
				this.hook('before', child, index);
				this.removeChild(child);
			}
		}, this);
		oldList = null;
	}

	// 只插入 或 删除并插入
	if (insertOnly || deleAndInsert) {
		// 开始的元素
		let startItem = this.getChild(start) || this.end;
		// 新增列表
		let listFrag = this.buildList(insertItems, start);
		// 更新新增部分
		this.$parent.insertBefore(listFrag, startItem);
	}
}
