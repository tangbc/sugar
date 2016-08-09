import { empty } from '../../dom';
import { observe } from '../observer';
import Parser, { linkParser } from '../parser';
import { warn, createFragment, each, def } from '../../util';

const vforAlias = '__vfor__';
const regForExp = /(.*) in (.*)/;
const partlyMethods = 'push|pop|shift|unshift|splice'.split('|');

/**
 * 标记节点特征字段
 * @param   {DOMElement}  node
 * @param   {String}      feature  [特征字段]
 * @param   {String}      value    [特征值]
 */
function markFeature (node, feature, value) {
	def(node, feature, value);
}


/**
 * v-for 指令解析模块
 */
export default function VFor () {
	Parser.apply(this, arguments);
}

var vfor = linkParser(VFor);

/**
 * 解析 v-for 指令
 */
vfor.parse = function () {
	var desc = this.desc;
	var expression = desc.expression;
	var match = expression.match(regForExp);
	var alias = match[1], iterator = match[2];

	if (!match) {
		return warn('The format of v-for must be like "item in items"!');
	}

	this.init = true;
	this.alias = alias;
	this.$parent = this.el.parentNode;
	this.$prev = this.el.previousSibling;
	this.$next = this.el.nextSibling;

	desc.expression = iterator;
	this.bind();
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
			this.updatePartly(arg);
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
vfor.updatePartly = function (arg) {
	this[arg.method].call(this, arg.args);
}

/**
 * 重新构建列表
 * @param   {Array}  list
 */
vfor.recompileList = function (list) {
	var child, parent = this.$parent;
	var prev = this.$prev, next = this.$next;
	var listFragment = this.buildList(list);

	// 清空循环列表
	while (child = prev.nextSibling || parent.firstChild) {
		if (next && child === next) {
			break;
		}
		parent.removeChild(child);
	}

	parent.insertBefore(listFragment, next);
}

/**
 * 构建循环板块
 * @param   {Array}     newArray    [列表数组]
 * @param   {Number}    startIndex  [下标起点]
 * @return  {Fragment}
 */
vfor.buildList = function (newArray, startIndex) {
	var start = startIndex || 0;
	var vm = this.vm, el = this.el;
	var listFragment = createFragment();

	each(newArray, function (item, i) {
		var index = start + i;
		var alias = this.alias;
		var plate = el.cloneNode(true);
		var _scope = this.$scope || vm.$data;
		var scope = Object.create(_scope);

		// 绑定别名
		observe(scope, alias, item);

		// 绑定下标
		observe(scope, '$index', index);

		// 阻止重复编译除 vfor 以外的指令
		if (el.__directives > 1) {
			vm.block(node);
		}

		// 标记别名
		markFeature(plate, vforAlias, alias);

		// 传入 vfor 数据编译板块
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
		this.$parent.removeChild();
	}
}

/**
 * 在循环列表结尾追加元素 array.push(item)
 * @param   {Array}  args
 */
vfor.push = function (args) {
	var item = this.buildList(args, list.length);
	this.$parent.insertBefore(item, this.$next);
}

/**
 * 在循环列表开头追加元素 array.unshift(item)
 * @param   {Array}  args
 */
vfor.unshift = function (args) {
	var first = this.getFirst();
	var item = this.buildList(args, 0);
	this.$parent.insertBefore(item, first);
}

/**
 * 循环列表的增删改 splice(start, deleteCount, inserts)
 * @param   {Array}  args
 */
vfor.splice = function (args) {
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

	var first = this.getFirst();
	var last = this.getLast();
	var parent = this.$parent;

	// 先删除选项
	if (deleteOnly || deleAndInsert) {
		let oldList = this.getChilds();
		each(oldList, function (child, index) {
			// 删除的范围内
			if (index >= start && index < start + deleteCont) {
				parent.removeChild(child);
			}
		});
	}

	// 只插入 或 删除并插入
	if (insertOnly || deleAndInsert) {
		// 开始的元素
		let startChild = this.getChild(start);
		// 新增列表
		let list = this.buildList(insertItems, start);
		// 更新变化部分
		parent.insertBefore(list, startChild);
	}
}
