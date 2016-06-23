require([
	'../../../../dist/mvvm'
], function(MVVM) {
	var layout, model, body = document.querySelector('body');


	layout =
	`
	<h2 v-bind:style="styleObj">vbind styleObject test ~</h2>
	<ul>
		<li v-for="item in items">
			<span v-bind:style="item.obj">{{ item.text }}</span>
		</li>
	</ul>
	<hr>

	<h2 v-bind:style="{'color': color, 'border': border}">vbind styleJson test ~</h2>
	<ul>
		<li v-for="item in options">
			<span v-bind:style="{'color': item.color, 'border': border}">{{ item.text }}</span>
		</li>
	</ul>
	<hr>
	`;

	model =  {
		// vbind styleObject
		'styleObj': {
			'border': '1px solid green'
		},
		'items': [
			{
				'text': 'aaa',
				'obj': {
					'color': '',
					'border': '1px solid red'
				}
			},
			{
				'text': 'bbb',
				'obj': {
					'border': '1px solid green'
				}
			},
			{
				'text': 'ccc',
				'obj': {
					'border': '1px solid blue'
				}
			}
		],

		// vbind styleJson
		'color': 'red',
		'border': '2px solid #ABCDEF',
		'options': [
			{
				'text': 'xxx',
				'color': 'red',
				'border': '1px solid red'
			},
			{
				'text': 'yyy',
				'color': 'green',
				'border': '1px solid green'
			},
			{
				'text': 'zzz',
				'color': 'blue',
				'border': '1px solid blue'
			}
		]
	}



	// start compile
	body.innerHTML = layout;
	var vm = new MVVM(body, model);
	// for global debug
	window.vm = vm.get();
});