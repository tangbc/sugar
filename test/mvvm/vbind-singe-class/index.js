require([
	'../../../src/mvvm/index'
], function(MVVM) {
	var layout, model, body = document.querySelector('body');


	layout =
	`
	<h2>{{ title }}</h2>
	`;

	model =  {
		'title': 'mvvm test ~'
	}



	// start compile
	body.innerHTML = layout;
	var vm = new MVVM(body, model);
	// for global debug
	window.vm = vm.get();
});