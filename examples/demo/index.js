require(['../../dist/sugar'], function(sugar) {
	var $ = sugar.jquery;

	var MainPage = sugar.Container.extend({
		init: function(config) {
			config = sugar.cover(config, {
				'html': [
					'<h1 v-bind:style="{width: w, height: h, background: bg}">styleString</h1>',
					'<h1 v-bind:style="styleObject">styleObject</h1>',
					'<h1 v-bind:class="classObject">classObject</h1>'
				].join(''),
				'model': {
					'w': 200 + 'px',
					'h': 50 + 'px',
					'bg': 'red',
					'styleObject': {
						'width': 200 + 'px',
						'height': 60 + 'px',
						'background': 'green'
					},
					'classObject': {
						'cls_1': true,
						'cls_2': false
					},
				}
			});
			this.Super('init', arguments);
		},
		viewReady: function() {
			var vm = this.vm.$data;

			this.setTimeout(function() {
				vm.styleObject.width = 60 + 'px';
				vm.styleObject.height = 200 + 'px';

				vm.bg = 'gray'

				vm.classObject.cls_1 = false
				vm.classObject.cls_2 = true
			}, 5000);
		}
	});

	sugar.core.create('mainPage', MainPage, {
		'target': $('body')
	});
});