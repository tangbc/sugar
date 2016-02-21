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
		this.$callbacks = {};

		this.observer = new Observer(model, ['$els'], '_triggerAgent', this);
	}
	Watcher.prototype =  {
		constructor: Watcher,

		/**
		 * 添加一个监测回调
		 * @param  {String}    field     [监测字段]
		 * @param  {Function}  callback  [变化回调]
		 * @param  {Object}    context   [作用域]
		 * @param  {Array}     args      [回调参数]
		 */
		add: function(field, callback, context, args) {
			var model = this.$model;
			var watchers = this.$watchers;
			var callbacks = this.$callbacks;

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
		 * 监测对象变化触发代理
		 * @param   {String}  path  [触发字段访问路径]
		 * @param   {Mix}     last  [新值]
		 * @param   {Mix}     old   [旧值]
		 */
		_triggerAgent: function(path, last, old) {
			var field = path.indexOf('*') === -1 ? path : path.split('*')[0];

			// 排除未监测字段
			if (this.$watchers.indexOf(field) === -1) {
				return;
			}

			// 触发所有回调
			util.each(this.$callbacks[field], function(cb) {
				var callback = cb[0], context = cb[1], args = cb[2];

				callback.apply(context, [path, last, old, args]);
			}, this);
		},
	};

	return Watcher;
});