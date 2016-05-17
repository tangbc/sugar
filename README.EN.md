# sugar
A lightweight JavaScript framework (mvvm & template) for building modular Front-end UI components


# Intro

* Easy way to develop Web Components with `Sugar.js`, support template layout and MVVM

* `Sugar.js` consists of two independent parts: **`sugar`** (Component system) and **`mvvm`** (DataBinding + ViewRefresh)


# Diagram of Sugar
<img src="http://7xodrz.com1.z0.glb.clouddn.com/sugar-constructor-en" width="666">


# Directory structure
* `test/` Test files directory

* `build/` Webpack config files

* `demos/` Some complete examples developed by sugar.js

* `dist/` Packaged sugar.js and mvvm.js, as well as their compressed files

* `src/` Source code files directory:

	* `src/main/` Component system module directory, all of the module files in this directory are eventually serving for component.js (component basic definition module). Components can be included each other, nested and message communication. See more Api: [sugar api](http://tangbc.github.io/sugar/sugar.html)

	* **`src/mvvm/`** A lightweight mvvm library, command system support v-text, v-model, v-bind, v-on, v-for and so on. **mvvm does not have any dependence on sugar, it can be used independently**. See more Api: [mvvm api](http://tangbc.github.io/sugar/mvvm.html)


# For example

```javascript
var sugar = require('dist/sugar.min');

/*
 * Define Page component, inherited from sugar.Component
 * Then Page get an independent view, dom, data and logical behavior can be flexible customization
 */
var Page = sugar.Component.extend({
	init: function(config) {
		// Define the initial state and data of the component in the config:
		config = this.cover(config, {
			'html' : '<h1 v-text="title"></h1>',
			// You can also use layout template, sugar.js will use the Ajax request template's uri
			// 'template': 'tpl/page.html',
			'model': {
				'title': 'hello sugar ~'
			}
		});
		// Call the parent class method 'init', Pass config for view rendering
		this.Super('init', arguments);
	},
	// When the view is rendered, method 'viewReady' called immediately, business can be started here
	viewReady: function () {
		this.vm.set('title', 'view has been rendered!');
	}
});

/*
 * Create an instance of the Page component and add it to the dom.
 * comp1 and comp2 are both the instances of the Page
 * A component can generate multi instances, it can be approximately considered: comp = new Page();
 */
var comp1 = sugar.core.create('component1', Page, {
	'target': document.querySelector('#demo1')
});

var comp2 = sugar.core.create('component2', Page, {
	'target': document.querySelector('#demo2')
});
```


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
* `v1.2.0`
	* `mvvm` Fixes many issues, adding instruction expressions that depend on extracting and updating the view's stability, a version of the function is relatively stable
