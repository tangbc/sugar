require(['../../../src/mvvm/index'], function(VM) {
	var body = document.querySelector('body');

	body.innerHTML =
	`<ul>
		<li v-for="item in items">
			<i>{{ $index }}</i>
			<span>{{ item.text }}</span>
		</li>
	</ul>`

	var vm = new VM(body, {
		'items': [
			{'text': 'a'},
			{'text': 'b'},
			{'text': 'c'},
			{'text': 'd'},
			{'text': 'e'}
		]
	});

	window.vm = vm.get();
});