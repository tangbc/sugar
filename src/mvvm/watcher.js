/**
 * watcher 数据订阅模块
 */
define([
	'../util',
	'./observer'
], function(util, Observer) {

	function Watcher(model) {
		this.$model = model;

		// 数据模型订阅集合
		this.$modelSubs = {};

		// 访问路径订阅集合
		this.$accessSubs = {};

		// 数组下标订阅集合
		this.$indexSubs = {};

		this.observer = new Observer(model, ['$els'], 'change', this);
	}

	var wp = Watcher.prototype;

	/**
	 * Observer 变化触发回调
	 * @param   {String}  path
	 * @param   {Mix}     last
	 * @param   {Mix}     old
	 */
	wp.change = function(path, last, old) {
		var isAccess = path.indexOf('*') !== -1;
		var subs = isAccess ? this.$accessSubs[path] : this.$modelSubs[path];
		this.trigger(subs, path, last, old);
	}

	/**
	 * 触发订阅的所有回调
	 * @param   {Array}   subs
	 * @param   {String}  path
	 * @param   {Mix}     last
	 * @param   {Mix}     old
	 * @param   {Array}   args
	 */
	wp.trigger = function(subs, path, last, old) {
		util.each(subs, function(sub) {
			sub.cb.call(sub.ct, path, last, old, sub.arg);
		}, this);
	}

	/**
	 * 订阅一个依赖集合的变化回调 (顶层模型无 access)
	 * @param   {Array}     depends
	 * @param   {Function}  callback
	 * @param   {Object}    context
	 * @param   {Array}     args
	 */
	wp.watch = function(depends, callback, context, args) {
		// 依赖的数据模型
		var depModels = depends[0];
		// 依赖的访问路径
		var depAccess = depends[1];

		util.each(depModels, function(model, index) {
			var access = depAccess[index];

			// 暂时只有这一个需要忽略的关键字
			if (model === '$event') {
				return;
			}

			// 下标取值
			if (model === '$index') {
				this.watchIndex(access, callback, context, args);
				return;
			}

			// 嵌套数组/对象
			if (access) {
				this.watchAccess(access, callback, context, args);
				return;
			}

			// 顶层数据模型
			this.watchModel(util.getExpAlias(model), callback, context, args);

		}, this);
	}

	/**
	 * 订阅一个数据模型字段的变化回调
	 * @param  {String}    field
	 * @param  {Function}  callback
	 * @param  {Object}    context
	 * @param  {Array}     args
	 */
	wp.watchModel = function(field, callback, context, args) {
		if (!util.hasOwn(this.$model, field)) {
			util.warn('The field: "' + field + '" does not exist in model!');
			return;
		}

		if (field.indexOf('*') !== -1) {
			util.warn('Model key cannot contain the character "*"!');
			return;
		}

		this.cacheSubs(this.$modelSubs, field, callback, context, args);
	}

	/**
	 * 订阅多层访问路径变化回调
	 * @param  {String}    access
	 * @param  {Function}  callback
	 * @param  {Object}    context
	 * @param  {Array}     args
	 */
	wp.watchAccess = function(access, callback, context, args) {
		this.cacheSubs(this.$accessSubs, access, callback, context, args);
	}

	/**
	 * 订阅 vfor 数组下标变化回调
	 * @param  {String}    access
	 * @param  {Function}  callback
	 * @param  {Object}    context
	 * @param  {Array}     args
	 */
	wp.watchIndex = function(access, callback, context, args) {
		this.cacheSubs(this.$indexSubs, access, callback, context, args);
	}

	/**
	 * 缓存订阅回调
	 */
	wp.cacheSubs = function(subs, identifier, callback, context, args) {
		// 缓存回调函数
		if (!subs[identifier]) {
			subs[identifier] = [];
		}

		subs[identifier].push({
			'cb' : callback,
			'ct' : context,
			'arg': args
		});
	}

	/**
	 * 移除指定的访问路径订阅(重新编译 vfor)
	 */
	wp.removeSubs = function(field) {
		util.each(this.$accessSubs, function(sub, access) {
			if (access.indexOf(field) === 0) {
				return null;
			}
		}, this);
	}

	/**
	 * 发生数组操作时处理订阅的移位
	 * @param   {String}  field   [数组字段]
	 * @param   {String}  method  [数组操作方法]
	 */
	wp.shiftSubs = function(field, method) {
		// 数组字段标识
		var prefix = field + '*';
		// 移位下标
		this.shiftIndex(prefix, method);
		// 移位访问路径
		this.shiftAccess(prefix, method);
	}

	/**
	 * 获取指定相关访问路径和回调集合
	 * @param   {String}  identifier  [目标标识符]
	 * @param   {Array}   subs        [所有订阅]
	 * @return  {Object}
	 */
	wp.getRelate = function(identifier, subs) {
		var caches = {}, targets = [];

		util.each(Object.keys(subs), function(key) {
			if (key.indexOf(identifier) === 0) {
				targets.push(key);
				caches[key] = subs[key];
			}
		}, this);

		return {
			'caches' : caches,
			'targets': targets
		}
	}

	/**
	 * 移位下标的订阅回调
	 * 移位的过程需要触发所有回调以更改每一个 $index
	 */
	wp.shiftIndex = function(prefix, method) {
		var subs = this.$indexSubs;
		// 需要移位的相关信息
		var relate = this.getRelate(prefix, subs);

		if (!relate.targets.length) {
			return;
		}

		switch (method) {
			case 'shift':
				this.shiftIndexForward(prefix, subs, relate);
				break;
			case 'unshift':
				this.shiftIndexBackward(prefix, subs, relate);
				break;
		}
	}

	/**
	 * 下标提前，shift 操作，最后一位为 undefined
	 */
	wp.shiftIndexForward = function(prefix, subs, relate) {
		var targets = relate.targets, caches = relate.caches;

		util.each(targets, function(access) {
			var index = +access.substr(prefix.length).charAt(0);
			var suffix = access.substr(prefix.length + 1);
			var current = access, prev = prefix + (index + 1) + suffix;

			subs[current] = caches[prev];

			util.each(subs[current], function(sub) {
				sub.cb.call(sub.ct, current, index, sub.arg);
			}, this);
		}, this);
	}

	/**
	 * 下标延后，unshift 操作，第一位为 undefined
	 */
	wp.shiftIndexBackward = function(prefix, subs, relate) {
		var targets = relate.targets, caches = relate.caches;

		util.each(targets.reverse(), function(access) {
			var udf, first = prefix + 0;
			var index = +access.substr(prefix.length).charAt(0);
			var suffix = access.substr(prefix.length + 1);
			var current = access, prev = prefix + (index + 1) + suffix;

			subs[prev] = caches[current];

			util.each(subs[current], function(sub) {
				sub.cb.call(sub.ct, current, index + 1, sub.arg);
			}, this);

			if (index === 0) {
				subs[first] = udf;
			}
		}, this);
	}

	/**
	 * 移位访问路径的订阅回调
	 * 移位的过程不需要触发回调
	 */
	wp.shiftAccess = function(prefix, method) {
		var subs = this.$accessSubs;
		// 需要移位的所有访问路径和回调
		var relate = this.getRelate(prefix, subs);

		if (!relate.targets.length) {
			return;
		}

		switch (method) {
			case 'shift':
				this.shiftAccessForward(prefix, subs, relate);
				break;
			case 'unshift':
				this.shiftAccessBackward(prefix, subs, relate);
				break;
		}
	}

	/**
	 * 访问路径提前，shift 操作，最后一位为 undefined
	 */
	wp.shiftAccessForward = function(prefix, subs, relate) {
		var targets = relate.targets, caches = relate.caches;

		util.each(targets, function(access) {
			var index = +access.substr(prefix.length).charAt(0);
			var suffix = access.substr(prefix.length + 1);
			var current = access, next = prefix + (index + 1) + suffix;

			subs[current] = caches[next];
		}, this);
	}

	/**
	 * 访问路径延后，unshift 操作，第一位为 undefined
	 */
	wp.shiftAccessBackward = function(prefix, subs, relate) {
		var targets = relate.targets, caches = relate.caches;

		util.each(targets, function(access) {
			var index = +access.substr(prefix.length).charAt(0);
			var suffix = access.substr(prefix.length + 1);
			var udf, first = prefix + 0 + suffix;
			var current = access, next = prefix + (index + 1) + suffix;

			subs[next] = caches[current];

			if (index === 0) {
				subs[first] = udf;
			}
		}, this);
	}

	return Watcher;
});