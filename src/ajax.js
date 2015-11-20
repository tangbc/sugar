/**
 * 数据请求 Ajax
 */
define(['./util', '../jquery.min'], function(util, jquery) {

	/**
	 * Ajax数据交互类
	 */
	function Ajax() {
		/**
		 * 等待请求的缓存队列
		 * @type {Object}
		 */
		this.queue = {};
		/**
		 * 请求唯一id标识
		 * @type {Number}
		 */
		this.id = 1;
		/**
		 * 当前请求数
		 * @type {Number}
		 */
		this.count = 0;
	}
	Ajax.prototype = {
		constructor: Ajax,

		/**
		 * 建立一个请求，如队列空闲则立即执行
		 * @param  {String}   type     [请求类型]
		 * @param  {String}   uri      [请求地址]
		 * @param  {Mix}      param    [请求数据]
		 * @param  {Function} callback [请求回调]
		 * @param  {Object}   context  [执行环境]
		 */
		_build: function(type, uri, param, callback, context) {
			if (!util.isString(uri)) {
				util.error('request uri must be a type of String: ', uri);
				return false;
			}

			// POST请求数据处理
			if (type === 'POST' && param) {
				param = JSON.stringify(param);
			}

			// callback为属性值
			if (util.isString(callback)) {
				callback = context[callback];
			}

			// 不合法的回调函数
			if (!util.isFunc(callback)) {
				util.error('request callback must be a type of Function: ', callback);
				return false;
			}

			var id = this.id++;
			var request = {
				// 请求id，与队列中的id对应
				'id'      : id,
				// xmlRequest对象
				'xhr'     : null,
				// 是否已被阻止
				'isAbort' : false,
				// 请求类型
				'type'    : type,
				// 请求地址
				'uri'     : uri,
				// 请求参数
				'param'   : param,
				// 回调函数
				'callback': callback,
				// 执行环境
				'context' : context
			};

			// 先存入请求队列
			this.queue[id] = request;

			// 如空闲，发送队列请求
			if (this.count < CONFIG.maxQuery) {
				setTimeout(this._sendQueue, 0);
			}

			return id;
		},

		/**
		 * 发送请求队列
		 */
		_sendQueue: function() {
			var queue = ajax.queue;

			// 取出请求队列中的第一条
			for (var property in queue) {
				if (util.has(property, queue)) {
					// 跳过正在执行的
					if (queue[property]['xhr']) {
						continue;
					}
					// 执行请求
					ajax._execute(queue[property]);
					break;
				}
			}
		},

		/**
		 * 执行下一个请求
		 * @param  {Object} request [当前完成的请求对象]
		 */
		_next: function(request) {
			// 删除已成功的上一个记录
			var queue = this.queue;
			var id = request.id;
			delete queue[id];
			this.count--;

			// 继续发送请求队列
			this._sendQueue();
		},

		/**
		 * 执行一个请求
		 * @param  {Object} request [请求对象]
		 */
		_execute: function(request) {
			// 发起请求并保存对应关系
			request.xhr = jquery.ajax({
				// 请求
				'url'        : request.uri,
				'type'       : request.type,
				'data'       : request.param,
				// 配置
				'timeout'    : CONFIG.timeout,
				'dataType'   : CONFIG.dataType,
				'contentType': CONFIG.contentType,
				// 回调
				'success'    : this._requestSuccess,
				'error'      : this._requestError,
				'context'    : request
			});

			// 请求数计数
			this.count++;
		},

		/**
		 * 请求成功处理函数
		 * @param  {Object} data [服务器请求成功返回的数据]
		 */
		_requestSuccess: function(data) {
			// 处理下一个请求
			ajax._next(this);

			var callback = this.callback;
			var context = this.context || this;

			// 数据格式化
			var result = null, error = null;
			if (data && data.success) {
				try {
					// 进行多语言转换
					result = JSON.parse(util.TRANSLATE(JSON.stringify(data)));
				}
				catch (e) {
					util.error(e);
					result = data;
				}
			}
			else {
				error = util.extend({
					'code'   : 200,
					'success': false,
					'message': 'The server returns invalid'
				}, data);
			}

			callback.call(context, error, result);
		},

		/**
		 * 请求错误处理函数
		 * @param  {Object} xhr        [XMLRequest对象]
		 * @param  {String} textStatus [错误文本信息]
		 * @param  {Object} err        [错误对象]
		 */
		_requestError: function(xhr, textStatus, err) {
			// 处理下一个请求
			ajax._next(this);

			var callback = this.callback;
			var context = this.context;
			var error = {
				'status' : textStatus,
				'message': err,
				'code'   : xhr.status
			};

			callback.call(context, error, null);
		},

		/**
		 * GET请求
		 * @param  {String}   uri      [请求地址]
		 * @param  {Json}     param    [请求参数]
		 * @param  {Function} callback [请求回调]
		 * @param  {Object}   context  [执行环境]
		 * @return {Number}            [请求id]
		 */
		get: function(uri, param, callback, context) {
			// 不传param
			if (util.isFunc(param)) {
				context = callback;
				callback = param;
				param = null;
			}

			return this._build('GET', uri + (param ? util.parse(param) : ''), null, callback, context);
		},

		/**
		 * POST请求
		 * @param  {String}   uri      [请求地址]
		 * @param  {Json}     param    [请求参数]
		 * @param  {Function} callback [请求回调]
		 * @param  {Object}   context  [执行环境]
		 * @return {Number}            [请求id]
		 */
		post: function(uri, param, callback, context) {
			return this._build('POST', uri, param, callback, context);
		},

		/**
		 * 加载模板（静态文件）
		 * @param  {String}   uri      [模板地址]
		 * @param  {Json}     param    [请求参数]
		 * @param  {Function} callback [请求回调]
		 * @param  {Object}   context  [执行环境]
		 */
		load: function(uri, param, callback, context) {
			var error = null;
			// 不传param
			if (util.isFunc(param)) {
				callback = param;
				context = callback;
				param = null;
			}
			context = context;

			// 模板请求成功
			function _fnSuccess(text) {
				callback.call(context, false, text);
			}

			// 模板请求失败
			function _fnError(xhr, textStatus, err) {
				error = {
					'status' : textStatus,
					'message': err,
					'code'   : xhr.status
				};
				callback.call(context, error, null);
			}

			jquery.ajax({
				'url'     : uri + util.parse(param),
				'type'    : 'GET',
				'dataType': 'text',
				'success' : _fnSuccess,
				'error'   : _fnError
			});
		},

		/**
		 * jsonp请求
		 * @param  {String}   uri      [请求地址]
		 * @param  {Json}     param    [请求参数]
		 * @param  {Function} callback [请求回调]
		 * @param  {Object}   context  [执行环境]
		 */
		jsonp: function(uri, param, callback, context) {
			// @todo;
		},

		/**
		 * 终止一个请求或者所有请求
		 * @param  {Number} id [需要终止的请求id，不传则终止所有请求]
		 * @return {Number}    [返回成功终止的请求数目]
		 */
		abort: function(id) {
			var count = 0;
			var request = this.queue[id];

			// 终止指定id的请求
			if (request) {
				if (request.xhr && !request.isAbort) {
					request.isAbort = true;
					request.xhr.abort();
					this.count--;
				}
				return +(delete this.queue[id]);
			}
			// 终止所有请求
			else {
				util.each(this.queue, function(req, id) {
					req.isAbort = true;
					req.abort();
					count++;
				});
				return count;
			}
		}
	};

	return new Ajax();
});