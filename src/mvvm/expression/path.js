import { removeSpace, each, copy, isObject } from '../../util';

const INIT = 0;
const IDENT = 1;
const QUOTE = 2;
const OTHER = 1;

function ident (value) {
	return value;
}

function quote (value) {
	return '';
}

var convert = [0, ident, quote, ident];

/**
 * 获取字符类型
 * 这里只定义了普通取词的分割法
 * @param   {String}  cha
 * @return  {Number}
 */
function getState (cha) {
	var code = cha.charCodeAt(0);

	// a-z A-Z 0-9
	if (
		(code >= 65 && code <= 90) ||
		(code >= 97 && code <= 122) ||
		(code >= 48 && code <= 57)
	) {
		return IDENT;
	}

	switch (code) {
		case 91: // [
		case 93: // ]
		case 46: // .
		case 34: // "
		case 39: // '
			return QUOTE;
		default:
			return OTHER;
	}
}

/**
 * 取词状态机
 * @type  {Object}
 */
var StateMachine = {
	/**
	 * 初始状态设定
	 */
	init: function (state) {
		this.saves = '';
		this.state = state;
	},

	/**
	 * 设置状态并返回当前取词
	 * @param  {Number}  state
	 * @param  {String}  value
	 */
	set: function (state, value) {
		var { keepIdent, tobeQuote, tobeIdent } = this.get(state);

		if (keepIdent) {
			this.save(state, value);
		} else if (tobeQuote) {
			let saves = this.saves;
			this.saves = '';
			this.change(state);
			return saves;
		} else if (tobeIdent) {
			this.save(state, value);
			this.change(state);
		}
	},

	/**
	 * 获取状态变更类型
	 * @param   {Number}  toBecome  [将要转换的状态]
	 * @return  {Object}            [状态类型对象]
	 */
	get: function (toBecome) {
		var current = this.state;
		var keepIdent = current === IDENT && toBecome === IDENT;
		var tobeQuote = (current === IDENT || current === INIT) && toBecome === QUOTE;
		var keepQuote = current === QUOTE && toBecome === QUOTE;
		var tobeIdent = (current === QUOTE || current === INIT) && toBecome === IDENT;
		return { keepIdent, tobeQuote, keepQuote, tobeIdent };
	},

	/**
	 * 更改状态
	 * @param   {Number}  state
	 */
	change: function (state) {
		this.state = state;
	},

	/**
	 * 缓存当前字符
	 */
	save: function (state, value) {
		this.saves += convert[state](value);
	},

	/**
	 * 重置状态
	 */
	reset: function () {
		this.saves = '';
		this.state = INIT;
	}
}

/**
 * 将字符表达式解析成访问路径
 * @param   {String}  expression
 * @return  {Array}
 */
function parseToPath (expression) {
	var paths = [];
	var letters = expression.split('');
	var lastIndex = letters.length - 1;
	var firstState = getState(letters[0]);

	StateMachine.init(firstState);
	each(letters, function (letter, index) {
		var state = getState(letter);
		var word = StateMachine.set(state, letter);
		if (word) {
			paths.push(word);
		}

		// 解析结束
		if (index === lastIndex && StateMachine.saves) {
			paths.push(StateMachine.saves);
			StateMachine.reset();
		}
	});

	return paths;
}

/**
 * 通过访问层级取值
 * @param   {Object}  target
 * @param   {Array}   paths
 * @return  {Object}
 */
function getDeepValue (target, paths) {
	while (paths.length) {
		target = target[paths.shift()];
	}
	return target;
}


/**
 * 生成访问路径数组
 * @param   {String}  expression
 * @return  {Array}
 */
export function createPath (expression) {
	return parseToPath(removeSpace(expression));
}

/**
 * 根据访问路径设置对象指定字段值
 * @param  {Object}  scope
 * @param  {Mix}     value
 * @param  {Array}   paths
 */
export function setValueByPath (scope, value, paths) {
	var copyPaths = copy(paths);
	var set = copyPaths.pop();
	var data = getDeepValue(scope, copyPaths);
	if (isObject(data)) {
		data[set] = value;
	}
}
