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
		this.$accesses = [];

		// 以监测访问路径为索引的回调集合
		this.$accessCallbacks = {};

		this.observer = new Observer(model, ['$els'], 'triggerAgent', this);
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
		triggerAgent: function(path, last, old) {
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

			// 缓存字段
			if (accesses.indexOf(access) === -1) {
				accesses.push(access);
			}

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
			if (this.$accesses.indexOf(access) === -1) {
				return;
			}

			util.each(this.$accessCallbacks[access], function(cb) {
				var callback = cb[0], context = cb[1], args = cb[2];
				callback.apply(context, [last, old, args]);
			});
		}
	};

	return Watcher;
});