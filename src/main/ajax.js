/**
 * Ajax模块
 */
define([
	'../util'
], function(util) {

	/**
		readyState:
		0: 请求未初始化
		1: 服务器连接已建立
		2: 请求已接收
		3: 请求处理中
		4: 请求已完成，且响应已就绪
	 */

	function Ajax() {
		this.xmlHttp = new XMLHttpRequest();
	}

	var ap = Ajax.prototype;

	/**
	 * 执行一个http请求
	 * @param   {String}    dataType  [回调数据类型json/text]
	 * @param   {String}    url       [请求url]
	 * @param   {String}    method    [请求类型]
	 * @param   {String}    param     [请求参数]
	 * @param   {Function}  callback  [回调函数]
	 * @param   {Function}  context   [作用域]
	 */
	ap._execute = function(dataType, url, method, param, callback, context) {
		var xmlHttp = this.xmlHttp;
		var ct = context || util.WIN;

		// 初始化请求
		xmlHttp.open(method, url, true);

		// 状态变化回调
		xmlHttp.onreadystatechange = function() {
			var response;
			var result = null, error = null, status = xmlHttp.status;

			// 请求完成
			if (xmlHttp.readyState === 4) {
				response = xmlHttp.responseText;

				// 返回数据类型
				if (dataType !== 'text') {
					try {
						response = JSON.parse(response);
					}
					catch (e) {}
				}

				// 请求响应成功
				if (status === 200) {
					result = {
						'success': true,
						'result' : response
					}
				}
				// 响应失败
				else {
					error = {
						'result' : null,
						'success': false,
						'status' : status
					}
				}

				callback.call(ct, error, result);
			}
		}

		if (param) {
			xmlHttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		}

		xmlHttp.send(param);
	}

	/**
	 * get请求
	 */
	ap.get = function(url, param, callback, context, dataType) {
		var params = [];

		if (util.isFunc(param)) {
			dataType = context;
			context = callback;
			callback = param;
			param = null;
		}

		// 格式化参数对象
		util.each(param, function(val, key) {
			params.push(key + '=' + encodeURIComponent(val));
		});

		if (params.length) {
			url = url + '?' + params.join('&');
		}

		this._execute(dataType || 'json', url, 'GET', null, callback, context);
	}

	/**
	 * post请求
	 */
	ap.post = function(url, param, callback, context) {
		this._execute('json', url, 'POST', param ? JSON.stringify(param) : null, callback, context);
	}

	/**
	 * 拉取静态模板
	 */
	ap.load = function(url, param, callback, context) {
		this.get(url, param, callback, context, 'text');
	}

	return new Ajax();
});