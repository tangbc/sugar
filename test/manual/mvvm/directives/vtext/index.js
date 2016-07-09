require([
	'../../../../../bundle/mvvm'
], function(imports) {
	var MVVM = imports.default;
	var layout, model, body = document.querySelector('body');


	layout =
	`
	<h2 v-text="title"></h2>
	<h3 v-text="isError ? errMsg : sucMsg"></h3>
	<ul>
		<li v-for="item in items">
			<b v-text="$index + ' - ' + item.title"></b>
			<br/>
			<span v-text="isError ? item.err : item.suc"></span>
		</li>
	</ul>
	`;

	model =  {
		'title': 'v-text test ~',

		'isError': false,
		'sucMsg': 'You are success ~',
		'errMsg': 'There is something wrong !',

		'items': [
			{'err': 'error apple', 'suc': 'suc apple', 'title': 'apple'},
			{'err': 'error meizu', 'suc': 'suc meizu', 'title': 'meizu'},
			{'err': 'error xiaomi', 'suc': 'suc xiaomi', 'title': 'xiaomi'}
		]
	}



	// start compile
	body.innerHTML = layout;
	var mvvm = new MVVM(body, model);
	var vm = mvvm.get();
	// for global debug
	window.vm = vm
});