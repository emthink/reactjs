/**
 * NotingList.js
 */
var React = require('react');
var NotingAction = require('../actions/NotingActions');
var NotingInput = require('./NotingInput');
var NotingItem = require('./NotingItem');
var ReactPropTypes = React.PropTypes;

var NotingList = React.createClass({
	isAutoFocus: true,
	placeholderTxt: '添加一条新笔记',
	propTypes: {
		notings: ReactPropTypes.object.isRequired
	},
	render: function() {
		var notings = this.props.notings;
		var _notingList = [];

		if (Object.keys(notings).length < 1) {
			return null;
		}
		for (var key in notings) {
			_notingList.push(<NotingItem key={key} noting={notings[key]} />);
		}
		return (
			<div className="notings-wrap">
				<NotingInput autoFocus={this.isAutoFocus} placeholder={this.placeholderTxt} onSave={this._onSave} />
				<ul className="noting-list">{_notingList}</ul>
			</div>
		);
	},

	_onSave: function(content) {
		if (content.trim() !== '') {
			NotingAction.create(content);
		}
	}
});

module.exports = NotingList;
