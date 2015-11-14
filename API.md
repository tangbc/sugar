# sugar实例属性简单介绍
引用sugar.js将会返回一个包含所有API的sugar的实例，这些API（方法或对象）有：ajax、Container、config、core、cover、init、jquery、Module、sync、sysCaches和util

基础模块类：
* ```Module``` 系统基础模块类，主要作用是构建系统模块树和实现模块的基础API
* ```Container``` 视图基础模块类，继承于Module，主要作用是实现视图模块组件的初始化、布局、渲染、MVVM数据绑定、事件绑定、状态设定和业务逻辑

公共方法
* ```init``` sugar配置参数初始化设定方法，接收config和modMap两个参数，config可以增加配置文件、Ajax参数设定和自定义子模块节点，modMap允许在sugar实例上挂载其他外部的方法或对象
* ```sync``` 在异步回调操作中，保证模块在异步前后的状态不受其他异步模块的影响，相当于模拟了同步创建
* ```config``` 读取/设置配置参数（JSON对象）的方法
* ```cover``` 子类覆盖父类配置参数的方法，封装util.extend()

功能实例
* ```ajax``` Ajax数据请求处理实例
* ```core``` 系统核心实例，是Module类生成的一个实例，主要用作顶层模块的创建和管理

对象
* ```sysCaches``` 系统所有模块实例的缓存队列，Module通过这个队列来管理模块之间的关系，仅供查看模块信息和调试用，不建议在外部对其进行读写操作
* ```util``` 辅助功能函数库，各种常用的处理方法
* ```jquery``` 就是大名鼎鼎的jquery，要是MVVM搞不定的需求可以用它帮忙


# 1、Module基础模块实例方法
系统模块基础类，实现所有模块的通用方法

* ##### _同步创建子模块实例：_ `create(name, Class, config)`

	* 参数说明：
		```
		{String}   name   <必选> [子模块名称]
		{Function} Class  <必选> [用于创建子模块实例的类（生成函数），通常是继承于sugar.Container的类]
		{Object}   config <可选> [子模块的配置参数]
		```

	* 返回值：创建成功后的子模块实例

	* 用法示例：
		```javascript
		// sugar.Container为视图基础模块的类，继承于sugar.Module，用于定义视图模块，文档下面有详细介绍

		var Page = sugar.Container.extend({
			// 定义视图模块
		});
		// 或者采用引入方式：var Page = require('/path/to/page');

		sugar.core.create('page', Page, {
			// 模块配置参数
		});
		```

---
* ##### _异步创建子模块实例：_ `createAsync(name, uri, config, callback)`

	* 参数说明：
		```
		{String}   name     <必选> [子模块名称]
		{String}   uri      <必选> [用于生成子模块实例的类的文件路径，支持.来指定导出对象]
		{Object}   config   <可选> [子模块的配置参数]
		{Function} callback <可选> [子模块创建完成后的回调函数，参数为创建成功后的子模块实例]
		```

	* 返回值：无

	* 用法示例：
		```javascript
		sugar.core.createAsync('page', '/path/to/file.page', {
			// 模块配置参数
		}, function(mod) {
			// page子模块创建完成了，做点什么……
		});
		```

---
* ##### _异步创建多个子模块实例：_ `createArrayAsync(modsMap, callback)`

	* 参数说明：

		```
		{Object}   modsMap  <必选> [子模块的配置参数集合对象]
		{Function} callback <可选> [所有子模块创建完成后的回调函数，参数为创建成功后的所有子模块实例]
		```
	* 返回值：无

	* 用法示例：
		```javascript
		var subsConfig = {
			'header' : {/* header模块配置参数 */},
			'main'   : {/* main模块配置参数 */},
			'sidebar': {/* sidebar模块配置参数 */},
			'footer' : {/* footer模块配置参数 */}
		};
		sugar.core.createArrayAsync(subsConfig, function(header, main, sidebar, footer) {
			// 子模块实例按照配置参数中的顺序回调
		});
		```

---
* ##### _异步请求模块/文件：_ `requireAsync(uri, callback)`

	* 参数说明：
		```
		{String,Array} uri      <必选> [模块/文件的路径或路径数组]
		{Function}     callback <可选> [请求完成后的回调函数]
		```

	* 返回值：无

	* 特殊说明：requireAsync方法封装了cmd和amd两种不同规范的异步模块请求方式，主要是提供给createAsync和createArrayAsync内部用的，可以用作异步请求模块/文件使用。不同的是，createAsync和createArrayAsync会在请求完模块文件后将模块创建到系统模块树中，requireAsync则不做任何处理，所以不太常用。

	* 用法示例：
		```javascript
		// 异步请求模块
		sugar.core.requireAsync('tool/validate', function(valid) {
			// 文件请求回来了，要做点什么……
		});
		```

---
* ##### _获取当前模块实例的父模块实例（创建者）：_ `getParent()`

	* 参数说明：不需要参数

	* 返回值：父模块实例或null，null表示该模块是由sugar.core实例创建的顶层模块

	* 用法示例：
		```javascript
		// 定义header子模块类
		var Header = sugar.Container.extend({
			// viewReady为每个视图模块创建完毕后默认的内部调用方法
			viewReady: function() {
				var parent = this.getParent(); // => Page实例
			}
		});

		// 定义页面模块类
		var Page = sugar.Container.extend({
			viewReady: function() {
				// 创建头部模块
				this.create('header', Header, {
					// 创建header模块的配置参数
				});

				var parent = this.getParent(); // => sugar.core实例
			}
		});

		var main = sugar.core.create('page', Page, {
			// 模块配置参数
		});
		var parent = main.getParent(); // => null
		```

---
* ##### _获取当前模块实例的指定子模块实例：_ `getChild(name)`

	* 参数说明：
		```
		{String} name <必选> [子模块的名称]
		```

	* 返回值：子模块实例，不存在则返回null

	* 用法示例：
		```javascript
		// 定义header子模块类
		var Header = sugar.Container.extend({/* 定义视图模块…… */});

		// 定义页面模块类
		var Page = sugar.Container.extend({
			viewReady: function() {
				// 创建头部模块
				this.create('header', Header, {
					// 创建header模块的配置参数
				});

				var head = this.getChild('header'); // => header模块实例
			}
		});
		```

---
* ##### _获取当前模块实例的所有子模块实例：_ `getChilds(returnArray)`

	* 参数说明：
		```
		{Boolean} returnArray <可选> [返回的子模块集合是否是数组的形式，否则为映射对象形式]
		```

	* 返回值：子模块集合

	* 用法示例：
		```javascript
		// 定义header子模块类
		var Header = sugar.Container.extend({/* 定义视图模块…… */});

		// 定义footer子模块类
		var Footer = sugar.Container.extend({/* 定义视图模块…… */});

		// 定义sidebar子模块类
		var Sidebar = sugar.Container.extend({/* 定义视图模块…… */});

		// 定义页面模块类
		var Page = sugar.Container.extend({
			viewReady: function() {
				// 创建三个子模块
				this.create('header', Header);
				this.create('footer', Footer);
				this.create('sidebar', Sidebar);

				var chids = this.getChilds();
				/*  {
						'header' : Object
						'footer' : Object
						'sidebar': Object
					}
				 */

				var chids = this.getChilds(true);
				// [header, footer, sidebar]
			}
		});
		```

---
* ##### _修正作用域的定时器：_ `setTimeout(callback, time, param)`

	* 参数说明：
		```
		{Function,String} callback <必选> [定时器回调函数，字符串时为模块属性]
		{Number}          time     <可选> [定时器延迟时间毫秒数，不传为0]
		{Mix}             param    <可选> [回调函数参数]
		```

	* 返回值：定时器的id

	* 用法示例：
		```javascript
		var Page = sugar.Container.extend({
			viewReady: function() {
				this.$name = 'SUGAR';

				this.setTimeout(function() {
					console.log(this.$name); // 匿名函数作用域也是this，所以打印结果为'SUGAR'
				}, 100);

				this.setTimeout('delayLog', 1000, this.$name);
			},
			delayLog: function() {
				console.log(arguments); // [SUGAR']
			}
		});
		```

---
* ##### _模块通信：冒泡方式发送消息：_ `fire(name, param, callback)`

	* 参数说明：
		```
		{String}   name     <必选> [消息名称]
		{Mix}      param    <可选> [消息参数（内容）]
		{Function} callback <可选> [消息被接受者接收完毕后的回调函数]
		```

	* 返回值：无

	* 用法示例：
		```javascript
		// 定义导航子模块
		var Nav = sugar.Container.extend({
			viewReady: function() {
				// 向父模块发送消息，将会冒泡到每一层父模块
				this.fire('navCreated', 123);
			},
			// 默认接收消息方法用on + 消息名首字母大写，以区分其他类型的方法
			// 消息会从本模块开始触发接收方法
			onNavCreated: function(ev) {
				// ev.param => 123
			}
		});

		// 定义Header子模块
		var Header = sugar.Container.extend({
			viewReady: function() {
				// 创建导航
				this.create('nav', Nav);
			},
			// Header是Nav的父模块，能接收到navCreated消息
			onNavCreated: function(ev) {
				// ev.param => 123
				// return false // 假如在这里返回false，则不会将消息冒泡到Header的父模块Page中
			}
		});

		// 定义Page模块
		var Page = sugar.Container.extend({
			viewReady: function() {
				// 创建头部模块
				this.create('header', Header);
			},
			// Page是Header的父模块，也能接收到navCreated消息
			onNavCreated: function(ev) {
				// ev.param => 123
				// 假如没有任何一层的消息return false，此消息还会将继续冒泡到Page的父模块，直到模块树的根
			}
		});

		// 以上，消息的传递顺序为子模块->父模块：Nav -> Header -> Page
		```

---
* ##### _模块通信：向下广播方式发送消息：_ `broadcast(name, param, callback)`

	* 参数说明：
		```
		{String}   name     <必选> [消息名称]
		{Mix}      param    <可选> [消息参数（内容）]
		{Function} callback <可选> [消息被接受者接收完毕后的回调函数]
		```

	* 返回值：无

	* 用法示例：
		```javascript
		// 定义导航子模块
		var Nav = sugar.Container.extend({
			// Nav是Header的子模块，能接收到pageReady消息
			onPageReady: function(ev) {
				// ev.param => 456
			}
		});

		// 定义LOGO子模块
		var LOGO = sugar.Container.extend({
			// LOGO是Header的子模块，能接收到pageReady消息
			onPageReady: function(ev) {
				// ev.param => 456
			}
		});

		// 定义Header子模块
		var Header = sugar.Container.extend({
			viewReady: function() {
				// 创建导航
				this.create('nav', Nav);
				// 创建LOGO
				this.create('logo', LOGO);
			},
			// Header是Page的子模块，能接收到pageReady消息
			onPageReady: function(ev) {
				// ev.param => 456
				// return false // 假如在这里返回false，则不会将消息继续广播到Header的子模块Nav和LOGO中
			}
		});

		// 定义Page模块
		var Page = sugar.Container.extend({
			viewReady: function() {
				// 创建头部模块
				this.create('header', Header);

				// 向所有子模块发送广播消息
				this.broadcast('pageReady', 456);
			},
			// 默认接收消息方法用on + 消息名首字母大写，以区分其他类型的方法
			// 消息会从本模块开始触发接收方法
			onPageReady: function(ev) {
				// ev.param => 456
			}
		});

		// 以上，消息的传递顺序为父模块->子模块：Page -> Header -> Nav、LOGO
		```

---
* ##### _模块通信：向指定的模块发送消息：_ `notify(receiver, name, param, callback)`

	* 参数说明：
		```
		{String}   receiver <必选> [接受消息的模块实例名称，有层级时以.分隔并且要求完整层级]
		{String}   name     <必选> [消息名称]
		{Mix}      param    <可选> [消息参数（内容）]
		{Function} callback <可选> [消息被接受者接收完毕后的回调函数]
		```

	* 返回值：无

	* 特殊说明：fire和broadcast方式要求通信的模块之间存在父子关系，而notify方式可以用于任何两个模块之间的通信，并且不会在发送者实例上开始触发消息

	* 用法示例：
		```javascript
		var PageA = sugar.Container.extend({
			viewReady: function() {
				this.notify('page_b', 'helloFromA', 'Are you ok?');
			}
		});

		var PageB = sugar.Container.extend({
			onHelloFromA: function(ev) {
				// ev.param => 'Are you ok?'
			}
		});

		sugar.core.create('page_b', PageB);
		```

---
* ##### _模块销毁：_ `destroy(notify)`

	* 参数说明：
		```
		{Boolean} notify <可选> [为true时，销毁后会向父模块发送subDestroyed消息]
		```

	* 返回值：无

	* 特殊说明：模块在destroy在之前会调用当前模块的beforeDestroy方法，销毁后会调用afterDestroy方法

	* 用法示例：
		```javascript
		var Page = sugar.Container.extend({/* 定义视图模块…… */});

		var page = sugar.core.create('page', Page);

		page.destroy(); // page => null
		```


# 2、core实例方法
core是由sugar中的Core类（继承与Module类）生成的实例，所以拥有以上基础模块所有的实例方法，另外拓展了两个自身方法：

* ##### _获取顶层模块实例：_ `get(name)`

	* 参数说明：
		```
		{String} name <必选> [子模块的名称]
		```

	* 返回值：由sugar.core创建的顶层模块实例，不存在或已销毁则返回null

	* 特殊说明：该方法只是实现用sugar.core.get(name)来代替sugar.core.getChild(name)而已，两者相同

---
* ##### _模块通信：全局广播消息：_ `globalCast(name, param)`

	* 参数说明：
		```
		{String} name  <必选> [消息名称]
		{Mix}    param <可选> [消息参数（内容）]
		```

	* 返回值：无

	* 用法示例：
		```javascript
		var user = 'xxx';
		// 全局广播userLogin，将触发系统模块树中所有的模块实例的onUserLogin方法
		sugar.core.globalCast('userLogin', user);
		```


# 3、Container视图模块实例方法
Container类继承于Module类，所以Container的实例也有基础模块实例的所有方法，另外为了完善视图操作，自身拓展了一些方法和属性

* ##### _视图模块状态/参数初始化：_ `init(config, parent)`

	* 参数说明：
		```
		{Object} config [视图模块生成实例的配置参数，可以覆盖和拓展Container类的参数]
		{Object} parent [父模块实例，没特殊需求基本上用不到]
		```

	* 返回值：无

	* 特殊说明：init方法的作用是定义整个视图模块的初始状态、配置参数、MVVM视图层初始化的，不建议在init方法里面含有任何业务逻辑的代码（虽然可以有）。视图模块在被创建成实例之后会默认调用init方法（详见Module的create方法实现），init方法会根据配置参数进行视图布局的渲染，在渲染完成后会调用cbRender参数指定的方法（默认为viewReady），业务逻辑比如事件绑定、数据加载等建议在viewReady中处理

	* 用法示例：
		```javascript
		// 这里的Page只是定义一个Page类（生成函数），这个Page类是继承于Container类的
		var Page = sugar.Container.extend({
			init: function(config) {
				// sugar.cover(子, 父)：子模块覆盖父模块参数
				config = sugar.cover(config, {
					'target'  : sugar.jquery('#pageBox'), // 模块插入的目标容器
					'class'   : 'page-main',
					'tag'     : 'div',
					'html'    : 'I am page main',
					'cbRender': 'afterRender'
				});

				// Super方法为调用父类方法，这里就是调用Container.init(config)
				this.Super('init', [config]);
			},
			afterRender: function() {
				console.log('视图渲染完成，模块可以做后续处理了！');
			}
		});

		/*
		 *	需要注意的是：当调用模块创建方法时才会生成Page的一个实例
		 *	也就是说，定义一个Page类，可以生成N个Page的实例
		 */
		var page1 = sugar.core.create('page1', Page);
		// page1的DOM呈现为：<div class="page-main">I am page main</div>

		var page2 = sugar.core.create('page2', Page, {
			'class': 'page2-main',
			'tag'  : 'p'
		});
		// page2的DOM呈现为：<p class="page2-main">I am page main</p>

		var page3 = sugar.core.create('page3', Page, {
			'html': 'I am page3'
		});
		// page3的DOM呈现为：<div class="page-main">I am page3</div>

		/*
		 *	以上page1、page2和page3都是由Page生成的实例，可以通过配置不同参数使实例输出不同的形态
		 *	实例之间功能完全相同并且相互独立互不影响
		 */
		```

---
* ##### `mvvm`

	* 说明：Container类封装了Vue.js来做视图层MVVM，数据对象为init重的`vModel`参数，在模块中可以用`this.vm`来访问该视图模块的vue实例

	* vm对象方法和属性：
		* 数据对象：`this.vm.$`
		* vue实例：`this.vm._vm`
		* 获取指定数据对象：`this.vm.get(key)`
		* 设置数据对象的值：`this.vm.set(key, value)`
		* 重置数据对象为初始状态：`this.vm.reset(key)`
		* 监控VM数据对象的变化：`this.vm.watch(expression, callback)`

	* 用法示例：内容比较多，请参照examples/demo3/的使用

---
* ##### _获取模块配置：_ `getConfig(name)`

	* 参数说明：
		```
		{String} name <可选> [获取指定的参数配置，不传则返回整个配置对象]
		```

	* 返回值：参数值或参数对象

	* 用法示例：
		```javascript
		var Page = sugar.Container.extend({
			init: function(config) {
				config = sugar.cover({
					'target': sugar.jquery('#pageBox')
					'class' : 'page-main',
					'tag'   : 'b',
					'html'  : 'I am a page'
				});
				this.Super('init', arguments);
			},
			viewReady: function() {
				var html = this.getConfig('html');
				// 'I am a page'

				var cfg = this.getConfig();
				// {'class': 'page-main', 'tag': 'b', 'html': 'I am a page'}
			}
		});
		```

---
* ##### _设置模块配置：_ `setConfig(name, value)`

	* 参数说明：
		```
		{String} name  <必选> [需要设置的配置参数名]
		{Mix}    value <必选> [设置的值，null则会删除该配置参数]
		```

	* 返回值：操作成功与否的Boolean

	* 用法示例：
		```javascript
		var Page = sugar.Container.extend({
			init: function(config) {
				config = sugar.cover({
					'target': sugar.jquery('#pageBox')
					'class' : 'page-main',
					'tag'   : 'b',
					'html'  : 'I am a page'
				});
				this.Super('init', arguments);
			},
			viewReady: function() {
				var html = this.getConfig('html'); // 'I am a page'

				this.setConfig('html', 'I change my mind');

				html = this.getConfig('html'); // 'I change my mind'
			}
		});
		```

---
* ##### _异步创建布局中标记的所有子模块：_ `createTplModules(configMap, callback)`

	* 参数说明：
		```
		{Object}   configMap <可选> [子模块名称与子模块配置的映射对象]
		{Function} callback  <可选> [全部子模块创建完成后的回调函数]
		```

	* 返回值：无

	* 特殊说明：该方法封装了Module的createArrayAsync，每个模块的target参数都是用标记的DOM节点，用来简化多个子模块的创建，只需在DOM节点上标记子模块名称和子模块类的路径或别名即可

	* 用法示例：
		```html
		<!-- page.html模板文件（m-name标记子模块名称，m-module标记子模块路径或别名）： -->
		<div class="page">
			<div m-name="header" m-module="component/header"></div>
			<div m-name="main" m-module="component/main"></div>
			<div m-name="footer" m-module="component/footer"></div>
		</div>
		```
		```javascript
		// page.js文件：
		var Page = sugar.Container.extend({
			init: function(config) {
				config = sugar.cover(config, {
					'target'  : sugar.jquery('#pageBox')
					'class'   : 'main',
					'template': 'page.html' // 模板文件拉取地址
				});
				this.Super('init', arguments);
			},
			viewReady: function() {
				// 子模块的配置，每个配置不需要指定target参数，因为标记的DOM节点就是子模块创建的目标容器
				var subsConfig = {
					'header': {/* header模块配置参数 */},
					'main'  : {/* main模块配置参数 */},
					'footer': {/* footer模块配置参数 */}
				};

				this.createTplModules(subsConfig, function(header, main, footer) {
					// 所有子模块创建完成
				});
			}
		});
		```

---
* ##### _获取/查找视图模块的DOM元素：_ `getDOM(selector)`

	* 参数说明：
		```
		{String} selector <可选> [元素选择器]
		```

	* 返回值：jQuery DOM

	* 用法示例：
		```javascript
		var Page = sugar.Container.extend({
			init: function(config) {
				config = sugar.cover(config, {
					'target': sugar.jquery('#pageBox')
					'class' : 'page',
					'tag'   : 'p',
					'html'  : '<div class="header"><div class="nav"></div></div>'
				});
				this.Super('init', arguments);
			},
			viewReady: function() {
				var dom = this.getDOM(); // <p class="page">……</p>
				var nav = this.getDOM('.nav'); // <div class="nav"></div>
			}
		});
		```

---
* ##### _为元素添加绑定事件（封装jquery的bind）：_ `bind(elm, event, data, callback)`

	```
	（参见jQuery的bind方法）
	```

---
* ##### _从元素上移除bind添加的事件处理函数（封装jquery的unbind）：_ `unbind(elm, event, callback)`

	```
	（参见jQuery的unbind方法）
	```

---
* ##### _添加代理事件（封装jquery的on）：_ `proxy(elm, event, selector, data, callback)`

	```
	（参见jQuery的on方法）
	```

---
* ##### _移除proxy添加的事件处理函数（封装jquery的off）：_ `unproxy(elm, event, callback)`

	```
	（参见jQuery的on方法）
	```


# 4、ajax实例方法
* ##### _GET请求：_ `sugar.ajax.get(uri, param, callback, context)`

	* 参数说明：
		```
		{String}   uri      <必选> [请求地址]
		{Object}   param    <可选> [请求参数]
		{Function} callback <必选> [请求回调]
		{Object}   context  <可选> [回调函数执行上下文]
		```

	* 返回值：请求id，利用该id可以阻止请求的进行

	* 用法示例：
		```javascript
		var Page = sugar.Container.extend({
			viewReady: function() {
				var param = {'page': 1, 'limit': 10};
				sugar.ajax.get('/article/list.php', param, this.dataBack);

				// 回调也可写成字符串形式：
				sugar.ajax.get('/article/list.php', param, 'dataBack', this);
			},
			dataBack: function(err, data) {
				// err为请求错误或者服务器返回信息错误的对象，data为请求成功的数据
			}
		});
		```

---
* ##### _POST请求：_ `sugar.ajax.post(uri, param, callback, context)`

	```
	（参照get请求）
	```

---
* ##### _加载静态文本文件：_ `sugar.ajax.load(uri, param, callback, context)`

	* 参数说明：（参照get请求）

	* 返回值：无

	* 用法示例：（参照get请求）

---
* ##### _终止一个请求或者所有请求：_ `sugar.ajax.abort(id)`

	* 参数说明：
		```
		{Number} id <可选> [需要终止的请求id，不传则终止所有请求]
		```

	* 返回值：成功终止的请求数目

	* 特殊说明：该方法只能终止正在进行的请求，已经完成或者等待队列中的请求将不会被终止

	* 用法示例：
		```javascript
		var req1 = sugar.ajax.get(……);
		var req2 = sugar.ajax.post(……);
		var req3 = sugar.ajax.load(……);

		// 终止指定id请求
		sugar.ajax.abort(req1);
		// 终止所有正在请求的
		sugar.ajax.abort();
		```


# 5、sugar公共方法
* ##### _sugar配置初始化：_ `sugar.init(config, modMap)`

	* 参数说明：
		```
		{Object} config [系统全局配置]
		{Object} modMap [挂载外部模块映射对象]
		```

	* 返回值：sugar实例以便链式调用

	* 用法示例：
		```javascript
		// 自定义框架配置参数
		var config = {
			// 配置文件数据
			'data'       : {'version': '0.2.0', ……},
			// ajax最大同时请求数
			'maxQuery'   : 5,
			// ajax响应超时的毫秒数
			'timeout'    : 10000,
			// ajax返回数据格式
			'dataType'   : 'json',
			// ajax数据内容格式
			'contentType': 'application/json; charset=UTF-8',
			// 视图模板文件中的子模块标记属性名称
			'mName'      : 'm-name',
			// 视图模块文件中的子模块标记属性路径
			'mModule'    : 'm-module'
		};

		// 在sugar上挂载其他属性/模块
		var commonMods = {
			'user'   : require('sys/user'),
			'animate': require('sys/animate')
		};

		sugar.init(config, commonMods);

		// 可以使用：
		sugar.config('version'); // '0.2.0'
		sugar.user ……
		sugar.animate ……
		```

---
* ##### _全局配置函数：_ `sugar.config(name, value)`

	* 参数说明：
		```
		{String} name  <可选> [读取配置参数的字段名，空则返回整个配置数据]
		{Mix}    value <可选> [设置配置参数的值，null时则删除该字段]
		```

	* 返回值：读取的值

	* 用法示例：（参照sugar.init的示例）

---
* ##### _模块配置参数覆盖：_ `sugar.cover(child, parent)`

	* 参数说明：
		```
		{Object} child  <可选> [子类配置参数]
		{Object} parent <可选> [父类配置参数]
		```

	* 返回值：无

	* 用法示例：
		```javascript
		var Page = sugar.Container.extend({
			init: function(config) {
				// 传入的config参数为创建模块实例时传入的最终参数
				config = sugar.cover(config, {
					'class' : 'page',
					'html'  : 'This is parent param'
				});
				this.Super('init', arguments);
			}
		});
		```

---
* ##### _模块异步回调状态锁：_ `sugar.sync(status)`

	* 参数说明：
		```
		{Number} status <必选> [异步状态码，1表示异步开始，0表示异步结束]
		```

	* 返回值：无

	* 特殊说明：该方法主要是处理sugar内部createAsync的回调使用的，实际的业务开发用处不大，但为了遇到交互比较复杂的情况还是放了出来（注：状态锁参数只传1或0只能锁住异步创建模块的回调，如需锁住自定义的异步回调，请参考sync函数实现的源代码的传参形式）

	* 用法示例：
		```javascript
		// 假设需要异步拉取用户数据和异步创建用户列表子模块，而子模块创建完成回调需要用到用户数据：
		var users;
		// 开启异步状锁
		sugar.sync(1);
		sugar.ajax.get('/user/list.php', function(err, data) {
			users = data.items;
			// 数据请求回来了，结束异步状态锁
			sugar.sync(0);
		});

		// 创建用户列表模块
		function afterCreateUserMod() {/* 用users创建列表 */}
		sugar.createAsync('userList', '/path/to/user.list', afterCreateUserMod);

		/*  以上代码说明：数据拉取ajax.get和异步创建子模块createAsync是同步进行的，
			但是ajax请求之前用了sync(1)，所以创建完userList模块之后将不会立即调用afterCreateUserMod，
			而是等待sync(0)异步结束之后再执行。

			其实这样的异步依赖可能会有个问题就是如果ajax请求接口等待时间过长，
			页面其他的模块就会受到影响，
			以上需求正确的做法为在userList模块中去请求用户数据（那样就根本不需要状态锁），
			而不是依赖模块外部数据。这里只是为了sugar.sync()举个栗子而已~
		*/
		```


# 6、sugar导出对象

	* sysCaches：系统所有已创建模块实例缓存队列（方便查看和调试）

	* util：sugar的辅助功能函数库，详见util.js源文件

	* jquery：jquery库