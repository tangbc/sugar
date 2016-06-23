require([
	'../../../../dist/mvvm'
], function(MVVM) {
	var layout, model, body = document.querySelector('body');


	layout =
	`
	<ul>
		<li v-for="item in items">
			<i>{{ $index }}</i>
			<span>{{ item.text }}</span>
		</li>
	</ul>
	<hr/>
	<ul>
		<li v-for="item in lists">
			<i>{{ $index }}</i>
			<span>{{ item.text }}</span>
		</li>
	</ul>
	`;

	model =  {
		'items': [
			{'text': 'aaa'},
			{'text': 'bbb'},
			{'text': 'ccc'},
			{'text': 'ddd'},
		],

		'lists': [
			{'text': 'AAA'},
			{'text': 'BBB'},
			{'text': 'CCC'},
			{'text': 'DDD'},
		]
	}



	// start compile
	body.innerHTML = layout;
	var vm = new MVVM(body, model);

	// deep watch
	vm.watch('items', function() {
		console.log(arguments);
	}, true);

	// shallow watch
	vm.watch('lists', function() {
		console.log(arguments);
	});

	// for global debug
	window.vm = vm.get();
});