require(['../../../dist/sugar'], function(sugar) {
	var $ = sugar.jquery;

	var MainPage = sugar.Container.extend({
		init: function(config) {
			config = sugar.cover(config, {
				'html': [
					// bind single event
					// '<div class="outside" v-on:click.self="vmClickOutside">',
					// 	'<p class="inside" v-on:click="vmClickInside">',
					// 		'<button v-on:click.stop="vmClickButton">按钮</button>',
					// 		'<input type="checkbox" v-on:click.stop.prevent="vmClickCheckbox">',
					// 	'</p>',
					// '</div>'

					// bind multi event
					// '<div class="outside" v-on="{click.self: vmClickOutside}">',
					// 	'<p class="inside" v-on="{click: vmClickInside}">',
					// 		'<button v-on="{click.stop: vmClickButton, mouseover: vmMouseoverButton(123, $event, 456)}">按钮</button>',
					// 		'<input type="checkbox" v-on="{click.prevent.stop: vmClickCheckbox}">',
					// 	'</p>',
					// '</div>'

					// von in vfor
					'<ul>',
						'<li v-for="item in items">',
							'<button v-on:click="vmClick($index, $event)">全局按钮_{{$index}}</button>',
							'<button v-on="{click: item.click($event, $index), mouseover: vmMouseoverButton($index)}">vfor按钮_{{$index}}</button>',
						'</li>',
					'</ul>'
				].join(''),
				'model': {
					// bind single event
					// 'vmClickOutside' : this.vmClickOutside,
					// 'vmClickInside'  : this.vmClickInside,
					// 'vmClickButton'  : this.vmClickButton,
					// 'vmClickCheckbox': this.vmClickCheckbox

					// bind multi event
					// 'vmClickOutside' : this.vmClickOutside,
					// 'vmClickInside'  : this.vmClickInside,
					// 'vmClickButton'  : this.vmClickButton,
					// 'vmClickCheckbox': this.vmClickCheckbox,
					// 'vmMouseoverButton': this.vmMouseoverButton

					// von in vfor
					'vmClick': function() {console.log(arguments)},
					'vmMouseoverButton': function(index) {console.log(index)},
					'items': [
						{'click': function() {console.log(arguments)}},
						{'click': function() {console.log(arguments)}},
						{'click': function() {console.log(arguments)}},
					]
				}
			});
			this.Super('init', arguments);
		},
		// bind single event
		// vmClickOutside: function(e) {
		// 	console.log('click outside');
		// },
		// vmClickInside: function(e) {
		// 	console.log('click inside');
		// },
		// vmClickButton: function(e) {
		// 	console.log('click button');
		// },
		// vmClickCheckbox: function(e) {
		// 	console.log('click checkbox');
		// },

		// bind multi event
		// vmClickOutside: function(e) {
		// 	console.log('click outside');
		// },
		// vmClickInside: function(e) {
		// 	console.log('click inside');
		// },
		// vmClickButton: function(e) {
		// 	console.log('click button');
		// },
		// vmClickCheckbox: function(e) {
		// 	console.log('click checkbox');
		// },
		// vmMouseoverButton: function() {
		// 	console.log('mouseover button', arguments);
		// },




		viewReady: function() {
			window.vm = this.vm.$data;
		}
	});

	sugar.core.create('mainPage', MainPage, {
		'target': $('body')
	});
});