/**
 * [多语言处理模块]
 * 多语言cookie名称为lang, 有三种值：zhCN、zhHK、enUS
 */
define(function(require, exports, module) {
	var WIN = window;
	var app = require('../core/app');
	var util = app.util;
	var cookie = require('../base/cookie');

	function Language() {
		var self = this;
		var defaultLang = 'zhCN';
		// 默认语言
		this.defaultLang = defaultLang;
		// 正在加载的语言
		this.loadLang = '';
		// 当前的语言
		if (cookie.get('lang')) {
			this.currentLang = cookie.get('lang');
		}
		else {
			cookie.set('lang', defaultLang);
			this.currentLang = defaultLang;
		}
		// 语言翻译对象(语言包)
		this.translate = null;
		// 语言转换模块路径
		this.translatePath = '_translate_module_path_';
		// 语言转换模块方法
		this.translateFunc = '_translate_module_func_';
		// 加载语言包后的回调函数
		this.callback = null;

		// 语言标记函数
		WIN.T = function(text) {
			if (!self.isDefault()) {
				// 方法转换
				if (self.translate && self.translate.func) {
					text = self.translate.func.call(self, text);
				}
				// 语言包装换
				else if (self.translate && self.translate.hasOwnProperty(text)) {
					text = self.translate[text];
				}
			}
			if (arguments.length > 1) {
				text = util.templateReplace.apply(self, arguments);
			}
			return text;
		}

		/**
		 * load 加载语言包
		 * @param  {String}  lang  [需要加载的语言类型]
		 */
		this.load = function(lang) {
			if (util.isFunc(lang)) {
				this.callback = lang;
				lang = this.currentLang;
			}
			if (lang === this.defaultLang) {
				this.translate = null;
				this.callback(null);
				return false;
			}
			this.loadLang = lang;
			if (!this.isDefault()) {
				app.ajax.get('lang/' + lang + '/translate.json', null, this.afterLoad, this);
			}
		};

		// 语言包加载回调
		this.afterLoad = function(err, data) {
			if (err) {
				util.error(err);
				return false;
			}
			var self = this;
			var result = self.translate = data.result;
			// 执行回调
			if (util.isFunc(this.callback)) {
				this.callback();
			}
			// 加载失败
			if (!result) {
				util.error(T('语言包{1}加载失败！', this.loadLang));
				this.currentLang = this.defaultLang;
				cookie.set('lang', this.defaultLang);
				return false;
			}
			var transPath = result[self.translatePath];
			var transFunc = result[self.translateFunc];

			self.currentLang = self.loadLang;
			// 缓存转换方法
			if (transPath && transFunc) {
				require.async(transPath, function(module) {
					var func =  module[transFunc];
					if (func && util.isFunc(func)) {
						self.translate.func = func;
					}
				});
			}
		};

		// 是否是默认语言
		this.isDefault = function() {
			return this.currentLang === this.defaultLang;
		};
	}

	module.exports = new Language();
});