require(['../../../src/mvvm/index'], function(VM) {
	var body = document.querySelector('body');

	body.innerHTML =
	`
	sss
	ddd
	<h4 v-text="msg"></h4>
	<ul>
		<li v-for="item in items">
			<i v-text="item.text"></i>
			<b v-for="p in item.ps">
				| {{p.text === item.text ? 'same' : 'diffrent'}}
			</b>
		</li>
	</ul>
	`;

	var vm = new VM(body, {
		'msg': 'xxx',
		'items': [
			{'text': 1, 'ps': [{'text': 1},{'text': 0}]},
			{'text': 2, 'ps': [{'text': 2},{'text': 0}]},
			{'text': 3, 'ps': [{'text': 3},{'text': 0}]}
		]
	});

	window.vm = vm.get();
});