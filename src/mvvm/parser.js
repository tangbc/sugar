/**
 * parser 指令解析模块
 */
var util = require('../util');

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
	var alias, exp = expression;

	if (exp.indexOf(fors.alias) !== -1) {
		return fors.alias;
	}

	// 跨层级的别名
	util.each(fors.aliases, function(_alias) {
		if ((new RegExp('\\b' + _alias + '\\b|\\b'+ _alias +'\\.')).test(exp)) {
			alias = _alias;
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
 * @param   {Object}      fors
 * @param   {DOMElement}  node
 * @param   {String}      expression
 */
p.bind = function(fors, node, expression) {
	// 提取依赖
	var deps = this.getDeps(fors, expression);
	// 取值域
	var scope = this.getScope(fors, expression);
	// 取值函数
	var getter = this.getEval(fors, expression);
	// 别名映射
	var maps = fors && util.copy(fors.maps);

	// 初始视图更新
	this.update(node, getter.call(scope, scope));

	// 监测依赖变化，更新取值 & 视图
	this.vm.watcher.watch(deps, function() {
		scope = this.updateScope(scope, maps, deps, arguments);
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
		throw('Invalid generated expression: ' + expression);
	}
}

/**
 * 获取表达式的取值函数
 */
p.getEval = function(fors, expression) {
	var exp = this.toScope(expression);

	if (regAviodKeyword.test(exp)) {
		return util.warn('Avoid using unallow keyword in expression: ' + exp);
	}

	// 替换 vfor 取值域别名
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
 * 转换表达式的变量为 scope 关键字参数
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
 * 获取数据模型
 * @return  {Object}
 */
p.getModel = function() {
	return this.vm.$data;
}

/**
 * 获取表达式的取值域
 * @param   {Object}  fors
 * @param   {String}  expression
 * @return  {Object}
 */
p.getScope = function(fors, expression) {
	var model = this.getModel();

	if (fors) {
		util.defRec(model, '$index', fors.index);
		util.defRec(model, '$scope', fors.scopes);
	}

	return model;
}

/**
 * 更新取值域
 * @param   {Object}  oldScope   [旧取值域]
 * @param   {Object}  maps       [别名映射]
 * @param   {Object}  deps       [取值依赖]
 * @param   {Array}   args       [变更参数]
 * @return  {Mix}
 */
p.updateScope = function(oldScope, maps, deps, args) {
	var leng = 0, $scope = {};
	var model = this.getModel();
	var targetPaths, scopePaths;
	var accesses = util.copy(deps.acc);

	// 获取最深层的依赖
	accesses.unshift(args[0]);
	util.each(accesses, function(access) {
		var paths = util.makePaths(access);
		if (paths.length > leng) {
			targetPaths = paths;
			leng = paths.length;
		}
	});

	// 更新 vfor 取值
	if (targetPaths) {
		// 取值路径数组
		scopePaths = util.makeScopePaths(targetPaths);
		// 对每一个取值路径进行更新
		util.each(scopePaths, function(paths) {
			var leng = paths.length;

			// 更新下标的情况通过变更参数来确定
			if ((args[0] === '$index')) {
				paths[leng - 1] = args[1];
			}

			var field = paths[leng - 2];
			var index = +paths[leng - 1];
			var scope = util.getDeepValue(model, paths) || {};

			util.defRec(model, '$index', index);
			$scope[maps[field]] = scope;
		});

		util.defRec(model, '$scope', util.extend(oldScope.$scope, $scope));
	}

	return model;
}

/**
 * 获取表达式的所有依赖（取值模型+访问路径）
 * @param   {Object}  fors        [vfor 数据]
 * @param   {String}  expression
 * @return  {Object}
 */
p.getDeps = function(fors, expression) {
	var deps = [], paths = [];
	var exp = ' ' + expression.replace(regReplaceConst, saveConst);
	var depMatches = exp.match(regReplaceScope);

	// 提取依赖和依赖的访问路径
	util.each(depMatches, function(dep) {
		var model = dep.substr(1);
		var alias, hasIndex, access, valAccess;

		// 取值域别名或 items.length -> items
		if (fors) {
			alias = getAlias(fors, dep);
			hasIndex = model.indexOf('$index') !== -1;

			// 取值域路径
			if (model.indexOf(alias) !== -1 || hasIndex) {
				access = fors.accesses[fors.aliases.indexOf(alias)];
			}
		}
		else {
			alias = util.getExpAlias(model);
		}

		// 取值字段访问路径，输出别名和下标
		if (hasIndex || model === alias) {
			valAccess = access || fors && fors.access;
		}
		else {
			if (access && model !== '$event') {
				valAccess = access + '*' + util.getExpKey(model);
			}
		}

		// 相同的依赖出现多次只需记录一次
		if (deps.indexOf(model) === -1) {
			deps.push(model);
			paths.push(valAccess);
		}
	});

	return {
		'dep': deps,
		'acc': paths
	}
}

module.exports = Parser;
