/**
 * 简单的数据绑定mvvm库
 */
define(['./util'], function(util) {

	function VM(element, model, context) {
		var nType = element.nodeType;
		if (nType !== 1 && nType !== 9) {
			util.error('element must be a type of DOMElement: ', element);
			return false;
		}

		if (!util.isObject(model)) {
			util.error('model must be a type of Object: ', model);
			return false;
		}


		// 数据缓存
		this.$el = element;
		this.$model = model;
		this.$context = context;

		console.log(element.innerHTML);
	}
	VM.prototype = {
		constructor: VM,

		init: function() {}
	}

	return VM;
});