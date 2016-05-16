require([
	'../../../src/mvvm/index'
], function(MVVM) {
	var layout, model, body = document.querySelector('body');


	layout =
	`
	<h2 v-bind:style="styleObj">vbind-style test ~</h2>
	<ul>
		<li v-for="item in items">
			<span v-bind:style="item.obj">{{ item.text }}</span>
		</li>
	</ul>
	`;

	model =  {
		'styleObj': {
			'border': '1px solid green'
		},
		'items': [
			{
				'text': 'aaa',
				'obj': {
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
		]
	}



	// start compile
	body.innerHTML = layout;
	var vm = new MVVM(body, model);
	// for global debug
	window.vm = vm.get();
});