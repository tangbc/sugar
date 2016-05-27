require([
	'../../../../src/mvvm/index',
	'../../../../src/util'
], function(MVVM, util) {
	var layout, model, body = document.querySelector('body');


	layout =
	`
	<h2>{{ title }}</h2>
	<input type="password" v-model="pass">
	<input type="button" value="submit" v-on:click="click">
	<hr/>

	<h2>Selected: {{ sex }}</h2>
	<input type="text" value="xxx" v-bind:disabled="disabled">
	<label>
		<input type="radio" v-bind:disabled="disabled" value="boy" v-model="sex"/> Boy
	</label>
	<label>
		<input type="radio" v-bind:disabled="disabled" value="girl" v-model="sex"/> Girl
	</label>
	<br/>
	<input type="button" value="disable" v-on:click="clickDisable">
	<input type="button" value="enable" v-on:click="clickEnable">
	`;

	model =  {
		'title': 'mvvm test ~',
		'pass' : '',
		'click': function () {
			console.log(this);
		},

		'sex': 'boy',
		'disabled': true,
		'clickDisable': function() {
			this.$.disabled = true;
		},
		'clickEnable': function() {
			this.$.disabled = false;
		},
	}



	// start compile
	body.innerHTML = layout;
	var vm = new MVVM(body, model);

	vm.watch('pass', function() {
		console.log(arguments);
	});

	// for global debug
	window.vm = vm.get();
});