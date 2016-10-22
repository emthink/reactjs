/**
 * NotingItem.js
 */
var React = require('react');
var Link = require('react-router').Link;
var ReactPropTypes = React.PropTypes;
var NotingStore = require('../stores/NotingStore');
var Utils = require('../commons/utils');

function getNotingState(id) {
    var notings = NotingStore.getAllNotings();
    return notings[id];
}

var NotingItem = React.createClass({
	propTypes: {
		noting: ReactPropTypes.object
	},
	getInitialState: function() {
		return {
			noting: this.props.noting || getNotingState(this.props.params.id)
		};
	},
	render: function() {
		var _noting = this.state.noting;
		var _btn;

		if (!Utils.isPlainObject(_noting)) {
			return null;
		}

		if (this.props.params && this.props.params.id) {
			_btn = <Link to="/notings/all">Show More</Link>;
		}else {
			_btn = <Link to={{pathname:'/noting/' + _noting.id}}>Read More</Link>;
		}
	
		return (
			<li className="notings-item" key={_noting.id}>
				<h3 className="noting-title">{_noting.title}</h3>
				<div className="noting-content">{_noting.content}</div>
				{_btn}
			</li>
		);
	}
});

module.exports = NotingItem;
