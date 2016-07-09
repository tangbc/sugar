require([
	'../../../../../bundle/mvvm'
], function(imports) {
	var MVVM = imports.default;
	var layout, model, body = document.querySelector('body');


	layout =
	`
	<h2>{{{ html }}}</h2>
	<h2>xx {{{ html }}} xx</h2>
	<ul>
		<li v-for="item in items">
		{{{ item.html }}}
		</li>
	</ul>
	`;

	model =  {
		'html': '<b>mvvm test ~</b>',

		'items': [
			{'html': '<i>aaa</i>'},
			{'html': '<b>bbb</b>'},
			{'html': '<span>ccc</span>'}
		]
	}



	// start compile
	body.innerHTML = layout;
	var vm = new MVVM(body, model);
	// for global debug
	window.vm = vm.get();
});