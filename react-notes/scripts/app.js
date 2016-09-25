/**
 * [app.js 程序入口js]
 * @Date 2016.09.13
 */

var React = require('react');
var NotingApp = require('./components/NotingApp.js');
console.log(NotingApp);

React.render(
    <NotingApp />,
    document.querySelector('.noting-wrap')
)
