/**
 * NotingApp.js
 * @author [惊鸿]
 * @description [应用入口js]
 * @Date 2016/09/23
 */

var React = require('react');
var NotingStore = require('../stores/NotingStore');
var NotingList = require('./NotingList');

function getNotingState() {
    console.log(NotingStore.getAllNotings());
    return {
        notings: NotingStore.getAllNotings()
    };
}

var NotingApp = React.createClass({
    _onChange: function() {
        this.setState(getNotingState());
    },
    getInitialState: function() {
        return getNotingState();
    },
    componentDidMount: function() {
        NotingStore.bindChangeEvent(this._onChange);
    },
    componentWillUnMount: function() {
        NotingStore.removeChangeEvent(this._onChange);
    },
    render: function() {
        return (
            <div>
                <h2>React Noting</h2>
                <NotingList notings={this.state.notings}></NotingList>
            </div>
        );
    }
});

module.exports = NotingApp;
