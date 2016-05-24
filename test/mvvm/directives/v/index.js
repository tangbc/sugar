require([
	'../../../../src/mvvm/index',
	'../../../../src/util'
], function(MVVM, util) {
	var layout, model, body = document.querySelector('body');


	layout =
	`
	<h2>{{ title }}</h2>
	<input type="password" v-model="pass">
	<input type="button" value="submit" v-on:click="click">
	`;

	model =  {
		'title': 'mvvm test ~',
		'pass' : '',
		'click': function () {
			console.log(this);
		}
	}



	// start compile
	body.innerHTML = layout;
	var vm = new MVVM(body, model);
	// for global debug
	window.vm = vm.get();
});