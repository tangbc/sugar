require(['../../dist/sugar.min'], function(Sugar) {

	// 模块布局
	var layout = [
		'<input class="result-btn" type="button" v-bind:value="select" v-on:click="clickResultBtn">',
		// 日期选择面板
		'<div class="pannel" v-show="showPannel" v-on:click="clickPannel">',
			'<div class="banner">',
				'<span class="prev-month" v-on:click="clickPrevMonth"><</span>',
				'<span class="curr-date">{{current}}</span>',
				'<span class="next-month" v-on:click="clickNextMonth">></span>',
			'</div>',
			// 星期容器
			'<ul class="week-list">',
				'<li class="week-item" v-for="week in weeks" v-text="week"></li>',
			'</ul>',
			// 日期容器
			'<ul class="date-list" v-on:click="clickSelectDate">',
				'<li class="date-item" v-for="date in dates" v-bind:class="{seize: date.seize, today: date.today}" v-bind="{date-index: $index, date-value: date.date}">',
					'{{date.date}}',
				'</li>',
			'</ul>',
		'</div>'
	].join('');

	/**
	 * 简单的日期选择模块
	 */
	var DatePicker = Sugar.Container.extend({
		init: function(config) {
			// 记录当前时间
			var now = new Date();
			this.updateDateValue(now.getFullYear(), now.getMonth(), now.getDate());

			// 定义模块配置
			config = this.cover(config, {
				'css'  : {'padding': '20px'},
				'html' : layout,
				'model': {
					// 是否显示日历版面
					'showPannel': false,
					// 选择结果
					'select' : this.getResult(),
					// 当前年月
					'current': this.getCurrent(),
					'weeks'  : ['一', '二', '三', '四', '五', '六', '日'],
					// 日期数据
					'dates'  : [],
					// 点击事件
					'clickResultBtn' : this.clickResultBtn,
					'clickPannel'    : this.clickPannel,
					'clickPrevMonth' : this.clickPrevMonth,
					'clickNextMonth' : this.clickNextMonth,
					'clickSelectDate': this.clickSelectDate
				}
			});
			this.Super('init', arguments);
		},

		// 视图渲染完毕
		viewReady: function() {
			var self = this;
			// 点击空白隐藏 pannel
			this.bind(document.querySelector('body'), 'click', function(e) {
				if (self.$timeStamp !== e.timeStamp) {
					self.vm.set('showPannel', false);
				}
			});
			// 监听 showPannel 的值变化
			this.vm.watch('showPannel', function(path, last, old) {
				if (last) {
					self.updateDateValue();
				}
			});
		},

		// 点击面板记录事件时间戳
		clickPannel: function(e) {
			this.$timeStamp = e.timeStamp;
		},

		// 点击按钮
		clickResultBtn: function(e) {
			var vm = this.vm.get();
			vm.showPannel = !vm.showPannel;
			this.$timeStamp = e.timeStamp;

			if (vm.showPannel) {
				this.updateCurrentValue().highlightSelectDate();
			}
		},

		// 高亮当前选中的日期
		highlightSelectDate: function() {
			var dates = this.vm.get('dates');
			Sugar.util.each(dates, function(date, index) {
				date.today = date.date === this.$rDate;
			}, this);
		},

		// 获取选择的显示结果
		getResult: function() {
			return [this.$rYear, this.$rMonth + 1, this.$rDate].join(' - ');
		},

		// 获取当前面板显示的年月
		getCurrent: function(year, month) {
			return  [this.$year, this.$month + 1].join(' - ');
		},

		// 根据当前年份&月份，输出该月排好序的日期数组
		createDays: function() {
			var year = this.$year, month = this.$month;
			var i = 1, day, days = [];
			var date, nextMonth, beginWeek, monthDays, seizes, isSeize, amount;

			// 从输入月份 1 号开始的时间对象
			date = new Date(year, month, 1);

			// 这个月从周几开始？ 0 周日 1 周一 ... 6 周六
			beginWeek = date.getDay();
			// 占位选项数量
			seizes = beginWeek === 0 ? 6 : beginWeek - 1;

			// 这个月有几天？
			nextMonth = month + 1;
			date.setMonth(nextMonth);
			date.setDate(0);
			monthDays = date.getDate();

			// 选项的数量
			amount = seizes + monthDays + 1;

			for (; i < amount; i++) {
				isSeize = i <= seizes;
				day = isSeize ? '-' : i - seizes;
				days.push({
					'seize': isSeize,
					'year' : year,
					'month': month,
					'date' : day,
					'today': false
				});
			}

			return days;
		},

		// 点击选择日期
		clickSelectDate: function(e) {
			var elm = e.target, vm = this.vm.get(), index, selectDate;

			if (elm.tagName !== 'LI') {
				return;
			}

			index = this.$.getAttr(elm, 'date-index');
			selectDate = vm.dates[index];
			this.updateDateValue(selectDate.year, selectDate.month, selectDate.date);

			this.vm.set({
				'showPannel': false,
				'select': this.getResult()
			});
		},

		// 更新年月日的当前值和结果值
		updateDateValue: function(year, month, date) {
			this.$year = this.$rYear = year || this.$rYear;
			this.$month = this.$rMonth = month || this.$rMonth;
			this.$date = this.$rDate = date || this.$rDate;
		},

		// 更新当前值和日期数组
		updateCurrentValue: function() {
			this.vm.set({
				'current': this.getCurrent(),
				'dates'  : this.createDays()
			});
			return this;
		},

		// 点击前一个月
		clickPrevMonth: function() {
			if (this.$month === 0) {
				this.$month = 11;
				this.$year--;
			}
			else {
				this.$month--;
			}
			this.updateCurrentValue();
		},

		// 点击下一个月
		clickNextMonth: function() {
			if (this.$month === 11) {
				this.$month = 0;
				this.$year++;
			}
			else {
				this.$month++;
			}
			this.updateCurrentValue();
		}
	});


	// 用同一个日期选择模块创建 3 个不同的实例：

	Sugar.core.create('date1', DatePicker, {
		'target': document.querySelector('#date1')
	});

	Sugar.core.create('date2', DatePicker, {
		'target': document.querySelector('#date2')
	});

	Sugar.core.create('date3', DatePicker, {
		'target': document.querySelector('#date3')
	});
});