/*
	浏览器特性判断模块
 */
define(function(require, exports) {
	var win = window;
	var doc = document;
	var loc = win.location;
	var host = loc.host;

	// CSS3 特性判断
	function isSupportCSS3() {
		var oDiv = doc.createElement('div'),
		browsers = 'O-Moz-Webkit'.split('-'),
		len = browsers.length,
		prop = "Perspective";
		if (prop in oDiv.style) {
			return true;
		}
		if ('-ms-' + prop in oDiv.style) {
			return true;
		}
		while(len--) {
			if (browsers[len] + prop in oDiv.style) {
				return true;
			}
		}
		return false;
	}

	// 获取跳转路径
	function getJumpPath() {
		var hash, arr, len, archive, aid, path;
		hash = loc.hash.replace(/^[#\/\!]+/, '');
		arr = hash.split('/');
		len = arr.length;

		switch(len) {
			case 1: aid = null; break;
			case 2: aid = arr[1]; break;
			default: aid = arr[2] === '' ? arr[1] : null;
		}

		archive = arr[0];

		if (archive === '' || archive === 'index') {
			path = ''
		}
		if (archive && archive !== 'index' && !aid) {
			path = '/p/' + archive
		}
		if (archive && aid) {
			path = '/' + aid + '.html'
		}

		return path;
	}

	// 检查是否需要跳转, 需要->true, 不需要->false
	exports.j = function() {
		// 页面跳转
		if (!isSupportCSS3() || doc.documentMode == 10) {
			var path = getJumpPath();
			win.location.href = 'http://' + host + path;
			return true;
		}
		return false;
	}
});