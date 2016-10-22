# React入门与进阶之路由

在传统的网页应用中，一般是根据用户的操作指向不同的url，然后服务器渲染出不同的html代码，后来有了ajax，在同一页面里，可以为不同操作，指定处理器函数，在不刷新页面的情况下更新局部视图，但是局限依然较大，一旦跳转了URL，依然需要服务器渲染模板返回；而在Backbone，Angular，React出现以后，在单页面应用中，我们可以给不同URL指定处理器函数，保持URL与视图的同步，渲染模板的功能已经转移到客户端进行，与服务器的交互只涉及到数据，这就是路由的功能。

## React中的路由

React是一个用户界面类库，仅相当于MVC模式中的V-view视图，其本身并不包含路由功能，但是它以模块的方式提供了路由功能，可以很好的与React进行协作开发，当然这也并不是必须使用的。现在很多单页应用框架都实现了各自的路由模块，如Backbone，Angular等。而这其中很多路由模块也能与React搭配使用。本文将介绍本人使用过的两种：Backbone.Router和react-router。

不使用路由模块，我们需要处理一个展示笔记列表和展示特定笔记对应不同视图时，React处理视图更新的方式大致如此：

```
    
    // 状态变量
    var NOTINGSTATUS = {
        SHOW: 0,
        EDIT: 1
    };
    
    // 模拟数据
    var notings ={
        10001: {
            id: 10001,
            title: 'React',
            content: 'React Router',
            status: NOTINGSTATUS.SHOW
        },
        10002: {
            id: 10002,
            title: 'Backbone',
            content: 'Backbone Router',
            status: NOTINGSTATUS.EDIT
        }
    };
    
    // React-Noting应用入口组件
    var NotingApp = React.createClass({
        getInitialState: function() {
            return {
                
            };
        },
        render: function() {
            return (
                <div>
                    <h1>React Noting</h1>
                    <NotingList notings={this.props.notings.slice(0, this.props.indexNotingListLength)}/>
                </div>
            );
        }
    });
    
    // 展示列表组件
    var NotingList = React.createClass({
        getNotings: function() {
            return notings;
        },
        getInitialState: function() {
            return {
                notings: this.props.notings || this.getNotings()
            };
        },
        render: function() {
            var notings = this.state.notings;
            var _notingList = [];
            
            for (var key in notings) {
                _notingList.push(<NotingItem key={key} noting={notings[key]} />);
            }
            return (
                <div>
                    <ul>{_notingList}</ul>
                </div>
            );
        }
    });
    // 展示特定项组件
    var NotingItem = React.createClass({
        getInitialState: function() {
            return {
                noting: this.props.noting,
                status: this.props.noting.status
            };
        },
        editNote: function() {
            this.setState({
                status: NOTINGSTATUS.EDIT;
            });
        },
        render: function() {
            var status = this.state.status;
            var noting = this.state.noting;
            
            if (status === NOTINGSTATUS.EDIT) {
                return (
                    <li>
                        <input type="text" value={noting.title} autoFocus={true} />
                    </li>
                );
            }else if (status === NOTINGSTATUS.SHOW) {
                return (
                    <li>
                        <h3 onClick={this.editNote}>{noting.title}</h3>
                    </li>
                );
            }
        }
    });

    var indexNotingListLength = 3;
    React.render(
        <NotingApp notings={notings} length={indexNotingListLength} />,
        document.querySelector('.noting-wrap')
    );
```

如上，没有路由模块管理，只是通过返回的组件状态变更，更新对应视图，随着应用越来越大处理会越发繁琐，接下来我们通过使用路由管理URL和视图的同步的方式来达到相同目的。

## Backbone.Router

Backbone是一种MVC（Model-View-Controller）模式的框架，其路由模块属于Controller层，独立于其他模块，可以很好的与React搭配使用，之前的例子使用Backbone.Router实现后如下：

```

    var NOTINGSTATUS = {
        SHOW: 0,
        EDIT: 1
    };
    var NOTINGROUTERTYPE = {
        LIST: 0,
        ITEM: 1
    };
    
    var NotingRouter = Backbone.Router.extend({
        routes; {
            '/': 'index',
            'notings': 'showNotings',
            'notings/:id': 'showNoting'
        },
        render: function(type, extraData) {
            if (type === NOTINGROUTERTYPE.LIST) {
                React.render(
                    <NotingList notings={notings} />,
                    document.querySelector('.noting-wrap')
                );
            }else if (type === NOTINGROUTERTYPE.ITEM) {
                React.render(
                    <NotingItem noting={notings[extraData.id]} />,
                    document.querySelector('.noting-wrap');
                );
            }
        },
        index: function() {
            
        },
        showNotings: function() {
            this.render(NOTINGROUTERTYE.LIST);
        },
        showNoting: function(id) {
            this.render(NOTINGROUTERTYPE.ITEM, {id: id});
        }
    });
    
    var notingRouter = new NotingRouter();
    Backbone.history.start();
```

如上，如果访问一个如/notings的URL地址，将会展示所以noting，而访问诸如/notings/123这种的URL则会展示特定id为123的noting。

了解更多关于Backbone路由的信息，可以查看[http://backbonejs.org/#Router](http://backbonejs.org/#Router)。

## react-router

**注：react-router 1.0.x和0.13.x两个大版本之前API语法有差别，本文使用最新的语法介绍react-router。**

我们在前文了解了Backbone.Router如何作为路由模块与React搭配使用，现在继续学习react-router。

[本文相关代码可点击此处查看https://github.com/codingplayboy/reactjs/tree/master/react-noting](https://github.com/codingplayboy/reactjs/tree/master/react-noting)

不同于Backbone的路由模块，react-router完全由React组件（component）构成：路由本身被定义成组件使用，而其内部路由分发处理器也定义成组件的形式使用。

现在让给我们继续使用react-router来实现之前展示noting的例子的路由管理：

```
    
    var Router = require('react-router').Router;
    var Route = require('react-router').Route;
    var Link = require('react-router').Link;
    
    
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
    	}
    });
    
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

```
如上为React Component主要代码，路由模块代码如下：

```

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
    
    React.render(
        NotingRouter,
        document.querySelector('.noting-wrap')
    );
```

如上路由，用户访问跟路由/或/index时（比如http://localhost:3000/或http://localhost:3000/index）,页面加载NotingApp组件，访问诸如/notings/all时将在NotingApp下加载NotingList组件，访问/noting/123路径时，则将在NotingApp下加载NotingItem组件。

### 获取URL参数

React路由支持我们通过 query 字符串来访问URL参数。比如访问 noting/1234?name=jh，你可以通过访问 this.props.location.query.来访问URL参数对象，通过this.props.location.query.name从Route组件中获得"jh"值。

### 路由配置
路由配置是一系列嵌套指令，它定义路由如何匹配URL和匹配URL后的操作（具体而言，即组件切换或更新）。

#### Router

React所有路由实例必须包含在< Router>标签内，以组件形式定义，该组件有history属性，其值有三种，将在后文介绍。

#### Route

定义具体路由节点使用Route指令，该指令有许多属性：

- path

    声明该路由节点所匹配URL（绝对路径）或URL片段（相对路径）字符串值，若该属性未赋值，则表示此路由节点不需匹配URL，直接嵌套渲染组件。

- component

    特定URL匹配到该节点时，渲染此路由节点定义的组件，如此，层层嵌套下去。
    
**this.props.children--Render，对应当前路由的默认子路由，将渲染返回默认子路由的组件。 **

#### IndexRoute

默认情况下，this.props.children值是undefined，即默认子路由不存在，我们可以通过IndexRoute指令指定路由的默认子路由，匹配且仅匹配到当前路由的URL将层层渲染路由组件到此默认子路由组件。

#### Redirect

顾名思义，这是一个重定向指令，很多时候我们可能改变了某些URL,之前的和改变后的URL都需要匹配该路由，这时，就需要使用Redirect指令：

```

    React.render((
      <Router>
        <Route path="/" component={App}>
          <IndexRoute component={Dashboard} />
          <Route path="about" component={About} />
          <Route path="inbox" component={Inbox}>
            {/* Redirect /inbox/messages/:id to /messages/:id */}
            <Redirect from="messages/:id" to="/messages/:id" />
          </Route>
    
          <Route component={Inbox}>
            <Route path="messages/:id" component={Message} />
          </Route>
        </Route>
      </Router>
    ), document.body);
```

#### onEnter 和onLeave钩子

React路由也可以定义onEnter和onLeave钩子函数（Hooks），在路由变更发生时触发，分别表示在离开某路由，进入某路由触发定义的钩子回调函数。

- onLeave

    路由变更时，首先触发onLeave钩子回调函数，且在离开的所有定义过的路由都会由外到内触发。

- onEnter

    路由变更时，接着onLeave钩子回调函数执行后，会从外到内层层触发onEnter回调函数。


#### JSX和Plain Object

React提供JSX语法开发React应用，也支持原生JavaScript语法，路由模块也是，对于路由，可以使用Object对象的形式定义：

var routes = {
};
render(<Router routes={routes} />, document.body);

**原生语法不支持Redirect指令，我们只能使用onEnter钩子，在回调函数里面处理重定向。**

### 路由匹配(Route Matching)

如果想要明白路由如何匹配某特定URL，就必须学习路由的三个相关概念和属性：

- 嵌套关系（nesting）
- 路径语法（path）
- 优先级（precedence）

#### 嵌套关系（nesting）

React路由嵌套路由的概念，就像DOM树一样；应用路由以嵌套的形式定义，路由对应的视图组件也形成嵌套，
当访问的特定URL层层向下匹配成功时，最后的匹配路由节点及其所有嵌套父级路由对应的组件都将被渲染。

> React Router traverses the route config depth-first searching for a route that matches the URL.
> React路由会对路由配置进行深度优先搜索，以找到匹配特定URL的路由。

#### 路径语法(path syntax)

路由的path属性值是字符串类型，能匹配特定URL或该URL的部分，除了可能包含的以下特殊符号，该值都是按照字面量进行解释的：

- :paramName 路由参数，匹配特定URL中/，?或#字符后面的部分
- () 表示URL中该部分是可选的
- * 匹配任意数量任意字符，直到下一个匹配点
- ** 匹配任意字符，直到遇见/,?或#字符，并且会产生一个splat参数
  
```

    <Route path="/notings/:id">        // matches /notings/23 and /notings/12345
    <Route path="/notings(/:id)">      // matches /notings, /notings/23, and /notings/12345
    <Route path="/blog/*.*">           // matches /blog/a.jpg and /blog/a.html
    <Route path="/**/*.html">          // matches /blog/a.html and /blogs/demo/b.html
```

##### 路由的相对路径与绝对路径

- 绝对路径，即以/开头的路径字符串，是一个独立的路径
- 相对路径，不以/开头，相对于其父级路由路径值

> If a route uses a relative path, it builds upon the accumulated path of its ancestors.
Nested routes may opt-out of this behavior by using an absolute path.

> 如果一个路由使用的是相对路径，则该路由匹配的URL是由该路由路劲及其所有祖先路由节点路径值从外到内拼接组成；
若使用的是绝对路径，则该路由就忽略嵌套关系直接匹配URL。
 
#### 优先级（precedence）

路由算法按照路由定义的顺序，从上到下匹配URL，所以，在有两个或多个同级路由节点时，必须保证前面的路由不能与后面的路由匹配同一个URL。

### History
 
History可以监听浏览器地址栏的变化并且能把URL解析成一个location对象，React路由基于History，
将URL解析成location对象，然后使用该对象来匹配路由并且正确的嵌套渲染组件。

React提供了三种最常用的history，当然react router也支持我们实现自定义history:

- browserHistory
- hashHistory
- createMemoryHistory


我们可以直接从react router包中直接导入这些history:

```
    
    // CommonJs require方式
    var browserHistory = require('react-router').browserHistory;
    var hashHistory = require('react-router').hashHistory;
    
    // ES6 module import
    import { browserHistory } from 'react-router';
    import { hashHistory } from 'react-router';
    
    React.render(
      <Router history={browserHistory} routes={routes} />,
      document.getElementById('app')
    );
```

他们都是有对应的create方法产生创建的，更多查看https://github.com/mjackson/history/：

- createBrowserHistory is for use in modern web browsers that support the HTML5 history API (see cross-browser compatibility)
- createMemoryHistory is used as a reference implementation and may also be used in non-DOM environments, like React Native
- createHashHistory is for use in legacy web browsers

```

    // JavaScript 模块导入（译者注：ES6 形式）
    import createBrowserHistory from 'history/lib/createBrowserHistory';
    // 或者以 commonjs 的形式导入
    const createBrowserHistory = require('history/lib/createBrowserHistory';
```

#### browserHistory

browserHistory适合利用React路由开发的浏览器应用使用。在浏览器中，通过History API创建以管理真实URL，比如创建一个新的URL:example.com/some/path。
使用该类型history前，我们必须对服务器进行配置，对所有URL，我们都返回同一html文件，如：index.html。

- 若使用node服务，则需要添加以下设置：

    ```
    
        // handle every other route with index.html, which will contain
        // a script tag to your application's JavaScript file(s).
        app.get('*', function (request, response){
          response.sendFile(path.resolve(__dirname, 'public', 'index.html'))
        });
    ```
    
- 对于nginx服务器，需添加如下配置：

    ```
    
        server {
              //...
              location / {
                    try_files $uri /index.html;
              }
        }
    ```

- 对于Apache服务器，首先在项目根目录下创建一个.htaccess文件，添加如下代码:

    ```
    
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    ```
 
##### 兼容性与IE8+

通过使用特性检测检测是否支持浏览器本地window.history相关API，
如果不支持，如IE8/9，为了更方便的开发，及更好的用户体验，在每次URL变更通过刷新页面来兼容旧浏览器。


**注：index.html引入js文件必须是绝对路径，否则找不到该文件**

#### hashHistory

hashHistory使用URL的hash(#)片段，创建诸如example.com/#/some/path的路径。

##### hashHistory与browserHistory

使用hashHistory不需要配置服务器，并且兼容IE8+，但是依然不推荐使用，
因为每一个web应用，都应该有清晰的URL地址变化，并且需要支持服务器端渲染，这些对于hashHistory来说是不可能实现的。

但是，如果在不支持window.historyAPI的老旧浏览器中，我们也不希望每次操作变更都刷新页面，这时候是需要hashHistory的。

#### createMemoryHistory

memoryHistory不操作或读取浏览器地址栏URL，它存在于内存中，我们使用它实现服务器渲染，适用于测试或渲染环境，如React Native。

不同于前两种history,React已经为我们创建好了，memoryHistory，必须在应用中主动创建：

```

    var createMemoryHistory = require('react-router').createMemoryHistory;
    var history = createMemoryHistory(location);
```

#### 实例

```

    var React = require('react');
    var render = require('react-dom');
    var browserHistory = require('react-router').browserHistory;
    var Router = require('react-router').Router;
    var Route = require('react-router').Route;
    var IndexRoute = require('react-router').IndexRoute;
    var App = require( '../components/App');
    var Home = require('../components/Home');
    var About = require('../components/About');
    var Features = require('../components/Features');

    React.render(
      <Router history={browserHistory}>
        <Route path='/' component={App}>
          <IndexRoute component={Home} />
          <Route path='about' component={About} />
          <Route path='features' component={Features} />
        </Route>
      </Router>,
      document.getElementById('app')
    );
```


### 默认路由及相关默认指令(IndexRoute，IndexRedirect和IndexLink)

#### Index Route

前文已经介绍< IndexRoute>指令，该指令声明当前路由的默认子路由及其对应需默认渲染的组件，更多请查看上文。

#### Index Redirects

有时候，我们在访问URL的时候，希望将当前路由默认重定向到另一路由，与前文的Redirect指令不同，Redirect指令是将匹配from属性值对应的路由的URL重定向到匹配to属性值对应的路由的URL；而IndexRedirect，是将当前路由的默认子路由重定向为其他子路由，重定向对象是当前路由的子路由。

#### Index Links

- Link

    React直接提供Link链接组件，to属性声明链接到的地址：
    
    ```
    
        var Link = require('react-router').Link;
        
        var app = React.createClass({
            render: function() {
                return(
                    <Link to="/notings">noting列表</Link>
                );
            }
        });
        
        React.render(<app />, document.body);
    ```

如上，点击noting列表将导航到项目noting列表展示页，即/notings路由下。

- IndexLink

    不同于Link指令，Link指令是提供一个链接，而React路由的Link是有激活状态的，如它的activeStyle属性，可以声明链接被激活时的样式，假如有一个Link链接<Link to="/notings">noting列表</Link>，当/notings路由或其子路由（如/notings/123）被渲染时，都会使该链接处于激活状态；而如果使用<IndexLink to="/notings">noting列表</IndexLink>，则需要/notings路由被渲染后才激活该链接。

[本文相关代码可点击此处查看https://github.com/codingplayboy/reactjs/tree/master/react-noting](https://github.com/codingplayboy/reactjs/tree/master/react-noting)

