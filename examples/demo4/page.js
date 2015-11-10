/**
 * demo4的page页面主模块
 */

define(['page'], function() {
	var sugar = require('../../sugar');
	var $ = sugar.jquery;

	/**
	 * 定义页面模块
	 */
	var Page = sugar.Container.extend({
		init: function(config) {
			config = sugar.cover(config, {
				'class'   : 'demo4',
				'template': 'page.html',
				'vModel'  : {
					// 是否显示结果
					'showResult': false,

					// 最佳阵容每个位置选择结果
					'spg': '',
					'ssg': '',
					'ssf': '',
					'spf': '',
					'sc' : '',

					// 事件的绑定也可以在模板中通过vm指令声明，无需jquery
					'vmClickResult': this.eventClickBtn,
					// 点击加载球队数据
					'vmClickLoad'  : this.eventClickLoad,
					// 点击清除数据
					'vmClickReset' : this.eventClickReset
				}
			});
			this.Super('init', arguments);
		},

		viewReady: function() {
			// 子模块配置参数
			var subConfig = {
				// 控球后卫radio，引用的是radio.js模块下的RadioBase组件，可在创建模块时定义模块参数
				'm-pg': {
					// radio的name属性标识
					'name'   : 'pg',
					// radio组的默认选中值
					'picked' : 'curry',
					// radio组选项
					'options': [
						{'text': '史提芬库里', 'value': 'curry'},
						{'text': '克里斯保罗', 'value': 'paul'},
						{'text': '拉塞尔维斯布鲁克', 'value': 'westbrook'},
						{'text': '凯利欧文', 'value': 'ivring'}
					]
				},
				// 得分后卫radio
				'm-sg': {
					'name'   : 'sg',
					'picked' : 'thompsom',
					// 也可以自定义字段值来适应后端返回数据的变化
					'text'   : 'name',
					'value'  : 'id',
					'options': [
						{'name': '詹姆斯哈登', 'id': 'hadden'},
						{'name': '克莱汤普森', 'id': 'thompsom'},
						{'name': '德维恩韦德', 'id': 'wade'}
					]
				},
				// 小前锋radio
				'm-sf': {
					'name'   : 'sf',
					'picked' : 'james',
					'options': [
						{'text': '勒布朗詹姆斯', 'value': 'james'},
						{'text': '凯文杜兰特', 'value': 'durant'},
						{'text': '卡哇伊伦纳德', 'value': 'lainode'},
						{'text': '保罗乔治', 'value': 'gorge'},
						{'text': '安德烈伊戈达拉', 'value': 'igudala'}
					]
				},
				// 大前锋radio
				'm-pf': {
					'name'   : 'pf',
					'picked' : 'davis',
					'options': [
						{'text': '凯文勒夫', 'value': 'love'},
						{'text': '安东尼戴维斯', 'value': 'davis'},
						{'text': '德雷蒙德格林', 'value': 'green'},
						{'text': '蒂姆邓肯', 'value': 'dancent'}
					]
				},
				// 中锋radio
				'm-c': {
					'name'   : 'm-c',
					'picked' : 'harward',
					'options': [
						{'text': '马克加索尔', 'value': 'gasol'},
						{'text': '安德鲁乔丹', 'value': 'jordan'},
						{'text': '德怀特霍华德', 'value': 'harward'}
					]
				},

				// 球队列表radio，数据动态拉取
				'm-team': {
					'autoLoad': false,
					'url'     : 'team_data.json',
					'name'    : 'team',
					'picked'  : 'warriors'
				}
			};

			// 扫描并根据subConfig来创建模板中标记的子模块
			// createTplModules为批量创建子模块，这里每个模块假如单独用createAsync来创建也是可以的
			this.createTplModules(subConfig, function() {
				console.log('全部子模块创建成功！', arguments);
			});
		},

		// 点击查看结果
		eventClickBtn: function() {
			// 获取由本模块创建的所有子模块
			var chs = this.getChilds();

			// 设置视图vm数据
			this.vm.set({
				// 显示结果容器
				'showResult': true,

				// 调用子模块的getData方法获取所选数据
				'spg': chs['m-pg'].getData()['text'],
				'ssg': chs['m-sg'].getData()['name'], // sg创建时字段配置不一样
				'ssf': chs['m-sf'].getData()['text'],
				'spf': chs['m-pf'].getData()['text'],
				'sc' : chs['m-c'].getData()['text']
			});
		},

		// 点击加载球队数据
		eventClickLoad: function() {
			// 获取指定子模块的实例(球队radio组模块)
			var mTeam = this.getChild('m-team');
			// 调用子模块的加载数据方法
			mTeam.loadData();
		},

		// 点击清除球队数据
		eventClickReset: function() {
			// 获取指定子模块的实例(球队radio组模块)
			var mTeam = this.getChild('m-team');
			// 调用子模块的reset方法
			mTeam.reset();
		}
	});

	return Page;
});