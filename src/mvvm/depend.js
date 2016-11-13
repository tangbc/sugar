import { each } from '../util';

let guid = 0;

/**
 * 依赖收集模块
 * @param  {String}  path  [数据路径]
 */
export default function Depend (path) {
	this.path = path;
	this.watchers = [];
	this.guid = guid++;
}

/**
 * 当前收集依赖的订阅模块 watcher
 * @type  {Object}
 */
Depend.watcher = null;

let dp = Depend.prototype;

/**
 * 添加依赖订阅
 * @param  {Object}  watcher
 */
dp.addWatcher = function (watcher) {
	this.watchers.push(watcher);
}

/**
 * 移除依赖订阅
 * @param  {Object}  watcher
 */
dp.removeWatcher = function (watcher) {
	this.watchers.$remove(watcher);
}

/**
 * 为 watcher 收集当前的依赖
 */
dp.depend = function () {
	if (Depend.watcher) {
		Depend.watcher.addDepend(this);
	}
}

/**
 * 依赖变更前调用方法，用于旧数据的缓存处理
 */
dp.beforeNotify = function () {
	each(this.watchers, function (watcher) {
		watcher.beforeUpdate();
	});
}

/**
 * 依赖变更，通知每一个订阅了该依赖的 watcher
 * @param  {Object}  args  [数组操作参数信息]
 */
dp.notify = function (args) {
	each(this.watchers, function (watcher) {
		watcher.update(args, this);
	}, this);
}
