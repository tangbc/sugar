import dom from './dom';
import util from './util';

/**
 * 事件处理模块
 */
function Eventer() {
	this.$map = {};
	this.$guid = 1000;
	this.$listeners = {};
}

var ep = Eventer.prototype;

/**
 * 获取一个唯一的标识
 * @return  {Number}
 */
ep.guid = function() {
	return this.$guid++;
}

/**
 * 添加一个事件绑定回调
 * @param  {DOMElement}   node
 * @param  {String}       evt
 * @param  {Function}     callback
 * @param  {Boolean}      capture
 * @param  {Mix}          context
 */
ep.add = function(node, evt, callback, capture, context) {
	var map = this.$map;
	var guid = this.guid();
	var listeners = this.$listeners;

	map[guid] = callback;

	listeners[guid] = function _proxy(e) {
		callback.call(context || this, e);
	}

	dom.addEvent(node, evt, listeners[guid], capture);
}

/**
 * 移除事件绑定
 * @param   {DOMElement}   node
 * @param   {String}       evt
 * @param   {Function}     callback
 * @param   {Boolean}      capture
 */
ep.remove = function(node, evt, callback, capture) {
	var guid, map = this.$map;
	var listeners = this.$listeners;

	// 找到对应的 callback id
	util.each(map, function(cb, id) {
		if (cb === callback) {
			guid = id;
			return false;
		}
	});

	if (guid) {
		dom.removeEvent(node, evt, listeners[guid], capture);
		delete map[guid];
		delete listeners[guid];
	}
}

/**
 * 清除所有事件记录
 */
ep.clear = function() {
	this.$guid = 1000;
	util.clear(this.$map);
	util.clear(this.$listeners);
}

export default new Eventer();
