/**
 * watcher模块
 */
define([
	'./util',
	'./vm-observer'
], function(util, Observer) {

	/**
	 * 监测器构造函数
	 * @param  {Object}  data     [监测对象]
	 */
	function Watcher(data) {
		/**
		 * 参数缓存
		 * @type  {Object}
		 */
		this.$data = data;

		/**
		 * 已监测的字段集合
		 * @type  {Array}
		 */
		this.$watchers = [];

		/**
		 * 以监测字段为索引的回调集合
		 * @type  {Object}
		 */
		this.$callbacks = {};

		this.observer = new Observer(data, '_triggerAgent', this);
	}
	Watcher.prototype =  {
		constructor: Watcher,

		/**
		 * 添加一个监测回调
		 * @param  {String}    field     [监测字段]
		 * @param  {Function}  callback  [变化回调]
		 * @param  {Object}    context   [回调上下文]
		 * @param  {Array}     args      [回调参数]
		 */
		add: function(field, callback, context, args) {
			var data = this.$data;
			var watchers = this.$watchers;

			if (!util.has(field, data)) {
				util.error('The field: ' + field + ' does not exist in model: ', data);
				return;
			}

			if (watchers.indexOf(field) === -1) {
				watchers.push(field);
			}

			this._saveCallback(field, [callback, context, args]);
		},

		/**
		 * 设置字段变化的回调函数
		 * @param  {String}  field  [字段名称]
		 * @param  {Array}   cbs    [回调与参数]
		 */
		_saveCallback: function(field, cbs) {
			var callbacks = this.$callbacks;

			if (!callbacks[field]) {
				callbacks[field] = [];
			}

			callbacks[field].push(cbs);
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
				cb[0].apply(cb[1], [path, last, old, cb[2]]);
			}, this);
		},
	};

	return Watcher;
});