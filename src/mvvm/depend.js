import { each } from '../util';

var guid = 0;

export default function Depend (key) {
	this.key = key;
	this.watchers= [];
	this.guid = guid++;
}

Depend.watcher = null;
var dp = Depend.prototype;

/**
 * 添加依赖订阅
 */
dp.addWatcher = function (watcher) {
	this.watchers.push(watcher);
}

/**
 * 移除依赖订阅
 */
dp.removeWatcher = function (watcher) {
	var index = this.watchers.indexOf(watcher);
	if (index > -1) {
		this.watchers.splice(index, 1);
	}
}

/**
 * 当前 watcher 收集依赖
 */
dp.depend = function () {
	if (Depend.watcher) {
		Depend.watcher.addDepend(this);
	}
}

/**
 * watcher 更新前调用方法
 */
dp.beforeNotify = function () {
	each(this.watchers, function (watcher) {
		watcher.beforeUpdate();
	});
}

/**
 * 通知每一个订阅了该依赖的 watcher
 * @param   {Object}  arg  [数组操作参数信息]
 */
dp.notify = function (arg) {
	each(this.watchers, function (watcher) {
		watcher.update(arg);
	});
}