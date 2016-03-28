require(['../../../src/mvvm/index'], function(VM) {
	var body = document.querySelector('body');

	body.innerHTML = [
		// '<input type="radio" value="nan" v-model="sex">男',
		// '<input type="radio" value="nv" v-model="sex">女'

		// vfor test
		'<ul>',
			'<li v-for="item in items">',
				'<input type="radio" v-bind:value="item.value" v-model="mvp"> {{item.player}}',
			'</li>',
		'</ul>',
		'<p>selectd: {{mvp}}</p>'
	].join('');

	var vm = new VM(body, {
		'sex': 'nan',

		// vfor test
		'mvp': 'Curry',
		'items': [
			{'value': 'Curry', 'player': '斯蒂芬库里'},
			{'value': 'West', 'player': '拉塞尔维斯布鲁克'},
			{'value': 'Durant', 'player': '凯文杜兰特'},
		]
	});

	window.vm = vm.get();
});