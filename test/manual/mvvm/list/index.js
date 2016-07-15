require([
	'../../../../bundle/mvvm',
	'../../assets/mock.min',
	'../../assets/vue.min'
], function (MVVM, Mock, Vue) {

	MVVM = MVVM.default || MVVM;

	var Random = Mock.Random;
	var layout, model, before, after;
	var body = document.querySelector('body');


	layout =
	`
	<h2>items count: {{ items.length }}</h2>
	<h2>test library: {{ library }}</h2>
	<h2>completed time: {{ time }}ms</h2>
	<ul>
		<li v-for="item in items" v-bind="{
			'title'  : 'ID: ' + item.id,
			'data-id': item.id,
			'class'  : $index % 2 === 0 ? 'even' : 'odd'
		}">
			<b v-text="$index + 1"></b>
			<strong v-text="item.name"></strong>
			<br/>
			{{ item.id + ': ' + item.email }}
		</li>
	</ul>
	`;

	var items = [];
	for (var i = 0; i < 1000; i++) {
		items.push({
			'id'   : Random.natural(10000, 90000),
			'name' : Random.ctitle(3, 8),
			'email': Random.email()
		});
	}

	// ==========================================


	// // Vue.js 测试
	// body.innerHTML = layout;
	// before = Date.now();
	// var vue = new Vue({
	// 	'el': body,
	// 	'data': {
	// 		'time': 0,
	// 		'library': 'Vue',
	// 		'items': items
	// 	}
	// });
	// after = Date.now();
	// vue.$data.time = after - before;


	// ==========================================

	// start compile
	body.innerHTML = layout;
	before = Date.now();
	var vm = new MVVM(body, {
		'time': 0,
		'library': 'Sugar',
		'items': items
	});
	after = Date.now();
	vm.set('time', after - before);
});