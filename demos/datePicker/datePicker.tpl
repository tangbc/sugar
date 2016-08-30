<input class="result-btn" type="button"
	v-bind:value="select"
	v-on:click="clickResultBtn"
>
<!-- 日期选择面板 -->
<div class="pannel" v-show="showPannel" v-on:click="clickPannel">
	<div class="banner">
		<span class="prev-month" v-on:click="clickPrevMonth"><</span>
		<span class="curr-date">{{ current }}</span>
		<span class="next-month" v-on:click="clickNextMonth">></span>
	</div>
	<!-- 星期容器 -->
	<ul class="week-list">
		<li class="week-item" v-for="week in weeks">{{ week }}</li>
	</ul>
	<!-- 日期容器 -->
	<ul class="date-list">
		<li class="date-item"
			v-on:click="clickSelectDate($index)"
			v-for="date in dates" v-bind:class="{seize: date.seize, today: date.today}"
		>
			{{ date.date }}
		</li>
	</ul>
</div>