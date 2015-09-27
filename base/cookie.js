/*
	cookie相关操作模块
 */
define(function(require, exports) {
	var util = require('../core/util');
	// cookie默认配置
	var defaults = {
		'raw'     : true,
		'json'    : false,
		'expires' : 30,
		'path'    : '',
		'domain'  : ''
	};


	// 写入cookie
	exports.set = function(key, value, options) {
		options = util.extend({}, defaults, options);
		if (util.isNumber(options.expires)) {
			var days = options.expires;
			var t = options.expires = new Date();
			t.setMilliseconds(t.getMilliseconds() + days * 864e+5);
		}

		return (document.cookie = [
			encode(key), '=', stringifyCookieValue(value),
			options.expires ? '; expires=' + options.expires.toUTCString() : '',
			options.path    ? '; path=' + options.path : '',
			options.domain  ? '; domain=' + options.domain : ''
		].join(''));
	}


	// 读取cookie
	exports.get = function(key) {
		var result = key ? undefined : {};
		var cookies = document.cookie ? document.cookie.split('; ') : [];

		util.each(cookies, function(item) {
			var parts = item.split('=');
			var name = decode(parts.shift());
			var cookie = parts.join('=');

			// 返回全部
			if (!key && cookie === read(cookie)) {
				result[name] = cookie;
			}
			// 返回单个
			if (key && key === name) {
				result = read(cookie);
				return false;
			}
		});
		return result;
	}


	// 删除cookie
	exports.remove = function(key, options) {
		this.setCookie(key, util.extend({}, options, {'expires': -1}));
		return !this.setCookie(key);
	}


	function encode(s) {
		return defaults.raw ? s : encodeURIComponent(s);
	}

	function decode(s) {
		return defaults.raw ? s : decodeURIComponent(s);
	}

	function stringifyCookieValue(value) {
		return encode(defaults.json ? JSON.stringify(value) : String(value));
	}

	function parseCookieValue(s) {
		if (s.indexOf('"') === 0) {
			s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
		}

		try {
			s = decodeURIComponent(s.replace(/\+/g, ' '));
			return defaults.json ? JSON.parse(s) : s;
		}
		catch (e) {
			util.error(e);
		}
	}

	function read(key) {
		var value = defaults.raw ? key : parseCookieValue(key);
		return value;
	}
});