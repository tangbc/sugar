require([
	'../../../src/mvvm/index'
], function(MVVM) {
	var layout, model, body = document.querySelector('body');


	layout =
	`
	<h2 v-bind:class="titleCls">Normal test</h2>
	<h2 v-bind:class="isError ? errCls : sucCls">Expression test</h2>
	`;

	model =  {
		'titleCls': 'title',

		'isError': false,
		'errCls': 'err1',
		'sucCls': 'suc1'
	}



	// start compile
	body.innerHTML = layout;
	var vm = new MVVM(body, model);
	// for global debug
	window.vm = vm.get();
});