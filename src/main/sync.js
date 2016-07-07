import util from '../util';

/**
 * 异步状态锁
 */
function Sync() {
	/**
	 * 异步计数
	 * @type  {Number}
	 */
	this.count = 0;

	/**
	 * 回调队列
	 * @type  {Array}
	 */
	this.queue = [];
}

var sp = Sync.prototype;

/**
 * 加锁异步计数
 */
sp.lock = function() {
	this.count++;
}

/**
 * 解锁异步计数
 */
sp.unlock = function() {
	this.count--;
	this._checkQueue();
}

/**
 * 添加一个回调到队列
 * @param  {Function}  callback  [回调函数]
 * @param  {Function}  context   [上下文]
 * @param  {Array}     args      [回调参数]
 */
sp.addQueue = function(callback, context, args) {
	this.queue.push([callback, context, args]);
}

/**
 * 检查回调队列是否空闲
 */
sp._checkQueue = function() {
	var sync, callback, context, args;

	// 依次从最后的回调开始处理
	while (this.count === 0 && this.queue.length) {
		sync = this.queue.pop();

		// 回调函数
		callback = sync[0];
		// 执行环境
		context = sync[1];
		// 回调参数
		args = sync[2];

		if (util.isString(callback)) {
			callback = context[callback];
		}

		if (util.isFunc(callback)) {
			callback.apply(context, args);
		}
	}
}

export default new Sync();
