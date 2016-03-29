# sugar.js

## 1. 模块机制
根函数模块 `src/main/root.js` 实现 sugar 底层模块的继承方法 `extend`，每个模块都是从 `Root` 为根源继承而来， `extend` 是一个通过原型实现的类式继承（单继承），对传入的每个子类方法会挂载一个 `Super` 来实现对父类的调用。


系统基础模块 `Module` 的定义在 `src/main/module.js` 中，`Module` 继承于 `Root`，定义了 sugar 的模块系统和基本形态，实现系统模块的管理、创建和消息通信等基础功能。


视图基础模块 `Container` (`src/main/container.js`) 继承于 `Module` ，在 `Module` 的基础上扩展成一个视图容器类（构造函数），实现容器的生成、模板的拉取、视图的渲染。以 `Container` 为基础可以继承出各种自定义形态的视图模块。


sugar 的模块继承关系：

<img src="http://7xodrz.com1.z0.glb.clouddn.com/sugar-extend">


## 2. 视图模块定义
sugar 的视图模块都是从 `Container` 继承而来，通过 `init` 方法来定义视图的初始数据和状态：

```javascript
var sugar = reuqire('dist/sugar.min');

var Page = sugar.Container.extend({
	// 配置字段可以缺省也可以自定义
	// `init` 传入的参数 config 是生成(创建) Page 实例时的配置
	// 生成实例时如有定义 config 将会覆盖掉原有配置，从而实现功能相似模块的复用
	init: function(config) {
		config = this.cover(config, {
			// 视图创建的目标容器
			'target'  : null,
			// 视图元素的标签
			'tag'     : 'div',
			// 元素的 class
			'class'   : '',
			// 元素的 css
			'css'     : null,
			// 元素的 attr
			'attr'    : null,
			// 视图布局内容
			'html'    : '',
			// 视图模板拉取地址
			'template': '',
			// 模板拉取请求参数
			'tplParam': null,
			// mvvm 数据模型对象
			'model'   : null,
			// 视图渲染完成后的回调函数
			'cbRender': 'viewReady',
			// 移除节点子模块标记
			'tidyNode': true
		});
		// 调用父类 (sugar.Container) 的 init 方法来完成视图的渲染
		this.Super('init', arguments);
	}
});
```


## 3. 视图模块创建
将视图模块创建到DOM的方式有两种：

1. 通过核心实例 `sugar.core` 创建顶层模块：
	```javascript
	var sugar = reuqire('dist/sugar.min');

	var Page = sugar.Container.extend({
		init: function() {
			// ...
		}
	});

	sugar.core.create('page', Page, {
		'target': document.querySelector('body')
	});
	```

2. 在视图模块内部创建子视图模块：


	调用自身 `create` 方法创建：
	```javascript
	var sugar = reuqire('dist/sugar.min');

	var SubPage = sugar.Container.extend({
		init: function() {
			// ...
		}
	});

	var Page = sugar.Container.extend({
		init: function() {
			// ...
		},
		// 每个视图模块渲染完成之后默认调用 viewReady 方法
		viewReady: function() {
			// 创建 SubPage 到当前视图容器
			this.create('subpage', SubPage, {
				'target': this.el
			});
		}
	});

	// 创建 Page 到 body
	sugar.core.create('page', Page, {
		'target': document.querySelector('body')
	});
	```

## 4. API
模块通信等更多详细参考: [API.md](https://github.com/tangbc/sugar/blob/master/README-api.md)