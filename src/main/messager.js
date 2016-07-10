import util from '../util';
import cache from './cache';

/**
 * 字符串首字母大写
 */
function ucFirst (str) {
	return str.charAt(0).toUpperCase() + str.substr(1);
}

/**
 * 根据组件名称获取组件实例
 * @param   {String}  name
 */
function getComponent (name) {
	var component = null;
	util.each(cache, function (instance) {
		if ((instance._ && instance._.name) === name) {
			component = instance;
			return false;
		}
	});
	return component;
}


/**
 * Messager 实现组件消息通信
 */
function Messager () {
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
mp.createMsg = function (type, sender, name, param) {
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
		// 发送完毕后的返回数据
		'returns': null
	}
}

/**
 * 触发接收消息组件实例的处理方法
 * @param  {Object}  receiver  [接收消息的组件实例]
 * @param  {Mix}     msg       [消息体（内容）]
 * @return {Mix}
 */
mp.trigger = function (receiver, msg) {
	// 接受者消息处理方法
	var func = receiver[msg.method];

	// 触发接收者的消息处理方法
	if (util.isFunc(func)) {
		// 标识消息的发送目标
		msg.to = receiver;
		// 发送次数
		++msg.count;
		return func.call(receiver, msg);
	}
}

/**
 * 通知发送者消息已被全部接收完毕
 * @param  {Mix}       msg       [消息体（内容）]
 * @param  {Function}  callback  [通知发送者的回调函数]
 * @param  {Object}    context   [执行环境]
 */
mp.notifySender = function (msg, callback, context) {
	// 通知回调
	if (util.isFunc(callback)) {
		callback.call(context, msg);
	}

	// 继续发送队列中未完成的消息
	if (this.queue.length) {
		setTimeout(this.sendQueue, 0);
	}
	else {
		this.busy = false;
	}
}

/**
 * 发送消息队列
 */
mp.sendQueue = function () {
	var request = messager.queue.shift();

	messager.busy = false;

	if (!request) {
		return false;
	}

	// 消息类型
	var type = request.shift();
	// 消息方法
	var func = messager[type];

	func.apply(messager, request);
}

/**
 * 冒泡（由下往上）方式发送消息，由子组件实例发出，逐层父组件实例接收
 * @param  {Object}    sender    [发送消息的子组件实例]
 * @param  {String}    name      [发送的消息名称]
 * @param  {Mix}       param     [<可选>附加消息参数]
 * @param  {Function}  callback  [<可选>发送完毕的回调函数，可在回调中指定回应数据]
 * @param  {Object}    context   [执行环境]
 */
mp.fire = function (sender, name, param, callback, context) {
	var type = 'fire';

	// 是否处于忙碌状态
	if (this.busy ) {
		this.queue.push([type, sender, name, param, callback, context]);
		return;
	}

	this.busy = true;

	// 创建消息
	var msg = this.createMsg(type, sender, name, param);
	// 消息接收者，先从上一层模块开始接收
	var receiver = sender.getParent();

	while (receiver) {
		let ret = this.trigger(receiver, msg);

		// 接收消息方法返回 false 则不再继续冒泡
		if (ret === false) {
			this.notifySender(msg, callback, context);
			return;
		}

		msg.from = receiver;
		receiver = receiver.getParent();
	}

	this.notifySender(msg, callback, context);
}

/**
 * 广播（由上往下）方式发送消息，由父组件实例发出，逐层子组件实例接收
 */
mp.broadcast = function (sender, name, param, callback, context) {
	var type = 'broadcast';

	// 是否处于忙碌状态
	if (this.busy) {
		this.queue.push([type, sender, name, param, callback, context]);
		return;
	}

	this.busy = true;

	// 创建消息
	var msg = this.createMsg(type, sender, name, param);
	// 消息接收者集合，先从自身的子模块开始接收
	var receivers = sender.getChilds(true).slice(0);

	while (receivers.length) {
		let receiver = receivers.shift();
		let ret = this.trigger(receiver, msg);

		// 接收消息方法返回 false 则不再继续广播
		if (ret !== false) {
			msg.from = receiver;
			Array.prototype.push.apply(receivers, receiver.getChilds(true));
		}
	}

	this.notifySender(msg, callback, context);
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
mp.notify = function (sender, receiver, name, param, callback, context) {
	var type = 'notify';

	// 是否处于忙碌状态
	if (this.busy) {
		this.queue.push([type, sender, receiver, name, param, callback, context]);
		return;
	}

	this.busy = true;

	// 找到 receiver，名称可能为 superName.fatherName.childName 的情况
	if (util.isString(receiver)) {
		let target;
		let paths = receiver.split('.');
		let parent = getComponent(paths.shift());

		// 有层级
		if (paths.length) {
			util.each(paths, function (comp) {
				target = parent.getChild(comp);
				parent = target;
				return null;
			});
		}
		else {
			target = parent;
		}

		parent = null;

		if (util.isObject(target)) {
			receiver = target;
		}
	}

	var msg = this.createMsg(type, sender, name, param);

	if (!util.isObject(receiver)) {
		this.notifySender(msg, callback, context);
		return util.warn('Component: [' + receiver + '] is not exist!');
	}

	this.trigger(receiver, msg);

	this.notifySender(msg, callback, context);
}

/**
 * 全局广播发消息，系统全部组件实例接受
 * @param  {String}  name   [发送的消息名称]
 * @param  {Mix}     param  [<可选>附加消息参数]
 */
mp.globalCast = function (name, param, callback, context) {
	var type = 'globalCast';

	// 是否处于忙碌状态
	if (this.busy) {
		this.queue.push([type, name, param, callback, context]);
		return;
	}

	this.busy = true;

	var msg = this.createMsg(type, '__core__', name, param);

	util.each(cache, function (receiver, index) {
		if (util.isObject(receiver) && index !== '0') {
			this.trigger(receiver, msg);
		}
	}, this);

	// 发送完毕回调
	this.notifySender(msg, callback, context);
}

messager = new Messager();

export default messager;
