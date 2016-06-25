var sync = require('./sync');
var util = require('../util');
var cache = require('./cache');

/**
 * 字符串首字母大写
 */
function ucFirst(str) {
	var first = str.charAt(0).toUpperCase();
	return first + str.substr(1);
}

/**
 * Messager 实现组件消息通信
 * 默认接收消息 onMessage, 默认全部发送完毕回调 onMessageSent
 */
function Messager() {
	/**
	 * 是否正在发送消息
	 * @type {Bool}
	 */
	this.busy = false;

	/**
	 * 等待发送的消息队列
	 * @type {Array}
	 */
	this.queue = [];
}

var messager;
var mp = Messager.prototype;

/**
 * 创建一条消息
 * @param  {String}  type    [消息类型]
 * @param  {Object}  sender  [发送消息的组件实例]
 * @param  {String}  name    [发送的消息名称]
 * @param  {Mix}     param   [<可选>附加消息参数]
 * @return {Object}
 */
mp._create = function(type, sender, name, param) {
	return {
		// 消息类型
		'type'   : type,
		// 消息发起组件实例
		'from'   : sender,
		// 消息目标组件实例
		'to'     : null,
		// 消息被传递的次数
		'count'  : 0,
		// 消息名称
		'name'   : name,
		// 消息参数
		'param'  : param,
		// 接收消息组件的调用方法 on + 首字母大写
		'method' : 'on' + ucFirst(name),
		// 接收消息组件的返回值
		'returns': null
	}
}

/**
 * 触发接收消息组件实例的处理方法
 * @param  {Object}  receiver  [接收消息的组件实例]
 * @param  {Mix}     msg       [消息体（内容）]
 * @param  {Mix}     returns   [返回给发送者的数据]
 * @return {Mix}
 */
mp._trigger = function(receiver, msg, returns) {
	// 接收者对该消息的接收方法
	var func = receiver[msg.method];

	// 标识消息的发送目标
	msg.to = receiver;

	// 触发接收者的消息处理方法，若未定义则默认为 onMessage
	if (util.isFunc(func)) {
		returns = func.call(receiver, msg);
		msg.count++;
	}
	else if (util.isFunc(receiver.onMessage)) {
		returns = receiver.onMessage.call(receiver, msg);
		msg.count++;
	}

	msg.returns = returns;

	return returns;
}

/**
 * 通知发送者消息已被全部接收完毕
 * @param  {Mix}       msg       [消息体（内容）]
 * @param  {Function}  callback  [通知发送者的回调函数]
 * @param  {Object}    context   [执行环境]
 */
mp._notifySender = function(msg, callback, context) {
	// callback 未定义时触发默认事件
	if (!callback) {
		callback = context.onMessageSent;
	}

	// callback 为属性值
	if (util.isString(callback)) {
		callback = context[callback];
	}

	// 合法的回调函数
	if (util.isFunc(callback)) {
		callback.call(context, msg);
	}

	// 继续发送队列中未完成的消息
	if (this.queue.length) {
		setTimeout(this._sendQueue, 0);
	}
	else {
		this.busy = false;
	}
}

/**
 * 发送消息队列
 */
mp._sendQueue = function() {
	var request = messager.queue.shift();

	messager.busy = false;

	if (!request) {
		return false;
	}

	// 消息类型
	var type = request.shift();
	// 消息方法
	var func = messager[type];

	if (util.isFunc(func)) {
		func.apply(messager, request);
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
mp.fire = function(sender, name, param, callback, context) {
	var type = 'fire';

	// 是否处于忙碌状态
	if (this.busy || sync.count) {
		this.queue.push([type, sender, name, param, callback, context]);
		if (sync.count) {
			sync.addQueue(this._sendQueue, this);
		}
		return;
	}

	this.busy = true;

	// 创建消息
	var msg = this._create(type, sender, name, param);
	// 消息接收者，先从自身开始接收
	var receiver = sender;
	var returns;

	while (receiver) {
		returns = this._trigger(receiver, msg);
		// 接收消息方法返回 false 则不再继续冒泡
		if (returns === false) {
			break;
		}

		msg.from = receiver;
		receiver = receiver.getParent();
	}

	this._notifySender(msg, callback, context);
}

/**
 * 广播（由上往下）方式发送消息，由父组件实例发出，逐层子组件实例接收
 */
mp.broadcast = function(sender, name, param, callback, context) {
	var type = 'broadcast';

	// 是否处于忙碌状态
	if (this.busy || sync.count) {
		this.queue.push([type, sender, name, param, callback, context]);
		if (sync.count) {
			sync.addQueue(this._sendQueue, this);
		}
		return;
	}

	this.busy = true;

	// 创建消息
	var msg = this._create(type, sender, name, param);
	// 消息接收者集合，先从自身开始接收
	var receivers = [sender];
	var receiver, returns;

	while (receivers.length) {
		receiver = receivers.shift();
		returns = this._trigger(receiver, msg);
		// 接收消息方法返回 false 则不再继续广播
		if (returns === false) {
			break;
		}

		receivers.push.apply(receivers, receiver.getChilds(true));
	}

	this._notifySender(msg, callback, context);
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
mp.notify = function(sender, receiver, name, param, callback, context) {
	var type = 'notify';

	// 是否处于忙碌状态
	if (this.busy || sync.count) {
		this.queue.push([type, sender, receiver, name, param, callback, context]);
		if (sync.count) {
			sync.addQueue(this._sendQueue, this);
		}
		return;
	}

	this.busy = true;

	// 根据名称获取系统实例
	function _getInstanceByName(name) {
		var target = null;
		util.each(cache, function(instance) {
			if ((instance._ && instance._.name) === name) {
				target = instance;
				return false;
			}
		});
		return target;
	}

	// 找到 receiver，名称可能为 superName.fatherName.childName 的情况
	var ns = null, tmp, tar;
	if (util.isString(receiver)) {
		ns = receiver.split('.');

		// 有层级
		while (ns.length > 0) {
			if (!tmp) {
				tmp = _getInstanceByName(ns.shift());
				tar = ns.length === 0 ? tmp : (tmp ? tmp.getChild(ns[0]) : null);
			}
			else {
				tar = tmp.getChild(ns.shift());
			}
		}

		if (util.isObject(tar)) {
			receiver = tar;
		}
	}

	if (!util.isObject(receiver)) {
		util.warn('module: \'' + receiver + '\' is not found in cache!');
		return false;
	}

	var msg = this._create(type, sender, name, param);

	this._trigger(receiver, msg);

	this._notifySender(msg, callback, context);
}

/**
 * 全局广播发消息，系统全部组件实例接受
 * @param  {String}  name   [发送的消息名称]
 * @param  {Mix}     param  [<可选>附加消息参数]
 */
mp.globalCast = function(name, param) {
	var type = 'globalCast';

	// 是否处于忙碌状态
	if (this.busy || sync.count) {
		this.queue.push([type, name, param]);
		if (sync.count) {
			sync.addQueue(this._sendQueue, this);
		}
		return;
	}

	this.busy = false;

	var msg = this._create(type, 'core', name, param);

	util.each(cache, function(receiver) {
		this._trigger(receiver, msg);
	}, this);
}

module.exports = messager = new Messager();
