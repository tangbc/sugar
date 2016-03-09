/**
 * watcher模块
 */
define([
	'./util',
	'./vm-observer'
], function(util, Observer) {

	/**
	 * 监测器构造函数
	 * @param  {Object}  model     [VM数据模型]
	 */
	function Watcher(model) {
		this.$model = model;

		// 已监测的字段集合
		this.$watchers = [];

		// 以监测字段为索引的回调集合
		this.$watcherCallbacks = {};

		// 已监测的访问路径集合
		this.$accesses = {};

		// 以监测访问路径为索引的回调集合
		this.$accessCallbacks = {};

		this.observer = new Observer(model, ['$els'], 'triggerModelAgent', this);
	}
	Watcher.prototype =  {
		constructor: Watcher,

		/**
		 * 添加一个对数据模型字段的监测回调
		 * @param  {String}    field     [监测字段]
		 * @param  {Function}  callback  [变化回调]
		 * @param  {Object}    context   [作用域]
		 * @param  {Array}     args      [回调参数]
		 */
		add: function(field, callback, context, args) {
			var model = this.$model;
			var watchers = this.$watchers;
			var callbacks = this.$watcherCallbacks;

			if (!util.has(field, model)) {
				util.warn('The field: ' + field + ' does not exist in model!');
				return;
			}

			// 缓存字段
			if (watchers.indexOf(field) === -1) {
				watchers.push(field);
			}

			// 缓存回调函数
			if (!callbacks[field]) {
				callbacks[field] = [];
			}

			callbacks[field].push([callback, context, args]);
		},

		/**
		 * 数据模型变化触发代理
		 * 只会触发一级模型定义的字段，嵌套对象和数组通过watchAccess在VM中手动触发
		 * @param   {String}  path  [触发字段访问路径]
		 * @param   {Mix}     last  [新值]
		 * @param   {Mix}     old   [旧值]
		 */
		triggerModelAgent: function(path, last, old) {
			var field = path.indexOf('*') === -1 ? path : path.split('*')[0];

			// 排除非数据模型的监测字段
			if (this.$watchers.indexOf(field) === -1) {
				return;
			}

			// 触发所有回调
			util.each(this.$watcherCallbacks[field], function(cb) {
				var callback = cb[0], context = cb[1], args = cb[2];
				callback.apply(context, [path, last, old, args]);
			}, this);
		},

		/**
		 * 监测数据模型多层访问路径
		 * @param  {String}    access    [访问路径]
		 * @param  {Function}  callback  [变化回调]
		 * @param  {Object}    context   [作用域]
		 * @param  {Array}     args      [回调参数]
		 */
		watchAccess: function(access, callback, context, args) {
			var accesses = this.$accesses;
			var callbacks = this.$accessCallbacks;
			var root = access.substr(0, access.indexOf('*'));

			// 缓存根字段
			if (!util.has(root, accesses)) {
				accesses[root] = [];
			}

			accesses[root].push(access);

			// 缓存回调函数
			if (!callbacks[access]) {
				callbacks[access] = [];
			}

			callbacks[access].push([callback, context, args]);
		},

		/**
		 * 触发访问路径变更回调
		 * @param   {String}  access  [访问路径]
		 * @param   {Mix}     last    [新值]
		 * @param   {Mix}     old     [旧值]
		 */
		triggerAccess: function(access, last, old) {
			var callbacks = this.$accessCallbacks;
			util.each(callbacks[access], function(cb) {
				var callback = cb[0], context = cb[1], args = cb[2];
				callback.apply(context, [last, old, args]);
			});
		},

		/**
		 * 访问路径回调延后/提前一位，处理循环数组的unshift/shift操作
		 * @param   {String}   field     [数组访问路径]
		 * @param   {Number}   newLeng   [新数组长度]
		 * @param   {Boolean}  backward  [是否延后]
		 */
		updateAccess: function(field, newLeng, backward) {
			var prefix = field + '*';
			// 访问路径根数组
			var root = field.substr(0, field.indexOf('*'));
			var accesses = this.$accesses[root || field];
			var callbacks = this.$accessCallbacks;

			// 需要移位的所有访问路径和回调
			var targets = [], cbCaches = {};
			util.each(accesses, function(access) {
				if (access.indexOf(prefix) === 0) {
					targets.push(access);
					cbCaches[access] = callbacks[access];
				}
			});

			util.each(targets, function(current) {
				var index = +current.substr(prefix.length).charAt(0);
				var suffix = current.substr(prefix.length + 1);
				var first = prefix + 0 + suffix;
				var next = prefix + (index + 1) + suffix;

				// 延后一位，第一位将为undefined
				if (backward) {
					callbacks[next] = cbCaches[current];
					if (index === 0) {
						callbacks[first] = undefined;
					}
				}
				// 提前一位，最后一位将为undefined
				else {
					callbacks[current] = cbCaches[next];
				}
			}, this);
		},

		/**
		 * 访问路径回调延后一位，处理循环数组的unshift操作
		 */
		backwardAccess: function(field, newLeng) {
			this.updateAccess(field, newLeng, true);
		},

		/**
		 * 访问路径回调提前一位，处理循环数组的shift操作
		 */
		forwardAccess: function(field, newLeng) {
			this.updateAccess(field, newLeng, false);
		}
	};

	return Watcher;
});