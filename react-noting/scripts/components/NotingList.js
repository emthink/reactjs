/**
 * NotingList.js
 */
var React = require('react');
var NotingAction = require('../actions/NotingActions');
var NotingStore = require('../stores/NotingStore');
var NotingInput = require('./NotingInput');
var NotingItem = require('./NotingItem');
var Utils = require('../commons/utils.js');
var ReactPropTypes = React.PropTypes;

var indexNotingLength = 3;
function getNotingState(length) {
    var notings = NotingStore.getAllNotings();
    var _notings;

    _notings = Utils.sliceObj(notings, length);

    return {
        notings: _notings
    };
}

var NotingList = React.createClass({
	indexNotingLength: indexNotingLength,
	isAutoFocus: true,
	placeholderTxt: '添加一条新笔记',
	propTypes: {
		notings: ReactPropTypes.object
	},
	type: null,
	getInitialState: function() {
		var notings = getNotingState().notings;
		var _notings = this.props.notings || notings;

		this.type = this.props.params.type;
		if (this.type === 'all') {
			_notings = notings;
		}else {
			_notings = getNotingState(this.indexNotingLength).notings;
		}

        return {
            notings: _notings
        };
    },
    _onChange: function(data) {
        var notingsObj = getNotingState();
        var notings = notingsObj.notings;
        var _id = data.notingID;
        var _noting = {
            _id: notings[_id]
        };
        var _notings = Utils.sliceObj(notings, this.indexNotingLength);
        notings = Utils.extend(_notings, _noting);
        //notings = Utils.extend(Utils.sliceObj(notings, this.indexNotingLength), notings[data.notingID])
        this.setState({
            notings: notings
        });
    },
    shouldComponentUpdate: function() {
    	console.log(this.type, this.props);
    	return true;
    },
    componentDidMount: function() {
        NotingStore.bindChangeEvent(this._onChange);
    },
    componentWillUnMount: function() {
        NotingStore.removeChangeEvent(this._onChange);
    },
	render: function() {
		var notings = this.state.notings;
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
