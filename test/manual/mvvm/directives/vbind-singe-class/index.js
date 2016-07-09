require([
	'../../../../../bundle/mvvm'
], function(imports) {
	var MVVM = imports.default;
	var layout, model, body = document.querySelector('body');


	layout =
	`
	<h2 v-bind:class="titleCls">normal</h2>
	<h2 v-bind:class="isError ? errCls : sucCls">expression</h2>
	<h2 v-bind:class="[errCls, sucCls]">classArray</h2>
	<h2 v-bind:class="classObject">classObject</h2>
	<hr/>

	<ul>
		<li v-for="item in items">
			<span v-bind:class="item.cls">vfor normal</span>
			<span v-bind:class="item.isError ? item.clsErr : item.clsSuc">vfor expression</span>
			<span v-bind:class="[item.clsErr, item.clsSuc]">vfor classArray</span>
			<span v-bind:class="item.obj">vfor classObject</span>
		</li>
	</ul>
	`;

	model =  {
		'titleCls': 'title',
		'isError': false,
		'errCls': 'err1',
		'sucCls': 'suc1',
		'classObject': {
			'clsa': true,
			'clsb': false,
			'clsc': true
		},

		'items': [
			{
				'cls': 'durant',
				'isError': true,
				'clsErr': 'errDurant',
				'clsSuc': 'sucDurant',
				'obj': {
					'a': true,
					'b': false
				}
			},
			{
				'cls': 'westbrook',
				'isError': true,
				'clsErr': 'errWest',
				'clsSuc': 'sucWest',
				'obj': {
					'c': true,
					'd': true
				}
			},
			{
				'cls': 'ibaka',
				'isError': false,
				'clsErr': 'errIbaka',
				'clsSuc': 'sucIbaka'
			},
		]
	}



	// start compile
	body.innerHTML = layout;
	var vm = new MVVM(body, model);
	// for global debug
	window.vm = vm.get();
});