var Parser = require('../parser');
var util = require('../../util');

function Vfor(vm) {
	this.vm = vm;
	Parser.call(this);
}
var vfor = Vfor.prototype = Object.create(Parser.prototype);

/**
 * 解析 v-for 指令
 * @param   {Object}      fors        [vfor 数据]
 * @param   {DOMElement}  node        [指令节点]
 * @param   {String}      expression  [指令表达式]
 */
vfor.parse = function(fors, node, expression) {
	var vm = this.vm;
	var match = expression.match(/(.*) in (.*)/);
	var alias = match[1];
	var iterator = match[2];

	var watcher = vm.watcher;
	var parent = node.parentNode;
	var isOption = node.tagName === 'OPTION' && parent.tagName === 'SELECT';

	// 取值信息
	var scope = this.getScope(fors, iterator);
	var getter = this.getEval(fors, iterator);
	var array = getter.call(scope, scope);

	// 循环数组的访问路径
	var loopAccess = iterator;
	var listArgs, template, updates;
	var key = util.getExpKey(iterator);

	// 循环层级
	var level = -1;
	// 取值域集合
	var scopes = {};
	// 取值域与数组字段映射
	var maps = {};
	// 别名集合
	var aliases = [];
	// 取值域路径集合
	var accesses = [];

	// 嵌套 vfor
	if (fors) {
		maps = fors.maps;
		level = fors.level;
		scopes = fors.scopes;
		aliases = fors.aliases.slice(0);
		accesses = fors.accesses.slice(0);
		loopAccess = fors.access + '*' + key;
	}

	if (!util.isArray(array)) {
		parent.removeChild(node);
		return;
	}

	listArgs = [node, array, 0, loopAccess, alias, aliases, accesses, scopes, maps, ++level];
	template = this.buildList.apply(this, listArgs);

	node.parentNode.replaceChild(template, node);

	if (isOption) {
		this.updateOption(parent, fors);
	}

	// 数组更新信息
	updates = {
		'alias'   : alias,
		'aliases' : aliases,
		'access'  : loopAccess,
		'accesses': accesses,
		'scopes'  : scopes,
		'level'   : level,
		'maps'    : maps
	}

	// 监测根数组的数组操作
	if (!fors) {
		watcher.watchModel(loopAccess, function(path, last, method, args) {
			this.update(parent, node, last, method, updates, args);
		}, this);
	}
	// 监测嵌套数组的操作
	else {
		watcher.watchAccess(loopAccess, function(path, last, method, args) {
			this.update(parent, node, last, method, updates, args);
		}, this);
	}
}

/**
 * 更新 select/option 在 vfor 中的值
 * @param   {Select}  select
 * @param   {Object}  fors
 */
vfor.updateOption = function(select, fors) {
	var model = select._vmodel;
	var getter = this.getEval(fors, model);
	var scope = this.getScope(fors, model);
	var value = getter.call(scope, scope);
	this.vm.updater.updateSelectChecked(select, value);
}

/**
 * 根据源数组构建循环板块集合
 * @param   {DOMElement}  node      [循环模板]
 * @param   {Array}       array     [取值数组]
 * @param   {Number}      start     [开始的下标计数]
 * @param   {String}      paths     [取值数组访问路径]
 * @param   {String}      alias     [当前取值域别名]
 * @param   {Array}       aliases   [取值域别名数组]
 * @param   {Array}       accesses  [取值域访问路径数组]
 * @param   {Object}      scopes    [取值域集合]
 * @param   {Object}      maps      [数组与取值域的映射]
 * @param   {Number}      level     [当前循环层级]
 * @return  {Fragment}              [板块文档碎片集合]
 */
vfor.buildList = function(node, array, start, paths, alias, aliases, accesses, scopes, maps, level) {
	var vm = this.vm;
	var fragments = util.createFragment();

	util.each(array, function(scope, i) {
		var index = start + i;
		var field = paths.split('*').pop();
		var cloneNode = node.cloneNode(true);
		var fors, access = paths + '*' + index;

		scopes[alias] = scope;
		aliases[level] = alias;
		accesses[level] = access;
		maps[field] = alias;

		fors = {
			// 别名
			'alias'   : alias,
			// 别名集合
			'aliases' : aliases,
			// 取值域访问路径
			'access'  : access,
			// 取值域访问路径集合
			'accesses': accesses,
			// 取值域集合
			'scopes'  : scopes,
			// 数组取值域映射
			'maps'    : maps,
			// 当前循环层级
			'level'   : level,
			// 当前取值域下标
			'index'   : index
		}

		// 阻止重复编译除 vfor 以外的指令
		if (node._vfor_directives > 1) {
			vm.blockCompile(node);
		}

		this.signAlias(cloneNode, alias);

		// 传入 vfor 数据编译板块
		vm.complieElement(cloneNode, true, fors);

		fragments.appendChild(cloneNode);
	}, this);

	return fragments;
}

/**
 * 标记节点的 vfor 别名
 * @param   {DOMElement}  node
 * @param   {String}      alias
 */
vfor.signAlias = function(node, alias) {
	util.def(node, '_vfor_alias', alias);
}

/**
 * 数组操作更新 vfor 循环列表
 * @param   {DOMElement}  parent    [父节点]
 * @param   {DOMElement}  node      [初始模板片段]
 * @param   {Array}       newArray  [新的数据重复列表]
 * @param   {String}      method    [数组操作]
 * @param   {Array}       updates   [更新信息]
 * @param   {Array}       args      [数组操作参数]
 */
vfor.update = function(parent, node, newArray, method, updates, args) {
	switch (method) {
		case 'push':
			this.push.apply(this, arguments);
			break;
		case 'pop':
			this.pop.apply(this, arguments);
			break;
		case 'unshift':
			this.unshift.apply(this, arguments);
			break;
		case 'shift':
			this.shift.apply(this, arguments);
			break;
		case 'splice':
			this.splice.apply(this, arguments);
			break;
		// sort、reverse 操作或直接赋值都重新编译
		default: this.recompile.apply(this, arguments);
	}
}

/**
 * 获取 shift 或 unshift 操作对应列表下标变化的关系
 * @param   {String}  method  [数组操作]
 * @param   {Number}  length  [新数组长度]
 * @return  {Object}          [新数组下标的变化映射]
 */
vfor.getChanges = function(method, length) {
	var i, udf, map = {};

	switch (method) {
		case 'unshift':
			map[0] = udf;
			for (i = 1; i < length; i++) {
				map[i] = i - 1;
			}
			break;
		case 'shift':
			for (i = 0; i < length + 1; i++) {
				map[i] = i + 1;
			}
			map[length] = udf;
			break;
	}

	return map;
}

/**
 * 在循环体的最后追加一条数据 array.push
 */
vfor.push = function(parent, node, newArray, method, up) {
	var last = newArray.length - 1;
	var alias = up.alias;
	var list = [newArray[last]];
	var listArgs = [node, list, last, up.access, alias, up.aliases, up.accesses, up.scopes, up.maps, up.level];
	var lastChild = this.getLast(parent, alias);
	var template = this.buildList.apply(this, listArgs);

	// empty list
	if (!lastChild) {
		parent.appendChild(template);
	}
	else {
		parent.insertBefore(template, lastChild.nextSibling);
	}
}

/**
 * 移除循环体的最后一条数据 array.pop
 */
vfor.pop = function(parent, node, newArray, method, updates) {
	var lastChild = this.getLast(parent, updates.alias);
	if (lastChild) {
		parent.removeChild(lastChild);
	}
}

/**
 * 在循环体最前面追加一条数据 array.unshift
 */
vfor.unshift = function(parent, node, newArray, method, up) {
	var alias = up.alias;
	var list = [newArray[0]];
	var map, template, firstChild;
	var listArgs = [node, list, 0, up.access, alias, up.aliases, up.accesses, up.scopes, up.maps, up.level];

	// 移位相关的订阅回调
	map = this.getChanges(method, newArray.length);
	this.vm.watcher.moveSubs(up.access, map);

	template = this.buildList.apply(this, listArgs);
	firstChild = this.getFirst(parent, alias);

	// 当 firstChild 为 null 时也会添加到父节点
	parent.insertBefore(template, firstChild);
}

/**
 * 移除循环体的第一条数据 array.shift
 */
vfor.shift = function(parent, node, newArray, method, updates) {
	var map = this.getChanges(method, newArray.length);
	var firstChild = this.getFirst(parent, updates.alias);
	if (firstChild) {
		parent.removeChild(firstChild);
		// 移位相关的订阅回调
		this.vm.watcher.moveSubs(updates.access, map);
	}
}

/**
 * 删除/替换循环体的指定数据 array.splice
 */
vfor.splice = function(parent, node, newArray, method, up, args) {
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

	var i, template, startChild, listArgs, udf;
	var map = {}, alias = up.alias, length = newArray.length;

	// 只删除 splice(2, 1);
	var deleteOnly = deleteCont && !insertLength;
	// 只插入 splice(2, 0, 'xxx')
	var insertOnly = !deleteCont && insertLength;
	// 删除并插入 splice(2, 1, 'xxx')
	var deleAndIns = deleteCont && insertLength;

	// 只删除
	if (deleteOnly) {
		for (i = 0; i < length; i++) {
			map[i] = i >= start ? i + deleteCont : i;
		}

		if (util.isEmpty(map)) {
			this.recompile.apply(this, arguments);
			return;
		}
		else {
			this.vm.watcher.moveSubs(up.access, map);
			this.removeEl(parent, alias, start, deleteCont);
		}
	}
	// 只插入 或 删除并插入
	else if (insertOnly || deleAndIns) {
		for (i = 0; i < length; i++) {
			if (insertOnly) {
				map[i] = i < start ? i : (i >= start && i < start + insertLength ? udf : i - insertLength);
			}
			else if (deleAndIns) {
				map[i] = i < start ? i : (i >= start && i < start + insertLength ? udf : i - (insertLength - deleteCont));
			}
		}

		if (util.isEmpty(map) || start === 0 && deleteCont > length) {
			this.recompile.apply(this, arguments);
			return;
		}
		else {
			this.vm.watcher.moveSubs(up.access, map);
		}

		// 先删除选项
		if (deleAndIns) {
			this.removeEl(parent, alias, start, deleteCont);
		}

		// 开始的元素
		startChild = this.getChild(parent, alias, start);
		// 编译新添加的列表
		listArgs = [node, insertItems, start, up.access, alias, up.aliases, up.accesses, up.scopes, up.maps, up.level];
		// 新增列表模板
		template = this.buildList.apply(this, listArgs);

		// 更新变化部分
		parent.insertBefore(template, startChild);
	}
}

/**
 * 获取 vfor 循环体的第一个子节点
 * @param   {DOMElement}  parent  [父节点]
 * @param   {String}      alias   [循环体对象别名]
 * @return  {FirstChild}
 */
vfor.getFirst = function(parent, alias) {
	var i, firstChild = null, child;
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
 * 获取 vfor 循环体的最后一个子节点
 * @param   {DOMElement}  parent   [父节点]
 * @param   {String}      alias    [循环体对象别名]
 * @return  {LastChild}
 */
vfor.getLast = function(parent, alias) {
	var i, lastChild = null, child;
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
 * 获取 vfor 循环体指定下标的子节点
 * @param   {DOMElement}  parent  [父节点]
 * @param   {String}      alias   [循环体对象别名]
 * @param   {Number}      index   [子节点下标]
 * @return  {DOMElement}
 */
vfor.getChild = function(parent, alias, index) {
	var i, e = 0, target = null, child;
	var childNodes = parent.childNodes;

	for (i = 0; i < childNodes.length; i++) {
		child = childNodes[i];
		if (child._vfor_alias === alias) {
			if (e === index) {
				target = child;
				break;
			}
			e++;
		}
	}

	return target;
}

/**
 * 删除 vfor 循环体指定的数据
 * @param   {DOMElement}  parent      [父节点]
 * @param   {String}      alias       [循环体对象别名]
 * @param   {Number}      start       [删除的下标起点]
 * @param   {Number}      deleteCont  [删除个数]
 */
vfor.removeEl = function(parent, alias, start, deleteCont) {
	var childNodes = parent.childNodes;
	var i, e = -1, child, scapegoats = [];

	for (i = 0; i < childNodes.length; i++) {
		child = childNodes[i];
		if (child._vfor_alias === alias) {
			e++;
		}
		// 删除的范围内
		if (e >= start && e < start + deleteCont) {
			scapegoats.push(child);
		}
	}

	util.each(scapegoats, function(scapegoat) {
		parent.removeChild(scapegoat);
		return null;
	});
}

/**
 * 重新编译循环体
 */
vfor.recompile = function(parent, node, newArray, method, up) {
	var child, scapegoat;
	var template, alias = up.alias;
	var childNodes = parent.childNodes;
	var listArgs = [node, newArray, 0, up.access, alias, up.aliases, up.accesses, up.scopes, up.maps, up.level];

	// 移除旧的监测
	this.vm.watcher.removeSubs(up.access);

	// 重新构建循环板块
	template = this.buildList.apply(this, listArgs);

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

module.exports = Vfor;
