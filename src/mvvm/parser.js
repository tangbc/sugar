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

	// 匹配常量缓存序号 "1"
	var regSaveConst = /"(\d+)"/g;
	// 只含有 true 或 false
	var regBool = /^(true|false)$/;
	// 匹配循环下标
	var regIndex = /^\$index|\W\$\bindex\b/;
	// 匹配表达式中的常量
	var regReplaceConst = /[\{,]\s*[\w\$_]+\s*:|('[^']*'|"[^"]*")|typeof /g;
	// 匹配表达式中的取值域
	var regReplaceScope = /[^\w$\.]([A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\])*)/g;
	// 匹配常规取值: item or item['x'] or item["y"] or item[0]
	var regNormal = /^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\]|\[\d+\]|\[[A-Za-z_$][\w$]*\])*$/;

	/**
	 * 是否是常规指令表达式（无运算符）
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
	 * @param   {Array}   fors         <必选>
	 * @param   {String}  expression   <必选>
	 * @return  {String}
	 */
	function getAlias(fors, expression) {
		var alias;

		// $index or item in items {{item}}
		if (expression === fors.alias || regIndex.test(expression)) {
			return fors.alias;
		}

		// 在表达式中匹配 alias.xxx
		util.each(fors.aliases, function(al) {
			var reg = new RegExp('\\b'+ al +'\\.');
			if (reg.test(expression)) {
				alias = al;
				return false;
			}
		});

		return alias;
	}


	/**
	 * Parser 基础解析器模块，指令解析模块都继承于 Parser
	 */
	function Parser() {}
	var p = Parser.prototype;

	/**
	 * 绑定监测 & 初始化视图
	 * @param   {Array}       fors
	 * @param   {DOMElement}  node
	 * @param   {String}      expression
	 */
	p.bind = function(fors, node, expression) {
		var vm = this.vm;

		// 提取依赖
		var deps = this.getDependents(fors, expression);
		// 获取取值域
		var scope = this.getScope(vm, fors, expression);
		// 生成取值函数
		var getter = this.getEvalFunc(fors, expression);

		// 监测所有依赖变化
		vm.watcher.watch(deps, function(path, last) {
			var nScope = this.updateScope(scope, expression, path, last);
			this.update(node, getter.call(nScope, nScope));
		}, this);

		// 调用更新方法
		this.update(node, getter.call(scope, scope));
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
	p.getEvalFunc = function(fors, expression) {
		return this.createGetter(this.replaceScope.apply(this, arguments));
	}

	/**
	 * 替换表达式的 scope 取值域
	 * @return  {String}
	 */
	p.replaceScope = function(fors, expression) {
		var exp = expression, alias, reg;

		// vfor 循环替换取值别名
		if (fors) {
			alias = getAlias(fors, expression);

			if (alias === expression) {
				return 'scope';
			}

			if (fors.aliases.indexOf(alias) !== -1) {
				reg = new RegExp('\\b' + alias + '\\.', 'g');
				exp = exp.replace(reg, '');
			}
		}

		// 常规指令
		if (isNormal(exp)) {
			return 'scope.' + exp;
		}

		if (regAviodKeyword.test(exp)) {
			util.warn('Avoid using unallow keyword in expression: ' + exp);
			return;
		}

		exp = (' ' + exp).replace(regReplaceConst, saveConst);
		exp = exp.replace(regReplaceScope, replaceScope);
		exp = exp.replace(regSaveConst, returnConst);

		return exp;
	}

	/**
	 * 获取表达式的取值域
	 * @param   {Object}  vm
	 * @param   {Array}   fors
	 * @param   {String}  expression
	 * @return  {Object}
	 */
	p.getScope = function(vm, fors, expression) {
		var alias, scope = {};

		// 顶层数据模型
		if (!fors) {
			return vm.$data;
		}
		else {
			alias = getAlias(fors, expression);
		}

		// 无别名(vfor 中取顶层值)
		if (!alias) {
			return vm.$data;
		}

		// 当前域取值
		if (alias === fors.alias) {
			scope = fors.scope;
			// 取 vfor 循环的下标
			if (regIndex.test(expression)) {
				scope.$index = fors.index;
			}
		}
		// 跨循环层级取值
		else {
			scope = fors.scopes[alias];
		}

		return scope;
	}

	/**
	 * 更新取值域
	 * @param   {Mix}     scope       [旧取值域]
	 * @param   {String}  expression  [取值表达式]
	 * @param   {String}  path        [更新路径]
	 * @param   {Mix}     last        [新值]
	 * @return  {Mix}
	 */
	p.updateScope = function(scope, expression, path, last) {
		var nScope = scope, key, field;

		// scope === alias
		if (typeof scope !== 'object') {
			nScope = last;
		}

		// 下标
		if (expression === '$index') {
			nScope.$index = last;
		}
		else {
			key = util.getExpKey(expression);
			field = key && path !== expression && path.lastIndexOf(key) === (path.length - key.length) ? key : path;
			nScope[field] = last;
		}

		return nScope;
	}

	/**
	 * 获取表达式的所有依赖（取值模型+访问路径）
	 * @param   {Array}   fors        [vfor 数据]
	 * @param   {String}  expression
	 * @return  {Array}
	 */
	p.getDependents = function(fors, expression) {
		var deps = [], paths = [];
		var exp = ' ' + expression.replace(regReplaceConst, saveConst);

		exp.replace(regReplaceScope, function(dep) {
			var model = dep.substr(1);
			var alias, access, valAccess;

			// 取值域别名或 items.length -> items
			if (fors) {
				alias = getAlias(fors, expression);
				// 取值域路径
				access = fors.accesses[fors.aliases.indexOf(alias)];
			}
			else {
				alias = util.getExpAlias(model);
			}

			// 取值字段访问路径
			if (model === '$index' || model === alias) {
				valAccess = access;
			}
			else {
				if (access) {
					valAccess = access + '*' + util.getExpKey(model);
				}
			}

			deps.push(model);
			paths.push(valAccess);
		});

		return [deps, paths];
	}

	return Parser;
});