require([
	'../../../src/mvvm/index'
], function(MVVM) {
	var layout, model, body = document.querySelector('body');


	layout =
	`
	<h2>{{ title }}</h2>
	<ul>
		<li v-for="item in items">
			<i>{{ item.$index }}</i>
			.
			<span>{{ item.text }}</span>
		</li>
	</ul>
	`;

	model =  {
		'title': 'mvvm test ~',
		'items': [
			{'text': 'aaa'},
			{'text': 'bbb'},
			{'text': 'ccc'},
			{'text': 'ddd'},
			{'text': 'eee'},
			{'text': 'fff'},
		]
	}



	// start compile
	body.innerHTML = layout;
	var vm = new MVVM(body, model);
	// for global debug
	window.vm = vm.get();
});