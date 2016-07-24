import util from '../util';

/**
 * 执行一个 http 请求
 * @param   {String}    dataType  [回调数据类型 json/text ]
 * @param   {String}    url       [请求url]
 * @param   {String}    method    [请求类型]
 * @param   {String}    param     [请求参数]
 * @param   {Function}  callback  [回调函数]
 * @param   {Function}  context   [作用域]
 * @return  {Object}
 */
function execute (dataType, url, method, param, callback, context) {
	var ct = context || this;
	var xhr = new XMLHttpRequest();

	// 初始化请求
	xhr.open(method, url, true);

	// 状态变化回调
	xhr.onreadystatechange = function () {
		var status = xhr.status;
		var result = null, error = null;

		// 请求完成
		if (xhr.readyState === 4) {
			let response = xhr.responseText;

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
			} else {
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
		xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	}

	xhr.send(param);

	return xhr;
}

/**
 * get 请求
 */
function get (url, param, callback, context, dataType) {
	var params = [];

	if (util.isFunc(param)) {
		dataType = context;
		context = callback;
		callback = param;
		param = null;
	}

	// 格式化参数对象
	util.each(param, function (val, key) {
		params.push(key + '=' + encodeURIComponent(val));
	});

	if (params.length) {
		url = url + '?' + params.join('&');
	}

	return execute(dataType || 'json', url, 'GET', null, callback, context);
}

/**
 * post 请求
 */
function post (url, param, callback, context) {
	return execute('json', url, 'POST', param ? JSON.stringify(param) : null, callback, context);
}

/**
 * 拉取静态模板
 */
function load (url, param, callback, context) {
	return get(url, param, callback, context, 'text');
}

export default { get, post, load }
