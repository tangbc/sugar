/**
 * 简单的数据绑定mvvm库
 */
define([
	'./util',
	'./mvvm-observe'
], function(util, observe) {

	/**
	 * 文档碎片缓存构造函数
	 */
	function FragmentCache() {
		/**
		 * 碎片缓存队列，id和fragment的映射
		 * @type  {Object}
		 */
		this.$cache = {'id': 100, 'length': 0};
	}
	FragmentCache.prototype = {
		constructor: FragmentCache,

		/**
		 * 获取指定id文档碎片
		 * @param   {Number}   id  [碎片id]
		 * @return  {Fragment}
		 */
		get: function(id) {
			return this.$cache[id];
		},

		/**
		 * 添加一条碎片缓存
		 * @param  {Fragment}  fragment  [文档碎片]
		 * @return {Number}    id        [碎片缓存id]
		 */
		add: function(fragment) {
			var cache = this.$cache;
			var id = cache.id++;
			cache[id] = fragment;
			cache.length++;
			return id;
		},

		/**
		 * 删除指定id的碎片
		 * @param   {Number}  id  [碎片id]
		 * @return  {Boolean}
		 */
		del: function(id) {
			return delete this.$cache[id];
		}
	}
	var fragmentCache = new FragmentCache();


	/**
	 * MVVM构造器
	 * @param  {DOMElement}  element  [视图的挂载原生DOM]
	 * @param  {Object}      model    [数据模型]
	 * @param  {Object}      config   [MVVM配置]
	 */
	function MVVM(element, model, config) {
		var nType = element.nodeType;
		if (nType !== 1 && nType !== 9) {
			util.error('element must be a type of DOMElement: ', element);
			return false;
		}

		if (!util.isObject(model)) {
			util.error('model must be a type of Object: ', model);
			return false;
		}

		if (config && !util.isObject(config)) {
			util.error('config must be a type of Object: ', config);
			return false;
		}


		// 参数缓存
		this.$element = element;
		this.$model = model;
		this.$config = config;

		// 是否已经渲染过
		this.$rendered = false;
		// 碎片缓存id
		this.$cacheId = 0;
		// 初始碎片
		this.$initFrag = null;
		// 初始模板字符串
		this.$initTemplate = element.innerHTML;

		this.init();
	}
	MVVM.prototype = {
		constructor: MVVM,

		/**
		 * MVVM初始化方法
		 */
		init: function() {
			if (this.$rendered) {
				return;
			}

			// 初始化碎片
			this.$initFrag = this.nodeToFragment(this.$element);
			this.$cacheId = fragmentCache.add(this.$initFrag);

			// 解析文档碎片
			this.parseFragment();
		},

		/**
		 * DOMElement转换成文档片段
		 * @param   {DOMElement}  element  [DOM节点]
		 */
		nodeToFragment: function(element) {
			var frag = util.DOC.createDocumentFragment();
			var cloneNode = element.cloneNode(true);
			var nodes = cloneNode.childNodes;

			var childNode;
			while (childNode = cloneNode.firstChild) {
				frag.appendChild(childNode);
			}

			return frag;
		},

		/**
		 * 解析文档碎片
		 */
		parseFragment: function() {
			var frag = this.$initFrag;
			console.log();
		}
	}

	return MVVM;
});