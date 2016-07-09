require([
	'../../../../../bundle/mvvm'
], function(imports) {
	var MVVM = imports.default;
	var layout, model, body = document.querySelector('body');


	layout =
	`
	<h2 v-el="myEl">{{ title }}</h2>
	<h3 v-if="show">
		<span v-el="vspan">123</span>
	</h3>
	<ul>
		<li v-for="item in items">
			<span v-el="item.vforEl" v-text="item.text"></span>
			<i v-for="sub in item.subs" v-el="sub.subEl">{{ sub.text }}</i>
		</li>
	</ul>
	`;

	model =  {
		'show' : false,
		'title': 'v-el is used for registering DOM el to Model',
		'items': [
			{
				'text': 'aaa',
				'subs': [
					{'text': 1},
					{'text': 2}
				]
			},
			{
				'text': 'bbb'
			},
			{
				'text': 'ccc',
				'subs': [
					{'text': 3}
				]
			}
		]
	}

	// start compile
	body.innerHTML = layout;
	var mvvm = new MVVM(body, model);
	var vm = mvvm.get();
	// for global debug
	window.vm = vm;


	console.log('myEl', vm.$els);

	console.log('---------------------------------------------------');

	vm.items.forEach(function(item, index) {
		console.log('vforEl register for items*' + index, item.vforEl);

		if (item.subs) {
			item.subs.forEach(function(sub, idx) {
				console.log('    subEl register for items*' + index + '*' + idx, sub.subEl);
			});
		}
	});

});