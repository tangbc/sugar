require([
	'../../../../../bundle/mvvm'
], function(imports) {
	var MVVM = imports.default;
	var layout, model, body = document.querySelector('body');


	layout =
	`
	<h2>{{ title }}</h2>
	<input v-model="title" type="text">
	<hr>
	<ul>
		<li v-for="item in items">
			<input type="text" v-model="item.text">
			{{ item.text }}
			<br/>
			<span style="padding-left: 2em;" v-for="sub in item.subs">
				<input type="text" v-model="sub.text">
				{{ sub.text }}
				<br/>
			</span>
		</li>
	</ul>
	`;

	model =  {
		'title': 'v-model test ~',

		'items': [
			{'text': 'aaa', 'subs': [{'text': 'sub-a'},{'text': 'sub-aa'}]},
			{'text': 'bbb', 'subs': [{'text': 'sub-b'}]},
			{'text': 'ccc', 'subs': [{'text': 'sub-c'},{'text': 'sub-cc'}]},
			{'text': 'ddd', 'subs': [{'text': 'sub-d'},{'text': 'sub-dd'}]},
		]
	}



	// start compile
	body.innerHTML = layout;
	var vm = new MVVM(body, model);
	// for global debug
	window.vm = vm.get();
});