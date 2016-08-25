import { observe } from '../observe/index';
import Parser, { linkParser } from '../parser';
import { warn, createFragment, each, defRec, copy } from '../../util';

const vforAlias = '__vfor__';
const regForExp = /(.*) (?:in|of) (.*)/;
const partlyMethods = 'push|pop|shift|unshift|splice'.split('|');

/**
 * 标记 vfor 节点特征字段
 * @param   {Element}  node
 * @param   {String}   feature  [特征字段]
 * @param   {String}   value    [特征值]
 */
function markVforFeature (node, feature, value) {
	defRec(node, feature, value);
}


/**
 * v-for 指令解析模块
 */
export function VFor () {
	Parser.apply(this, arguments);
}

var vfor = linkParser(VFor);

/**
 * 解析 v-for 指令
 */
vfor.parse = function () {
	var el = this.el;
	var desc = this.desc;
	var parent = el.parentNode;
	var expression = desc.expression;
	var match = expression.match(regForExp);

	if (!match) {
		return warn('The format of v-for must be like "item in/of items"!');
	}

	var alias = match[1];
	var iterator = match[2];

	this.scopes = [];
	this.init = true;
	this.alias = alias;
	this.partly = false;
	this.partlyArgs = [];
	this.$parent = parent;
	this.$next = el.nextSibling;
	this.$prev = el.previousSibling;
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
		let model = this.$parent.__vmodel__;
		if (model) {
			model.forceUpdate();
		}
	}
}

/**
 * 更新视图
 * @param   {Array}   newArray  [新数组]
 * @param   {Array}   oldArray  [旧数组]
 * @param   {Object}  arg       [数组操作参数信息]
 */
vfor.update = function (newArray, oldArray, arg) {
	// 初次构建列表
	if (this.init) {
		this.initList(newArray);
	} else {
		// 数组操作部分更新
		if (arg && partlyMethods.indexOf(arg.method) > -1) {
			this.partly = true;
			this.updatePartly(newArray, arg);
			this.partly = false;
		} else {
			this.recompileList(newArray);
		}
	}
}

/**
 * 初始化构建列表
 * @param   {Array}  list
 */
vfor.initList = function (list) {
	this.init = false;
	var listFragment = this.buildList(list);
	this.$parent.replaceChild(listFragment, this.el);
}

/**
 * 数组操作部分更新列表
 * @param   {Array}   list
 * @param   {Object}  arg
 */
vfor.updatePartly = function (list, arg) {
	var partlyArgs = [];
	var method = arg.method;
	var scopes = this.scopes;
	var args = copy(arg.args);

	// 更新处理 DOM 片段
	this[method].call(this, list, arg.args);

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
 * @param   {Array}  list
 */
vfor.recompileList = function (list) {
	var next = this.$next;
	var prev = this.$prev;
	var parent = this.$parent;

	// 清空循环列表
	var child;
	while (child = (prev && prev.nextSibling || parent.firstChild)) {
		if (next && child === next) {
			break;
		}
		parent.removeChild(child);
	}

	// 移除所有取值域缓存
	this.scopes.length = 0;

	var listFragment = this.buildList(list);
	parent.insertBefore(listFragment, next);
}

/**
 * 构建循环板块
 * @param   {Array}     list        [列表数组]
 * @param   {Number}    startIndex  [下标起点]
 * @return  {Fragment}
 */
vfor.buildList = function (list, startIndex) {
	var vm = this.vm;
	var el = this.el;
	var start = startIndex || 0;
	var bodyDirs = el.__dirs__;
	var listFragment = createFragment();

	each(list, function (item, i) {
		var index = start + i;
		var alias = this.alias;
		var plate = el.cloneNode(true);
		var scope = Object.create(this.$scope || vm.$data);

		// 绑定别名
		observe(scope, alias, item);
		// 绑定下标
		observe(scope, '$index', index);

		if (this.partly) {
			this.partlyArgs.push(scope);
		} else {
			this.scopes.push(scope);
		}

		// 阻止重复编译除 vfor 以外的指令
		if (bodyDirs > 1) {
			vm.block(el);
		}

		// 标记别名
		markVforFeature(plate, vforAlias, alias);

		// 编译板块
		vm.complieElement(plate, true, scope);
		listFragment.appendChild(plate);
	}, this);

	return listFragment;
}

/**
 * 获取完整的列表数据
 * @return  {Array}
 */
vfor.getChilds = function () {
	var list = [];
	var childs = this.$parent.childNodes;

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
	var prev = this.$prev;
	return prev && prev.nextSibling || this.$parent.firstChild;
}

/**
 * 获取循环列表最后一项
 * @return  {Element}
 */
vfor.getLast = function () {
	var next = this.$next;
	return next && next.previousSibling || this.$parent.lastChild;
}

/**
 * 获取循环列表指定下标项
 * @param   {Number}    index
 * @return  {Element}
 */
vfor.getChild = function (index) {
	return this.getChilds()[index];
}

/**
 * 删除循环列表的第一个元素 array.shift()
 */
vfor.shift = function () {
	var first = this.getFirst();
	if (first) {
		this.$parent.removeChild(first);
	}
}

/**
 * 删除循环列表的最后一个元素 array.pop()
 */
vfor.pop = function () {
	var last = this.getLast();
	if (last) {
		this.$parent.removeChild(last);
	}
}

/**
 * 在循环列表结尾追加元素 array.push(item)
 * @param   {Array}  list
 * @param   {Array}  args
 */
vfor.push = function (list, args) {
	var item = this.buildList(args, list.length - 1);
	this.$parent.insertBefore(item, this.$next);
}

/**
 * 在循环列表开头追加元素 array.unshift(item)
 * @param   {Array}  list
 * @param   {Array}  args
 */
vfor.unshift = function (list, args) {
	var first = this.getFirst();
	var item = this.buildList(args, 0);
	this.$parent.insertBefore(item, first);
}

/**
 * 循环列表的增删改 splice(start, deleteCount, inserts)
 * @param   {Array}  list
 * @param   {Array}  args
 */
vfor.splice = function (list, args) {
	// 从数组的哪一位开始修改内容。如果超出了数组的长度，则从数组末尾开始添加内容。
	var start = args.shift();
	// 整数，表示要移除的数组元素的个数。
	// 如果 deleteCount 是 0，则不移除元素。这种情况下，至少应添加一个新元素。
	// 如果 deleteCount 大于 start 之后的元素的总数，则从 start 后面的元素都将被删除（含第 start 位）。
	var deleteCont = args.shift();
	// 要添加进数组的元素。如果不指定，则 splice() 只删除数组元素。
	var insertItems = args, insertLength = args.length;

	// 不删除也不添加
	if (deleteCont === 0 && !insertLength) {
		return;
	}

	// 只删除 splice(2, 1);
	var deleteOnly = deleteCont && !insertLength;
	// 只插入 splice(2, 0, 'xxx')
	var insertOnly = !deleteCont && insertLength;
	// 删除并插入 splice(2, 1, 'xxx')
	var deleAndInsert = deleteCont && insertLength;

	var parent = this.$parent;

	// 删除指定选项
	if (deleteOnly || deleAndInsert) {
		let oldList = this.getChilds();
		each(oldList, function (child, index) {
			// 删除的范围内
			if (index >= start && index < start + deleteCont) {
				parent.removeChild(child);
			}
		});
		oldList = null;
	}

	// 只插入 或 删除并插入
	if (insertOnly || deleAndInsert) {
		// 开始的元素
		let startChild = this.getChild(start);
		// 新增列表
		let listFrag = this.buildList(insertItems, start);
		// 更新变化部分
		parent.insertBefore(listFrag, startChild);
	}
}