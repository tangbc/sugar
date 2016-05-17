require([
	'../../../src/mvvm/index'
], function(MVVM) {
	var layout, model, body = document.querySelector('body');


	layout =
	`
	<h2 v-on:click="vmClick1">v-on test without param ~</h2>
	<h2 v-on:click="vmClick2(123, title, $event)">v-on test with params ~</h2>
	`;

	model =  {
		'title': 'aaa',
		'vmClick1': function() {
			console.log(arguments);
		},
		'vmClick2': function() {
			console.log(arguments);
		}
	}



	// start compile
	body.innerHTML = layout;
	var vm = new MVVM(body, model);
	// for global debug
	window.vm = vm.get();
});