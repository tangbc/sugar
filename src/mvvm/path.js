import { removeSpace, each, copy } from '../util';

const INIT = 0;
const IDENT = 1;
const QUOTE = 2;
const OTHER = 3;

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
		(code >= 0x41 && code <= 0x5A) ||
		(code >= 0x61 && code <= 0x7A) ||
		(code >= 0x30 && code <= 0x39)
	) {
		return IDENT;
	}

	switch (code) {
		case 0x5B: // [
		case 0x5D: // ]
		case 0x2E: // .
		case 0x22: // "
		case 0x27: // '
			return QUOTE;
		default:
			return OTHER; // @todo
	}
}

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
		var { keepIdent, tobeQuote, keepQuote, tobeIdent } = this.get(state);

		if (keepIdent) {
			this.save(state, value);
		} else if (tobeQuote) {
			let saves = this.saves;
			this.saves = '';
			this.change(state);
			return saves;
		} else if (keepQuote) {
			// to do nothing
		} else if (tobeIdent) {
			this.save(state, value);
			this.change(state);
		}
	},

	/**
	 * 获取状态变更类型
	 * @param   {Number}  willbe   [将要转换的状态]
	 * @return  {String}           [状态操作类型]
	 */
	get: function (willbe) {
		var current = this.state;
		var keepIdent = current === IDENT && willbe === IDENT;
		var tobeQuote = (current === IDENT || current === INIT) && willbe === QUOTE;
		var keepQuote = current === QUOTE && willbe === QUOTE;
		var tobeIdent = (current === QUOTE || current === INIT) && willbe === IDENT;
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
	var firstState = getState(letters[0]);

	StateMachine.init(firstState);
	each(letters, function (letter, index) {
		var state = getState(letter);
		var word = StateMachine.set(state, letter);
		if (word) {
			paths.push(word);
		}

		// 解析结束
		if (index + 1 === letters.length && StateMachine.saves) {
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
 * @return  {Mix}
 */
function getDeep (target, paths) {
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
 * 根据访问路径设置对象指定字段的值
 * @param  {Object}  scope
 * @param  {Mix}     value
 * @param  {Array}   paths
 */
export function setValueByPath (scope, value, paths) {
	var _paths = copy(paths);
	var set = _paths.pop();
	var data = getDeep(scope, _paths);
	if (data) {
		data[set] = value;
	}
}
