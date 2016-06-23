require(['../../../../dist/mvvm'], function(MVVM) {
	var layout, model, body = document.querySelector('body');

	layout =
	`
	<h2 v-pre>{{ title }}</h2>
	<div v-pre>
		<p>{{ title }}</p>
		<p>{{ title }}</p>
		<p>{{ title }}</p>
		<p>{{ title }}</p>
		<p>{{ title }}</p>
		<p>{{ title }}</p>
		<p>{{ title }}</p>
		<p>{{ title }}</p>
		<p>{{ title }}</p>
		<p>{{ title }}</p>
		<ul>
			<li v-for="item in items">{{ item }}</li>
		</ul>
	</div>
	`;

	var items = [];
	for (var i = 0; i < 1000; i++) {
		items.push(i);
	}
	model =  {
		'title': 'mvvm test ~',
		'items': items
	}



	// start compile
	body.innerHTML = layout;
	console.time('compile');
	var vm = new MVVM(body, model);
	console.timeEnd('compile');
	// for global debug
	window.vm = vm.get();
});