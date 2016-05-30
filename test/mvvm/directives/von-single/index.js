require([
	'../../../../src/mvvm/index'
], function(MVVM) {
	var layout, model, body = document.querySelector('body');


	layout =
	`
	<input type="text" v-on:keyup.13="vmKeyEvent(1,2,3)">
	<h2 v-on:click="vmClick1">v-on test without param ~</h2>
	<h2 v-on:click="vmClick2(123, title, $event)">v-on test with params ~</h2>
	<hr/>
	<ul>
		<li v-for="item in items">
			<b v-on:click="remove(item, $index, $event)">×</b>
			<span>{{ $index + '.' + item.text }}</span>
		</li>
	</ul>
	`;

	model =  {
		'title': 'aaa',
		'vmClick1': function() {
			console.log(arguments);
		},
		'vmClick2': function() {
			console.log(arguments);
		},
		'vmKeyEvent': function() {
			console.log(arguments);
		},

		'items': [
			{'text': 'aaa'},
			{'text': 'bbb'},
			{'text': 'ccc'},
		],
		'remove': function(item, index, ev) {
			var vm = this.vm.$data;
			vm.items.$remove(item);
		}
	}



	// start compile
	body.innerHTML = layout;
	var vm = new MVVM(body, model);
	// for global debug
	window.vm = vm.get();
});