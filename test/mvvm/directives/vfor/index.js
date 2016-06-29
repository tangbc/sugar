require([
	'../../../../dist/mvvm'
], function(MVVM) {
	var layout, model, body = document.querySelector('body');


	layout =
	'<ul id="test7">' +
		'<li v-for="item in items">' +
			'<b>{{ item.text }}-</b>' +
			'<span v-for="sub in item.subs">' +
				'{{ item.text + \'_\' + sub.text }}' +
			'</span>' +
		'</li>' +
	'</ul>'

	model =  {
		'items': [
			{'text': 'A', 'subs': [{'text': 'a'}]},
			{'text': 'B', 'subs': [{'text': 'b'}]}
		]
	}



	// start compile
	body.innerHTML = layout;
	var vm = new MVVM(body, model);

	// for global debug
	window.vm = vm.get();
});