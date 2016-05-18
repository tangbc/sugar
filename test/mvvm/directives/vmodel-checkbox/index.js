require([
	'../../../../src/mvvm/index'
], function(MVVM) {
	var layout, model, body = document.querySelector('body');


	layout =
	`
	<h2>Checked MVP: {{ isCheckMVP }}</h2>
	<label>
		<input type="checkbox" v-model="isCheckMVP"> MVP
	</label>
	<hr/>

	<h2>Selected players: {{ players }}</h2>
	<label>
		<input type="checkbox" value="Curry" v-model="players"> Curry
	</label>
	<label>
		<input type="checkbox" value="Westbrook" v-model="players"> Westbrook
	</label>
	<label>
		<input type="checkbox" value="Durant" v-model="players"> Durant
	</label>
	<hr>

	<h2>Selected sports: {{ favSpots }}</h2>
	<ul>
		<li v-for="sport in sports">
			<label>
				<input type="checkbox" v-bind:value="sport.value" v-model="favSpots">
				{{ sport.value + '-' + sport.name }}
			</label>
		</li>
	</ul>
	<hr>

	<ul>
		<li v-for="item in items">
			<p>
				<b>Selected: {{ item.res }}</b>
				<br/>
				<span v-for="p in item.options">
					<label>
						<input type="checkbox" v-bind:value="p.value" v-model="item.res"> {{ p.title }}
					</label>
				</span>
			</p>
		</li>
	</ul>
	`;

	model =  {
		'isCheckMVP': true,

		'players': ['Curry'],

		'favSpots': ['s1', 's2', 's3'],
		'sports': [
			{'value': 's1', 'name': 'Badminton'},
			{'value': 's2', 'name': 'Basketball'},
			{'value': 's3', 'name': 'PingPong'}
		],

		'items': [
			{
				'res': ['a3'],
				'options': [
					{'title': 'a1', 'value': 'a1'},
					{'title': 'a2', 'value': 'a2'},
					{'title': 'a3', 'value': 'a3'},
				]
			},
			{
				'res': ['b2', 'b3'],
				'options': [
					{'title': 'b1', 'value': 'b1'},
					{'title': 'b2', 'value': 'b2'},
					{'title': 'b3', 'value': 'b3'},
				]
			}
		]
	}



	// start compile
	body.innerHTML = layout;
	var vm = new MVVM(body, model);
	// for global debug
	window.vm = vm.get();
});