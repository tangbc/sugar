<p align="center">
	<a href="https://npmjs.com/package/sugar-js">
		<img src="https://img.shields.io/npm/v/sugar-js.svg?style=flat" alt="NPM version"/>
	</a>
	<a href="https://travis-ci.org/tangbc/sugar">
		<img src="https://travis-ci.org/tangbc/sugar.svg?branch=master" alt="Travis CI Status"/>
	</a>
	<a href="https://codecov.io/gh/tangbc/sugar">
		<img src="https://codecov.io/gh/tangbc/sugar/branch/master/graph/badge.svg" alt="codecov"/>
	</a>
	<a href="https://saucelabs.com/u/tangbc">
		<img src="https://saucelabs.com/buildstatus/tangbc" alt="Sauce Test Status"/>
	</a>
	<br>
	<a href="https://saucelabs.com/u/tangbc">
		<img src="https://saucelabs.com/browser-matrix/tangbc.svg" alt="Sauce Browser Matrix"/>
	</a>
</p>


## sugar

> A lightweight and powerful MVVM library for building web UI component.

Simple api and without any dependence.
Consists of two independent libraries:
* **`sugar.js`** *Component system + MVVM , for building flexible web component*.
* **`mvvm.js`** *Achived the MVVM* , **it doesn't rely on sugar, it can be used independently**.


## Diagram

<img src="https://tangbc.github.io/github-images/sugar-diagram-en.png" width="600">


## Directories

* **`build/`** Development, production and test configurations.

* **`demos/`** Several complete examples/demos developed by `sugar.js`.

* **`dist/`** Product files of `sugar.js` and `mvvm.js`, and their compressed.

* **`src/`** Source code module files:

	* `src/main/`<sup>20%</sup> A simple component system. [API & Doc](https://github.com/tangbc/sugar/wiki/API)

	* **`src/mvvm/`**<sup>80%</sup> A powerful and easy-using MVVM library. [API & Doc](https://github.com/tangbc/sugar/wiki/MVVM)

* **`test/`** Unit test specs writing by karma + jasmine.


## HelloWorld
```html
...
<body>
	<div id="app">
		<h1>{{ title }}</h1>
	</div>
</body>
...
```
```javascript
// define HelloWorld component:
var HelloWorld = sugar.Component.extend({
	init: function (config) {
		config = this.cover(config, {
			target: '#app',
			model: {
				title: 'Hello world!'
			}
		});
		this.Super('init', [config]);
	}
});

// create component instance:
var app = sugar.core.create('hello-world', HelloWord);
```
And then the HTML structure was rendered to be:
```html
...
<body>
	<div class="app">
		<h1>Hello world!</h1>
	</div>
</body>
...
```
Data reactive:
```javascript
app.vm.$data.title = 'Change the title!'; // <h1>Change the title!</h1>
```


## Documentation

[Get start and check documentation on Wiki.](https://github.com/tangbc/sugar/wiki)


## Demos

There are several simple demos in **`demos/`**, check it out and preview them in the following links:

* [StarRating](https://tangbc.github.io/sugar/demos/starRating)
* [DatePicker](https://tangbc.github.io/sugar/demos/datePicker)
* [TodoMVC](https://tangbc.github.io/sugar/demos/todoMVC)

You can also preview `sugar.js` by a *RadioComponent* in [jsfiddle](https://jsfiddle.net/tangbc/may7jzb4/7/).


## Usage

* Use by nodejs package: `npm install sugar-js`

* Both support [`UMD`](https://github.com/umdjs/umd) (Universal Module Definition)
	* `mvvm.js (about 26 kb)` https://tangbc.github.io/sugar/dist/mvvm.min.js
	* `sugar.js (about 33 kb)` https://tangbc.github.io/sugar/dist/sugar.min.js

* Browsers: **not support IE8 and below**, used `Object.defineProperty`, `Object.create`.


## ChangeLog

* [See releases](https://github.com/tangbc/sugar/releases)


## Contribution

1. Fork repository

2. Install nodejs package devtools: **`npm install`**

3. Develop and debug: **`npm run dev`** *(generate sourcemap files in `bundle/`)*

4. Add and write test spec, *(in `test/units/specs/`)* then run uint test：**`npm run test`**

5. Generate the test coverage report and jshint checking up: **`npm run build`**


## License

[MIT License](https://github.com/tangbc/sugar/blob/master/LICENSE)
