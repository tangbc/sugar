define([
	'../parser',
	'../../dom',
	'../../util'
], function(Parser, dom, util) {

	function Vfor(vm) {
		this.vm = vm;
		Parser.call(this);
	}
	var vfor = Vfor.prototype = Object.create(Parser.prototype);

	/**
	 * 解析 v-for 指令
	 * @param   {Object}      fors        [vfor数据]
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
		var isOption = node.tagName === 'OPTION';

		// 取值信息
		var scope = this.getScope(vm, fors, iterator);
		var getter = this.getEvalFunc(fors, iterator);
		var array = getter.call(scope, scope);

		// 循环数组的访问路径
		var loopAccess = iterator;
		var listArgs, template, updates;
		var key = util.getExpKey(iterator);

		// 循环层级
		var level = -1;
		// 取值域集合
		var scopes = {};
		// 别名集合
		var aliases = [];
		// 取值域路径集合
		var accesses = [];

		// 嵌套 vfor
		if (fors) {
			level = fors.level;
			// 取值域集合一定是引用而不是拷贝
			scopes = fors.scopes;
			aliases = fors.aliases.slice(0);
			accesses = fors.accesses.slice(0);
			loopAccess = fors.access + '*' + key;
		}

		if (!util.isArray(array)) {
			parent.removeChild(node);
			return;
		}

		listArgs = [node, array, loopAccess, alias, aliases, accesses, scopes, ++level];
		template = this.buildList.apply(this, listArgs);

		node.parentNode.replaceChild(template, node);

		if (isOption) {
			this.froceUpdateOption(parent, fors);
		}

		// 数组更新信息
		updates = {
			'alias'   : alias,
			'aliases' : aliases,
			'access'  : loopAccess,
			'accesses': accesses,
			'scopes'  : scopes,
			'level'   : level
		}

		// 监测根数组的数组操作
		if (!fors) {
			watcher.watchModel(loopAccess, function(path, last, method) {
				this.update(parent, node, last, method, updates);
			}, this);
		}
		// 监测嵌套数组的数组操作
		else {
			watcher.watchAccess(loopAccess, function(path, last, method) {
				this.update(parent, node, last, method, updates);
			}, this);
		}
	}

	/**
	 * 强制更新 select/option 在 vfor 中的值
	 * @param   {Select}  select
	 * @param   {Object}  fors
	 */
	vfor.froceUpdateOption = function(select, fors) {
		var model = select._vmodel;
		var getter = this.getEvalFunc(fors, model);
		var scope = this.getScope(this.vm, fors, model);
		var value = getter.call(scope, scope);
		this.vm.updater.updateNodeFormSelectChecked(select, value, dom.hasAttr(select, 'multiple'));
	}

	/**
	 * 根据源数组构建循环板块集合
	 * @param   {DOMElement}  node      [循环模板]
	 * @param   {Array}       array     [取值数组]
	 * @param   {String}      paths     [取值数组访问路径]
	 * @param   {String}      alias     [当前取值域别名]
	 * @param   {Array}       aliases   [取值域别名数组]
	 * @param   {Array}       accesses  [取值域访问路径数组]
	 * @param   {Object}      scopes    [取值域集合]
	 * @param   {Number}      level     [当前循环层级]
	 * @return  {Fragment}              [板块文档碎片集合]
	 */
	vfor.buildList = function(node, array, paths, alias, aliases, accesses, scopes, level) {
		var vm = this.vm;
		var fragments = util.createFragment();

		util.each(array, function(scope, index) {
			var cloneNode = node.cloneNode(true);
			var fors, access = paths + '*' + index;

			scopes[alias] = scope;
			aliases[level] = alias;
			accesses[level] = access;

			fors = {
				// 别名
				'alias'   : alias,
				// 别名集合
				'aliases' : aliases,
				// 取值域访问路径
				'access'  : access,
				// 取值域访问路径集合
				'accesses': accesses,
				// 当前取值域
				'scope'   : scope,
				// 取值域集合
				'scopes'  : scopes,
				// 当前循环层级
				'level'   : level,
				// 当前取值域下标
				'index'   : index
			}

			// 阻止重复编译除 vfor 以外的指令
			if (node._vfor_directives > 1) {
				vm.blockCompileNode(node);
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
		util.defineProperty(node, '_vfor_alias', alias);
	}

	/**
	 * 数组操作更新 vfor 循环体
	 * @param   {DOMElement}  parent    [父节点]
	 * @param   {DOMElement}  node      [初始模板片段]
	 * @param   {Array}       newArray  [新的数据重复列表]
	 * @param   {String}      method    [数组操作]
	 * @param   {Array}       updates   [更新信息]
	 */
	vfor.update = function(parent, node, newArray, method, updates) {
		switch (method) {
			case 'push':
				this.pushArray.apply(this, arguments);
				break;
			case 'pop':
				this.popArray.apply(this, arguments);
				break;
			case 'unshift':
				this.unshiftArray.apply(this, arguments);
				break;
			case 'shift':
				this.shiftArray.apply(this, arguments);
				break;
			// @todo: splice, sort, reverse 操作和直接赋值暂时都重新编译
			default: this.recompileArray.apply(this, arguments);
		}
	}

	/**
	 * 在循环体的最后追加一条数据 array.push
	 */
	vfor.pushArray = function(parent, node, newArray, method, updates) {
		var fragment = util.createFragment();
		var cloneNode = node.cloneNode(true);
		var lastChild, last = newArray.length - 1;

		var alias = updates.alias;
		var level = updates.level;
		var fors, access = updates.access + '*' + last;

		updates.scopes[alias] = newArray[last];
		updates.accesses[level] = access;

		fors = {
			'alias'   : updates.alias,
			'aliases' : updates.aliases,
			'access'  : access,
			'accesses': updates.accesses,
			'scope'   : newArray[last],
			'scopes'  : updates.scopes,
			'level'   : updates.level,
			'index'   : last
		}

		this.signAlias(cloneNode, alias);

		// 解析节点
		this.vm.complieElement(cloneNode, true, fors);
		fragment.appendChild(cloneNode);

		lastChild = this.getLastChild(parent, alias);

		// empty list
		if (!lastChild) {
			parent.appendChild(fragment);
		}
		else {
			parent.insertBefore(fragment, lastChild.nextSibling);
		}
	}

	/**
	 * 移除循环体的最后一条数据 array.pop
	 */
	vfor.popArray = function(parent, node, newArray, method, updates) {
		var lastChild = this.getLastChild(parent, updates.alias);
		if (lastChild) {
			parent.removeChild(lastChild)
		}
	}

	/**
	 * 在循环体最前面追加一条数据 array.unshift
	 */
	vfor.unshiftArray = function(parent, node, newArray, method, updates) {
		var vm = this.vm, firstChild;
		var fragment = util.createFragment();
		var cloneNode = node.cloneNode(true);

		// 移位相关的订阅回调
		vm.watcher.shiftSubs(updates.access, method);

		var alias = updates.alias;
		var level = updates.level;
		var fors, access = updates.access + '*' + 0;

		updates.scopes[alias] = newArray[0];
		updates.accesses[level] = access;

		fors = {
			'alias'   : updates.alias,
			'aliases' : updates.aliases,
			'access'  : access,
			'accesses': updates.accesses,
			'scope'   : newArray[0],
			'scopes'  : updates.scopes,
			'level'   : updates.level,
			'index'   : 0
		}

		this.signAlias(cloneNode, alias);

		// 解析节点
		vm.complieElement(cloneNode, true, fors);
		fragment.appendChild(cloneNode);

		firstChild = this.getFirstChild(parent, alias);

		// 当 firstChild 为 null 时会自动添加到父节点
		parent.insertBefore(fragment, firstChild);
	}

	/**
	 * 移除循环体的第一条数据 array.shift
	 */
	vfor.shiftArray = function(parent, node, newArray, method, updates) {
		var firstChild = this.getFirstChild(parent, updates.alias);
		if (firstChild) {
			parent.removeChild(firstChild);
			// 移位相关的订阅回调
			this.vm.watcher.shiftSubs(updates.access, method);
		}

	}

	/**
	 * 获取 vfor 循环体的第一个子节点
	 * @param   {DOMElement}  parent  [父节点]
	 * @param   {String}      alias   [循环体对象别名]
	 * @return  {FirstChild}
	 */
	vfor.getFirstChild = function(parent, alias) {
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
	vfor.getLastChild = function(parent, alias) {
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
	 * 重新编译循环体
	 */
	vfor.recompileArray = function(parent, node, newArray, method, up) {
		var scapegoat, child;
		var childNodes = parent.childNodes;
		var template, alias = up.alias;
		var listArgs = [node, newArray, up.access, alias, up.aliases, up.accesses, up.scopes, up.level];

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

	return Vfor;
});