/*!
 * sugar.js v1.4.2 (c) 2017 TANG
 * Released under the MIT license
 * Fri Nov 10 2017 17:15:52 GMT+0800 (CST)
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.Sugar = factory());
}(this, function () { 'use strict';

    var OP = Object.prototype
    var has = OP.hasOwnProperty

    /**
     * typeof 类型检测
     * @param   {Mix}      test
     * @param   {String}   type
     * @return  {Boolean}
     */
    function typeOf (test, type) {
        return typeof test === type
    }

    /**
     * 是否是对象
     */
    function isObject (object) {
        return OP.toString.call(object) === '[object Object]'
    }

    /**
     * 是否是数组
     */
    function isArray (array) {
        return Array.isArray(array)
    }

    /**
     * 是否是函数
     */
    function isFunc (func) {
        return typeOf(func, 'function')
    }

    /**
     * 是否是字符串
     */
    function isString (str) {
        return typeOf(str, 'string')
    }

    /**
     * 是否是布尔值
     */
    function isBool (bool) {
        return typeOf(bool, 'boolean')
    }

    /**
     * 是否是数字
     */
    function isNumber (num) {
        return typeOf(num, 'number') && !isNaN(num)
    }

    /**
     * 是否是纯粹对象
     */
    function isPlainObject (object) {
        if (!object || !isObject(object) || object.nodeType || object === object.window) {
            return false
        }

        if (object.constructor && !has.call(object.constructor.prototype, 'isPrototypeOf')) {
            return false
        }

        return true
    }

    /**
     * 是否是空对象
     * @param   {Object}   object
     * @return  {Boolean}
     */
    function isEmptyObject (object) {
        return Object.keys(object).length === 0
    }

    /**
     * 将 value 转化为字符串
     * undefined 和 null 都转成空字符串
     * @param   {Mix}     value
     * @return  {String}
     */
    function _toString (value) {
        return value == null ? '' : value.toString()
    }

    /**
     * value 转成 Number 类型
     * 如转换失败原样返回
     * @param   {String|Mix}  value
     * @return  {Number|Mix}
     */
    function toNumber (value) {
        if (isString(value)) {
            var val = Number(value)
            return isNumber(val) ? val : value
        } else {
            return value
        }
    }

    /**
     * 空操作函数
     */
    function noop () {}

    var cons = window.console

    /**
     * 打印警告信息
     */
    /* istanbul ignore next */
    function warn () {
        if (cons) {
            cons.warn.apply(cons, arguments)
        }
    }

    /**
     * 打印错误信息
     */
    /* istanbul ignore next */
    function error () {
        if (cons) {
            cons.error.apply(cons, arguments)
        }
    }

    /*
     * 对象自有属性检测
     */
    function hasOwn (obj, key) {
        return obj && has.call(obj, key)
    }

    /**
     * object 定义或修改 property 属性
     * @param  {Object}   object      [对象]
     * @param  {String}   property    [属性字段]
     * @param  {Mix}      value       [属性的修改值/新值]
     * @param  {Boolean}  enumerable  [属性是否出现在枚举中]
     */
    function def (object, property, value, enumerable) {
        return Object.defineProperty(object, property, {
            value: value,
            writable: true,
            enumerable: !!enumerable,
            configurable: true
        })
    }

    /**
     * 遍历数组或对象，提供删除选项和退出遍历的功能
     * @param  {Array|Object}  iterator  [数组或对象]
     * @param  {Fuction}       callback  [回调函数]
     * @param  {Object}        context   [作用域]
     */
    function each (iterator, callback, context) {
        var i, ret

        if (!context) {
            context = this
        }

        // 数组
        if (isArray(iterator)) {
            for (i = 0; i < iterator.length; i++) {
                ret = callback.call(context, iterator[i], i, iterator)

                // 回调返回 false 退出循环
                if (ret === false) {
                    break
                }

                // 回调返回 null 从原数组删除当前选项
                if (ret === null) {
                    iterator.splice(i, 1)
                    i--
                }
            }

        } else if (isObject(iterator)) {
            var keys = Object.keys(iterator)

            for (i = 0; i < keys.length; i++) {
                var key = keys[i]

                ret = callback.call(context, iterator[key], key, iterator)

                // 回调返回 false 退出循环
                if (ret === false) {
                    break
                }

                // 回调返回 null 从原对象删除当前选项
                if (ret === null) {
                    delete iterator[key]
                }
            }
        }
    }

    /**
     * 删除 object 所有属性
     * @param  {Object}   object
     */
    function clearObject (object) {
        each(object, function () {
            return null
        })
    }

    /**
     * 扩展合并对象
     */
    /* istanbul ignore next */
    function extend () {
        var arguments$1 = arguments;

        var options, name, src, copy, copyIsArray, clone
        var target = arguments[0] || {}, i = 1, length = arguments.length, deep = false

        // Handle a deep copy situation
        if (isBool(target)) {
            deep = target
            target = arguments[i] || {}
            i++
        }

        // Handle case when target is a string or something (possible in deep copy)
        if (typeof target !== 'object' && !isFunc(target)) {
            target = {}
        }

        // Extend Util itself if only one argument is passed
        if (i === length) {
            target = this
            i--
        }

        for (; i < length; i++) {
            // Only deal with non-null/undefined values
            if ((options = arguments$1[i]) != null) {
                // Extend the base object
                for (name in options) {
                    src = target[name]
                    copy = options[name]

                    // Prevent never-ending loop
                    if (target === copy) {
                        continue
                    }

                    // Recurse if we're merging plain objects or arrays
                    if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
                        if (copyIsArray) {
                            copyIsArray = false
                            clone = src && isArray(src) ? src : []

                        } else {
                            clone = src && isPlainObject(src) ? src : {}
                        }

                        // Never move original objects, clone them
                        target[name] = extend(deep, clone, copy)
                    }
                    // Don't bring in undefined values
                    else if (copy !== undefined) {
                        target[name] = copy
                    }
                }
            }
        }

        // Return the modified object
        return target
    }

    /**
     * 复制对象或数组，其他类型原样返回
     * @param   {Object|Array}  target
     * @return  {Mix}
     */
    function copy (target) {
        var ret

        if (isArray(target)) {
            ret = extend(true, [], target)
        } else if (isObject(target)) {
            ret = extend(true, {}, target)
        }

        return ret || target
    }


    /**
     * 创建一个空的 dom 元素
     * @param   {String}  tag  [元素标签名称]
     * @return  {Elemnt}
     */
    function createElement (tag) {
        return document.createElement(tag)
    }

    /**
     * 返回一个空文档碎片
     * @return  {Fragment}
     */
    function createFragment () {
        return document.createDocumentFragment()
    }

    /**
     * element 的子节点转换成文档片段（element 将会被清空）
     * @param  {Element}  element
     */
    function nodeToFragment (element) {
        var child
        var fragment = createFragment()

        while (child = element.firstChild) {
            fragment.appendChild(child)
        }

        return fragment
    }

    /**
     * 去掉字符串中所有空格
     * @param   {String}  string
     * @return  {String}
     */
    var spaceRE = /\s/g
    function removeSpace (string) {
        return string.replace(spaceRE, '')
    }

    /**
     * 设置/读取数据配置对象
     * @param   {Object}   data   [配置对象]
     * @param   {String}   name   [配置名称, 支持/分隔层次]
     * @param   {Mix}      value  [不传为读取配置信息]
     * @return  {Mix}             [返回读取的配置值]
     */
    function config (data, name, value) {
        if (name) {
            var ns = name.split('.')
            while (ns.length > 1 && hasOwn(data, ns[0])) {
                data = data[ns.shift()]
            }
            name = ns[0]
        } else {
            return data
        }

        if (typeof value !== 'undefined') {
            data[name] = value
            return
        } else {
            return data[name]
        }
    }

    /**
     * 挂载到 sugar 上的工具方法
     * @param  {Object}
     */
    var util = Object.create(null)

    util.def = def
    util.each = each
    util.copy = copy
    util.config = config
    util.extend = extend
    util.hasOwn = hasOwn
    util.isFunc = isFunc
    util.isBool = isBool
    util.isArray = isArray
    util.isObject = isObject
    util.isNumber = isNumber
    util.isString = isString
    util.isEmptyObject = isEmptyObject

    /**
     * 执行一个 http 请求
     * @param   {String}    dataType  [回调数据类型 json/text ]
     * @param   {String}    url       [请求url]
     * @param   {String}    method    [请求类型]
     * @param   {String}    param     [请求参数]
     * @param   {Function}  callback  [回调函数]
     * @param   {Function}  context   [作用域]
     * @return  {Object}
     */
    function execute (dataType, url, method, param, callback, context) {
        var ct = context || this
        var xhr = new XMLHttpRequest()

        // 初始化请求
        xhr.open(method, url, true)

        // 状态变化回调
        xhr.onreadystatechange = function () {
            var status = xhr.status
            var result = null, error = null

            // 请求完成
            if (xhr.readyState === 4) {
                var response = xhr.responseText

                // 返回数据类型
                if (dataType !== 'text') {
                    try {
                        response = JSON.parse(response)
                    }
                    catch (e) {}
                }

                // 请求响应成功
                if (status === 200) {
                    result = {
                        success: true,
                        result: response
                    }
                } else {
                    error = {
                        result: null,
                        success: false,
                        status: status
                    }
                }

                callback.call(ct, error, result)
            }
        }

        if (param) {
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
        }

        xhr.send(param)

        return xhr
    }

    /**
     * get 请求
     */
    function get (url, param, callback, context, dataType) {
        var params = []

        if (isFunc(param)) {
            dataType = context
            context = callback
            callback = param
            param = null
        }

        // 格式化参数对象
        each(param, function (val, key) {
            params.push(key + '=' + encodeURIComponent(val))
        })

        if (params.length) {
            url = url + '?' + params.join('&')
        }

        return execute(dataType || 'json', url, 'GET', null, callback, context)
    }

    /**
     * post 请求
     */
    function post (url, param, callback, context) {
        return execute('json', url, 'POST', param ? JSON.stringify(param) : null, callback, context)
    }

    /**
     * 拉取静态模板
     */
    function load (url, param, callback, context) {
        return get(url, param, callback, context, 'text')
    }

    /**
     * 挂载到 Sugar 上的 Ajax 工具方法
     * @type  {Object}
     */
    var ajax = Object.create(null)

    ajax.get = get
    ajax.post = post
    ajax.load = load

    var cache = { id: 1, length: 0 }

    var superRE = /\b\.Super\b/
    var _toString$1 = Function.prototype.toString

    /**
     * 对子类方法挂载 Super
     * @param   {Function}  Super   [Super 函数]
     * @param   {Mix}       method  [子类属性或者方法]
     * @return  {Mix}
     */
    function bindSuper (Super, method) {
        if (
            isFunc(method) &&
            superRE.test(_toString$1.call(method))
        ) {
            return function () {
                this.Super = Super
                method.apply(this, arguments)
            }
        } else {
            return method
        }
    }

    /*
     * Root 实现类式继承
     * @param   {Object}    proto  [生成类的属性或方法]
     * @return  {Function}  Class  [继承后的类]
     */
    function Root () {}
    Root.extend = function (proto) {
        var parent = this.prototype

        /**
         * 子类对父类方法的调用
         * @param  {String}  method     [父类方法]
         * @param  {Object}  oldConfig  [原配置参数]
         * @param  {Object}  newConfig  [新配置参数]
         */
        function Super (method, oldConfig, newConfig) {
            var func = parent[method]
            if (isFunc(func)) {
                func.call(this, extend(true, newConfig, oldConfig))
            }
        }

        /**
         * 返回(继承后)的类
         */
        function Class () {}
        var classProto = Class.prototype = Object.create(parent)

        each(proto, function (value, property) {
            classProto[property] = bindSuper(Super, value)
        })

        proto = null
        Class.extend = this.extend
        classProto.constructor = Class

        return Class
    }

    /**
     * 字符串首字母大写
     * @param   {String}  string
     */
    function ucFirst (string) {
        return string.charAt(0).toUpperCase() + string.substr(1)
    }

    /**
     * 根据组件名称获取组件实例
     * @param   {String}  name
     */
    function getComponentByName (name) {
        var component = null

        each(cache, function (instance) {
            if ((instance.__rd__ && instance.__rd__.name) === name) {
                component = instance
                return false
            }
        })

        return component
    }

    /**
     * 创建一条消息
     * @param  {String}  type    [消息类型]
     * @param  {Object}  sender  [发送消息的组件实例]
     * @param  {String}  name    [发送的消息名称]
     * @param  {Mix}     param   [<可选>附加消息参数]
     * @return {Object}
     */
    function createMessage (type, sender, name, param) {
        return {
            // 消息类型
            type: type,
            // 消息发起组件实例
            from: sender,
            // 消息目标组件实例
            to: null,
            // 消息被传递的次数
            count: 0,
            // 消息名称
            name: name,
            // 消息参数
            param: param,
            // 接收消息组件的调用方法 on + 首字母大写
            method: 'on' + ucFirst(name),
            // 消息接收者的返回数据
            returns: null
        }
    }

    /**
     * 触发接收消息组件实例的处理方法
     * @param  {Object}  receiver  [接收消息的组件实例]
     * @param  {Mix}     msg       [消息体（内容）]
     * @return {Mix}
     */
    function triggerReceiver (receiver, msg) {
        // 接受者消息处理方法
        var func = receiver[msg.method]

        // 触发接收者的消息处理方法
        if (isFunc(func)) {
            // 标识消息的发送目标
            msg.to = receiver
            // 发送次数
            ;++msg.count
            return func.call(receiver, msg)
        }
    }

    /**
     * 通知发送者消息已被全部接收完毕
     * @param  {Mix}       msg       [消息体（内容）]
     * @param  {Function}  callback  [通知发送者的回调函数]
     * @param  {Object}    context   [执行环境]
     */
    function feedbackSender (msg, callback, context) {
        if (isFunc(callback)) {
            callback.call(context, msg)
        }
    }

    /**
     * 冒泡（由下往上）方式发送消息，由子组件实例发出，逐层父组件实例接收
     * @param  {Object}    sender    [发送消息的子组件实例]
     * @param  {String}    name      [发送的消息名称]
     * @param  {Mix}       param     [<可选>附加消息参数]
     * @param  {Function}  callback  [<可选>发送完毕的回调函数，可在回调中指定回应数据]
     * @param  {Object}    context   [执行环境]
     */
    function fire (sender, name, param, callback, context) {
        // 创建消息
        var msg = createMessage('fire', sender, name, param)

        // 消息接收者，先从上一层模块开始接收
        var receiver = sender.getParent()

        while (receiver) {
            var ret = triggerReceiver(receiver, msg)

            // 接收消息方法返回 false 则不再继续冒泡
            if (ret === false) {
                feedbackSender(msg, callback, context)
                return
            }

            msg.from = receiver
            receiver = receiver.getParent()
        }

        feedbackSender(msg, callback, context)
    }

    /**
     * 广播（由上往下）方式发送消息，由父组件实例发出，逐层子组件实例接收
     * @param  {Object}    sender    [发送消息的子组件实例]
     * @param  {String}    name      [发送的消息名称]
     * @param  {Mix}       param     [<可选>附加消息参数]
     * @param  {Function}  callback  [<可选>发送完毕的回调函数，可在回调中指定回应数据]
     * @param  {Object}    context   [执行环境]
     */
    function broadcast (sender, name, param, callback, context) {
        // 创建消息
        var msg = createMessage('broadcast', sender, name, param)

        // 消息接收者集合，先从自身的子模块开始接收
        var receivers = sender.getChilds(true).slice(0)

        while (receivers.length) {
            var receiver = receivers.shift()
            var ret = triggerReceiver(receiver, msg)

            // 接收消息方法返回 false 则不再继续广播
            if (ret !== false) {
                msg.from = receiver
                Array.prototype.push.apply(receivers, receiver.getChilds(true))
            }
        }

        feedbackSender(msg, callback, context)
    }

    /**
     * 向指定组件实例发送消息
     * @param  {Object}    sender    [发送消息的组件实例]
     * @param  {String}    receiver  [接受消息的组件实例名称支持.分层级]
     * @param  {String}    name      [发送的消息名称]
     * @param  {Mix}       param     [<可选>附加消息参数]
     * @param  {Function}  callback  [<可选>发送完毕的回调函数，可在回调中指定回应数据]
     * @param  {Object}    context   [执行环境]
     */
    function notify (sender, receiver, name, param, callback, context) {
        // 找到 receiver，名称可能为 superName.fatherName.childName 的情况
        if (isString(receiver)) {
            var target
            var paths = receiver.split('.')
            var parent = getComponentByName(paths.shift())

            // 有层级
            if (paths.length) {
                each(paths, function (comp) {
                    target = parent.getChild(comp)
                    parent = target
                    return null
                })
            } else {
                target = parent
            }

            parent = null

            if (isObject(target)) {
                receiver = target
            }
        }

        var msg = createMessage('notify', sender, name, param)

        if (!isObject(receiver)) {
            feedbackSender(msg, callback, context)
            return warn('Component: [' + receiver + '] is not exist!')
        }

        triggerReceiver(receiver, msg)

        feedbackSender(msg, callback, context)
    }

    /**
     * 全局广播发消息，系统全部组件实例接受
     * @param  {String}    name      [发送的消息名称]
     * @param  {Mix}       param     [<可选>附加消息参数]
     * @param  {Function}  callback  [<可选>发送完毕的回调函数，可在回调中指定回应数据]
     * @param  {Object}    context   [执行环境]
     */
    function globalCast (name, param, callback, context) {
        var msg = createMessage('globalCast', '__core__', name, param)

        each(cache, function (receiver, index) {
            if (isObject(receiver) && index !== '0') {
                triggerReceiver(receiver, msg)
            }
        })

        feedbackSender(msg, callback, context)
    }

    var messager = { fire: fire, broadcast: broadcast, notify: notify, globalCast: globalCast }

    var childMap = 'map'
    var childArray = 'array'

    /**
     * Module 系统组件模块基础类，实现所有模块的通用方法
     */
    var Module = Root.extend({
        /**
         * __rd__ 记录模块信息
         * @type {Object}
         */
        __rd__: {},

        /**
         * 创建一个子模块实例
         * @param  {String}  name    [子模块名称，同一模块下创建的子模块名称不能重复]
         * @param  {Class}   Class   [生成子模块实例的类]
         * @param  {Object}  config  [<可选>子模块配置参数]
         * @return {Object}          [返回创建的子模块实例]
         */
        create: function (name, Class, config) {
            if (!isString(name)) {
                return warn('Module name ['+ name +'] must be a type of String')
            }
            if (!isFunc(Class)) {
                return warn('Module Class ['+ Class +'] must be a type of Component')
            }

            var record = this.__rd__

            // 建立模块关系信息
            if (!hasOwn(record, childArray)) {
                // 子模块实例缓存数组
                record[childArray] = []
                // 子模块命名索引
                record[childMap] = {}
            }

            // 判断是否已经创建过
            if (record[childMap][name]) {
                return warn('Module ['+ name +'] is already exists!')
            }

            // 生成子模块实例
            var instance = new Class(config)

            // 记录子模块实例信息和父模块实例的对应关系
            var subRecord = {
                // 子模块实例名称
                name: name,
                // 子模块实例id
                id: cache.id++,
                // 父模块实例 id，0 为顶级模块实例
                pid: record.id || 0
            }
            instance.__rd__ = subRecord

            // 存入系统实例缓存队列
            cache[subRecord.id] = instance
            cache.length++

            // 缓存子模块实例
            record[childArray].push(instance)
            record[childMap][name] = instance

            // 调用模块实例的 init 方法，传入配置参数和父模块
            if (isFunc(instance.init)) {
                instance.init(config, this)
            }

            return instance
        },

        /**
         * 获取当前模块的父模块实例（模块创建者）
         */
        getParent: function () {
            var record = this.__rd__
            var pid = record && record.pid
            return cache[pid] || null
        },

        /**
         * 获取当前模块创建的指定名称的子模块实例
         * @param  {String}  name  [子模块名称]
         * @return {Object}
         */
        getChild: function (name) {
            var record = this.__rd__
            return record && record[childMap] && record[childMap][name] || null
        },

        /**
         * 返回当前模块的所有子模块实例
         * @param  {Boolean}  returnArray  [返回的集合是否为数组形式，否则返回映射结构]
         * @return {Mix}
         */
        getChilds: function (returnArray) {
            var record = this.__rd__
            returnArray = isBool(returnArray) && returnArray
            return returnArray ? (record[childArray] || []) : (record[childMap] || {})
        },

        /**
         * 移除当前模块实例下的指定子模块的记录
         * @param  {String}   name  [子模块名称]
         * @return {Boolean}
         */
        _removeChild: function (name) {
            var record = this.__rd__
            var cMap = record[childMap] || {}
            var cArray = record[childArray] || []
            var child = cMap[name]

            for (var i = 0, len = cArray.length; i < len; i++) {
                if (cArray[i].id === child.id) {
                    delete cMap[name]
                    cArray.splice(i, 1)
                    break
                }
            }
        },

        /**
         * 模块销毁函数，只删除缓存队列中的记录和所有子模块集合
         * @param  {Mix}  notify  [是否向父模块发送销毁消息]
         */
        destroy: function (notify) {
            var record = this.__rd__
            var name = record.name

            // 调用销毁前函数，可进行必要的数据保存
            if (isFunc(this.beforeDestroy)) {
                this.beforeDestroy()
            }

            // 递归调用子模块的销毁函数
            var childs = this.getChilds(true)
            each(childs, function (child) {
                if (isFunc(child.destroy)) {
                    child.destroy(1)
                }
            })

            // 从父模块删除（递归调用时不需要）
            var parent = this.getParent()
            if (notify !== 1 && parent) {
                parent._removeChild(name)
            }

            // 从系统缓存队列中销毁相关记录
            var id = record.id
            if (hasOwn(cache, id)) {
                delete cache[id]
                cache.length--
            }

            // 调用销毁后函数，可进行销毁界面和事件
            if (isFunc(this._afterDestroy)) {
                this._afterDestroy()
            }

            // 向父模块通知销毁消息
            if (notify === true) {
                this.fire('subDestroyed', name)
            }

            // 移除所有属性
            clearObject(this)
        },

        /**
         * 冒泡（由下往上）方式发送消息，由子模块发出，逐层父模块接收
         * @param  {String}    name      [发送的消息名称]
         * @param  {Mix}       param     [<可选>附加消息参数]
         * @param  {Function}  callback  [<可选>发送完毕的回调函数，可在回调中指定回应数据]
         */
        fire: function (name, param, callback) {
            // 不传 param
            if (isFunc(param)) {
                callback = param
                param = null
            }

            // callback 为属性值
            if (isString(callback)) {
                callback = this[callback]
            }

            messager.fire(this, name, param, callback, this)
        },

        /**
         * 广播（由上往下）方式发送消息，由父模块发出，逐层子模块接收
         */
        broadcast: function (name, param, callback) {
            // 不传 param
            if (isFunc(param)) {
                callback = param
                param = null
            }

            // callback 为属性值
            if (isString(callback)) {
                callback = this[callback]
            }

            messager.broadcast(this, name, param, callback, this)
        },

        /**
         * 向指定模块实例发送消息
         * @param   {String}    receiver  [消息接受模块实例的名称以.分隔，要求完整的层级]
         * @param   {String}    name      [发送的消息名称]
         * @param   {Mix}       param     [<可选>附加消息参数]
         * @param   {Function}  callback  [<可选>发送完毕的回调函数，可在回调中指定回应数据]]
         */
        notify: function (receiver, name, param, callback) {
            // 不传 param
            if (isFunc(param)) {
                callback = param
                param = null
            }

            // callback 为属性值
            if (isString(callback)) {
                callback = this[callback]
            }

            messager.notify(this, receiver, name, param, callback, this)
        }
    })

    /**
     * Core 核心模块，用于顶层组件模块的创建
     */
    var Core = Module.extend({
        /**
         * 获取顶级组件实例
         * @param  {String}  name  [组件实例名称]
         * @return {Object}
         */
        get: function (name) {
            return this.getChild(name)
        },

        /**
         * 全局广播消息，由 core 实例发出，系统全部实例接收
         * @param  {String}    name      [发送的消息名称]
         * @param  {Mix}       param     [<可选>附加消息参数]
         * @param  {Function}  callback  [<可选>发送完毕的回调函数]
         * @param  {Object}    context   [<可选>执行环境]
         * @return {Boolean}
         */
        globalCast: function (name, param, callback, context) {
            // 不传 param
            if (isFunc(param)) {
                context = callback
                callback = param
                param = null
            }

            messager.globalCast(name, param, callback, context)
        },

        /**
         * 重写 destroy, core 模块不允许销毁
         */
        destroy: function () {}
    })

    var core = cache['0'] = new Core()

    var guid = 0

    /**
     * 依赖收集模块
     * @param  {String}  path  [数据路径]
     */
    function Depend (path) {
        this.path = path
        this.watchers = []
        this.guid = guid++
    }

    /**
     * 当前收集依赖的订阅模块 watcher
     * @type  {Object}
     */
    Depend.watcher = null

    var dp = Depend.prototype

    /**
     * 添加依赖订阅
     * @param  {Object}  watcher
     */
    dp.addWatcher = function (watcher) {
        this.watchers.push(watcher)
    }

    /**
     * 移除依赖订阅
     * @param  {Object}  watcher
     */
    dp.removeWatcher = function (watcher) {
        this.watchers.$remove(watcher)
    }

    /**
     * 为 watcher 收集当前的依赖
     */
    dp.depend = function () {
        if (Depend.watcher) {
            Depend.watcher.addDepend(this)
        }
    }

    /**
     * 依赖变更前调用方法，用于旧数据的缓存处理
     */
    dp.beforeNotify = function () {
        each(this.watchers, function (watcher) {
            watcher.beforeUpdate()
        })
    }

    /**
     * 依赖变更，通知每一个订阅了该依赖的 watcher
     * @param  {Object}  args  [数组操作参数信息]
     */
    dp.notify = function (args) {
        each(this.watchers, function (watcher) {
            watcher.update(args, this)
        }, this)
    }

    var INIT = 0
    var IDENT = 1
    var QUOTE = 2
    var OTHER = 1

    /**
     * 保留取词
     * @param  {String}  value
     */
    function ident (value) {
        return value
    }

    /**
     * 舍弃取词
     * @param  {String}  value
     */
    function quote (value) {
        return ''
    }

    var convert = [0, ident, quote, ident]

    /**
     * 获取字符类型
     * 这里只定义了普通取词的分割法
     * @param   {String}  cha
     * @return  {Number}
     */
    function getState (cha) {
        var code = cha.charCodeAt(0)

        // a-z A-Z 0-9
        if (
            (code >= 65 && code <= 90) ||
            (code >= 97 && code <= 122) ||
            (code >= 48 && code <= 57)
        ) {
            return IDENT
        }

        switch (code) {
            case 91: // [
            case 93: // ]
            case 46: // .
            case 34: // "
            case 39: // '
                return QUOTE
            default:
                return OTHER
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
            this.saves = ''
            this.state = state
        },

        /**
         * 设置状态并返回当前取词
         * @param  {Number}  state
         * @param  {String}  value
         */
        set: function (state, value) {
            var ref = this.get(state);
            var keepIdent = ref.keepIdent;
            var tobeQuote = ref.tobeQuote;
            var tobeIdent = ref.tobeIdent;

            if (keepIdent) {
                this.save(state, value)
            } else if (tobeQuote) {
                var saves = this.saves
                this.saves = ''
                this.change(state)
                return saves
            } else if (tobeIdent) {
                this.save(state, value)
                this.change(state)
            }
        },

        /**
         * 获取状态变更类型
         * @param   {Number}  toBecome  [将要转换的状态]
         * @return  {Object}            [状态类型对象]
         */
        get: function (toBecome) {
            var current = this.state
            var keepIdent = current === IDENT && toBecome === IDENT
            var tobeQuote = (current === IDENT || current === INIT) && toBecome === QUOTE
            var keepQuote = current === QUOTE && toBecome === QUOTE
            var tobeIdent = (current === QUOTE || current === INIT) && toBecome === IDENT
            return { keepIdent: keepIdent, tobeQuote: tobeQuote, keepQuote: keepQuote, tobeIdent: tobeIdent }
        },

        /**
         * 更改状态
         * @param  {Number}  state
         */
        change: function (state) {
            this.state = state
        },

        /**
         * 缓存当前字符
         */
        save: function (state, value) {
            this.saves += convert[state](value)
        },

        /**
         * 重置状态
         */
        reset: function () {
            this.saves = ''
            this.state = INIT
        }
    }

    /**
     * 将字符表达式解析成访问路径
     * @param   {String}  expression
     * @return  {Array}
     */
    function parseToPath (expression) {
        var paths = []
        var letters = expression.split('')
        var lastIndex = letters.length - 1
        var firstState = getState(letters[0])

        StateMachine.init(firstState)
        each(letters, function (letter, index) {
            var state = getState(letter)
            var word = StateMachine.set(state, letter)
            if (word) {
                paths.push(word)
            }

            // 解析结束
            if (index === lastIndex && StateMachine.saves) {
                paths.push(StateMachine.saves)
                StateMachine.reset()
            }
        })

        return paths
    }

    /**
     * 通过访问层级取值
     * @param   {Object}  target
     * @param   {Array}   paths
     * @return  {Object}
     */
    function getDeepValue (target, paths) {
        while (paths.length) {
            target = target[paths.shift()]
        }
        return target
    }

    /**
     * 生成访问路径数组
     * @param   {String}  expression
     * @return  {Array}
     */
    function createPath (expression) {
        return parseToPath(removeSpace(expression))
    }

    /**
     * 根据访问路径设置对象指定字段值
     * @param  {Object}  scope
     * @param  {Mix}     value
     * @param  {Array}   paths
     */
    function setValueByPath (scope, value, paths) {
        var copyPaths = copy(paths)
        var set = copyPaths.pop()
        var data = getDeepValue(scope, copyPaths)
        if (isObject(data)) {
            data[set] = value
        }
    }

    // 匹配常量缓存序号 "1"
    var saveConstRE = /"(\d+)"/g
    // 只含有 true 或 false
    var booleanRE = /^(true|false)$/
    // 匹配表达式中的常量
    var replaceConstRE = /[\{,]\s*[\w\$_]+\s*:|('[^']*'|"[^"]*")|typeof /g
    // 匹配表达式中的取值域
    var replaceScopeRE = /[^\w$\.]([A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\])*)/g
    // 匹配常规取值: item or item['x'] or item["y"] or item[0]
    var normalRE = /^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\]|\[\d+\]|\[[A-Za-z_$][\w$]*\])*$/

    // 表达式中允许的关键字
    var allowKeywords = 'JSON.Math.parseInt.parseFloat.Date.this.true.false.null.undefined.Infinity.NaN.' +
                        'isNaN.isFinite.decodeURI.decodeURIComponent.encodeURI.encodeURIComponent'

    // 表达式中禁止的关键字
    var avoidKeywords = 'var.const.let.if.else.for.in.continue.switch.case.break.default.function.return.' +
                        'do.while.delete.try.catch.throw.finally.with.import.export.instanceof.yield.await'

    // 保存常量，返回序号 "i"
    var consts = []
    function saveConst (string) {
        var i = consts.length
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
    var allKeywords = allowKeywords + '.' + avoidKeywords
    var scopeKeywordRE = new RegExp('^(' + allKeywords.replace(/\./g, '\\b|') + '\\b)')
    function isScopeKeyword (sentence) {
        return sentence.indexOf('$event') === 0 || scopeKeywordRE.test(sentence)
    }

    /**
     * 返回变量/语句的 scope 替换
     * @param   {String}  string
     * @return  {String}
     */
    function replaceScope (string) {
        var pad = string.charAt(0)
        var path = string.slice(1)

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
    function isNormal (expression) {
        return normalRE.test(expression) && !booleanRE.test(expression)
    }

    /**
     * 表达式变量添加 scope
     * @return  {String}
     */
    function addScope (expression) {
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
    var aviodKeywordRE = new RegExp('^(' + avoidKeywords.replace(/\./g, '\\b|') + '\\b)')
    function createGetter (expression) {
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
    function createSetter (expression) {
        var paths = createPath(expression)
        if (paths.length) {
            return function setter (scope, value) {
                setValueByPath(scope, value, paths)
            }
        } else {
            error('Invalid setter expression ['+ expression +']')
            return noop
        }
    }

    /**
     * 遍历对象/数组每一个可枚举属性
     * @param  {Object|Array}  target  [遍历值/对象或数组]
     * @param  {Boolean}       root    [是否是根对象/数组]
     */
    var walkedObs = []
    function walkThrough (target, root) {
        var ob = target && target.__ob__
        var guid = ob && ob.dep.guid

        if (guid) {
            if (walkedObs.indexOf(guid) > -1) {
                return
            } else {
                walkedObs.push(guid)
            }
        }

        each(target, function (value) {
            walkThrough(value, false)
        })

        if (root) {
            walkedObs.length = 0
        }
    }

    /**
     * 数据订阅模块
     * @param  {Object}    vm
     * @param  {Object}    desc
     * @param  {Function}  callback
     * @param  {Object}    context
     */
    function Watcher (vm, desc, callback, context) {
        this.vm = vm
        extend(this, desc)
        this.callback = callback
        this.context = context || this

        // 依赖 id 缓存
        this.depIds = []
        this.newDepIds = []
        this.shallowIds = []
        // 依赖实例缓存
        this.depends = []
        this.newDepends = []

        var once = desc.once
        var expression = desc.expression
        var preSetFunc = isFunc(expression)

        // 缓存取值函数
        this.getter = preSetFunc ? expression : createGetter(expression)
        // 缓存设值函数（双向数据绑定）
        this.setter = !once && desc.duplex ? createSetter(expression) : null

        // 缓存表达式旧值
        this.oldVal = null
        // 表达式初始值 & 提取依赖
        this.value = once ? this.getValue() : this.get()
    }

    var wp = Watcher.prototype

    /**
     * 获取取值域
     * @return  {Object}
     */
    wp.getScope = function () {
        return this.context.scope || this.vm.$data
    }

    /**
     * 获取表达式的取值
     */
    wp.getValue = function () {
        var scope = this.getScope()
        return this.getter.call(scope, scope)
    }

    /**
     * 设置订阅数据的值
     * @param  {Mix}  value
     */
    wp.setValue = function (value) {
        var scope = this.getScope()
        if (this.setter) {
            this.setter.call(scope, scope, value)
        }
    }

    /**
     * 获取表达式的取值 & 提取依赖
     */
    wp.get = function () {
        this.beforeGet()

        var value = this.getValue()

        // 深层依赖获取
        if (this.deep) {
            // 先缓存浅依赖的 ids
            this.shallowIds = copy(this.newDepIds)
            walkThrough(value, true)
        }

        this.afterGet()

        return value
    }

    /**
     * 设置当前依赖对象
     */
    wp.beforeGet = function () {
        Depend.watcher = this
    }

    /**
     * 将依赖订阅到该 watcher
     */
    wp.addDepend = function (depend) {
        var guid = depend.guid
        var newIds = this.newDepIds

        if (newIds.indexOf(guid) < 0) {
            newIds.push(guid)
            this.newDepends.push(depend)
            if (this.depIds.indexOf(guid) < 0) {
                depend.addWatcher(this)
            }
        }
    }

    /**
     * 移除订阅的依赖监测
     * @param  {Function}  filter
     */
    wp.removeDepends = function (filter) {
        each(this.depends, function (depend) {
            if (filter) {
                if (filter.call(this, depend)) {
                    depend.removeWatcher(this)
                }
            } else {
                depend.removeWatcher(this)
            }
        }, this)
    }

    /**
     * 更新/解除依赖挂载
     */
    wp.afterGet = function () {
        Depend.watcher = null

        // 清除无用的依赖
        this.removeDepends(function (depend) {
            return this.newDepIds.indexOf(depend.guid) < 0
        })

        // 重设依赖缓存
        this.depIds = copy(this.newDepIds)
        this.newDepIds.length = 0

        this.depends = copy(this.newDepends)
        this.newDepends.length = 0
    }

    /**
     * 更新前调用方法
     * 用于旧值的缓存处理，对象或数组只存副本
     */
    wp.beforeUpdate = function () {
        this.oldVal = copy(this.value)
    }

    /**
     * 依赖变化，更新取值
     * @param  {Object}  args    [数组操作参数信息]
     * @param  {Object}  depend  [变更依赖对象 id]
     */
    wp.update = function (args, depend) {
        var oldVal = this.oldVal
        var watchall = this.vm.$watchall
        var newVal = this.value = this.get()

        // 多维数组的情况下判断数组操作是否为源数组所发出的
        var source = args && args.source
        if (source && source !== newVal && this.directive === 'v-for') {
            return
        }

        var callback = this.callback
        var fromDeep = this.deep && this.shallowIds.indexOf(depend.guid) < 0
        if (callback && (oldVal !== newVal)) {
            callback.call(this.context, newVal, oldVal, fromDeep, args)

            if (source) {
                args.source = null
            }
        }

        // 通知统一监听回调
        if (watchall) {
            watchall({ action: args, path: depend.path }, newVal, oldVal)
        }
    }

    /**
     * 销毁函数
     */
    wp.destroy = function () {
        this.value = null
        this.removeDepends()
        this.getter = this.setter = null
        this.vm = this.callback = this.context = null
    }

    /**
     * 指令通用模块
     * 提供生成数据订阅和变化更新功能
     * @param  {Object}   parser  [指令解析模块实例]
     */
    function Directive (parser) {
        this.parser = parser
        this.scope = parser.scope
    }

    var dp$1 = Directive.prototype

    /**
     * 安装/解析指令，订阅数据、更新视图
     */
    dp$1.mount = function () {
        var parser = this.parser
        // 生成数据订阅实例
        var watcher = this.watcher = new Watcher(parser.vm, parser.desc, this.update, this)
        // 更新初始视图
        this.update(watcher.value)
    }

    /**
     * 销毁/卸载指令
     */
    dp$1.destroy = function () {
        this.watcher.destroy()
        this.parser = this.scope = null
    }

    /**
     * 更新指令视图
     * @param   {Mix}      newVal     [依赖数据新值]
     * @param   {Mix}      oldVal     [依赖数据旧值]
     * @param   {Boolean}  fromDeep   [数组内部更新]
     * @param   {Object}   methodArg  [数组操作参数信息]
     */
    dp$1.update = function () {
        var parser = this.parser
        parser.update.apply(parser, arguments)
    }

    /**
     * 获取依赖数据当前值
     * @return  {Mix}
     */
    dp$1.get = function () {
        return this.watcher.value
    }

    /**
     * 设置依赖数据的值（用于双向数据绑定）
     * @param  {Mix}  value
     */
    dp$1.set = function (value) {
        this.watcher.setValue(value)
    }

    /**
     * Parser 基础指令解析器模块
     * @param  {Object}   vm
     * @param  {Element}  node
     * @param  {Object}   desc
     * @param  {Object}   scope
     */
    function Parser (vm, node, desc, scope) {
        // 数据缓存
        this.vm = vm
        this.el = node
        this.desc = desc
        this.scope = scope

        // 解析指令
        this.parse()
    }

    var pp = Parser.prototype

    /**
     * 安装指令实例
     */
    pp.bind = function () {
        this.directive = new Directive(this)
        this.directive.mount()
    }

    /**
     * 指令销毁函数
     */
    pp.destroy = function () {
        var directive = this.directive

        if (directive) {
            directive.destroy()
        }

        this.vm = this.el = this.desc = this.scope = null
    }

    /**
     * 解析器模块的类式继承
     * @param   {Function}   PostParser
     * @return  {Prototype}
     */
    function linkParser (PostParser) {
        return PostParser.prototype = Object.create(Parser.prototype)
    }

    /**
     * 是否是元素节点
     * @param   {Element}  element
     * @return  {Boolean}
     */
    function isElement (element) {
        return element.nodeType === 1
    }

    /**
     * 是否是文本节点
     * @param   {Element}  element
     * @return  {Boolean}
     */
    function isTextNode (element) {
        return element.nodeType === 3
    }

    /**
     * 清空 element 的所有子节点
     * @param  {Element}  element
     */
    function empty (element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild)
        }
        return element
    }

    /**
     * 获取节点属性值
     * @param   {Element}  node
     * @param   {String}   name
     * @return  {String}
     */
    function getAttr (node, name) {
        return node.getAttribute(name) || ''
    }

    /**
     * 移除节点属性
     * @param  {Element}  node
     * @param  {String}   name
     */
    function removeAttr (node, name) {
        node.removeAttribute(name)
    }

    /**
     * 设置节点属性
     * @param  {Element}  node
     * @param  {String}   name
     * @param  {String}   value
     */
    function setAttr (node, name, value) {
        // 设为 null/undefined 和 false 移除该属性
        if (value == null || value === false) {
            return removeAttr(node, name)
        }

        if (value === true) {
            node[name] = value

            // 有些浏览器/情况下用 node[name] = true
            // 是无法添加自定义属性的，此时设置一个空字符串
            if (!hasAttr(node, name)) {
                node.setAttribute(name, '')
            }
        } else if (value !== getAttr(node, name)) {
            node.setAttribute(name, value)
        }
    }

    /**
     * 判断节点是否存在属性
     * @param   {Element}  node
     * @param   {String}   name
     * @return  {Boolean}
     */
    function hasAttr (node, name) {
        return node.hasAttribute(name)
    }

    /**
     * 节点是否存在 classname
     * @param   {Element}  node
     * @param   {String}   classname
     * @return  {Boolean}
     */
    function hasClass (node, classname) {
        var current, list = node.classList

        /* istanbul ignore else */
        if (list) {
            return list.contains(classname)
        } else {
            current = ' ' + getAttr(node, 'class') + ' '
            return current.indexOf(' ' + classname + ' ') > -1
        }
    }

    /**
     * 节点添加 classname
     * @param  {Element}  node
     * @param  {String}   classname
     */
    function addClass (node, classname) {
        var current, list = node.classList

        if (!classname || hasClass(node, classname)) {
            return
        }

        /* istanbul ignore else */
        if (list) {
            list.add(classname)
        } else {
            current = ' ' + getAttr(node, 'class') + ' '

            if (current.indexOf(' ' + classname + ' ') === -1) {
                setAttr(node, 'class', (current + classname).trim())
            }
        }
    }

    /**
     * 节点删除 classname
     * @param  {Element}  node
     * @param  {String}   classname
     */
    function removeClass (node, classname) {
        var current, target, list = node.classList

        if (!classname || !hasClass(node, classname)) {
            return
        }

        /* istanbul ignore else */
        if (list) {
            list.remove(classname)
        } else {
            target = ' ' + classname + ' '
            current = ' ' + getAttr(node, 'class') + ' '

            while (current.indexOf(target) > -1) {
                current = current.replace(target, ' ')
            }

            setAttr(node, 'class', current.trim())
        }

        if (!node.className) {
            removeAttr(node, 'class')
        }
    }

    /**
     * 节点事件绑定
     * @param  {Element}   node
     * @param  {String}    evt
     * @param  {Function}  callback
     * @param  {Boolean}   capture
     */
    function addEvent (node, evt, callback, capture) {
        node.addEventListener(evt, callback, capture)
    }

    /**
     * 解除节点事件绑定
     * @param  {Element}   node
     * @param  {String}    evt
     * @param  {Function}  callback
     * @param  {Boolean}   capture
     */
    function removeEvent (node, evt, callback, capture) {
        node.removeEventListener(evt, callback, capture)
    }

    /**
     * 导出作为组件系统的 DOM 处理构造函数
     */
    function DOM () {
        this.empty = empty
        this.getAttr = getAttr
        this.removeAttr = removeAttr
        this.setAttr = setAttr
        this.hasAttr = hasAttr
        this.hasClass = hasClass
        this.addClass = addClass
        this.removeClass = removeClass
        this.addEvent = addEvent
        this.removeEvent = removeEvent
    }

    /**
     * 获取事件修饰符对象
     * 支持 6 种事件修饰符
     * .self .stop .prevent .capture .keyCode .one
     * @param  {String}  type
     * @param  {Object}  modifier
     */
    function getModifiers (type, modifier) {
        var modifiers = modifier.split('.')

        var self = modifiers.indexOf('self') > -1
        var stop = modifiers.indexOf('stop') > -1
        var one = modifiers.indexOf('one') > -1
        var prevent = modifiers.indexOf('prevent') > -1
        var capture = modifiers.indexOf('capture') > -1

        var keyCode = null
        if (type.indexOf('key') === 0) {
            each(modifiers, function (value) {
                if (/^(\d)*$/.test(value)) {
                    keyCode = +value
                    return false
                }
            })
        }

        return { self: self, stop: stop, prevent: prevent, capture: capture, keyCode: keyCode, one: one }
    }

    /**
     * 收集绑定的事件
     * @param   {Object}  desc
     * @return  {Array}
     */
    function collectEvents (desc) {
        var binds = []
        var args = desc.args
        var expression = desc.expression.trim()

        if (args) {
            var pos = args.indexOf('.')
            var type = pos === -1 ? args : args.substr(0, pos)
            var modifier = pos === -1 ? '' : args.substr(pos + 1,  args.length)
            binds = [{ type: type, handler: expression, modifier: modifier }]
        } else if (/^{.*}$/.test(expression)) {
            expression = expression.substr(1, expression.length - 2)
            each(removeSpace(expression).split(','), function (event) {
                var info = event.split(':')
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
    function VOn () {
        Parser.apply(this, arguments)
    }

    var von = linkParser(VOn)

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
        var type = event.type;
        var handler = event.handler;
        var modifier = event.modifier;
        var modifiers = getModifiers(type, modifier)

        if (handler === '$remove') {
            return this.bindRemoveEvent(type, modifiers)
        }

        var inlineStatement = isNormal(handler) ? handler + '($event)' : handler
        this.bindEvent(type, createAnonymous(inlineStatement), modifiers)
    }

    /**
     * 绑定删除($remove) vfor 选项事件
     * @param  {String}  type       [事件类型]
     * @param  {Object}  modifiers  [事件修饰符]
     */
    von.bindRemoveEvent = function (type, modifiers) {
        var scope = this.scope

        if (!scope) {
            return warn('The specify event $remove must be used in v-for scope')
        }

        var alias = scope.__alias__
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
        var el = this.el
        var scope = this.scope || this.vm.$data
        var self = modifiers.self;
        var stop = modifiers.stop;
        var prevent = modifiers.prevent;
        var capture = modifiers.capture;
        var keyCode = modifiers.keyCode;
        var one = modifiers.one;

        var listenerAgent = function (e) {
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

        var listener = one ? function (e) {
            listenerAgent(e)
            removeEvent(el, type, listener, capture)
        } : listenerAgent

        addEvent(el, type, listener, capture)
    }

    /**
     * v-el 指令解析模块
     * 不需要实例化 Directive
     */
    function VEl () {
        Parser.apply(this, arguments)
    }

    var vel = linkParser(VEl)

    /**
     * 解析 v-el 指令
     * 不需要在 model 中声明
     */
    vel.parse = function () {
        // 不能在 vfor 中使用
        if (!this.scope) {
            this.vm.$els[this.desc.expression] = this.el
        } else {
            warn('v-el can not be used inside v-for! Consider use v-custom to handle v-for element.')
        }
    }

    var hasProto = '__proto__' in {}
    var arrayProto = Array.prototype
    var mutatedProto = Object.create(arrayProto)

    /**
     * 重写/定义数组变异方法
     */
    each([
        'pop',
        'push',
        'sort',
        'shift',
        'splice',
        'unshift',
        'reverse'
    ], function (method) {
        var original = arrayProto[method]

        def(mutatedProto, method, function () {
            var arguments$1 = arguments;

            var args = []
            var ob = this.__ob__

            for (var i = 0; i < arguments.length; i++) {
                args.push(arguments$1[i])
            }

            ob.dep.beforeNotify()

            var result = original.apply(this, args)

            var inserts
            switch (method) {
                case 'push':
                case 'unshift':
                    inserts = args
                    break
                case 'splice':
                    inserts = args.slice(2)
                    break
            }

            if (inserts && inserts.length) {
                observeArray(inserts)
            }

            ob.dep.notify({method: method, args: args, source: this})

            return result
        })
    })

    /**
     * 添加数组选项设置/替换方法（全局修改）
     * 提供需要修改的数组项下标 index 和新值 value
     */
    def(arrayProto, '$set', function (index, value) {
        // 超出数组长度默认追加到最后
        if (index >= this.length) {
            index = this.length
        }
        return this.splice(index, 1, value)[0]
    })

    /**
     * 添加数组选项删除方法（全局修改）
     */
    def(arrayProto, '$remove', function (item) {
        var index = this.indexOf(item)
        if (index > -1) {
            return this.splice(index, 1)
        }
    })

    /**
     * 逐个修改数组变异方法
     * IE9, IE10 不支持修改 __proto__
     * @param   {Array}  array
     */
    var mutatedKeys = Object.getOwnPropertyNames(mutatedProto)
    /* istanbul ignore next */
    function defMutationProto (array) {
        for (var i = 0; i < mutatedKeys.length; i++) {
            var key = mutatedKeys[i]
            def(array, key, mutatedProto[key])
        }
    }

    /**
     * 修改数组原型，将变异方法挂载到数组上
     * @param  {Array}  array
     */
    function setMutationProto (array) {
        /* istanbul ignore else */
        if (hasProto) {
            array.__proto__ = mutatedProto
        } else {
            defMutationProto(array)
        }
    }

    /**
     * 生成取值路径
     * @param   {String}  prefix
     * @param   {String}  suffix
     * @return  {String}
     */
    function createPath$1 (prefix, suffix) {
        return prefix ? (prefix + '*' + suffix) : suffix
    }

    /**
     * 监测对象
     * @param  {Object}  object
     * @param  {String}  path
     */
    function observeObject (object, path) {
        each(object, function (value, key) {
            observe(object, key, value, createPath$1(path, key))
        })
    }

    /**
     * 监测数组
     * @param  {Array}   array
     * @param  {String}  path
     */
    function observeArray (array, path) {
        setMutationProto(array)
        each(array, function (item, index) {
            createObserver(item, createPath$1(path, index))
        })
    }

    /**
     * 数据监测模块
     * @param  {Object}  data  [监测对象/数组]
     * @param  {String}  path  [监测字段名称]
     */
    function Observer (data, path) {
        this.dep = new Depend(path)

        if (isArray(data)) {
            observeArray(data, path)
        } else {
            observeObject(data, path)
        }

        def(data, '__ob__', this)
    }

    /**
     * 创建一个对象监测
     * @param   {Object|Array}  target
     * @param   {String}        path
     * @return  {Object}
     */
    function createObserver (target, path) {
        if (isObject(target) || isArray(target)) {
            return hasOwn(target, '__ob__') ? target.__ob__ : new Observer(target, path || '')
        }
    }

    /**
     * 监测 object[key] 的变化 & 依赖收集
     * @param  {Object}   object
     * @param  {String}   key
     * @param  {Mix}      value
     * @param  {String}   path
     */
    function observe (object, key, value, path) {
        var dep = new Depend(path)
        var descriptor = Object.getOwnPropertyDescriptor(object, key)
        var getter = descriptor && descriptor.get
        var setter = descriptor && descriptor.set

        var childOb = createObserver(value, path)

        Object.defineProperty(object, key, {
            get: function Getter () {
                var val = getter ? getter.call(object) : value

                if (Depend.watcher) {
                    dep.depend()
                    if (childOb) {
                        childOb.dep.depend()
                    }
                }

                if (isArray(val)) {
                    each(val, function (item) {
                        var ob = item && item.__ob__
                        if (ob) {
                            ob.dep.depend()
                        }
                    })
                }

                return val
            },

            set: function Setter (newValue) {
                var oldValue = getter ? getter.call(object) : value

                if (newValue === oldValue) {
                    return
                }

                dep.beforeNotify()

                if (setter) {
                    setter.call(object, newValue)
                } else {
                    value = newValue
                }

                childOb = createObserver(newValue, key)
                dep.notify()
            }
        })
    }

    /**
     * 生成计算属性取值函数
     * @param   {Object}    vm
     * @param   {Function}  getter
     * @return  {Function}
     */
    function createComputedGetter (vm, getter) {
        var watcher = new Watcher(vm, {
            expression: getter.bind(vm)
        })

        return function computedGetter () {
            if (Depend.watcher) {
                each(watcher.depends, function (dep) {
                    dep.depend()
                })
            }
            return watcher.value
        }
    }

    /**
     * 设置 vm 的计算属性
     * @param  {Object}  vm
     * @param  {Object}  computed
     */
    function setComputedProperty (vm, computed) {
        each(computed, function (getter, property) {
            if (!isFunc(getter)) {
                return warn('computed property ['+ property +'] must be a getter function!')
            }

            Object.defineProperty(vm, property, {
                set: noop,
                get: createComputedGetter(vm, getter)
            })
        })
    }

    var vforAlias = '__vfor__'
    var vforGuid = '__vforid__'
    var vforRE = /(.*) (?:in|of) (.*)/
    var partlyMethods = 'push|pop|shift|unshift|splice'.split('|')

    /**
     * 获取添加前和删除后的钩子函数
     * @param   {Object}   vm
     * @param   {Element}  node
     * @return  {Object}
     */
    function getHooks (vm, node) {
        var after, before
        var hooks = vm.$hooks
        var afterHook = node.__afterHook__
        var beforeHook = node.__beforeHook__

        if (afterHook) {
            after = hooks[afterHook]
        }

        if (beforeHook) {
            before = hooks[beforeHook]
        }

        return { after: after, before: before }
    }

    /**
     * 生成一段不重复的 id
     * @return  {String}
     */
    function makeVforGuid () {
        return Math.random().toString(36).substr(2)
    }

    /**
     * v-for 指令解析模块
     */
    function VFor () {
        Parser.apply(this, arguments)
    }

    var vfor = linkParser(VFor)

    /**
     * 解析 v-for 指令
     */
    vfor.parse = function () {
        var el = this.el
        var desc = this.desc
        var parent = el.parentNode
        var expression = desc.expression
        var match = expression.match(vforRE)

        if (!match) {
            return warn('The format of v-for must be like "item in/of items"!')
        }

        if (parent.nodeType !== 1) {
            return warn('v-for cannot use in the root element!')
        }

        if (hasAttr(el, 'v-if')) {
            return warn('Do not use v-if and v-for on the same element! Consider filtering the source Array instead.')
        }

        var alias = match[1]
        var iterator = match[2]

        this.length = 0
        this.scopes = []
        this.init = true
        this.alias = alias
        this.partly = false
        this.partlyArgs = []

        this.$parent = parent
        this.end = el.nextSibling
        this.start = el.previousSibling

        this.bodyDirs = el.__dirs__
        this.tpl = el.cloneNode(true)
        this.hooks = getHooks(this.vm, el)
        this.isOption = el.tagName === 'OPTION' && parent.tagName === 'SELECT'

        desc.expression = iterator
        this.bind()
        this.updateModel()
    }

    /**
     * 更新 select 绑定
     */
    vfor.updateModel = function () {
        if (this.isOption) {
            var selectModel = this.$parent.__vmodel__
            if (selectModel) {
                selectModel.forceUpdate()
            }
        }
    }

    /**
     * 调用状态钩子函数
     * @param  {String}   type   [钩子类型]
     * @param  {Element}  frag   [元素板块]
     * @param  {Number}   index  [下标]
     */
    vfor.hook = function (type, frag, index) {
        var hook = this.hooks[type]
        if (isFunc(hook)) {
            hook.call(this.vm.$context, frag, index, frag[vforGuid])
            frag = null
        }
    }

    /**
     * 更新视图
     * @param  {Array}    newArray   [新数组]
     * @param  {Array}    oldArray   [旧数组]
     * @param  {Boolean}  fromDeep   [数组内部更新]
     * @param  {Object}   methodArg  [数组操作参数信息]
     */
    vfor.update = function (newArray, oldArray, fromDeep, methodArg) {
        this.length = newArray && newArray.length

        // 初始化列表
        if (this.init) {
            this.$parent.replaceChild(this.buildList(newArray), this.el)
            this.el = null
            this.init = false
        } else {
            // 数组操作部分更新
            if (methodArg && partlyMethods.indexOf(methodArg.method) > -1) {
                this.partly = true
                this.updatePartly(newArray, methodArg)
                this.partly = false
            } else {
                this.recompileList(newArray)
                this.updateModel()
            }
        }
    }

    /**
     * 数组操作部分更新列表
     * @param  {Array}   list
     * @param  {Object}  arg
     */
    vfor.updatePartly = function (list, arg) {
        var partlyArgs = []
        var args = arg.args
        var method = arg.method
        var scopes = this.scopes

        // 更新处理 DOM 片段
        this[method].call(this, list, args)

        // 更新 scopes
        switch (method) {
            case 'pop':
            case 'shift':
                break
            case 'push':
            case 'unshift':
                partlyArgs = this.partlyArgs
                break
            case 'splice':
                partlyArgs = args.slice(0, 2)
                Array.prototype.push.apply(partlyArgs, this.partlyArgs)
                break
        }

        scopes[method].apply(scopes, partlyArgs)
        this.partlyArgs.length = 0

        // 同步更新下标序号
        each(scopes, function (scope, index) {
            scope.$index = index
        })
    }

    /**
     * 重新构建列表
     * @param  {Array}  list
     */
    vfor.recompileList = function (list) {
        var this$1 = this;

        var count = 0
        var parent = this.$parent
        var childs = parent.childNodes

        // 清空循环列表
        for (var i = 0; i < childs.length; i++) {
            var child = childs[i]
            if (child[vforAlias] === this$1.alias) {
                this$1.hook('before', child, count++)
                parent.removeChild(child)
                i--
            }
        }

        // 移除所有取值域缓存
        this.scopes.length = 0

        var listFragment = this.buildList(list)
        parent.insertBefore(listFragment, this.end)
    }

    /**
     * 构建循环板块
     * @param   {Array}     list        [列表数组]
     * @param   {Number}    startIndex  [下标起点]
     * @return  {Fragment}
     */
    vfor.buildList = function (list, startIndex) {
        var vm = this.vm
        var tpl = this.tpl
        var start = startIndex || 0
        var listFragment = createFragment()
        var iterator = this.directive.watcher.value

        each(list, function (item, i) {
            var index = start + i
            var alias = this.alias
            var frag = tpl.cloneNode(true)
            var parentScope = this.scope || vm.$data
            var scope = Object.create(parentScope)

            scope.$parent = parentScope

            // 绑定别名
            observe(scope, alias, item)
            // 绑定下标
            observe(scope, '$index', index)

            // 挂载别名
            def(scope, '__alias__', alias)
            // 挂载迭代器
            def(scope, '__viterator__', iterator)

            if (this.partly) {
                this.partlyArgs.push(scope)
            } else {
                this.scopes.push(scope)
            }

            // 阻止重复编译除 vfor 以外的指令
            if (this.init && this.bodyDirs > 1) {
                vm.block(this.el)
            }

            // 片段挂载别名
            def(frag, vforAlias, alias)
            // 挂载唯一 id
            def(frag, vforGuid, makeVforGuid())

            // 编译片段
            vm.compile(frag, true, scope, this.desc.once)

            listFragment.appendChild(frag)

            this.hook('after', frag, index)
        }, this)

        return listFragment
    }

    /**
     * 获取完整的列表数据
     * @return  {Array}
     */
    vfor.getChilds = function () {
        var this$1 = this;

        var list = []
        var childs = this.$parent.childNodes

        for (var i = 0; i < childs.length; i++) {
            var child = childs[i]

            if (child[vforAlias] === this$1.alias) {
                list.push(child)
            }
        }

        return list
    }

    /**
     * 获取循环列表第一项
     * @return  {Element}
     */
    vfor.getFirst = function () {
        var start = this.start
        return start && start.nextSibling || this.$parent.firstChild
    }

    /**
     * 获取循环列表最后一项
     * @return  {Element}
     */
    vfor.getLast = function () {
        var end = this.end
        return end && end.previousSibling || this.$parent.lastChild
    }

    /**
     * 获取循环列表指定下标项
     * @param   {Number}    index
     * @return  {Element}
     */
    vfor.getChild = function (index) {
        return this.getChilds()[index] || null
    }

    /**
     * 删除一条选项
     * @param  {Element}  child
     */
    vfor.removeChild = function (child) {
        if (child) {
            this.$parent.removeChild(child)
        }
    }

    /**
     * 删除循环列表的第一个元素 array.shift()
     */
    vfor.shift = function () {
        var first = this.getFirst()
        if (first) {
            this.hook('before', first, 0)
            this.removeChild(first)
        }
    }

    /**
     * 删除循环列表的最后一个元素 array.pop()
     */
    vfor.pop = function () {
        var last = this.getLast()
        if (last) {
            this.hook('before', last, this.length)
            this.removeChild(last)
        }
    }

    /**
     * 在循环列表结尾追加元素 array.push(item)
     * @param  {Array}  list
     * @param  {Array}  args
     */
    vfor.push = function (list, args) {
        var item = this.buildList(args, list.length - 1)
        this.$parent.insertBefore(item, this.end)
    }

    /**
     * 在循环列表开头追加元素 array.unshift(item)
     * @param  {Array}  list
     * @param  {Array}  args
     */
    vfor.unshift = function (list, args) {
        var first = this.getFirst()
        var item = this.buildList(args, 0)
        this.$parent.insertBefore(item, first)
    }

    /**
     * 循环列表的增删改 splice(start, deleteCount, inserts)
     * @param  {Array}  list
     * @param  {Array}  args
     */
    vfor.splice = function (list, args) {
        // 从数组的哪一位开始修改内容。如果超出了数组的长度，则从数组末尾开始添加内容。
        var start = args[0]
        // 整数，表示要移除的数组元素的个数。
        // 如果 deleteCount 是 0，则不移除元素。这种情况下，至少应添加一个新元素。
        // 如果 deleteCount 大于 start 之后的元素的总数，则从 start 后面的元素都将被删除（含第 start 位）。
        var deleteCont = args[1]
        // 要添加进数组的元素。如果不指定，则 splice() 只删除数组元素。
        var insertItems = args.slice(2)
        var insertLength = insertItems.length

        // 不删除也不添加
        if (deleteCont === 0 && !insertLength) {
            return
        }

        // 只删除 splice(2, 1);
        var deleteOnly = deleteCont && !insertLength
        // 只插入 splice(2, 0, 'xxx')
        var insertOnly = !deleteCont && insertLength
        // 删除并插入 splice(2, 1, 'xxx')
        var deleAndInsert = deleteCont && insertLength

        // 删除指定选项
        if (deleteOnly || deleAndInsert) {
            var oldList = this.getChilds()
            each(oldList, function (child, index) {
                // 删除范围内
                if (index >= start && index < start + deleteCont) {
                    this.hook('before', child, index)
                    this.removeChild(child)
                }
            }, this)
            oldList = null
        }

        // 只插入 或 删除并插入
        if (insertOnly || deleAndInsert) {
            // 开始的元素
            var startItem = this.getChild(start) || this.end
            // 新增列表
            var listFrag = this.buildList(insertItems, start)
            // 更新新增部分
            this.$parent.insertBefore(listFrag, startItem)
        }
    }

    /**
     * 移除 DOM 注册的引用
     * @param  {Object}      vm
     * @param  {DOMElement}  element
     */
    function removeDOMRegister (vm, element) {
        var registers = vm.$els
        var childNodes = element.childNodes

        for (var i = 0; i < childNodes.length; i++) {
            var node = childNodes[i]

            if (!isElement(node)) {
                continue
            }

            var nodeAttrs = node.attributes

            for (var ii = 0; ii < nodeAttrs.length; ii++) {
                var attr = nodeAttrs[ii]

                if (
                    attr.name === 'v-el' &&
                    hasOwn(registers, attr.value)
                ) {
                    registers[attr.value] = null
                }
            }

            if (node.hasChildNodes()) {
                removeDOMRegister(vm, node)
            }
        }
    }

    /**
     * 生成一个锚点标记
     * @return  {TextNode}
     */
    function createAnchor () {
        return document.createTextNode('')
    }

    /**
     * 元素节点替换
     * @param  {Element}  oldChild
     * @param  {Element}  newChild
     */
    function replaceNode (oldChild, newChild) {
        var parent = oldChild.parentNode
        if (parent) {
            parent.replaceChild(newChild, oldChild)
        }
    }

    /**
     * v-if 指令解析模块
     */
    function VIf () {
        Parser.apply(this, arguments)
    }

    var vif = linkParser(VIf)

    /**
     * 解析 v-if 指令
     */
    vif.parse = function () {
        var el = this.el
        var elseEl = el.nextElementSibling

        var parent = el.parentNode

        if (parent.nodeType !== 1) {
            return warn('v-if cannot use in the root element!')
        }

        this.$parent = parent

        // 状态钩子
        this.hooks = getHooks(this.vm, el)

        // 缓存渲染模板
        this.elTpl = el.cloneNode(true)
        this.elAnchor = createAnchor()
        replaceNode(el, this.elAnchor)
        this.el = null

        // else 节点
        if (elseEl && hasAttr(elseEl, 'v-else')) {
            this.elseTpl = elseEl.cloneNode(true)
            this.elseAnchor = createAnchor()
            replaceNode(elseEl, this.elseAnchor)
            elseEl = null
        }

        this.bind()
    }

    /**
     * 调用状态钩子函数
     * @param  {String}   type      [钩子类型]
     * @param  {Element}  renderEl  [渲染元素]
     * @param  {Boolean}  isElse    [是否是 else 板块]
     */
    vif.hook = function (type, renderEl, isElse) {
        var hook = this.hooks[type]
        if (isFunc(hook)) {
            hook.call(this.vm.$context, renderEl, isElse)
        }
    }

    /**
     * 更新视图
     * @param  {Boolean}  isRender
     */
    vif.update = function (isRender) {
        var elseAnchor = this.elseAnchor

        this.toggle(this.elAnchor, this.elTpl, isRender, false)

        if (elseAnchor) {
            this.toggle(elseAnchor, this.elseTpl, !isRender, true)
        }
    }

    /**
     * 切换节点内容渲染
     * @param  {Element}   anchor
     * @param  {Fragment}  template
     * @param  {Boolean}   isRender
     * @param  {Boolean}   isElse
     */
    vif.toggle = function (anchor, template, isRender, isElse) {
        var vm = this.vm
        var parent = this.$parent
        var tpl = template.cloneNode(true)

        // 渲染 & 更新视图
        if (isRender) {
            vm.compile(tpl, true, this.scope, this.desc.once)
            var insert = parent.insertBefore(tpl, anchor)
            this.hook('after', insert, isElse)
            def(insert, '__vif__', true)
        }
        // 不渲染的情况需要移除 DOM 索引的引用
        else {
            var el = anchor.previousSibling
            if (el && el.__vif__) {
                this.hook('before', el, isElse)
                removeDOMRegister(vm, template)
                parent.removeChild(el)
            }
        }
    }

    /**
     * v-text 指令解析模块
     */
    function VText () {
        Parser.apply(this, arguments)
    }

    var vtext = linkParser(VText)

    /**
     * 解析 v-text, {{ text }} 指令
     */
    vtext.parse = function () {
        this.bind()
    }

    /**
     * 更新视图
     * @param  {String}  value
     */
    vtext.update = function (value) {
        this.el.textContent = _toString(value)
    }

    /**
     * v-html 指令解析模块
     */
    function VHtml () {
        Parser.apply(this, arguments)
    }

    var vhtml = linkParser(VHtml)

    /**
     * 解析 v-html 指令
     */
    vhtml.parse = function () {
        this.bind()
    }

    /**
     * 更新视图
     * @param  {String}  value
     */
    vhtml.update = function (value) {
        this.el.innerHTML = _toString(value)
    }

    var visibleDisplay = '__visible__'

    /**
     * 缓存节点行内样式显示值
     * 行内样式 display = '' 不会影响由 classname 中的定义
     * visibleDisplay 用于缓存节点行内样式的 display 显示值
     * @param  {Element}  node
     */
    function setVisibleDisplay (node) {
        var display = node.style.display
        def(node, visibleDisplay, display === 'none' ? '' : display)
    }

    /**
     * 设置节点 style.display 值
     * @param  {Element}  node
     * @param  {String}   display
     */
    function setStyleDisplay (node, display) {
        node.style.display = display
    }

    /**
     * v-show 指令解析模块
     */
    function VShow () {
        Parser.apply(this, arguments)
    }

    var vshow = linkParser(VShow)

    /**
     * 解析 v-show 指令
     */
    vshow.parse = function () {
        var el = this.el

        setVisibleDisplay(el)

        // else 片段
        var elseEl = el.nextElementSibling
        if (elseEl && hasAttr(elseEl, 'v-else')) {
            this.elseEl = elseEl
            setVisibleDisplay(elseEl)
        }

        this.bind()
    }

    /**
     * 更新视图
     * @param  {Boolean}  isShow
     */
    vshow.update = function (isShow) {
        var el = this.el
        var elseEl = this.elseEl

        setStyleDisplay(el, isShow ? el[visibleDisplay] : 'none')

        if (elseEl) {
            setStyleDisplay(elseEl, !isShow ? elseEl[visibleDisplay] : 'none')
        }
    }

    /**
     * 返回 contrast 相对于 refer 的差异对象
     * @param   {Object}  contrast  [对比对象]
     * @param   {Object}  refer     [参照对象]
     * @return  {Object}
     */
    function getDiffObject (contrast, refer) {
        var unique = {}

        each(contrast, function (value, key) {
            var _diff, oldItem = refer[key]

            if (isObject(value)) {
                _diff = getDiffObject(value, oldItem)
                if (!isEmptyObject(_diff)) {
                    unique[key] = _diff
                }
            } else if (isArray(value)) {
                var newArray = []

                each(value, function (nItem, index) {
                    var _diff

                    if (isObject(nItem)) {
                        _diff = getDiffObject(nItem, oldItem[index])
                        newArray.push(_diff)
                    }
                    else {
                        // 新数组元素
                        if (oldItem.indexOf(nItem) < 0) {
                            newArray.push(nItem)
                        }
                    }
                })

                unique[key] = newArray
            } else {
                if (value !== oldItem) {
                    unique[key] = value
                }
            }
        })

        return unique
    }

    /**
     * 返回 contrast 相对于 refer 的差异数组
     * @param   {Array}  contrast  [对比数组]
     * @param   {Array}  refer     [参照数组]
     * @return  {Array}
     */
    function getDiffArray (contrast, refer) {
        var uniques = []

        if (!isArray(contrast) || !isArray(refer)) {
            return contrast
        }

        each(contrast, function (item) {
            if (refer.indexOf(item) < 0) {
                uniques.push(item)
            }
        })

        return uniques
    }

    /**
     * 返回两个比较值的差异
     * 获取绑定 object 和 array 的更新差异
     * @param   {Object|Array}  newVal
     * @param   {Object|Array}  oldVal
     * @return  {Object}
     */
    function diff (newVal, oldVal) {
        var isA = isArray(newVal) && isArray(oldVal)
        var isO = isObject(newVal) && isObject(oldVal)
        var handler = isO ? getDiffObject : (isA ? getDiffArray : null)

        var after = handler && handler(newVal, oldVal) || newVal
        var before = handler && handler(oldVal, newVal) || oldVal

        return { after: after, before: before }
    }

    /**
     * 处理 styleObject, 批量更新元素 style
     * @param  {Element}  element
     * @param  {String}   styleObject
     */
    function updateStyle (element, styleObject) {
        var style = element.style

        if (!isObject(styleObject)) {
            return warn('v-bind for style must be a type of Object', styleObject)
        }

        each(styleObject, function (value, property) {
            if (style[property] !== value) {
                style[property] = value
            }
        })
    }

    /**
     * 支持空格分割的 add/remove class
     * @param  {Element}  element
     * @param  {String}   className
     * @param  {Boolean}  remove
     */
    function handleClass (element, className, remove) {
        each(className.split(' '), function (cls) {
            if (remove) {
                removeClass(element, cls)
            } else {
                addClass(element, cls)
            }
        })
    }

    /**
     * 根据绑定值更新元素的 className
     * @param  {Element}  element
     * @param  {Mix}      classValue
     * @param  {Boolean}  remove
     */
    function updateClass (element, classValue, remove) {
        if (isString(classValue)) {
            handleClass(element, classValue, remove)
        } else if (isArray(classValue)) {
            each(classValue, function (cls) {
                handleClass(element, cls, remove)
            })
        } else if (isObject(classValue)) {
            each(classValue, function (add, cls) {
                handleClass(element, cls, remove || !add)
            })
        }
    }

    /**
     * v-bind 指令解析模块
     */
    function VBind () {
        Parser.apply(this, arguments)
    }

    var vbind = linkParser(VBind)

    /**
     * 解析 v-bind 指令
     */
    vbind.parse = function () {
        this.desc.deep = true
        this.bind()
    }

    /**
     * 视图更新
     * @param  {Mix}  newValue
     * @param  {Mix}  oldValue
     */
    vbind.update = function (newValue, oldValue) {
        var type = this.desc.args
        if (type) {
            this.single(type, newValue, oldValue)
        } else {
            this.multi(newValue, oldValue)
        }
    }

    /**
     * 解析单个 attribute
     * @param  {String}  type
     * @param  {Mix}     newValue
     * @param  {Mix}     oldValue
     */
    vbind.single = function (type, newValue, oldValue) {
        switch (type) {
            case 'class':
                this.processClass(newValue, oldValue)
                break
            case 'style':
                this.processStyle(newValue, oldValue)
                break
            default:
                this.processAttr(type, newValue)
        }
    }

    /**
     * 解析 attribute, class, style 组合
     * @param  {Object}  newObj
     * @param  {Object}  oldObj
     */
    vbind.multi = function (newObj, oldObj) {
        if (oldObj) {
            var ref = diff(newObj, oldObj);
            var after = ref.after;
            var before = ref.before;
            this.batch(after, before)
        }

        this.batch(newObj)
    }

    /**
     * 绑定属性批处理
     * @param  {Object}  newObj
     * @param  {Object}  oldObj
     */
    vbind.batch = function (newObj, oldObj) {
        each(newObj, function (value, key) {
            this.single(key, value, oldObj && oldObj[key])
        }, this)
    }

    /**
     * 更新处理 className
     * @param  {Mix}  newClass
     * @param  {Mix}  oldClass
     */
    vbind.processClass = function (newClass, oldClass) {
        var el = this.el

        // 数据更新
        if (oldClass) {
            var ref = diff(newClass, oldClass);
            var after = ref.after;
            var before = ref.before;
            updateClass(el, before, true)
            updateClass(el, after)
        } else {
            updateClass(el, newClass)
        }
    }

    /**
     * 更新处理 style
     * @param  {Mix}  newStyle
     * @param  {Mix}  oldStyle
     */
    vbind.processStyle = function (newStyle, oldStyle) {
        var el = this.el

        // 数据更新
        if (oldStyle) {
            // 移除旧样式(设为 '')
            each(oldStyle, function (v, key) {
                oldStyle[key] = ''
            })

            updateStyle(el, oldStyle)
        }

        updateStyle(el, newStyle)
    }

    /**
     * 更新处理 attribute
     * @param  {String}   attr
     * @param  {String}   value
     */
    vbind.processAttr = function (attr, value) {
        setAttr(this.el, attr, value)
    }

    /**
     * 保证 func 在上次执行后的 delay 时间内不会被触发第二次
     * @param  {Function}  func
     * @param  {Number}    delay
     */
    var beginTime = 0
    function debounceDelay (func, delay) {
        beginTime = Date.now()
        setTimeout(function () {
            if (Date.now() - beginTime >= delay) {
                func.call(func)
            }
        }, delay)
    }

    var userAgent = window.navigator.userAgent.toLowerCase()
    var isMsie9 = userAgent && userAgent.indexOf('msie 9.0') > 0

    var text = {
        /**
         * 绑定 text 变化事件
         */
        bind: function bind () {
            var self = this
            var trim = this.trim
            var lazy = this.lazy
            var number = this.number
            var debounce = this.debounce
            var directive = this.directive

            /**
             * 表单值变化设置数据值
             * @param  {String}  value  [表单值]
             */
            function setModelValue (value) {
                if (trim) {
                    value = value.trim()
                }

                var val = formatValue(value, number)

                if (debounce) {
                    debounceDelay(function () {
                        self.onDebounce = true
                        directive.set(val)
                    }, toNumber(debounce))
                } else {
                    directive.set(val)
                }
            }

            // 解决输入板在未选择词组时 input 事件的触发问题
            // https://developer.mozilla.org/zh-CN/docs/Web/Events/compositionstart
            var composeLock
            this.on('compositionstart', function () {
                composeLock = true
            })
            this.on('compositionend', function () {
                composeLock = false
                if (!lazy) {
                    // 在某些浏览器下 compositionend 会在 input 事件之后触发
                    // 所以必须在 compositionend 之后进行一次更新以确保数据的同步
                    setModelValue(this.value)
                }
            })

            this.on('input', function () {
                if (!composeLock && !lazy) {
                    setModelValue(this.value)
                }
            })

            this.on('blur', function () {
                setModelValue(this.value)
            })

            this.on('change', function () {
                setModelValue(this.value)
            })

            // 在 IE9 中，backspace, delete 和剪切事件不会触发 input 事件
            /* istanbul ignore next */
            if (isMsie9) {
                this.on('cut', function () {
                    setModelValue(this.value)
                })

                this.on('keyup', function (e) {
                    var keyCode = e.keyCode
                    if (keyCode === 8 || keyCode === 46) {
                        setModelValue(this.value)
                    }
                })
            }
        },

        /**
         * 根据数据更新更新 text 值
         * @param  {String}  data
         */
        update: function update (data) {
            var el = this.el
            var val = _toString(data)
            if (el.value !== val && !this.onDebounce) {
                el.value = val
            }
        }
    }

    var radio = {
        /**
         * 绑定 radio 变化事件
         */
        bind: function bind () {
            var number = this.number
            var directive = this.directive

            this.on('change', function () {
                directive.set(formatValue(this.value, number))
            })
        },

        /**
         * 根据数据更新更新 radio 值
         * @param  {String}  data
         */
        update: function update (data) {
            var el = this.el
            el.checked = el.value === _toString(data)
        }
    }

    /**
     * 获取多选 select 的选中值
     * @param   {Select}   select
     * @param   {Boolean}  number
     * @return  {Array}
     */
    function getSelecteds (select, number) {
        var sels = []
        var options = select.options

        for (var i = 0; i < options.length; i++) {
            var option = options[i]
            var value = option.value
            if (option.selected) {
                sels.push(formatValue(value, number))
            }
        }

        return sels
    }

    var select = {
        /**
         * 绑定 select 变化事件
         */
        bind: function bind () {
            var multi = this.multi
            var number = this.number
            var directive = this.directive

            this.on('change', function () {
                var setVal = multi ?
                    getSelecteds(this, number) :
                    formatValue(this.value, number)

                directive.set(setVal)
            })

            // 在 更新 select 时将 selectedIndex 设为 -1 的情况下
            // 假如当前 select dom 片段的父元素被移动(append)到文档或其他节点之后
            // 在部分浏览器如 IE9, PhantomJS 中，selectedIndex 将会从 -1 又变回 0
            // 这将导致 v-for option 在列表渲染完成后无法正确的设置 select 的选中值
            // 因为编译阶段都是在文档碎片上执行，所以必须在编译完成后再次强制初始选中状态
            this.vm.after(this.forceUpdate, this)
        },

        /**
         * 根据数据更新 select 选中值
         * @param  {Array|String}  data
         */
        update: function update (data) {
            var el = this.el
            var multi = this.multi
            var exp = this.desc.expression

            // 初始选中项设为空（默认情况下会是第一项）
            // 在 v-model 中 select 的选中项总是以数据(data)为准
            el.selectedIndex = -1

            if (multi && !isArray(data)) {
                return warn('<select> cannot be multiple when the model set ['+ exp +'] as not Array')
            }

            if (!multi && isArray(data)) {
                return warn('The model ['+ exp +'] cannot set as Array when <select> has no multiple propperty')
            }

            var options = el.options
            for (var i = 0; i < options.length; i++) {
                var option = options[i]
                var value = option.value
                option.selected = multi ? indexOf(value, data) > -1 : value === _toString(data)
            }
        },

        /**
         * 强制更新 select 的值，用于动态的 option
         */
        forceUpdate: function forceUpdate () {
            this.update(this.directive.get())
        }
    }

    var checkbox = {
        /**
         * 绑定 checkbox 变化事件
         */
        bind: function bind () {
            var number = this.number
            var directive = this.directive

            this.on('change', function () {
                var value = directive.get()
                var checked = this.checked

                if (isBool(value)) {
                    directive.set(checked)
                } else if (isArray(value)) {
                    var val = formatValue(this.value, number)
                    var index = indexOf(val, value)

                    if (checked && index === -1) {
                        value.push(val)
                    } else if (index > -1) {
                        value.splice(index, 1)
                    }
                }
            })
        },

        /**
         * 根据数据更新更新 checkbox 值
         * @param  {Boolean|Array}  data
         */
        update: function update (data) {
            var el = this.el
            var value = formatValue(el.value, this.number)

            if (!isArray(data) && !isBool(data)) {
                return warn('Checkbox v-model value must be a type of Boolean or Array')
            }

            el.checked = isBool(data) ? data : (indexOf(value, data) > -1)
        }
    }

    /**
     * 表单数据格式化
     * @param   {String}   value
     * @param   {Boolean}  convertToNumber
     * @return  {Number}
     */
    function formatValue (value, convertToNumber) {
        return convertToNumber ? toNumber(value) : value
    }

    /**
     * 非全等比较的数组查找
     * @param   {Mix}     item
     * @param   {Array}   array
     * @return  {Number}
     */
    function indexOf (item, array) {
        for (var i = 0; i < array.length; i++) {
            /* jshint ignore:start */
            if (array[i] == item) {
                return i
            }
            /* jshint ignore:end */
        }

        return -1
    }

    // 双向数据绑定限制的表单元素
    var validForms = ['input', 'select', 'textarea']

    /**
     * v-model 指令解析模块
     */
    function VModel () {
        Parser.apply(this, arguments)
    }

    var vmodel = linkParser(VModel)

    /**
     * 解析 v-model 指令
     */
    vmodel.parse = function () {
        var el = this.el
        var desc = this.desc
        var tagName = el.tagName.toLowerCase()
        var type = tagName === 'input' ? getAttr(el, 'type') : tagName

        if (validForms.indexOf(tagName) < 0) {
            return warn('v-model only for using in ' + validForms.join(', '))
        }

        // v-model 仅支持静态指令表达式
        if (!isNormal(desc.expression)) {
            return warn('v-model directive value can be use by static expression')
        }

        // 双向数据绑定
        desc.duplex = true
        this.bindDuplex(type)
    }

    /**
     * 双向数据绑定
     * @param  {String}  type
     */
    vmodel.bindDuplex = function (type) {
        var form
        var el = this.el

        switch (type) {
            case 'text':
            case 'password':
            case 'textarea':
                form = text
                // 可以使用 trim 属性来清除首尾空格
                this.trim = hasAttr(el, 'trim')
                // 可以使用 lazy 属性来控制 input 事件是否同步数据
                this.lazy = hasAttr(el, 'lazy')
                // 可以使用 debounce 来设置更新数据的延迟时间
                this.debounce = getAttr(el, 'debounce')
                break
            case 'radio':
                form = radio
                break
            case 'checkbox':
                form = checkbox
                break
            case 'select':
                form = select
                // select 需要将指令实例挂载到元素上
                def(el, '__vmodel__', this)
                // 是否多选
                this.multi = hasAttr(el, 'multiple')
                // 动态 option 强制刷新取值方法
                this.forceUpdate = select.forceUpdate.bind(this)
                break
        }

        // 提示未指定类型的表单元素
        if (!form) {
            return warn('Do not use incorrect form-type with v-model: ', el)
        }

        // 是否将绑定值转化成数字
        this.number = hasAttr(el, 'number')

        // 表单刷新函数
        this.update = form.update.bind(this)

        // 订阅数据 & 更新初始值
        this.bind()

        // 绑定表单变化事件
        if (!this.desc.once) {
            form.bind.call(this)
        }
    }

    /**
     * 表单元素事件绑定
     * @param  {String}    type
     * @param  {Function}  callback
     */
    vmodel.on = function (type, callback) {
        addEvent(this.el, type, callback, false)
    }

    /**
     * v-custom 指令解析模块
     */
    function VCustom () {
        Parser.apply(this, arguments)
    }

    var vcustom = linkParser(VCustom)

    /**
     * 解析 v-custom 指令
     */
    vcustom.parse = function () {
        var desc = this.desc
        var update = this.vm.$customs[desc.args]

        if (!isFunc(update)) {
            return warn('Custom directive ['+ desc.attr +'] must define with a refresh function!')
        }

        this.update = update
        this.bind()
    }

    /**
     * 导出指令解析模块
     * @type {Object}
     */
    var DirectiveParsers = {
        von: VOn,
        vel: VEl,
        vif: VIf,
        vfor: VFor,
        vtext: VText,
        vhtml: VHtml,
        vshow: VShow,
        vbind: VBind,
        vmodel: VModel,
        vcustom: VCustom
    }

    var newlineRE = /\n/g
    var textRE = /\{\{(.+?)\}\}/g
    var mustacheRE = /(\{\{.*\}\})/
    var noParsers = ['velse', 'vpre', 'vcloak', 'vonce', 'vhook']

    /**
     * 是否是合法指令
     * @param   {String}   directive
     * @return  {Boolean}
     */
    function isDirective (directive) {
        return directive.indexOf('v-') === 0
    }

    /**
     * 是否是 v-once 指令
     * 节点以及所有子节点的指令只渲染，无数据绑定
     * @param   {Element}  node
     * @return  {Boolean}
     */
    function isOnceNode (node) {
        return isElement(node) && hasAttr(node, 'v-once')
    }

    /**
     * 节点的子节点是否延迟编译
     * 单独处理 vif, vfor 和 vpre 子节点的编译
     * @param   {Element}  node
     * @return  {Boolean}
     */
    function hasLateCompileChilds (node) {
        return hasAttr(node, 'v-if') || hasAttr(node, 'v-for') || hasAttr(node, 'v-pre')
    }

    /**
     * 节点是否含有合法指令
     * @param   {Element}  node
     * @return  {Number}
     */
    function hasDirective (node) {
        if (isElement(node) && node.hasAttributes()) {
            var nodeAttrs = node.attributes

            for (var i = 0; i < nodeAttrs.length; i++) {
                if (isDirective(nodeAttrs[i].name)) {
                    return true
                }
            }

        } else if (isTextNode(node) && mustacheRE.test(node.textContent)) {
            return true
        }
    }

    /**
     * 获取指令信息
     * @param   {Attr}    attribute
     * @return  {Object}
     */
    function getDirectiveDesc (attribute) {
        var attr = attribute.name
        var expression = attribute.value
        var directive, args, pos = attr.indexOf(':')

        if (pos > -1) {
            args = attr.substr(pos + 1)
            directive = attr.substr(0, pos)
        } else {
            directive = attr
        }

        return { args: args, attr: attr, directive: directive, expression: expression }
    }

    /**
     * 缓存指令钩子函数名称
     * @param  {Elemnt}  node
     */
    function saveDirectiveHooks (node) {
        if (!node.__afterHook__) {
            def(node, '__afterHook__', getAttr(node, 'v-hook:after'))
        }

        if (!node.__beforeHook__) {
            def(node, '__beforeHook__', getAttr(node, 'v-hook:before'))
        }
    }

    /**
     * 统一变更回调函数
     * 保证多个相同依赖的变更只触发一次
     * @param   {Function}  func
     * @param   {Object}    context
     * @return  {Function}
     */
    function makeUnifyCallback (func, context) {
        var _path, _newVal, _oldVal
        return function (param, newVal, oldVal) {
            var path = param.path
            if (path !== _path || newVal !== _newVal || oldVal !== _oldVal) {
                func.apply(context, arguments)
                _path = path
                _newVal = newVal
                _oldVal = oldVal
            }
        }
    }

    /**
     * ViewModel 编译模块
     * @param  {Object}  option  [参数对象]
     */
    function Compiler (option) {
        var model = option.model
        var element = option.view
        var computed = option.computed
        var watchAll = option.watchAll

        if (isString(element)) {
            element = document.querySelector(element)
        }

        if (!element || !isElement(element)) {
            return warn('view must be a type of DOMElement: ', element)
        }

        if (!isObject(model)) {
            return warn('model must be a type of Object: ', model)
        }

        // 编译节点缓存队列
        this.$queue = []
        // 数据模型对象
        this.$data = model
        // 缓存根节点
        this.$element = element
        // DOM 注册索引
        this.$els = {}
        // 指令实例缓存
        this.$directives = []
        // 钩子和统一回调作用域
        this.$context = option.context || this

        // 监测数据模型
        createObserver(this.$data)

        // 设置计算属性
        if (computed) {
            setComputedProperty(this.$data, computed)
        }

        // 编译完成后的回调集合
        this.$afters = []
        // v-if, v-for DOM 插删钩子函数
        this.$hooks = option.hooks || {}
        // 自定义指令刷新函数
        this.$customs = option.customs || {}
        // 监听变更统一回调
        this.$watchall = isFunc(watchAll) ? makeUnifyCallback(watchAll, this.$context) : null

        // 是否立刻编译根元素
        if (!option.lazy) {
            this.mount()
        }
    }

    var cp = Compiler.prototype

    /**
     * 挂载/编译根元素
     */
    cp.mount = function () {
        this.$done = false
        this.$fragment = nodeToFragment(this.$element)
        this.compile(this.$fragment, true)
    }

    /**
     * 收集节点所有需要编译的指令
     * 并在收集完成后编译指令队列
     * @param  {Element}  element  [编译节点]
     * @param  {Boolean}  root     [是否是根节点]
     * @param  {Object}   scope    [vfor 取值域]
     * @param  {Boolean}  once     [是否只渲染首次]
     */
    cp.compile = function (element, root, scope, once) {
        var this$1 = this;

        var children = element.childNodes
        var parentOnce = !!once || isOnceNode(element)

        if (root && hasDirective(element)) {
            this.$queue.push([element, scope])
        }

        def(element, '__vonce__', parentOnce)

        for (var i = 0; i < children.length; i++) {
            var node = children[i]
            var nodeType = node.nodeType

            // 指令只能应用在文本或元素节点
            if (nodeType !== 1 && nodeType !== 3) {
                continue
            }

            var selfOnce = parentOnce || isOnceNode(node)

            if (hasDirective(node)) {
                this$1.$queue.push([node, scope])
                def(node, '__vonce__', selfOnce)
            }

            if (node.hasChildNodes() && !hasLateCompileChilds(node)) {
                this$1.compile(node, false, scope, selfOnce)
            }
        }

        if (root) {
            this.compileAll()
        }
    }

    /**
     * 编译节点缓存队列
     */
    cp.compileAll = function () {
        each(this.$queue, function (tuple) {
            this.compileNode(tuple)
            return null
        }, this)

        this.completed()
    }

    /**
     * 收集并编译节点指令
     * @param  {Array}  tuple  [node, scope]
     */
    cp.compileNode = function (tuple) {
        var node = tuple[0]
        var scope = tuple[1]

        if (isElement(node)) {
            var vfor, attrs = []
            var hasModel, hasBind, index
            var nodeAttrs = node.attributes

            for (var i = 0; i < nodeAttrs.length; i++) {
                var attr = nodeAttrs[i]
                var name = attr.name

                // 收集合法指令
                if (isDirective(name)) {
                    if (name === 'v-for') {
                        vfor = attr
                    } else if (name === 'v-model') {
                        hasModel = true
                        index = attrs.length
                    } else if (name.indexOf('v-bind') === 0) {
                        hasBind = true
                    } else if (name.indexOf('v-hook') === 0) {
                        saveDirectiveHooks(node)
                    }

                    attrs.push(attr)
                }
            }

            // 当 v-bind 和 v-model 共存时，即使 v-model 写在 v-bind 的后面
            // 在 IE9+ 和 Edge 中遍历 attributes 时 v-model 仍然会先于 v-bind
            // 所以当二者共存时，v-model 需要放到最后编译以保证表单 value 的正常获取
            /* istanbul ignore next */
            if (
                !vfor &&
                hasBind &&
                hasModel &&
                attrs.length > 1 &&
                (index !== attrs.length - 1)
            ) {
                var vmodel = attrs.splice(index, 1)[0]
                attrs.push(vmodel)
                vmodel = null
            }

            // vfor 指令与其他指令共存时只需编译 vfor
            if (vfor) {
                def(node, '__dirs__', attrs.length)
                attrs = [vfor]
                vfor = null
            }

            // 解析节点指令
            each(attrs, function (attribute) {
                this.parse(node, attribute, scope)
            }, this)

        } else if (isTextNode(node)) {
            this.parseText(node, scope)
        }
    }

    /**
     * 解析元素节点指令
     * @param  {Element}  node
     * @param  {Object}   attr
     * @param  {Object}   scope
     */
    cp.parse = function (node, attr, scope) {
        var once = node.__vonce__
        var desc = getDirectiveDesc(attr)
        var directive = desc.directive

        var dir = 'v' + directive.substr(2)
        var Parser = DirectiveParsers[dir]

        // 移除指令标记
        removeAttr(node, desc.attr)

        // 不需要实例化解析的指令
        if (noParsers.indexOf(dir) > -1) {
            return
        }

        if (Parser) {
            desc.once = once
            var dirParser = new Parser(this, node, desc, scope)

            if (once) {
                dirParser.destroy()
            } else if (!scope) {
                this.$directives.push(dirParser)
            }
        } else {
            warn('[' + directive + '] is an unknown directive!')
        }
    }

    /**
     * 解析文本指令 {{ text }}
     * @param  {Element}  node
     * @param  {Object}   scope
     */
    cp.parseText = function (node, scope) {
        var tokens = [], desc = {}
        var once = node.parentNode && node.parentNode.__vonce__
        var text = node.textContent.trim().replace(newlineRE, '')

        var pieces = text.split(textRE)
        var matches = text.match(textRE)

        // 文本节点转化为常量和变量的组合表达式
        // 'a {{b}} c' => '"a " + b + " c"'
        each(pieces, function (piece) {
            if (matches.indexOf('{{' + piece + '}}') > -1) {
                tokens.push('(' + piece + ')')
            } else if (piece) {
                tokens.push('"' + piece + '"')
            }
        })

        desc.once = once
        desc.expression = tokens.join('+')

        var directive = new DirectiveParsers.vtext(this, node, desc, scope)

        if (once) {
            directive.destroy()
        } else if (!scope) {
            this.$directives.push(directive)
        }
    }

    /**
     * 停止编译节点的剩余指令
     * 如含有其他指令的 vfor 节点
     * 应保留指令信息并放到循环列表中编译
     * @param  {Element}  node
     */
    cp.block = function (node) {
        each(this.$queue, function (tuple) {
            if (node === tuple[0]) {
                return null
            }
        })
    }

    /**
     * 添加编译完成后的回调函数
     * @param  {Function}  callback
     * @param  {Object}    context
     */
    cp.after = function (callback, context) {
        this.$afters.push([callback, context])
    }

    /**
     * 检查根节点是否编译完成
     */
    cp.completed = function () {
        if (this.$queue.length === 0 && !this.$done) {
            this.$done = true
            this.$element.appendChild(this.$fragment)

            delete this.$fragment

            // 触发编译完成后的回调函数
            each(this.$afters, function (after) {
                after[0].call(after[1])
                return null
            })
        }
    }

    /**
     * 销毁函数，销毁指令，清空根节点
     */
    cp.destroy = function () {
        this.$data = null
        empty(this.$element)
        each(this.$directives, function (directive) {
            directive.destroy()
            return null
        })
    }

    /**
     * MVVM 构造函数入口
     * @param  {Object}  option  [数据参数对象]
     * @param  {Element}   - view      [视图对象]
     * @param  {Object}    - model     [数据对象]
     * @param  {Object}    - computed  [<可选>计算属性对象]
     * @param  {Object}    - methods   [<可选>事件声明函数对象]
     * @param  {Object}    - watches   [<可选>批量 watch 数据对象]
     * @param  {Object}    - customs   [<可选>自定义指令刷新函数对象]
     * @param  {Object}    - context   [<可选>methods, watches 回调上下文]
     * @param  {Object}    - hooks     [<可选>v-if/v-for DOM 增删钩子函数定义]
     * @param  {Function}  - watchAll  [<可选>model 变更统一回调函数]
     * @param  {Boolean}   - lazy      [<可选>是否手动编译根元素]
     */
    function MVVM (option) {
        var context = option.context || option.model

        // 将事件函数 this 指向调用者
        each(option.model, function (value, key) {
            if (isFunc(value)) {
                option.model[key] = value.bind(context)
            }
        })

        // 整合事件函数声明对象
        each(option.methods, function (callback, func) {
            option.model[func] = callback.bind(context)
        })

        // 事件或 watch 函数作用域
        this.__ct__ = context
        // 初始数据备份，用于 reset
        this.__bk__ = copy(option.model)
        // 内部 ViewModel 实例
        this.__vm__ = new Compiler(option)

        // 数据模型对象
        this.$data = this.__vm__.$data
        // DOM 注册索引
        this.$els = this.__vm__.$els

        // 批量 watch
        each(option.watches, function (callback, expression) {
            if (isFunc(callback)) {
                this.watch(expression, callback, false)
            } else if (isObject(callback)) {
                this.watch(expression, callback.handler, callback.deep)
            }
        }, this)
    }

    var mvp = MVVM.prototype

    /**
     * 手动挂载/编译根元素
     */
    mvp.mount = function () {
        this.__vm__.mount()
    }

    /**
     * 获取指定数据模型值
     * 如果获取的模型为对象或数组
     * 返回数据与原数据保持引用关系
     * @param   {String}  key  [<可选>数据模型字段]
     * @return  {Mix}
     */
    mvp.get = function (key) {
        var data = this.$data
        return isString(key) ? config(data, key) : data
    }

    /**
     * 获取指定数据模型值
     * 如果获取的模型为对象或数组
     * 返回数据与原数据将不会保持引用关系
     * @param   {String}  key  [<可选>数据模型字段]
     * @return  {Mix}
     */
    mvp.getCopy = function (key) {
        return copy(this.get(key))
    }

    /**
     * 设置数据模型的值，key 为 json 时则批量设置
     * @param  {String}  key    [数据模型字段]
     * @param  {Mix}     value  [值]
     */
    mvp.set = function (key, value) {
        var data = this.$data

        // 设置单个
        if (isString(key)) {
            config(data, key, value)
        }
        // 批量设置
        else if (isObject(key)) {
            each(key, function (v, k) {
                config(data, k, v)
            })
        }
    }

    /**
     * 重置数据和视图为初始状态
     * @param  {Array|String}  key  [<可选>数据模型字段，或字段数组，空则重置所有]
     */
    mvp.reset = function (key) {
        var data = this.$data
        var backup = copy(this.__bk__)

        // 重置单个
        if (isString(key)) {
            data[key] = backup[key]
        }
        // 重置多个
        else if (isArray(key)) {
            each(key, function (v) {
                data[v] = backup[v]
            })
        }
        // 重置所有
        else {
            each(data, function (v, k) {
                data[k] = backup[k]
            })
        }
    }

    /**
     * 监测表达式值的变化
     * @param  {String}    expression  [监测的表达式]
     * @param  {Function}  callback    [监测变化回调]
     * @param  {Boolean}   deep        [<可选>深层依赖监测]
     */
    mvp.watch = function (expression, callback, deep) {
        return new Watcher(this, {
            deep: deep,
            expression: expression
        }, callback.bind(this.__ct__))
    }

    /**
     * 销毁函数
     */
    mvp.destroy = function () {
        this.__vm__.destroy()
        this.__vm__ = this.__ct__ = this.__bk__ = this.$data = this.$els = null
    }

    /**
     * 事件 id 唯一计数
     * @type  {Number}
     */
    var componentEventGuid = 1000
    var identifier = '__eventid__'

    /**
     * Component 基础视图组件
     */
    var Component = Module.extend({
        /**
         * init 组件初始化
         * @param  {Object}  config  [组件参数配置]
         * @param  {Object}  parent  [父组件对象]
         */
        init: function (config) {
            this.__config__ = extend(true, {
                /********* 组件位置定义 *********/
                target: null, // 组件目标容器 <DOM|CssStringSelector>
                replace: false, // 组件是否替换目标容器 <Boolean>

                /********* 组件属性定义 *********/
                tag: 'div', // dom 元素的标签
                css: null, // 元素的 css <Object>
                attr: null, // 元素的 attr <Object>
                class: '', // 元素的 class <String>

                /********* 组件布局定义 *********/
                view: '', // 视图布局内容 <HTMLString>
                template: '', // 静态模板 uri <UrlString>
                tplParam: null, // 模板拉取请求参数 <Object>

                /********* 组件 MVVM 定义 *********/
                model: null,  // mvvm 数据模型对象 <Object>
                methods: null,  // 事件声明函数对象  <Object>
                watches: null,  // 批量 watch 数据对象  <Object>
                watchAll: null,  // model 变化统一回调函数  <Function>
                computed: null,  // mvvm 计算属性对象 <Object>
                customs: null,  // 自定义指令刷新函数对象 <Object>
                hooks: null,  // DOM 增删钩子函数对象 <Object>
                lazy: false, // 是否手动编译根元素 <Boolean>

                /********* 声明式嵌套子组件定义 *********/
                childs: null, // <Object>

                // 视图渲染完成后的回调函数
                cbRender: 'afterRender'
            }, config)

            // 组件元素
            this.el = null
            // mvvm 实例
            this.vm = null
            // 通用 DOM 处理方法
            this.$ = new DOM()

            // (Private) 组件初始显示状态
            this.__visible__ = ''
            // (Private) 组件是否已经创建完成
            this.__ready__ = false
            // (Private) DOM 事件绑定记录
            this.__listeners__ = {}

            // 调用渲染前函数
            if (isFunc(this.beforeRender)) {
                this.beforeRender()
            }

            // 拉取模板
            if (this.getConfig('template')) {
                this._loadTemplate()
            } else {
                this._render()
            }
        },

        /**
         * (Private) 加载模板布局文件
         */
        _loadTemplate: function () {
            var c = this.getConfig()
            var uri = c.template

            ajax.load(uri, c.tplParam, function (err, data) {
                var view

                if (err) {
                    view = err.status + ': ' + uri
                    warn(err)
                } else {
                    view = data.result
                }

                this.setConfig('view', view)
                this._render()
            }, this)
        },

        /**
         * (Private) 渲染组件视图、初始化配置
         */
        _render: function () {
            // 判断是否已创建过
            if (this.__ready__) {
                return this
            }

            this.__ready__ = true

            var c = this.getConfig()

            var target = c.target
            var isAppend = target instanceof HTMLElement

            // 组件 el 创建
            if (isAppend) {
                this.el = createElement(c.tag)
            } else {
                this.el = document.querySelector(target)
            }

            // 添加 class
            var cls = c.class
            if (cls && isString(cls)) {
                each(cls.split(' '), function (classname) {
                    addClass(this.el, classname)
                }, this)
            }

            // 添加 css
            if (isObject(c.css)) {
                each(c.css, function (value, property) {
                    this.el.style[property] = value
                }, this)
            }

            // 添加 attr
            if (isObject(c.attr)) {
                each(c.attr, function (value, name) {
                    setAttr(this.el, name, value)
                }, this)
            }

            // 添加页面视图布局
            if (c.view) {
                this.el.innerHTML = _toString(c.view)
            }

            // 初始化 mvvm 对象
            var model = c.model
            if (isObject(model)) {
                this.vm = new MVVM({
                    view: this.el,
                    model: model,
                    methods: c.methods,
                    watches: c.watches,
                    watchAll: c.watchAll,
                    computed: c.computed,
                    customs: c.customs,
                    hooks: c.hooks,
                    context: this,
                    lazy: c.lazy
                })
            }

            // 组件初始显示状态
            var display = this.el.style.display
            this.__visible__ = display === 'none' ? '' : display

            // 创建子组件
            each(c.childs, this._buildBatchChilds, this)

            // 追加到目标容器
            if (isAppend) {
                if (c.replace) {
                    target.parentNode.replaceChild(this.el, target)
                } else {
                    target.appendChild(this.el)
                }
            }

            // 组件视图渲染完成回调方法
            var cb = this[c.cbRender]
            if (isFunc(cb)) {
                cb.call(this)
            }
        },

        /**
         * (Private) 批量创建子组件
         * @param   {Function}  ChildComp  [子组件类]
         * @param   {String}    symbol     [子组件名称]
         */
        _buildBatchChilds: function (ChildComp, symbol) {
            var this$1 = this;

            var target = this.queryAll(symbol.toLowerCase())

            if (!target.length) {
                target = this.queryAll('[name='+ symbol +']')
            }

            switch (target.length) {
                case 0:
                    warn('Cannot find target element for sub component ['+ symbol +']')
                    break
                case 1:
                    this._createChild(target[0], symbol, ChildComp)
                    break
                default: {
                    for (var i = 0; i < target.length; i++) {
                        this$1._createChild(target[i], symbol + i, ChildComp)
                    }
                }
            }
        },

        /**
         * (Private) 创建一个子组件实例
         * @param   {DOMElement}  target
         * @param   {String}      childName
         * @param   {Function}    ChildComp
         */
        _createChild: function (target, childName, ChildComp) {
            // 默认全部替换子组件标记
            var childConfig = { target: target, 'replace': true }

            // 直接传入子组件
            if (isFunc(ChildComp)) {
                this.create(childName, ChildComp, childConfig)
            }
            // 传子组件和其配置参数 [component, config]
            else if (isArray(ChildComp)) {
                this.create(childName, ChildComp[0], extend(ChildComp[1], childConfig))
            }
        },

        /**
         * (Private) 组件销毁后的回调函数
         */
        _afterDestroy: function () {
            var vm = this.vm
            var el = this.el
            var parent = el.parentNode

            // 销毁 mvvm 实例
            if (vm) {
                vm.destroy()
            }

            // 销毁 dom 对象
            if (parent) {
                parent.removeChild(el)
            }

            this.el = this.vm = null
            clearObject(this.__listeners__)
        },

        /**
         * 获取组件配置参数
         * @param  {String}  name  [参数字段名称，支持/层级]
         */
        getConfig: function (name) {
            return config(this.__config__, name)
        },

        /**
         * 设置组件配置参数
         * @param {String}  name   [配置字段名]
         * @param {Mix}     value  [值]
         */
        setConfig: function (name, value) {
            return config(this.__config__, name, value)
        },

        /**
         * 返回当前组件中第一个匹配特定选择器的元素
         * @param  {String}     selector  [子元素选择器]
         * @return {DOMObject}
         */
        query: function (selector) {
            return this.el.querySelector(selector)
        },

        /**
         * 返回当前组件中匹配一个特定选择器的所有的元素
         * @param  {String}    selectors  [子元素选择器]
         * @return {NodeList}
         */
        queryAll: function (selectors) {
            return this.el.querySelectorAll(selectors)
        },

        /**
         * 显示组件
         */
        show: function () {
            this.el.style.display = this.__visible__
            return this
        },

        /**
         * 隐藏组件
         */
        hide: function () {
            this.el.style.display = 'none'
            return this
        },

        /**
         * 元素添加绑定事件
         */
        on: function (node, type, callback, capture) {
            var self = this
            var guid = componentEventGuid++

            if (isString(callback)) {
                callback = this[callback]
            }

            callback[identifier] = guid
            var eventAgent = function (e) {
                callback.call(self, e)
            }

            this.__listeners__[guid] = eventAgent
            addEvent(node, type, eventAgent, capture)

            return this
        },

        /**
         * 元素解除绑定事件
         */
        off: function (node, type, callback, capture) {
            if (isString(callback)) {
                callback = this[callback]
            }

            var guid = callback[identifier]
            var eventAgent = this.__listeners__[guid]
            if (eventAgent) {
                removeEvent(node, type, eventAgent, capture)
            }

            return this
        }
    })

    /**
     * Sugar
     * @type  {Object}
     */
    var Sugar = Object.create(null)

    /**
     * 添加属性扩展方法
     * @param  {Object}  extra  [扩展对象]
     */
    Sugar.extend = function (extra) {
        util.extend.call(this, extra)
    }

    Sugar.extend({ ajax: ajax, core: core, util: util, Component: Component })

    return Sugar;

}));