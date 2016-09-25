/**
 * NotingList.js
 */
var React = require('react');
var ReactPropTypes = React.PropTypes;
var Utils = require('../commons/utils');

var NotingItem = React.createClass({
	propTypes: {
		noting: ReactPropTypes.object.isRequired
	},
	render: function() {
		var _noting = this.props.noting;

		if (!Utils.isPlainObject(_noting)) {
			return null;
		}
	
		return (
			<li className="notings-item" key={_noting.id}>
				<div className="noting-content">{_noting.content}</div>
			</li>
		);
	}
});

module.exports = NotingItem;
