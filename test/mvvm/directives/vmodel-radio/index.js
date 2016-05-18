require([
	'../../../../src/mvvm/index'
], function(MVVM) {
	var layout, model, body = document.querySelector('body');


	layout =
	`
	<h2>You sex: {{ sex }}</h2>
	<label>
		<input type="radio" value="boy" v-model="sex"> Boy
	</label>
	<label>
		<input type="radio" value="girl" v-model="sex"> Girf
	</label>
	<hr>

	<h2>MVP is: {{ mvp }}</h2>
	<ul>
		<li v-for="item in items">
			<label>
				<input type="radio" v-bind:value="item.value" v-model="mvp"> {{ item.player }}
			</label>
		</li>
	</ul>
	<hr/>

	<ul>
		<li v-for="group in groups">
			Selected: {{ group.checkd }}
			<br/>
			<div v-for="sub in group.subs">
				<label>
					<input type="radio" v-bind:value="sub" v-model="group.checkd"> {{ sub }}
				</label>
			</div>
		</li>
	</ul>
	`;

	model =  {
		'sex': 'girl',

		'mvp': 'Curry',
		'items': [
			{'value': 'Curry', 'player': 'Curry'},
			{'value': 'Westbrook', 'player': 'Westbrook'},
			{'value': 'Durant', 'player': 'Durant'},
		],

		'groups': [
			{
				'checkd': 'aa',
				'subs': ['aa', 'bb', 'cc']
			},
			{
				'checkd': 'ee',
				'subs': ['dd', 'ee', 'ff']
			}
		]
	}



	// start compile
	body.innerHTML = layout;
	var vm = new MVVM(body, model);
	// for global debug
	window.vm = vm.get();
});