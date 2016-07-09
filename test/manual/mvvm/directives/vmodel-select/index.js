require([
	'../../../../../bundle/mvvm'
], function(imports) {
	var MVVM = imports.default;
	var layout, model, body = document.querySelector('body');


	layout =
	`
	<h2>Selected: {{ selected_1 }}</h2>
	<div>(single selection without value)</div>
	<select v-model="selected_1">
		<option>Curry</option>
		<option>Thompson</option>
		<option>Green</option>
	</select>
	<hr/>

	<h2>Selected: {{ selected_2 }}</h2>
	<div>(single selection with value)</div>
	<select v-model="selected_2">
		<option value="Curry">Curry</option>
		<option value="Thompson">Thompson</option>
		<option value="Green">Green</option>
	</select>
	<hr/>

	<h2>Selected: {{ selecteds_1 }}</h2>
	<div>(multi selection with value)</div>
	<br/>
	<select v-model="selecteds_1" multiple>
		<option value="Curry">Curry</option>
		<option value="Thompson">Thompson</option>
		<option value="Green">Green</option>
	</select>
	<hr/>

	<h2>Selected: {{ selected_3 }}</h2>
	<div>(single selection without value in vfor)</div>
	<select v-model="selected_3">
		<option v-for="option in options_3">
		{{ option.text }}
		</option>
	</select>
	<hr/>

	<h2>Selected: {{ selecteds_2 }}</h2>
	<div>(multi selection with value in vfor)</div>
	<select v-model="selecteds_2" multiple>
		<option v-for="opt in options_2" v-bind:value="opt.value">
		{{ opt.value }}
		</option>
	</select>
	<hr/>

	<h2>nest vfor selection</h2>
	<select v-for="sel in selects" v-model="sel.res">
		<option v-for="op in sel.opts">
			{{ op.text }}
		</option>
	</select>
	<h2 v-for="sel in selects">
		{{ sel.type }} Selected: {{ sel.res }}
	</h2>
	<hr/>

	<h2>Selected: {{ sel_default }}</h2>
	<div>(single selection with default value)</div>
	<select v-model="sel_default" number multiple>
		<option value="1">Curry</option>
		<option value="2" selected>Thompson</option>
		<option value="3" selected>Green</option>
	</select>
	<hr/>
	`;

	model =  {
		// single selection without value
		'selected_1': 'Green',

		// single selection with value
		'selected_2': 'Thompson',

		// multi selection with value
		'selecteds_1': ['Curry', 'Green'],

		// single selection without value in vfor
		'selected_3': 'Thompson',
		'options_3': [
			{'text': 'Curry'},
			{'text': 'Thompson'},
			{'text': 'Green'},
		],

		// multi selection with value in vfor
		'selecteds_2': ['Curry'],
		'options_2': [
			{'value': 'Curry'},
			{'value': 'Thompson'},
			{'value': 'Green'},
		],

		// nest vfor
		'selects': [
			{
				'type': 'Warriors',
				'res': 'Curry',
				'opts': [
					{'text': 'Curry'},
					{'text': 'Thompson'},
					{'text': 'Green'}
				]
			},
			{
				'type': 'Thunder',
				'res': 'Durant',
				'opts': [
					{'text': 'Westbrook'},
					{'text': 'Durant'},
					{'text': 'Ibaka'}
				]
			},
			{
				'type': 'Lakers',
				'res': 'Kobe',
				'opts': [
					{'text': 'Russell'},
					{'text': 'Randle'},
					{'text': 'Kobe'}
				]
			}
		],

		'sel_default': []
	}



	// start compile
	body.innerHTML = layout;
	console.time('compile');
	var vm = new MVVM(body, model);
	console.timeEnd('compile');
	// for global debug
	window.vm = vm.get();
});