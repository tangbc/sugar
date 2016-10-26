import cache from './cache';
import { each, isFunc, isObject, isString, warn } from '../util';

/**
 * 字符串首字母大写
 * @param   {String}  string
 */
function ucFirst (string) {
	return string.charAt(0).toUpperCase() + string.substr(1);
}

/**
 * 根据组件名称获取组件实例
 * @param   {String}  name
 */
function getComponentByName (name) {
	let component = null;

	each(cache, function (instance) {
		if ((instance.__rd__ && instance.__rd__.name) === name) {
			component = instance;
			return false;
		}
	});

	return component;
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
	let func = receiver[msg.method];

	// 触发接收者的消息处理方法
	if (isFunc(func)) {
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
function feedbackSender (msg, callback, context) {
	if (isFunc(callback)) {
		callback.call(context, msg);
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
	let msg = createMessage('fire', sender, name, param);

	// 消息接收者，先从上一层模块开始接收
	let receiver = sender.getParent();

	while (receiver) {
		let ret = triggerReceiver(receiver, msg);

		// 接收消息方法返回 false 则不再继续冒泡
		if (ret === false) {
			feedbackSender(msg, callback, context);
			return;
		}

		msg.from = receiver;
		receiver = receiver.getParent();
	}

	feedbackSender(msg, callback, context);
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
	let msg = createMessage('broadcast', sender, name, param);

	// 消息接收者集合，先从自身的子模块开始接收
	let receivers = sender.getChilds(true).slice(0);

	while (receivers.length) {
		let receiver = receivers.shift();
		let ret = triggerReceiver(receiver, msg);

		// 接收消息方法返回 false 则不再继续广播
		if (ret !== false) {
			msg.from = receiver;
			Array.prototype.push.apply(receivers, receiver.getChilds(true));
		}
	}

	feedbackSender(msg, callback, context);
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
		let target;
		let paths = receiver.split('.');
		let parent = getComponentByName(paths.shift());

		// 有层级
		if (paths.length) {
			each(paths, function (comp) {
				target = parent.getChild(comp);
				parent = target;
				return null;
			});
		} else {
			target = parent;
		}

		parent = null;

		if (isObject(target)) {
			receiver = target;
		}
	}

	let msg = createMessage('notify', sender, name, param);

	if (!isObject(receiver)) {
		feedbackSender(msg, callback, context);
		return warn('Component: [' + receiver + '] is not exist!');
	}

	triggerReceiver(receiver, msg);

	feedbackSender(msg, callback, context);
}

/**
 * 全局广播发消息，系统全部组件实例接受
 * @param  {String}    name      [发送的消息名称]
 * @param  {Mix}       param     [<可选>附加消息参数]
 * @param  {Function}  callback  [<可选>发送完毕的回调函数，可在回调中指定回应数据]
 * @param  {Object}    context   [执行环境]
 */
function globalCast (name, param, callback, context) {
	let msg = createMessage('globalCast', '__core__', name, param);

	each(cache, function (receiver, index) {
		if (isObject(receiver) && index !== '0') {
			triggerReceiver(receiver, msg);
		}
	});

	feedbackSender(msg, callback, context);
}

export default { fire, broadcast, notify, globalCast }
