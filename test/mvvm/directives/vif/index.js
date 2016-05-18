require([
	'../../../../src/mvvm/index'
], function(MVVM) {
	var layout, model, body = document.querySelector('body');


	layout =
	`
	<h2 v-if="showTitle">{{ title }}</h2>
	<h3 v-if="items.length > 0">List here:</h3>
	<h3 v-else>List is empty!</h3>
	<ul>
		<li v-for="item in items">
			<b>{{ item.text }}</b>
		</li>
	</ul>
	`;

	model =  {
		'title': 'vif test ~',
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