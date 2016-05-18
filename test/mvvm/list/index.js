require([
	'../../../../dist/mvvm.min',
	'../../mock.min',
	'../../vue.min'
], function(MVVM, Mock, Vue) {

	var layout, model;
	var Random = Mock.Random;
	var body = document.querySelector('body');


	layout =
	`
	<h2>items count: {{ items.length }}</h2>
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

	model =  {
		'items': items
	}


	// // Vue.js 测试
	// body.innerHTML = layout;
	// console.time('compileVue');
	// new Vue({
	// 	'el': body,
	// 	'data': {
	// 		'items': items
	// 	}
	// });
	// console.timeEnd('compileVue');



	// start compile
	body.innerHTML = layout;
	console.time('compile');
	var vm = new MVVM(body, model);
	console.timeEnd('compile');
});