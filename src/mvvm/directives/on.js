import Parser, { linkParser } from '../parser'
import { addEvent, removeEvent } from '../../dom'
import { isNormal, addScope } from '../expression/index'
import { removeSpace, each, error, warn, noop } from '../../util'

/**
 * 获取事件修饰符对象
 * 支持 6 种事件修饰符
 * .self .stop .prevent .capture .keyCode .one
 * @param  {String}  type
 * @param  {Object}  modifier
 */
function getModifiers (type, modifier) {
    let modifiers = modifier.split('.')

    let self = modifiers.indexOf('self') > -1
    let stop = modifiers.indexOf('stop') > -1
    let one = modifiers.indexOf('one') > -1
    let prevent = modifiers.indexOf('prevent') > -1
    let capture = modifiers.indexOf('capture') > -1

    let keyCode = null
    if (type.indexOf('key') === 0) {
        each(modifiers, function (value) {
            if (/^(\d)*$/.test(value)) {
                keyCode = +value
                return false
            }
        })
    }

    return { self, stop, prevent, capture, keyCode, one }
}

/**
 * 收集绑定的事件
 * @param   {Object}  desc
 * @return  {Array}
 */
function collectEvents (desc) {
    let binds = []
    let args = desc.args
    let expression = desc.expression.trim()

    if (args) {
        let pos = args.indexOf('.')
        let type = pos === -1 ? args : args.substr(0, pos)
        let modifier = pos === -1 ? '' : args.substr(pos + 1,  args.length)
        binds = [{ type, handler: expression, modifier }]
    } else if (/^{.*}$/.test(expression)) {
        expression = expression.substr(1, expression.length - 2)
        each(removeSpace(expression).split(','), function (event) {
            let info = event.split(':')
            binds.push({ type: info[0], handler: info[1], modifier: '' })
        })
    }

    return binds
}

/**
 * 生成匿名事件函数
 * @param   {String}  expression
 * @return  {Function}
 */
function createAnonymous (expression) {
    try {
        return new Function('scope', '$event', addScope(expression))
    } catch (e) {
        error('Invalid generated expression: [' + expression + ']')
        return noop
    }
}

/**
 * v-on 指令解析模块
 * 不需要实例化 Directive
 */
export function VOn () {
    Parser.apply(this, arguments)
}

let von = linkParser(VOn)

/**
 * 解析 v-on 指令
 */
von.parse = function () {
    each(collectEvents(this.desc), function (bind) {
        this.parseEvent(bind)
    }, this)
}

/**
 * 解析事件绑定函数
 * @param  {Object}  event
 */
von.parseEvent = function (event) {
    let { type, handler, modifier } = event
    let modifiers = getModifiers(type, modifier)

    if (handler === '$remove') {
        return this.bindRemoveEvent(type, modifiers)
    }

    let inlineStatement = isNormal(handler) ? handler + '($event)' : handler
    this.bindEvent(type, createAnonymous(inlineStatement), modifiers)
}

/**
 * 绑定删除($remove) vfor 选项事件
 * @param  {String}  type       [事件类型]
 * @param  {Object}  modifiers  [事件修饰符]
 */
von.bindRemoveEvent = function (type, modifiers) {
    let scope = this.scope

    if (!scope) {
        return warn('The specify event $remove must be used in v-for scope')
    }

    let alias = scope.__alias__
    this.bindEvent(type, function $remove () {
        scope.__viterator__.$remove(scope[alias])
    }, modifiers)
}

/**
 * 添加一个事件绑定，同时处理参数的变更
 * @param  {String}    type       [事件类型]
 * @param  {Function}  handler    [事件函数]
 * @param  {Object}    modifiers  [事件修饰符]
 */
von.bindEvent = function (type, handler, modifiers) {
    let el = this.el
    let scope = this.scope || this.vm.$data
    let { self, stop, prevent, capture, keyCode, one } = modifiers

    let listenerAgent = function (e) {
        if (
            (self && e.target !== el) || // 是否限定只能在当前节点触发事件
            (keyCode && keyCode !== e.keyCode) // 键盘事件时是否指定键码触发
        ) {
            return
        }

        // 是否阻止默认事件
        if (prevent) {
            e.preventDefault()
        }

        // 是否阻止冒泡
        if (stop) {
            e.stopPropagation()
        }

        handler.call(scope, scope, e)
    }

    let listener = one ? function (e) {
        listenerAgent(e)
        removeEvent(el, type, listener, capture)
    } : listenerAgent

    addEvent(el, type, listener, capture)
}
