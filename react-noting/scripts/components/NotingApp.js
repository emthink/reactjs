/**
 * NotingApp.js
 * @author [惊鸿]
 * @description [应用入口js]
 * @Date 2016/09/23
 */

var React = require('react');
var Link = require('react-router').Link;
var NotingDate = require('./NotingDate');

var NotingApp = React.createClass({
    
    getInitialState: function() {
        return {}
    },
    render: function() {
        var date = new Date();

        return (
            <div>
                <Link to="/index"><h2>React Noting</h2></Link>
                <NotingDate date={date} />
                {this.props.children}
            </div>
        );
    }
});

module.exports = NotingApp;
