require([
	'../../../../dist/mvvm'
], function(MVVM) {
	var layout, model, body = document.querySelector('body');


	layout =
	`
	<h2>{{ title }}</h2>
	<textarea v-model="title"></textarea>
	<textarea v-model="title"></textarea>
	<textarea v-model="title"></textarea>
	`;

	model =  {
		'title': 'vmodel test ~'
	}



	// start compile
	body.innerHTML = layout;
	var vm = new MVVM(body, model);
	// for global debug
	window.vm = vm.get();
});