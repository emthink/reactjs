/**
 * NotingRouter.js
 * @description [React-Noting应用路由模块]
 * @author [惊鸿]
 * @Date 2016/10/07
 */

var React = require('react');
var ReactRouter = require('react-router');
var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var IndexRoute = ReactRouter.IndexRoute;
var Link = ReactRouter.Link;
var browserHistory = ReactRouter.browserHistory;
var NotingApp = require('../components/NotingApp.js');
var NotingList = require('../components/NotingList.js');
var NotingItem = require('../components/NotingItem.js');

var NotingRouter = (
    <Router history={browserHistory}>
        <Route path="/" component={NotingApp}>
        	<IndexRoute component={NotingList} />
            <Route path="notings/:type" component={NotingList} />
            <Route path="noting/:id" component={NotingItem} />
        </Route>
    	<Route path="/index" component={NotingApp}>
    		<IndexRoute component={NotingList} />
    	</Route>
    </Router>
);

module.exports = NotingRouter;