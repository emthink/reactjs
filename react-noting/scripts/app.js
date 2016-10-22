/**
 * [app.js 程序入口js]
 * @Date 2016.09.13
 */

var React = require('react');
var NotingRouter = require('./router/NotingRouter.js');

React.render(
    NotingRouter,
    document.querySelector('.noting-wrap')
);
