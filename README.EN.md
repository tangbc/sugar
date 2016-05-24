# Intro

* Easy way to develop Web Components with `Sugar.js`, support template layout and MVVM

* `Sugar.js` consists of two independent parts: **`sugar`** (Component system) and **`mvvm`** (DataBinding + ViewRefresh)


# Diagram of Sugar
<img src="http://7xodrz.com1.z0.glb.clouddn.com/sugar-constructor-en" width="666">

# For example
Here to define, create a simple reusable `radio` components as an example:
```html
<div id="radio-box-phone"></div>
<hr/>
<div id="radio-box-job"></div>
```

```javascript
// Defines a general radio frame assembly, to generate the specified radio data
var RadioComponent = Sugar.Component.extend({
	// Initialize the component configuration data
	init: function(config) {
		config = this.cover(config, {
			// component layout, you can also use `template: xxx.html` to load external template
			'html' : `
				<h2>Q: {{ title }}</h2>
				<h2>A: {{ selected }}</h2>
				<ul>
					<li v-for="item in items">
						<label>
							<input type="radio" v-bind:value="item.value"  v-model="selected">
							{{ item.value }}
						</label>
					</li>
				</ul>
			`,
			// MVVM data model
			'model': {
      			'title'   : config.title,
				'items'   : config.items,
				'selected': config.selected
			}
		});
		this.Super('init', arguments);
	}
});

// Use RadioComponent create a `phoneQA` component instance
var phoneQA = Sugar.core.create('phone', RadioComponent, {
	'target'  : document.querySelector('#radio-box-phone'),
 	'title'   : 'What cell phone do you use ? ',
	'selected': 'iPhone',
	'items'   : [
		{'value': 'iPhone'},
		{'value': 'XiaoMi'},
		{'value': 'Meizux'},
		{'value': 'HuaWei'},
    	{'value': 'Others'}
	]
});
// Use RadioComponent create a `jobQA` component instance
var jobQA = Sugar.core.create('job', RadioComponent, {
	'target'  : document.querySelector('#radio-box-job'),
  	'title'   : 'What\'s your job ? ',
	'selected': 'Programmer',
	'items'   : [
		{'value': 'Doctor'},
		{'value': 'Programmer'},
		{'value': 'Teacher'},
		{'value': 'Student'},
    	{'value': 'Others'}
	]
});

```
Finally, we can see two independent radio components in web interface:

<img src="http://7xodrz.com1.z0.glb.clouddn.com/sugar-radio-example">

You can modify code and preview this demo at [jsfiddle](https://jsfiddle.net/tangbc/may7jzb4/6/)


# Directory structure
* `test/` Test files directory

* `build/` Webpack config files

* `demos/` Some complete examples developed by sugar.js

* `dist/` Packaged sugar.js and mvvm.js, as well as their compressed files

* `src/` Source code files directory:

	* `src/main/` Component system module directory, all of the module files in this directory are eventually serving for component.js (component basic definition module). Components can be included each other, nested and message communication. See more Api: [sugar api](http://tangbc.github.io/sugar/sugar.html)

	* **`src/mvvm/`** A lightweight mvvm library, command system support v-text, v-model, v-bind, v-on, v-for and so on. **mvvm does not have any dependence on sugar, it can be used independently**. See more Api: [mvvm api](http://tangbc.github.io/sugar/mvvm.html)


# Component demo
There are some examples of the **`demos/`** directory, you can also preview the demos on the github.io

* [Star rating](http://tangbc.github.io/sugar/demos/star)
* [Simple datePicker](http://tangbc.github.io/sugar/demos/date)
* [tangbc.github.io/sugar](http://tangbc.github.io/sugar)


# Usage & Environment
* `sugar.js` and `mvvm.js` both support `cmd` `amd` and browser `script` tag
	* `sugar (about 41 kb)` http://tangbc.github.io/sugar/dist/sugar.min.js
	* `mvvm (about 31 kb)` http://tangbc.github.io/sugar/dist/mvvm.min.js

* Browser support: do not support old IE (used many ES5 characteristics)


# Majoy update log
* `v1.0`
	* `sugar` Basic component system
	* `mvvm` Support basic model instruction (static expression)
* `v1.0.2`
	* `mvvm` Support dynamic instruction expressions: `<p v-text="isError ? errorMsg : sucMsg"></p>`
* `v1.0.4`
	* `mvvm` Process `splice` action in `v-for` array operation
* `v1.0.6`
	* `mvvm` Fixes many issues, adding instruction expressions that depend on extracting and updating the view's stability, a version of the function is relatively stable
* `v1.0.8`
	* `mvvm` Update v-bind for object/json can be used with a simple diff algorithm
