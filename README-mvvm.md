# mvvm.js

`mvvm.js` 是一个非常轻量的 mvvm 库，指令系统功能齐全，能满足基本的 mvvm 模式开发需求。 **`mvvm` 对 `sugar` 没有任何依赖，如果只需要 mvvm 的功能而不需要组件模块化可直接使用 mvvm.js ~**

mvvm.js 的源代码都放在 `src/mvvm/` 目录下：

* `index.js` mvvm 入口/构造函数
* `compiler.js` 指令编译模块
* `observer.js` 数据监测模块
* `parser.js` 指令解析基础模块
* `updater.js` 视图刷新模块
* `watcher.js` 数据订阅模块
* `src/mvvm/parsers/` 每个指令单独的解析模块目录

### 支持的指令列表：

* [v-el](https://github.com/tangbc/sugar/blob/master/README-mvvm.md#v-el)
* [v-text](https://github.com/tangbc/sugar/blob/master/README-mvvm.md#v-text)
* [v-html](https://github.com/tangbc/sugar/blob/master/README-mvvm.md#v-html)
* [v-show](https://github.com/tangbc/sugar/blob/master/README-mvvm.md#v-show)
* [v-if](https://github.com/tangbc/sugar/blob/master/README-mvvm.md#v-if)
* [v-else](https://github.com/tangbc/sugar/blob/master/README-mvvm.md#v-else)
* [v-model](https://github.com/tangbc/sugar/blob/master/README-mvvm.md#v-model)
	* [v-model for text & textarea](https://github.com/tangbc/sugar/blob/master/README-mvvm.md#v-model-for-text--textarea)
	* [v-model for radio](https://github.com/tangbc/sugar/blob/master/README-mvvm.md#v-model-for-radio)
	* [v-model for checkbox](https://github.com/tangbc/sugar/blob/master/README-mvvm.md#v-model-for-checkbox)
	* [v-model for select](https://github.com/tangbc/sugar/blob/master/README-mvvm.md#v-model-for-select)
* [v-bind](https://github.com/tangbc/sugar/blob/master/README-mvvm.md#v-bind)
	* [v-bind:class](https://github.com/tangbc/sugar/blob/master/README-mvvm.md#v-bindclass)
	* [v-bind:style](https://github.com/tangbc/sugar/blob/master/README-mvvm.md#v-bindstyle)
* [v-on](https://github.com/tangbc/sugar/blob/master/README-mvvm.md#v-on)
* [v-for](https://github.com/tangbc/sugar/blob/master/README-mvvm.md#v-for)


## 1. 定义一个 mvvm 实例
```javascript
/*
 * element 接受一个 DOM 元素，作为编译的目标元素 <必选>
 * model 接受一个对象作为数据模型，模型字段不能包含*字符 <必选>
 * context 接受一个 v-on 事件回调函数 this 指向的执行上下文 <可选>
 */
var vm = new MVVM(element, {
  'title': '初始标题',
  'items': []
}, context);

/*
 * vm 实例的属性和方法
 */
vm.$ 为数据模型对象

vm.get('title'); // 返回 初始标题
vm.get(); // 返回 整个数据模型

vm.set('title', '新标题'); // 设置单个 vm
vm.set({ // 同时设置多个 vm
  'title': 'xxx',
  'items': [...]
});

vm.reset('title'); // 重置单个 vm 为初始状态
vm.reset(); // 重置整个数据模型为初始状态

vm.watch('title', callback); // 实现对数据模型的观察 callback 参数返回 ['title', last, old]
```


## 2. 所有指令详细说明

### v-el
* 说明：

	将指令所在的节点注册到数据模型对象中，方便通过 `$els` 访问这个元素

* 示例：

  ```html
  <div v-el="elm"></div>
  ```
  ```javascript
  vm.$.$els.elm.textContent = 'hello mvvm~';
  ```


### v-text
* 说明：

	更新元素的 `node.textContent` 在元素标签内部使用 `{{field}}` 也将编译为一个 `v-text` 指令，可存在前缀和后缀

* 示例：

  ```html
  <h1 v-text="title"></h1>
  <h2>The title is: {{title}}.</h2>
  ```

### v-html
* 说明：

	更新元素的 `node.innerHTML` 在元素标签内部使用 `{{{html}}}` 也将编译为一个 `v-html` 指令，注意的是替换的内容不会进行数据绑定，`{{{html}}}` 只能包含在元素节点内，不能存在前缀或者后缀文本如: `<p>***{{html}}***</p>`

* 示例：
	```html
	<div v-html="html"></div>
	<div>{{{html}}}</div>
	```

### v-show
* 说明：

	根据指令的值（布尔值）来切换显示/隐藏元素 `CSS` 的 `display` 值，隐藏统一设为 `none` 显示的时候如果元素有行内样式设置了 `display` ，将自动切换回原来所定义的值，切换过程仍旧在文档中保留该元素，`v-show` 可以添加一个 `v-else` 兄弟节点进行 toggle 切换

* 示例：
	```html
	<h1 v-show="isShowTitle">big title</h1>

	<div v-show="isShowGreet">how are you?</div>
	<div v-else>I am fine 3q</div>
	```

### v-if
* 说明：

	根据指令的值（布尔值）切换渲染元素，在切换时元素及它的数据绑定将会被销毁并重建，切换过程将会从文档移除该元素的所有子节点，`v-if` 也可以添加一个 `v-else` 兄弟节点进行 toggle 切换

* 示例：与 `v-show` 用法相同

### v-else
* 说明：

	见 `v-show` 与 `v-if` 的说明，注意的是 `v-else` 前一兄弟元素必须有 `v-if` 或 `v-show`

### v-model
* 说明：

	在表单控件上实现双向绑定，只能够在`input(text, radio, checkbox)` `select` 和 `textarea` 元素上使用

* 示例：见下面示例

### v-model for text & textarea
* 示例：

	```html
	<h1 v-text="title"></h1>
	<input type="text" v-model="title">
	<textarea v-model="title"></textarea>
	```

### v-model for radio
* 示例：

	```html
	<label>
		<input type="radio" v-model="sex" value="boy"> 男生
	</label>
	<label>
		<input type="radio" v-model="sex" value="girl"> 女生
	</label>
	<br/>
	<div>Selected: {{sex}}</div>
	```

### v-model for checkbox
* 示例：

	单个 checkbox 绑定一个布尔值：
	```javascript
	isCheck: true
	```
	```html
	<label>
		<input type="checkbox" v-model="isCheck"> Checked
	</label>
	<br/>
	<div>Selected: {{isCheck}}</div>
	```

	多个 checkbox 绑定一个数组：
	```javascript
	phones: ['apple', 'mzx']
	```
	```html
	<label>
		<input type="checkbox" value="apple" v-model="phones"> 苹果
	</label>
	<label>
		<input type="checkbox" value="xmi" v-model="phones"> 小米
	</label>
	<label>
		<input type="checkbox" value="mzx" v-model="phones"> 魅族
	</label>
	<br/>
	<div>Selected: {{phones}}</div>
	```

### v-model for select
* 示例：

	单选绑定到一个指定的 value：
	```javascript
	selected: 'apple'
	```
	```html
	<select v-model="selected">
		<option value="apple">苹果</option>
		<option value="xmi">小米</option>
		<option value="mzx">魅族</option>
	</select>
	<span>Selected: {{selected}}</span>
	```

	多选绑定到一个数组：
	```javascript
	selected: ['apple', 'mzx']
	```
	```html
	<select v-model="selected" multiple>
		<option value="apple">苹果</option>
		<option value="xmi">小米</option>
		<option value="mzx">魅族</option>
	</select>
	<span>Selected: {{selected}}</span>
	```

### v-bind
* 说明：

	动态地绑定一个或多个 `attribute` 包括 `class` 、 `style` 以及其他属性，原有的非指令属性也将保留（单个绑定性能稍高于 Json 形式的多个绑定）

* 示例：

	绑定单个：
	```html
	<div v-bind:id="vid"></div>
	```

	绑定多个属性的 Json 结构：
	```html
	<div v-bind="{'id': vid, 'data-id': vdid, 'class': classObject, 'style': styleObject}"></div>
	```

### v-bind:class
* 示例：

	绑定 `class` 到一个字段，通过 vm.$.cls = 'class-a' 切换 classname：
	```html
	<div class="static" v-bind:class="cls"></div>
	```

	绑定 `class` 到一个数组：
	```javascript
	'classA': 'oneClass',
	'classB': 'twoClass'
	```
	```html
	<div v-bind:class="[classA, classB]"></div>
	```

	绑定 `class` 到一个对象，键名作为 classname，键值作为是否添加的布尔值：
	```javascript
	'classObject': {
		'class-a': true,
		'class-b': false
	}
	```
	```html
	<div v-bind:class="classObject"></div>
	```

	绑定多个 `class` 的 Json 结构：
	```html
	<div v-bind:class="{'class-a': isA, 'class-b': isB}"></div>
	```

### v-bind:style
* 示例：

	绑定 `style` 到一个对象，键名作为 `property` 键值作为 `value` ：
	```javascript
	'styleObject': {
		'display': 'none',
		'padding': '10px'
	}
	```
	```html
	<div v-bind:style="styleObject"></div>
	```

	绑定 `style` 的 Json 结构：
	```html
	<div v-bind:style="{'display': vdsp, 'border': vbrd, 'padding': vpd}"></div>
	```

### v-on
* 说明：

	事件的绑定方式是 `addEventListener` 支持4种事件修饰符：只在当前元素触发 `.self` 、 阻止冒泡 `.stop` 、 阻止默认事件 `.prevent` 和 使用捕获 `.capture` 可以指定事件回调的参数(默认为原生事件对象 e )，比如 `$event` 替换为 e 在 `v-for` 中 `$index` 替换为循环数组下标

* 示例：

	使用事件修饰符：
	```html
	<div class="outSide" v-on:click.self="clickOutside">
		<p class="inSide" v-on:click.stop="clickInside">
			<input type="checkbox" v-on:click.stop.prevent="clickCheckbox"> 点击不会勾上也不会冒泡
		</p>
	</div>
	```

	传参数：
	```html
	<button v-on:click="clickBtn($event, 123, 'abc')"></button>
	```

	一次绑定多个事件：
	```html
	<button v-on="{'click': clickBtn, 'mouseover': overBtn(123, $event， 'abc')}"></button>
	```

### v-for
* 说明：

	构建基于源数据重复的动态列表，语法为: `alias in iterator` 支持 `push, pop, shift, unshift, splice, sort, reverse` 数组操作，支持下标操作，支持内嵌指令，嵌套 v-for ，在循环体中 `$index` 用在其他指令将会替换为当前选项的下标（Number）

	列表数组操作中 `push, pop, shift, unshift, splice` 会进行差异比对尽量少的 dom 操作来更新列表视图（部分更新），而 `sort, reverse` 以及替换整个数组时将会重新编译整个 vfor 循环列表

* 示例：

	循环及嵌套循环：
	```javascript
	items: [
		{
			'text': 'aaa',
			'sps': [
				{'text': 'aaa111'},
				{'text': 'aaa222'}
			]
		},
		{
			'text': 'bbb',
			'sps': [
				{'text': 'bbb111'},
				{'text': 'bbb222'}
			]
		}
	]
	```
	```html
	<ul>
		<li v-for="item in items">
			<b v-text="item.text"></b>
			<span v-for="sp in item.sps">
				<i v-text="sp.text"></i>
				<i v-text="item.text"></i>
			</span>
		</li>
	</ul>
	```

	动态的 option 的 select 表单：
	```html
	<select v-model="selected">
		<option v-for="option in options" v-bind:value="option.value">
			{{ option.text }}
		</option>
	</select>
	```

## 3. 继续完善和维护中 ……