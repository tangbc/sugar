require([
	'../../../../../bundle/mvvm'
], function(imports) {
	var MVVM = imports.default;
	var layout, model, body = document.querySelector('body');


	layout =
	`
	<h2 v-show="showTitle">{{ title }}</h2>
	<h3 v-show="items.length > 0">List here:</h3>
	<h3 v-else>List is empty!</h3>
	<ul>
		<li v-for="item in items">
			<span v-show="item.showIndex">{{ $index }}</span>
			<b>{{ item.text }}</b>
		</li>
	</ul>
	`;

	model =  {
		'title': 'vshow test ~',
		'showTitle': true,

		'items': [
			{'showIndex': true, 'text': 'aaa'},
			{'showIndex': true, 'text': 'bbb'},
			{'showIndex': true, 'text': 'ccc'},
		]
	}



	// start compile
	body.innerHTML = layout;
	var vm = new MVVM(body, model);
	// for global debug
	window.vm = vm.get();
});