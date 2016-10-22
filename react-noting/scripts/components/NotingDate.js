/**
 * NotingDate.js
 * @description [日期组件]
 * @author [惊鸿]
 * @link []
 * @Date 2016/10/8
 */

var React = require('react');
var Utils = require('../commons/utils.js');
var ReactPropTypes = React.PropTypes;

var NotingDate = React.createClass({
	getInitialState: function() {
		return {
			date: this.props.date || new Date()
		};
	},
	_processDate: function() {
		var _date = this.state.date;
		var dates = [];

		dates.push(_date.getFullYear());
		dates.push(_date.getMonth() + 1);
		dates.push(_date.getDate());
		dates.push(this._getWeekDay(_date.getDay()));

		return dates.join('/');
	},
	_getWeekDay: function(day) {
		var dayStr = ['日', '一', '二', '三', '四', '五', '六'];
		return '星期' + dayStr[day];
	},
	render: function() {
		var date = this._processDate();

		return (
			<div className="noting-date">
				<h3>{date}</h3>
			</div>
		);
	}
});

module.exports = NotingDate;