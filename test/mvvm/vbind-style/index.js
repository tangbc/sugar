require(['../../../src/mvvm/index'], function(VM) {
	var body = document.querySelector('body');

	body.innerHTML = [
		// single stylejson
		// '<div style="display:block;" v-bind:style="{color: outColor}">text</div>',
		// '<ul>',
		// 	'<li v-for="item in items">',
		// 		'<h3 v-bind:style="{color: outColor, border: item.border}">text</h3>',
		// 	'</li>',
		// '</ul>'

		// styleobj
		// '<h1 style="display:block;" v-bind:style="outStyleObj"></h1>',
		// // @todo: shift和unshift后无法在watcher的displaceCallback中正确的移位styleobj定义的样式
		// '<ul>',
		// 	'<li v-for="item in items">',
		// 		'<h3 style="display:block;" v-bind:style="outStyleObj">text</h3>',
		// 		// '<h3 style="display:block;" v-bind:style="item.obj">text</h3>',
		// 	'</li>',
		// '</ul>'

		// mutil property with styleobj
		'<h1 v-bind="{style: styleobj, id: pid}"></h1>',
		'<ul>',
			'<li v-for="item in items">',
				// '<h3 style="display:block;" v-bind="{style: item.styleobj, id: item.id}">text</h3>',
				'<h3 style="display:block;" v-bind="{style: styleobj, id: item.id}">text</h3>',
				'<p v-for="p in item.ps">',
					// '<b v-bind="{style: p.styleobj, id: p.id}"></b>',
					'<i v-bind="{style: styleobj, id: p.id}"></i>',
				'</p>',
			'</li>',
		'</ul>'

	].join('');

	var vm = new VM(body, {
		'outColor': 'tan', // plum
		'outStyleObj': {
			'color': 'tan',
			'border': '3px solid tan'
		},

		// single
		// 'clr': 'red',
		// 'items': [
		// 	{'color': 'red', 'border': '2px solid #DDD'},
		// 	{'color': 'green', 'border': '5px solid #CCC'},
		// 	{'color': 'blue', 'border': '10px solid #BBB'}
		// ]

		// styleobj
		// 'obj': {
		// 	'color': 'red',
		// 	'border': '1px solid #000',
		// 	'xxx': 'yyy'
		// }
		// 'items': [
		// 	{'obj': {
		// 		'color': 'red',
		// 		'border': '2px solid #777'
		// 	}},
		// 	{'obj': {
		// 		'color': 'green',
		// 		'border': '5px solid #aaa'
		// 	}},
		// 	{'obj': {
		// 		'color': 'blue',
		// 		'border': '10px solid #ccc'
		// 	}}
		// ]

		// mutil property with styleobj
		'styleobj': {
			'color': 'red',
			'paddingTop': '10px',
			'margin-left': '10px',
			'border': '1px solid #000',
		},
		'pid': '30',
		'items': [
			{'id': 12, 'styleobj': {
				'color': 'red',
				'border': '2px solid #000'
			}, 'ps': [{
				'id': 12222,
				'styleobj': {
					'color': 'gray',
					'border': '2px dashed #333'
				}
			}]},
			{'id': 24, 'styleobj': {
				'color': 'green',
				'border': '5px solid #000'
			}},
			{'id': 48, 'styleobj': {
				'color': 'blue',
				'border': '10px solid #000'
			}}
		]
	});

	window.vm = vm.get();
});