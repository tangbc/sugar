require([
	'../../../../../bundle/mvvm'
], function (imports) {
	var MVVM = imports.default;
	var layout, model, body = document.querySelector('body');


	layout =
	`
	<h2 v-el="myEl">{{ title }}</h2>
	<h3 v-if="show">
		<span v-el="vspan">123</span>
	</h3>
	`;

	model =  {
		'show' : false,
		'title': 'v-el is used for registering DOM el to Model'
	}

	// start compile
	body.innerHTML = layout;
	var mvvm = new MVVM({
		'view': body,
		'model': model
	});
	var vm = mvvm.get();
	// for global debug
	window.vm = vm;


	console.log('myEl', vm.$els);

	console.log('---------------------------------------------------');

});