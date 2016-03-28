require(['../../../src/mvvm/index'], function(VM) {
	var body = document.querySelector('body');

	body.innerHTML = [
		// bind single event
		'<div class="outside" v-on:click.self="vmClickOutside">',
			'<p class="inside" v-on:click="vmClickInside">',
				'<button v-on:click.stop="vmClickButton">按钮</button>',
				'<input type="checkbox" v-on:click.stop.prevent="vmClickCheckbox">',
			'</p>',
		'</div>'

		// bind multi event
		// '<div class="outside" v-on="{click.self: vmClickOutside}">',
		// 	'<p class="inside" v-on="{click: vmClickInside}">',
		// 		'<button v-on="{click.stop: vmClickButton, mouseover: vmMouseoverButton(123, $event, 456)}">按钮</button>',
		// 		'<input type="checkbox" v-on="{click.prevent.stop: vmClickCheckbox}">',
		// 	'</p>',
		// '</div>'

		// von in vfor
		// '<ul>',
		// 	'<li v-for="item in items">',
		// 		'<button v-on:click="vmClick($index, $event)">全局按钮_{{$index}}</button>',
		// 		'<button v-on="{click: item.click($event, $index), mouseover: vmMouseoverButton($index)}">vfor按钮_{{$index}}</button>',
		// 	'</li>',
		// '</ul>'
	].join('');

	var evtMap = {
		// bind single event
		vmClickOutside: function(e) {
			console.log('click outside');
		},
		vmClickInside: function(e) {
			console.log('click inside');
		},
		vmClickButton: function(e) {
			console.log('click button');
		},
		vmClickCheckbox: function(e) {
			console.log('click checkbox');
		},

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
	}

	var vm = new VM(body, {
		// bind single event
		'vmClickOutside' : evtMap.vmClickOutside,
		'vmClickInside'  : evtMap.vmClickInside,
		'vmClickButton'  : evtMap.vmClickButton,
		'vmClickCheckbox': evtMap.vmClickCheckbox

		// bind multi event
		// 'vmClickOutside' : evtMap.vmClickOutside,
		// 'vmClickInside'  : evtMap.vmClickInside,
		// 'vmClickButton'  : evtMap.vmClickButton,
		// 'vmClickCheckbox': evtMap.vmClickCheckbox,
		// 'vmMouseoverButton': evtMap.vmMouseoverButton

		// von in vfor
		// 'vmClick': function() {console.log(arguments)},
		// 'vmMouseoverButton': function(index) {console.log(index)},
		// 'items': [
		// 	{'click': function() {console.log(arguments)}},
		// 	{'click': function() {console.log(arguments)}},
		// 	{'click': function() {console.log(arguments)}},
		// ]
	});
});