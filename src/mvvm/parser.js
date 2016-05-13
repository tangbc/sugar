/**
 * parser 指令解析模块（部分正则借鉴于 vue）
 */
define([
	'../util'
], function(util) {

	// 表达式中允许的关键字
	var allowKeywords = 'Math.parseInt.parseFloat.Date.this.true.false.null.undefined.Infinity.NaN.isNaN.isFinite.decodeURI.decodeURIComponent.encodeURI.encodeURIComponent';
	var regAllowKeyword = new RegExp('^(' + allowKeywords.replace(/\./g, '\\b|') + '\\b)');

	// 表达式中禁止的关键字
	var avoidKeywords = 'var.const.let.if.else.for.in.continue.switch.case.break.default.function.return.do.while.delete.try.catch.throw.finally.with.import.export.instanceof.yield.await';
	var regAviodKeyword = new RegExp('^(' + avoidKeywords.replace(/\./g, '\\b|') + '\\b)');

	// 匹配纯数字
	var regNumber = /^[0-9]*$/;
	// 匹配常量缓存序号 "1"
	var regSaveConst = /"(\d+)"/g;
	// 只含有 true 或 false
	var regBool = /^(true|false)$/;
	// 匹配循环下标别名
	var regIndex = /^\$index|\W\$\bindex\b/;
	// 匹配表达式中的常量
	var regReplaceConst = /[\{,]\s*[\w\$_]+\s*:|('[^']*'|"[^"]*")|typeof /g;
	// 匹配表达式中的取值域
	var regReplaceScope = /[^\w$\.]([A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\])*)/g;
	// 匹配常规取值: item or item['x'] or item["y"] or item[0]
	var regNormal = /^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\]|\[\d+\]|\[[A-Za-z_$][\w$]*\])*$/;

	/**
	 * 是否是常规指令表达式
	 * @param   {String}   expression
	 * @return  {Boolean}
	 */
	function isNormal(expression) {
		return regNormal.test(expression) && !regBool.test(expression) && expression.indexOf('Math.') !== 0;
	}

	// 保存常量，返回序号 "i"
	var consts = [];
	function saveConst(string) {
		var i = consts.length;
		consts[i] = string;
		return '"' + i + '"';
	}

	/**
	 * 返回替换之前的常量
	 * @param   {Strinf}  string
	 * @param   {Number}  i
	 * @return  {String}
	 */
	function returnConst(string, i) {
		return consts[i];
	}

	/**
	 * 返回表达式的 scope 替换
	 * @param   {String}  string
	 * @return  {String}
	 */
	function replaceScope(string) {
		var pad = string.charAt(0);
		var path = string.slice(1);

		if (regAllowKeyword.test(path)) {
			return string;
		}
		else {
			path = path.indexOf('"') !== -1 ? path.replace(regSaveConst, returnConst) : path;
			return pad + 'scope.' + path;
		}
	}

	/**
	 * 获取取值表达式的 vfor 取值域别名
	 * @param   {Object}  fors         <必选>
	 * @param   {String}  expression   <必选>
	 * @return  {String}
	 */
	function getAlias(fors, expression) {
		var alias, exp = expression.replace(/(\(.*\))/g, '');

		// $index or item in items {{item}}
		if (exp === fors.alias || regIndex.test(exp)) {
			return fors.alias;
		}

		// 在表达式中匹配 alias.xxx
		util.each(fors.aliases, function(al) {
			var reg = new RegExp('\\b' + al + '\\b|\\b'+ al +'\\.');
			if (reg.test(exp)) {
				alias = al;
				return false;
			}
		});

		return alias;
	}

	/**
	 * 生成取值路径数组
	 * items*0*ps*0*text => [[items, 0], [ps, 0]]
	 * @param   {String}  access
	 * @return  {Array}
	 */
	function makePaths(access) {
		var paths = access.split('*');
		var length, index = 0, scopePaths = [];

		for (var i = paths.length - 1; i < paths.length; i--) {
			if (regNumber.test(paths[i])) {
				length = i + 1;
				break;
			}
		}

		paths = paths.slice(0, length);

		if (paths.length % 2 === 0) {
			while (index < paths.length) {
				index += 2;
				scopePaths.push(paths.slice(0, index));
			}
		}

		return scopePaths;
	}

	/**
	 * 通过访问层级取值
	 * @param   {Object}  target
	 * @param   {array}   paths
	 * @return  {Mix}
	 */
	function getDeepValue(target, paths) {
		var _paths = paths.slice(0);

		while (_paths.length) {
			target = target[_paths.shift()];
		}

		return target;
	}


	/**
	 * Parser 基础解析器模块，指令解析模块都继承于 Parser
	 */
	function Parser() {}
	var p = Parser.prototype;

	/**
	 * 绑定监测 & 初始化视图
	 * @param   {Object}      fors
	 * @param   {DOMElement}  node
	 * @param   {String}      expression
	 */
	p.bind = function(fors, node, expression) {
		var vm = this.vm;

		// 提取依赖
		var deps = this.getDeps(fors, expression);
		// 获取取值域
		var scope = this.getScope(fors, expression);
		// 生成取值函数
		var getter = this.getEval(fors, expression);
		// 取值别名映射
		var maps = fors && util.copy(fors.maps);

		// 调用更新方法
		this.update(node, getter.call(scope, scope));

		// 监测所有依赖变化
		vm.watcher.watch(deps, function(path) {
			scope = this.updateScope(scope, maps, path);
			this.update(node, getter.call(scope, scope));
		}, this);
	}

	/**
	 * 生成表达式取值函数
	 * @param   {String}    expression
	 * @return  {Function}
	 */
	p.createGetter = function(expression) {
		try {
			return new Function('scope', 'return ' + expression + ';');
		}
		catch (e) {
			util.error('Invalid generated expression: ' + expression);
		}
	}

	/**
	 * 获取表达式的取值函数
	 */
	p.getEval = function(fors, expression) {
		var exp = this.toScope(expression);

		if (regAviodKeyword.test(exp)) {
			util.warn('Avoid using unallow keyword in expression: ' + exp);
			return;
		}

		// 替换取值域别名
		if (fors) {
			util.each(fors.aliases, function(alias) {
				var reg = new RegExp('scope.' + alias, 'g');
				exp = exp.replace(reg, function(scope) {
					return 'scope.$' + scope;
				});
			});
		}

		return this.createGetter(exp);
	}

	/**
	 * 转换表达式的 scope 取值域
	 * @return  {String}
	 */
	p.toScope = function(expression) {
		var exp = expression;

		if (isNormal(exp)) {
			return 'scope.' + exp;
		}

		exp = (' ' + exp).replace(regReplaceConst, saveConst);
		exp = exp.replace(regReplaceScope, replaceScope);
		exp = exp.replace(regSaveConst, returnConst);

		return exp;
	}

	/**
	 * 获取表达式的取值域
	 * @param   {Object}  fors
	 * @param   {String}  expression
	 * @return  {Object}
	 */
	p.getScope = function(fors, expression) {
		var scope = util.copy(this.vm.$data);

		if (!fors) {
			return scope;
		}

		// 组合每一层 vfor 的取值域
		util.each(fors.scopes, function(_scope, alias) {
			scope.$scope[alias] = _scope;
		});

		// vfor 下标
		scope.$index = fors.index;

		return scope;
	}

	/**
	 * 更新取值域
	 * @param   {Object}  oldScope   [旧取值域]
	 * @param   {Object}  maps       [别名映射]
	 * @param   {String}  access     [更新路径]
	 * @return  {Mix}
	 */
	p.updateScope = function(oldScope, maps, access) {
		var model = util.copy(this.vm.$data);
		var newScope, paths, index, scope = {};

		// 更新 vfor 取值域
		if (maps && access.indexOf('*') !== -1) {
			paths = makePaths(access);

			util.each(paths, function(path) {
				var leng = path.length;
				var field = path[leng - 2];
				var vforScope = util.copy(model);
				var value = getDeepValue(vforScope, path);

				value.$index = path[leng - 1];
				scope[maps[field]] = value;
			});

			newScope = util.extend(model, {
				'$scope': util.extend(oldScope.$scope, scope)
			});

			return newScope;
		}
		// 更新顶层数据模型
		else {
			return model;
		}
	}

	/**
	 * 获取表达式的所有依赖（取值模型+访问路径）
	 * @param   {Object}  fors        [vfor 数据]
	 * @param   {String}  expression
	 * @return  {Object}
	 */
	p.getDeps = function(fors, expression) {
		var deps = [], paths = [], $index;
		var exp = ' ' + expression.replace(regReplaceConst, saveConst);

		exp.replace(regReplaceScope, function(dep) {
			var model = dep.substr(1);
			var alias, access, valAccess;

			// 取值域别名或 items.length -> items
			if (fors) {
				alias = getAlias(fors, dep);
				$index = alias + '.$index';
				// 取值域路径
				if (model.indexOf(alias) !== -1 || model === $index) {
					access = fors.accesses[fors.aliases.indexOf(alias)];
				}
			}
			else {
				alias = util.getExpAlias(model);
			}

			// 取值字段访问路径，输出别名和下标
			if (model === $index || model === alias) {
				valAccess = access || fors && fors.access;
			}
			else {
				if (access && model !== '$event') {
					valAccess = access + '*' + util.getExpKey(model);
				}
			}

			deps.push(model);
			paths.push(valAccess);
		});

		return {
			'dep': deps,
			'acc': paths
		}
	}

	return Parser;
});