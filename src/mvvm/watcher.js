import util from '../util';
import Observer from './observer';

/**
 * watcher 数据订阅模块
 */
function Watcher (model) {
	this.$model = model;

	// 数据模型订阅集合
	this.$modelSubs = {};

	// 访问路径订阅集合
	this.$accessSubs = {};

	// 数组下标订阅集合
	this.$indexSubs = {};

	// 深层订阅集合
	this.$deepSubs = {};

	this.observer = new Observer(model, 'change', this);
}

var wp = Watcher.prototype;

/**
 * 变化触发回调
 * @param   {String}  path
 * @param   {Mix}     last
 * @param   {Mix}     old
 * @param   {Array}   args
 */
wp.change = function (path, last, old, args) {
	var isAccess = path.indexOf('*') !== -1;
	var subs = isAccess ? this.$accessSubs[path] : this.$modelSubs[path];
	this.trigger(subs, path, last, old, args);

	if (isAccess) {
		let field = path.split('*').shift();
		this.trigger(this.$deepSubs[field], path, last, old, args);
	}
}

/**
 * 触发订阅的所有回调
 * @param   {Array}   subs
 * @param   {String}  path
 * @param   {Mix}     last
 * @param   {Mix}     old
 * @param   {Array}   args
 */
wp.trigger = function (subs, path, last, old, args) {
	util.each(subs, function (sub) {
		sub.cb.call(sub.ct, path, last, old, args || sub.arg);
	});
}

/**
 * 订阅一个依赖集合的变化回调 (顶层模型 access 为 undefined)
 * @param   {Object}    depends
 * @param   {Function}  callback
 * @param   {Object}    context
 * @param   {Array}     args
 */
wp.watch = function (depends, callback, context, args) {
	// 依赖的数据模型
	var depModels = depends.dep;
	// 依赖的访问路径
	var depAccess = depends.acc;

	util.each(depModels, function (model, index) {
		var access = depAccess[index];

		// 暂时只有这一个需要忽略的关键字
		if (model === '$event') {
			return;
		}

		// 下标取值
		if (model.indexOf('$index') !== -1) {
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
 * @param  {Boolean}   deep
 */
wp.watchModel = function (field, callback, context, args, deep) {
	if (!util.hasOwn(this.$model, field)) {
		return util.warn('the field: [' + field + '] does not exist in model');
	}

	if (field.indexOf('*') !== -1) {
		return util.warn('model ['+ field +'] cannot contain the character *');
	}

	this.addSubs(this.$modelSubs, field, callback, context, args);

	// index.js watch api 调用，用于数组的深层监测
	if (deep) {
		this.addSubs(this.$deepSubs, field, callback, context, args);
	}
}

/**
 * 订阅多层访问路径变化回调
 * @param  {String}    access
 * @param  {Function}  callback
 * @param  {Object}    context
 * @param  {Array}     args
 */
wp.watchAccess = function (access, callback, context, args) {
	this.addSubs(this.$accessSubs, access, callback, context, args);
}

/**
 * 订阅 vfor 数组下标变化回调
 * @param  {String}    access
 * @param  {Function}  callback
 * @param  {Object}    context
 * @param  {Array}     args
 */
wp.watchIndex = function (access, callback, context, args) {
	this.addSubs(this.$indexSubs, access, callback, context, args);
}

/**
 * 缓存订阅回调
 */
wp.addSubs = function (subs, identifier, callback, context, args) {
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
 * 移除指定的访问路径/下标订阅(重新编译 vfor)
 */
wp.removeSubs = function (field) {
	// 下标
	util.each(this.$indexSubs, function (sub, index) {
		if (index.indexOf(field) === 0) {
			return null;
		}
	});
	// 访问路径
	util.each(this.$accessSubs, function (sub, access) {
		if (access.indexOf(field) === 0) {
			return null;
		}
	});
}

/**
 * 发生数组操作时处理订阅的移位
 * @param   {String}  field     [数组字段]
 * @param   {String}  moveMap   [移位的映射关系]
 */
wp.moveSubs = function (field, moveMap, method) {
	// 数组字段标识
	var prefix = field + '*';
	// 移位下标
	this.moveIndex(prefix, moveMap);
	// 移位访问路径
	this.moveAccess(prefix, moveMap);
}

/**
 * 移位下标订阅集合
 * 移位的过程需要触发所有回调以更改每一个 $index
 */
wp.moveIndex = function (prefix, moveMap) {
	var dest = {};
	var subs = this.$indexSubs;
	var caches = util.copy(subs);

	// 根据结果映射 移位下标
	util.each(moveMap, function (move, index) {
		var udf;
		var nowIndex = prefix + index;
		var moveIndex = prefix + move;

		dest[nowIndex] = caches[moveIndex];

		// 被挤掉的设为 undefined
		if (move === udf) {
			subs[nowIndex] = udf;
		}
	});

	// 触发 $index 变更
	util.each(dest, function (subs, index) {
		var i = +index.substr(prefix.length);
		util.each(subs, function (sub) {
			sub.cb.call(sub.ct, '$index', i, sub.arg);
		});
	});

	// 合并移位结果
	util.extend(subs, dest);

	dest = caches = null;
}

/**
 * 移位访问路径订阅集合
 * 移位的过程不需要触发回调
 */
wp.moveAccess = function (prefix, moveMap) {
	var dest = {};
	var subs = this.$accessSubs;
	var caches = util.copy(subs);

	// 根据结果映射 移位访问路径
	util.each(moveMap, function (move, index) {
		var udf;
		var befores = [], afters = [];
		var nowIndex = prefix + index;
		var moveIndex = prefix + move;

		// 提取出替换前后的访问路径集合
		util.each(subs, function (sub, access) {
			if (move === udf && access.indexOf(nowIndex) === 0) {
				afters.push(udf);
				befores.push(access);
			}
			else if (access.indexOf(moveIndex) === 0) {
				afters.push(access);
				befores.push(access.replace(moveIndex, nowIndex));
			}
		});

		// 进行替换
		util.each(befores, function (before, index) {
			var after = afters[index];

			// 被挤掉的设为 undefined
			if (after === udf) {
				subs[before] = udf;
			}
			else {
				dest[before] = caches[after];
			}
		});
	});

	// 合并移位结果
	util.extend(subs, dest);

	dest = caches = null;
}

/**
 * 销毁函数
 */
wp.destroy = function () {
	util.clear(this.$modelSubs);
	util.clear(this.$accessSubs);
	util.clear(this.$indexSubs);
	util.clear(this.$deepSubs);
	this.observer.destroy();
}

export default Watcher;
