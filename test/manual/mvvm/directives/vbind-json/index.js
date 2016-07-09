require([
	'../../../../../bundle/mvvm'
], function(imports) {
	var MVVM = imports.default;
	var layout, model, body = document.querySelector('body');


	layout =
	`
	<h2 v-bind="{'data-type': 'mvvm', 'id': bid, 'class': clsobj, 'style': styobj}">v-bind json test 1</h2>
	<h2 v-bind="{'id': bid, 'class': [clsa, clsb], 'style': styobj}">v-bind json test 2</h2>
	<hr/>

	<ul>
		<li v-for="item in items">
			<span v-bind="{'id': item.id, 'class': item.clsobj, 'style': item.styobj}"></span>
			<span v-bind="{'id': item.id, 'class': [item.cls, clsa], 'style': item.styobj}"></span>
		</li>
	</ul>
	`;

	model =  {
		'bid': 'xxdk',
		'clsobj': {
			'aa': true,
			'bb': true
		},
		'styobj': {
			'color': 'red',
			'border': '2px solid green'
		},
		'clsa': 'classA',
		'clsb': 'classB',


		'items': [
			{
				'id': 'xxx',
				'cls': 'clsx',
				'clsobj': {
					'aa': true,
					'bb': true
				},
				'styobj': {
					'color': 'red',
					'border': '2px solid red'
				}
			},
			{
				'id': 'yyy',
				'cls': 'clsy',
				'clsobj': {
					'cc': true,
					'dd': true
				},
				'styobj': {
					'color': 'green',
					'border': '3px solid green'
				}
			},
			{
				'id': 'zz',
				'cls': 'clsz',
				'clsobj': {
					'ee': true,
					'ff': true
				},
				'styobj': {
					'color': 'blue',
					'border': '4px solid blue'
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