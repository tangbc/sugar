/**
 * radio组件
 */

define(['radio'], function() {
	var sugar = require('../../sugar');
	var util = sugar.util;

	/**
	 * 基础的radio组件，只支持设置静态数据选项options
	 */
	var RadioBase = sugar.Container.extend({
		init: function(config) {
			config = sugar.cover(config, {
				'tag'     : 'ul',
				'class'   : 'radio-component',
				// 选项静态数据
				'options' : [],
				// 默认选中的值
				'picked'  : '',
				// radio的name属性
				'name'    : 'radio',
				// 选项数据文字
				'text'    : 'text',
				// 选项数据字段
				'value'   : 'value',
				'template': 'radio-component.html',
				// 数据模型的配置尽量避免在创建子模块时定义，最好是根据一级参数来确定
				'vModel'  : {
					// 默认选中的值
					'picked': config.picked,
					// radio的name属性
					'name'  : config.name || 'radio',
					// 选项数组
					'radios': []
				}
			});
			this.Super('init', arguments);
		},

		viewReady: function() {
			var options = this.getConfig('options');

			// 直接调用构建方法
			this.buildRadioItems(options);
		},

		/**
		 * 创建radio选项
		 * @param   {Array}  items  [选项对象数组]
		 */
		buildRadioItems: function(items) {
			// 直接创建选项
			var c = this.getConfig();
			var radios = [];

			// 生成符合格式的数据
			util.each(items, function(item) {
				radios.push({
					'text' : item[c.text],
					'value': item[c.value]
				});
			});

			// 设置VM数据
			this.vm.set('radios', radios);
		},

		/**
		 * 获取所选的值
		 */
		getData: function() {
			var c = this.getConfig();

			// 获取当前所选的字段
			var picked = this.vm.get('picked');

			// 找出并返回当前picked的选项数据
			return util.find(c.options, picked, c.value);
		}
	});


	/**
	 * 通过继承基础的RadioBase，RadioSenior可以在原有功能的基础上增加其他功能：
	 * 1、支持动态拉取选项数据load的功能
	 * 2、支持选中状态设置setValue的功能
	 */
	var RadioSenior = RadioBase.extend({
		init: function(config) {
			config = sugar.cover(config, {
				// 数据拉取地址
				'url'     : 'xxxxxxx',
				// 模块创建完成后是否立即拉取数据
				'autoLoad': true
			});

			// 这里会依次调用父类的init方法：RadioBase.init -> Container.init
			this.Super('init', arguments);
		},

		/**
		 * 重新定义RadioSenior的viewReady方法
		 */
		viewReady: function() {
			var c = this.getConfig();

			// 读取配置参数的数据拉取地址
			if (c.url && c.autoLoad) {
				this.loadData();
			}
			// 如果没有设置地址而是设置了静态数据options，直接调用buildRadioItems进行同步创建数据
			// 由于RadioSenior是通过RadioBase继承而来，所以也有buildRadioItems方法（通过原型链）
			else {
				this.buildRadioItems(c.options);
			}
		},

		/**
		 * 加载服务器数据
		 */
		loadData: function() {
			var url = this.getConfig('url');

			// 用sugar的ajax拉取数据
			sugar.ajax.get(url, null, function(err, data) {
				if (err) {
					alert('数据拉取失败：' + err.message);
					util.error(err);
					return false;
				}

				// 得到返回数据后创建数据
				this.buildRadioItems(data.items);
			}, this);
		},

		/**
		 * 设置选中的数据
		 */
		setValue: function(picked) {
			// 设置vm数据
			this.vm.set('picked', picked);

			// 支持链式调用
			return this;
		},

		// 重置模块为初始状态
		reset: function() {
			this.vm.reset();
			return this;
		}
	});


	// 模块导出
	return {
		'base'  : RadioBase,
		'senior': RadioSenior
	}
});