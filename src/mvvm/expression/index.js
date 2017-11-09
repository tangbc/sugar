import { warn, error, noop } from '../../util'
import { createPath, setValueByPath} from './path'

// 匹配常量缓存序号 "1"
const saveConstRE = /"(\d+)"/g
// 只含有 true 或 false
const booleanRE = /^(true|false)$/
// 匹配表达式中的常量
const replaceConstRE = /[\{,]\s*[\w\$_]+\s*:|('[^']*'|"[^"]*")|typeof /g
// 匹配表达式中的取值域
const replaceScopeRE = /[^\w$\.]([A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\])*)/g
// 匹配常规取值: item or item['x'] or item["y"] or item[0]
const normalRE = /^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\]|\[\d+\]|\[[A-Za-z_$][\w$]*\])*$/

// 表达式中允许的关键字
const allowKeywords = 'JSON.Math.parseInt.parseFloat.Date.this.true.false.null.undefined.Infinity.NaN.' +
                    'isNaN.isFinite.decodeURI.decodeURIComponent.encodeURI.encodeURIComponent'

// 表达式中禁止的关键字
const avoidKeywords = 'var.const.let.if.else.for.in.continue.switch.case.break.default.function.return.' +
                    'do.while.delete.try.catch.throw.finally.with.import.export.instanceof.yield.await'

// 保存常量，返回序号 "i"
let consts = []
function saveConst (string) {
    let i = consts.length
    consts[i] = string
    return '"' + i + '"'
}

/**
 * 返回替换之前的常量
 * @param   {Strinf}  string
 * @param   {Number}  i
 * @return  {String}
 */
function returnConst (string, i) {
    return consts[i]
}

/**
 * 是否是不加 scope 的语句
 * @param   {String}  sentence
 * @return  {Boolean}
 */
const allKeywords = allowKeywords + '.' + avoidKeywords
const scopeKeywordRE = new RegExp('^(' + allKeywords.replace(/\./g, '\\b|') + '\\b)')
function isScopeKeyword (sentence) {
    return sentence.indexOf('$event') === 0 || scopeKeywordRE.test(sentence)
}

/**
 * 返回变量/语句的 scope 替换
 * @param   {String}  string
 * @return  {String}
 */
function replaceScope (string) {
    let pad = string.charAt(0)
    let path = string.slice(1)

    if (isScopeKeyword(path)) {
        return string
    } else {
        path = path.indexOf('"') > -1 ? path.replace(saveConstRE, returnConst) : path
        return pad + 'scope.' + path
    }
}

/**
 * 是否是常规指令表达式
 * @param   {String}   expression
 * @return  {Boolean}
 */
export function isNormal (expression) {
    return normalRE.test(expression) && !booleanRE.test(expression)
}

/**
 * 表达式变量添加 scope
 * @return  {String}
 */
export function addScope (expression) {
    if (isNormal(expression)) {
        return 'scope.' + expression
    }

    expression = (' ' + expression).replace(replaceConstRE, saveConst)
    expression = expression.replace(replaceScopeRE, replaceScope)
    expression = expression.replace(saveConstRE, returnConst)

    return expression
}

/**
 * 生成表达式取值函数
 * @param   {String}    expression
 * @return  {Function}
 */
const aviodKeywordRE = new RegExp('^(' + avoidKeywords.replace(/\./g, '\\b|') + '\\b)')
export function createGetter (expression) {
    if (aviodKeywordRE.test(expression)) {
        warn('Avoid using unallow keyword in expression ['+ expression +']')
        return noop
    }

    try {
        return new Function('scope', 'return ' + addScope(expression) + ';')
    } catch (e) {
        error('Invalid generated expression: [' + expression + ']')
        return noop
    }
}

/**
 * 生成表达式设值函数
 * @param  {String}  expression
 */
export function createSetter (expression) {
    let paths = createPath(expression)
    if (paths.length) {
        return function setter (scope, value) {
            setValueByPath(scope, value, paths)
        }
    } else {
        error('Invalid setter expression ['+ expression +']')
        return noop
    }
}
