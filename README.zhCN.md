## sugar

[![Travis CI Status](https://travis-ci.org/tangbc/sugar.svg?branch=master)](https://travis-ci.org/tangbc/sugar)
[![codecov](https://codecov.io/gh/tangbc/sugar/branch/master/graph/badge.svg)](https://codecov.io/gh/tangbc/sugar)


* 一个用于开发前端模块化 UI 组件的轻量级 JavaScript MVVM 库/框架

* 无第三方库依赖，简单的模块化组件开发方式，支持模板布局功能和 MVVM 模式

* 框架分为两个独立的部分：**`sugar`** (实现组件系统) 和 **`mvvm`** (实现数据绑定 + 视图刷新)


## 核心组成

<img src="http://7xodrz.com1.z0.glb.clouddn.com/sugar-constructor" width="600">


## 目录结构

* `test/` 单元测试以及其他测试用例

* `build/` 开发、测试和打包配置文件目录

* `demos/` 用 sugar.js 做的一些完整例子

* `dist/` 打包好的 sugar.js 和 mvvm.js 以及各自的压缩版本

* `src/` 源模块文件目录：

	* `src/main/` 为 sugar 的组件系统模块目录，该目录下所有的模块文件都最终服务于 component.js (视图组件基础模块)，组件之间可以相互调用、嵌套和消息通信，详细参见: [sugar api](http://tangbc.github.io/sugar/sugar.html)

	* **`src/mvvm/`** 为一个简单 mvvm 库，指令系统支持文本、表单双向数据绑定、属性绑定、事件绑定 和循环列表等常用功能，**mvvm 对于 sugar 没有任何依赖，可独立使用**。详细指令参见: [mvvm api](http://tangbc.github.io/sugar/mvvm.html)


## 组件示例

**`demos/`**  目录做了些示例，也可在线预览效果：

* [打星评分组件](http://tangbc.github.io/sugar/demos/star/)
* [简单的日期选择组件](http://tangbc.github.io/sugar/demos/date/)
* [tangbc.github.io/sugar](http://tangbc.github.io/sugar)
* [简单的 TodoMVC 应用](http://tangbc.github.io/sugar/demos/todoMVC)

在 [jsfiddle](https://jsfiddle.net/tangbc/may7jzb4/6/) 上编辑一个可复用的 `radio` 组件


## 引用 & 环境

* 引用方式：`sugar.js` 和 `mvvm.js` 均支持 `cmd` `amd` 以及 `script` 标签引用
	* `sugar (约 38 kb)` http://tangbc.github.io/sugar/dist/sugar.min.js
	* `mvvm (约 30 kb)` http://tangbc.github.io/sugar/dist/mvvm.min.js

* 浏览器支持：不支持 IE8 及以下 (用了 `Object.defineProperty` 和 `Object.create` 等)


## 更新日志

[查看 Release 版本](https://github.com/tangbc/sugar/releases)


## 交流 & 贡献

1. 拉取代码：**`git clone https://github.com/tangbc/sugar.git`**

2. 安装开发测试所需的 nodejs 包：**`npm install`**

3. 开发调试 sugar ：**`npm run dev-sugar`**

4. 开发调试 mvvm ：**`npm run dev-mvvm`**

5. 进行单元测试：**`npm run test`**

6. 生成测试覆盖率统计报告：**`npm run cover`**

7. 打包压缩项目代码：**`npm run pack`**
