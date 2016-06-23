require([
	'../../../../dist/mvvm'
], function(MVVM) {
	var layout, model, body = document.querySelector('body');


	layout =
	`
	<h3 v-bind:id="bid">single attr</h3>
	<h3 v-bind:data-id="did">single attr with -</h3>
	<ul>
		<li v-for="item in items">
			<i v-bind:data-id="item.bid"></i>
			<b v-bind:data-index="bid + '_' + $index">top scope</b>
			<span v-bind:id="isTop ? bid : item.bid">vfor scope</span>
		</li>
	</ul>
	<hr/>

	<h3 v-bind="{'id': bid, 'data-id': did}">multi attrs</h3>
	<h3 v-bind="{'id': isTop ? 'top' : 'noTop', 'data-id': did}">multi attrs with expression</h3>
	<h3 v-bind="{'id': isTop ? bid : did}">multi attrs with expression</h3>
	<hr/>

	<h3>multi attrs in vfor</h3>
	<ul>
		<li v-for="item in options">
			<h3 v-bind="{'id': $index, 'name': item.bname, 'data-id': item.vdid}">single expression</h3>
			<h3 v-bind="{'id': $index > 1 ? ($index + '-') : ('-' + $index)}">multi expression</h3>
		</li>
	</ul>
	`;

	model =  {
		'bid': 'xxdx',
		'did': 'sf',
		'isTop': true,
		'items': [
			{'bid': 'aaa'},
			{'bid': 'bbb'},
			{'bid': 'ccc'},
		],

		'vbid': 'xxx',
		'bname': 'yyy',
		'vdid': 'zzz',
		'options': [
			{'vdid': 'a1', 'bname': 'a2', 'vdid': 'a3'},
			{'vdid': 'b1', 'bname': 'b2', 'vdid': 'b3'},
			{'vdid': 'c1', 'bname': 'c2', 'vdid': 'c3'}
		]
	}



	// start compile
	body.innerHTML = layout;
	var vm = new MVVM(body, model);
	// for global debug
	window.vm = vm.get();
});