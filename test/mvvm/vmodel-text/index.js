require(['../../../src/mvvm/index'], function(VM) {
	var body = document.querySelector('body');

	body.innerHTML = [
		// '<h3>{{title}}</h3>',
		// '<input type="text" v-model="title">'

		// vfor test
		'<h3>{{title}}</h3>',
		'<ul>',
			'<li v-for="item in items">',
				'<span>{{item.title}}</span>',
				'<input type="text" v-model="item.title">',
				'<input type="text" v-model="title">',
			'</li>',
		'</ul>'
	].join('');

	var vm = new VM(body, {
		'title': '标题',

		'items': [
			{'title': 'aaa'},
			{'title': 'bbb'},
			{'title': 'ccc'}
		]
	});

	window.vm = vm.get();
});