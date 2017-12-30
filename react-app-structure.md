# React应用架构设计

在上一篇我们介绍了[Webpack自动化构建React应用](https://github.com/codingplayboy/react-blog/blob/master/docs/initWebpack.md)，我们的本地开发服务器可以较好的支持我们编写React应用，并且支持代码热更新。本节将开始详细分析如何搭建一个React应用架构。

[完整项目代码见github](https://github.com/codingplayboy/react-blog)

## 前言

现在已经有很多脚手架工具，如[create-react-app](https://github.com/facebookincubator/create-react-app)，支持一键创建一个React应用项目结构，很方便，但是享受方便的同时，也失去了对项目架构及技术栈完整学习的机会，而且通常脚手架创建的应用技术架构并不能完全满足我们的业务需求，需要我们自己修改，完善，所以如果希望对项目架构有更深掌控，最好还是从0到1理解一个项目。

## 项目结构与技术栈

我们这次的实践不准备使用任何脚手架，所以我们需要自己创建每一个文件，引入每一个技术和三方库，最终形成完整的应用，包括我们选择的完整技术栈。

第一步，当然是创建目录，我们在上一篇已经弄好，如果你还没有代码，可以从Github获取：

```shell
git clone https://github.com/codingplayboy/react-blog.git
cd react-blog
```

生成项目结构如下图：

![React项目初始结构](http://blog.codingplayboy.com/wp-content/uploads/2017/12/project-dir-struc-init.png)

1. `src`为应用源代码目录；
2. `webpack`为webpack配置目录；
3. `webpack.config.js`为webpack配置入口文件；
4. `package.json`为项目依赖管理文件；
5. `yarn.lock`为项目依赖版本锁文件；
6. `.babelrc`文件，babel的配置文件，使用babel编译React和JavaScript代码；
7. `eslintrc`和`eslintignore`分别为eslint语法检测配置及需要忽略检查的内容或文件；
8. `postcss.config.js`为CSS后编译器postcss的配置文件；
9. `API.md`为API文档入口；
10. `docs`为文档目录；
11. `README.md`为项目说明文档；

接下来的工作主要就是丰富`src`目录，包括搭建项目架构，开发应用功能，还有自动化，单元测试等，本篇主要关注项目架构的搭建，然后使用技术栈实践开发几个模块。

### 技术栈

项目架构搭建很大部分依赖于项目的技术栈，所以先对整个技术栈进行分析，总结：

1. react和react-dom库是项目前提；
2. react路由；
3. 应用状态管理容器；
4. 是否需要Immutable数据；
5. 应用状态的持久化；
6. 异步任务管理；
7. 测试及辅助工具或函数；
8. 开发调试工具；

根据以上划分决定选用以下第三方库和工具构成项目的完整技术栈：

1. react，react-dom；
2. react-router管理应用路由；
3. redux作为JavaScript状态容器，react-redux将React应用与redux连接；
4. Immutable.js支持Immutable化状态，redux-immutable使整个redux store状态树Immutable化；
5. 使用redux-persist支持redux状态树的持久化，并添加redux-persist-immutable拓展以支持Immutable化状态树的持久化；
6. 使用redux-saga管理应用内的异步任务，如网络请求，异步读取本地数据等；
7. 使用jest集成应用测试，使用lodash，ramda等可选辅助类，工具类库；
8. 可选使用reactotron调试工具

针对以上分析，完善后的项目结构如图：

![React-Redux项目结构](http://blog.codingplayboy.com/wp-content/uploads/2017/12/react-redux-project-dir-struc.png)

## 开发调试工具

React应用开发目前已经有诸多调试工具，常用的如redux-devtools，[Reactron](https://github.com/infinitered/reactotron)等。

### redux-devtools

redux-devtools是支持热重载，回放action，自定义UI的一款Redux开发工具。

首先需要按照对应的浏览器插件，然后再Redux应用中添加相关配置，就能在浏览器控制台中查看到redux工具栏了，[详细文档点此查看](https://github.com/zalmoxisus/redux-devtools-extension#installation)。

然后安装项目依赖库：

```shell
yarn add --dev redux-devtools
```

然后在创建redux store时将其作为redux强化器传入`createStore`方法：

```javascript
import { applyMiddleware, compose, createStore, combineReducers } from 'redux'
// 默认为redux提供的组合函数
let composeEnhancers = compose

if (__DEV__) {
  // 开发环境，开启redux-devtools
  const composeWithDevToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  if (typeof composeWithDevToolsExtension === 'function') {
    // 支持redux开发工具拓展的组合函数
    composeEnhancers = composeWithDevToolsExtension
  }
}

// create store
const store = createStore(
  combineReducers(...),
  initialState,
  // 组合redux中间价和加强器，强化redux
  composeEnhancers(
    applyMiddleware(...middleware),
    ...enhancers
  )
)
```

1. 在开发环境下获取redux-devtools提供的拓展组合函数；
2. 创建store时使用拓展组合函数组合redux中间件和增强器，redux-dev-tools便获得了应用redux的相关信息；

### Reactotron

[Reactotron](https://github.com/infinitered/reactotron)是一款跨平台调试React及React Native应用的桌面应用，能动态实时监测并输出React应用等redux，action，saga异步请求等信息，如图：

![Reactotron](https://github.com/infinitered/reactotron/raw/master/docs/images/readme/reactotron-demo-app.gif)

首先安装：

```shell
yarn add --dev reactotron-react-js
```

然后初始化Reactotron相关配置：

```react
import Reactotron from 'reactotron-react-js';
import { reactotronRedux as reduxPlugin } from 'reactotron-redux';
import sagaPlugin from 'reactotron-redux-saga';

if (Config.useReactotron) {
  // refer to https://github.com/infinitered/reactotron for more options!
  Reactotron
    .configure({ name: 'React Blog' })
    .use(reduxPlugin({ onRestore: Immutable }))
    .use(sagaPlugin())
    .connect();

  // Let's clear Reactotron on every time we load the app
  Reactotron.clear();

  // Totally hacky, but this allows you to not both importing reactotron-react-js
  // on every file.  This is just DEV mode, so no big deal.
  console.tron = Reactotron;
}
```

然后启使用`console.tron.overlay`方法拓展入口组件：

```react
import './config/ReactotronConfig';
import DebugConfig from './config/DebugConfig';

class App extends Component {
  render () {
    return (
      <Provider store={store}>
        <AppContainer />
      </Provider>
    )
  }
}

// allow reactotron overlay for fast design in dev mode
export default DebugConfig.useReactotron
  ? console.tron.overlay(App)
  : App
```

至此就可以使用Reactotron客户端捕获应用中发起的所有的redux和action了。

## 组件划分

React组件化开发原则是组件负责渲染UI，组件不同状态对应不同UI，通常遵循以下组件设计思路：

1. 布局组件：仅仅涉及应用UI界面结构的组件，不涉及任何业务逻辑，数据请求及操作；
2. 容器组件：负责获取数据，处理业务逻辑，通常在render()函数内返回展示型组件；
3. 展示型组件：负责应用的界面UI展示；
4. UI组件：指抽象出的可重用的UI独立组件，通常是无状态组件；

|         | 展示型组件            | 容器组件                   |
| ------- | ---------------- | ---------------------- |
| 目标      | UI展示 (HTML结构和样式) | 业务逻辑（获取数据，更新状态）        |
| 感知Redux | 无                | 有                      |
| 数据来源    | props            | 订阅Redux store          |
| 变更数据    | 调用props传递的回调函数   | Dispatch Redux actions |
| 可重用     | 独立性强             | 业务耦合度高                 |

## Redux

现在的任何大型web应用如果少了状态管理容器，那这个应用就缺少了时代特征，可选的库诸如mobx，redux等，实际上大同小异，各取所需，以redux为例，redux是最常用的React应用状态容器库，对于React Native应用也适用。

> Redux是一个JavaScript应用的可预测状态管理容器，它不依赖于具体框架或类库，所以它在多平台的应用开发中有着一致的开发方式和效率，另外它还能帮我们轻松的实现时间旅行，即action的回放。

![redux-flow](http://blog.codingplayboy.com/wp-content/uploads/2017/12/redux-flow.png)

1. 数据单一来源原则：使用Redux作为应用状态管理容器，统一管理应用的状态树，它推从数据单一可信来源原则，所有数据都来自redux store，所有的数据更新也都由redux处理；
2. redux store状态树：redux集中管理应用状态，组织管理形式就好比DOM树和React组件树一样，以树的形式组织，简单高效；
3. redux和store：redux是一种Flux的实现方案，所以创建了store一词，它类似于商店，集中管理应用状态，支持将每一个发布的action分发至所有reducer；
4. action：以对象数据格式存在，通常至少有type和payload属性，它是对redux中定义的任务的描述；
5. reducer：通常是以函数形式存在，接收state（应用局部状态）和action对象两个参数，根据action.type(action类型)执行不同的任务，遵循函数式编程思想；
6. dispatch：store提供的分发action的功能方法，传递一个action对象参数；
7. createStore：创建store的方法，接收reducer，初始应用状态，redux中间件和增强器，初始化store，开始监听action；

### 中间件（Redux Middleware）

Redux中间件，和Node中间件一样，它可以在action分发至任务处理reducer之前做一些额外工作，dispatch发布的action将依次传递给所有中间件，最终到达reducer，所以我们使用中间件可以拓展诸如记录日志，添加监控，切换路由等功能，所以中间件本质上只是拓展了`store.dispatch`方法。

![redux-middleware-enhancer](http://blog.codingplayboy.com/wp-content/uploads/2017/12/redux-middleware-enhancer.png)

### 增强器（Store Enhancer）

有些时候我们可能并不满足于拓展`dispatch`方法，还希望能增强store，redux提供以增强器形式增强store的各个方面，甚至可以完全定制一个store对象上的所有接口，而不仅仅是`store.dispatch`方法。

```javascript
const logEnhancer = (createStore) => (reducer, preloadedState, enhancer) => {
  const store = createStore(reducer, preloadedState, enhancer)
  const originalDispatch = store.dispatch
  store.dispatch = (action) => {
    console.log(action)
    originalDispatch(action)
  }
  
  return store
}
```

最简单的例子代码如上，新函数接收redux的createStore方法和创建store需要的参数，然后在函数内部保存store对象上某方法的引用，重新实现该方法，在里面处理完增强逻辑后调用原始方法，保证原始功能正常执行，这样就增强了store的dispatch方法。

可以看到，增强器完全能实现中间件的功能，其实，中间件就是以增强器方式实现的，它提供的`compose`方法就可以组合将我们传入的增强器拓展到store，而如果我们传入中间件，则需要先调用`applyMiddleware`方法包装，内部以增强器形式将中间件功能拓展到`store.dispatch`方法

### react-redux

Redux是一个独立的JavaScript应用状态管理容器库，它可以与React、Angular、Ember、jQuery甚至原生JavaScript应用配合使用，所以开发React应用时，需要将Redux和React应用连接起来，才能统一使用Redux管理应用状态，使用官方提供的[react-redux](https://github.com/reactjs/react-redux)库。

```react
class App extends Component {
  render () {
    const { store } = this.props
    return (
      <Provider store={store}>
        <div>
          <Routes />
        </div>
      </Provider>
    )
  }
}
```

> react-redux库提供`Provider`组件通过context方式向应用注入store，然后可以使用`connect`高阶方法，获取并监听store，然后根据store state和组件自身props计算得到新props，注入该组件，并且可以通过监听store，比较计算出的新props判断是否需要更新组件。

更多关于react-redux的内容可以阅读之前的文章：[React-Redux分析](http://blog.codingplayboy.com/2017/09/25/react-redux/)。

### createStore

使用redux提供的`createStore`方法创建redux store，但是在实际项目中我们常常需要拓展redux添加某些自定义功能或服务，如添加redux中间件，添加异步任务管理saga，增强redux等：

```react
// creates the store
export default (rootReducer, rootSaga, initialState) => {
  /* ------------- Redux Configuration ------------- */
  // Middlewares
  // Build the middleware for intercepting and dispatching navigation actions
  const blogRouteMiddleware = routerMiddleware(history)
  const sagaMiddleware = createSagaMiddleware()
  const middleware = [blogRouteMiddleware, sagaMiddleware]

  // enhancers
  const enhancers = []
  let composeEnhancers = compose

  // create store
  const store = createStore(
    combineReducers({
      router: routerReducer,
      ...reducers
    }),
    initialState,
    composeEnhancers(
      applyMiddleware(...middleware),
      ...enhancers
    )
  )
  sagaMiddleware.run(saga)

  return store;
}
```

### redux与Immutable

redux默认提供了`combineReducers`方法整合reduers至redux，然而该默认方法期望接受原生JavaScript对象并且它把state作为原生对象处理，所以当我们使用`createStore`方法并且接受一个Immutable对象作应用初始状态时，`reducer`将会返回一个错误，源代码如下：

```react
if   (!isPlainObject(inputState)) {
	return   (                              
    	`The   ${argumentName} has unexpected type of "` +                                    ({}).toString.call(inputState).match(/\s([a-z|A-Z]+)/)[1] +
      ".Expected argument to be an object with the following + 
      `keys:"${reducerKeys.join('", "')}"`   
	)  
}
```

如上表明，原始类型reducer接受的state参数应该是一个原生JavaScript对象，我们需要对`combineReducers`其进行增强，以使其能处理Immutable对象，`redux-immutable` 即提供创建一个可以和[Immutable.js](https://facebook.github.io/immutable-js/)协作的Redux [combineReducers](http://redux.js.org/docs/api/combineReducers.html)。

```react
import { combineReducers } from 'redux-immutable';
import Immutable from 'immutable';
import configureStore from './CreateStore';

// use Immutable.Map to create the store state tree
const initialState = Immutable.Map();

export default () => {
  // Assemble The Reducers
  const rootReducer = combineReducers({
    ...RouterReducer,
    ...AppReducer
  });

  return configureStore(rootReducer, rootSaga, initialState);
}
```

如上代码，可以看见我们传入的`initialState`是一个`Immutable.Map`类型数据，我们将redux整个state树丛根源开始Immutable化，另外传入了可以处理Immutable state的reducers和sagas。

另外每一个state树节点数据都是Immutable结构，如`AppReducer`：

```react
const initialState = Immutable.fromJS({
  ids: [],
  posts: {
    list: [],
    total: 0,
    totalPages: 0
  }
})

const AppReducer = (state = initialState, action) => {
  case 'RECEIVE_POST_LIST':
  	const newState = state.merge(action.payload)
  	return newState || state
  default:
  	return state
}
```

这里默认使用Immutable.fromJS()方法状态树节点对象转化为Immutable结构，并且更新state时使用Immutable方法`state.merge()`，保证状态统一可预测。

## React路由

在React web单页面应用中，页面级UI组件的展示和切换完全由路由控制，每一个路由都有对应的URL及路由信息，我们可以通过路由统一高效的管理我们的组件切换，保持UI与URL同步，保证应用的稳定性及友好体验。

### react-router

React Router是完整的React 路由解决方案，也是开发React应用最常使用的路由管理库，只要用过它，绝对会喜欢上它的设计，它提供简单的API，以声明式方式实现强大的路由功能，诸如按需加载，动态路由等。

1. 声明式：语法简洁，清晰；
2. 按需加载：延迟加载，根据使用需要判断是否需要加载；
3. 动态路由：动态组合应用路由结构，更灵活，更符合组件化开发模式；

### 动态路由与静态路由

使用react-router v4版本可以定义跨平台的应用动态路由结构，所谓的动态路由（Dynamic Routing）即在渲染过程中发生路由的切换，而不需要在创建应用前就配置好，这也正是其区别于静态路由（Static Routing）所在，动态路由提高更灵活的路由组织方式，而且更方便编码实现路由按需加载组件。

在react-router v2和v3版本中，开发React应用需要在开始渲染前就定义好完整的应用路由结构，所有的路由都需要同时初始化，才能在应用渲染后生效，会产生很多嵌套化路由，丧失了动态路由的灵活性和简洁的按需加载编码方式。

### react-router v4.x

在react-router 2.x和3.x版本中，定义一个应用路由结构通常如下：

```react
import React from 'react'
import ReactDOM from 'react-dom'
import { browserHistory, Router, Route, IndexRoute } from 'react-router'

import App from '../components/App'
import Home from '../components/Home'
import About from '../components/About'
import Features from '../components/Features'

ReactDOM.render(
  <Router history={browserHistory}>
    <Route path='/' component={App}>
      <IndexRoute component={Home} />
      <Route path='about' component={About} />
      <Route path='features' component={Features} />
    </Route>
  </Router>,
  document.getElementById('app')
)
```

很简单，但是所有的路由结构都需要在渲染应用前，统一定义，层层嵌套；而且如果要实现异步按需加载还需要在这里对路由配置对象进行修改，使用`getComponent`API，并侵入改造该组件，配合webpack的异步打包加载API，实现按需加载：

1. 路由层层嵌套，必须在渲染应用前统一声明；
2. API不同，需要使用`getComponent`，增加路由配置对象的复杂性；
3. `<Route>`只是一个声明路由的辅助标签，本身无意义；

而使用react-router v4.x则如下：

```react
// react-dom (what we'll use here)
import { BrowserRouter } from 'react-router-dom'

ReactDOM.render((
  <BrowserRouter>
    <App/>
  </BrowserRouter>
), el)

const App = () => (
  <div>
    <nav>
      <Link to="/about">Dashboard</Link>
    </nav>
    <Home />
    <div>
      <Route path="/about" component={About}/>
      <Route path="/features" component={Features}/>
    </div>
  </div>
)
```

相比之前版本，减少了配置化的痕迹，更凸显了组件化的组织方式，而且在渲染组件时才实现该部分路由，而如果期望按需加载该组件，则可以通过封装实现一个支持异步加载组件的高阶组件，将经过高阶组件处理后返回的组件传入`<Route>`即可，依然遵循组件化形式：

1. 灵活性：路由可以在渲染组件中声明，不需依赖于其他路由，不需要集中配置；
2. 简洁：统一传入`component`，保证路由声明的简洁性；
3. 组件化：`<Route>`作为一个真实组件创建路由，可以渲染；

#### 路由钩子方法

另外需要注意的是，相对于之前版本提供`onEnter`, `onUpdate`, ` onLeave`等钩子方法API在一定程度上提高了对路由的可控性，但是实质只是覆盖了渲染组件的生命周期方法，现在我们可以通过路由渲染组件的生命周期方法直接控制路由，如使用`componentDidMount` 或 `componentWillMount` 代替 `onEnter`。

### 路由与Redux

同时使用React-Router和Redux时，大多数情况是正常的，但是也可能出现路由变更组件未更新的情况，如：

1. 我们使用redux的`connect`方法将组件连接至redux：`connect(Home)`;
2. 组件不是一个路由渲染组件，即不是使用`Route>`组件形式：`<Route component={Home} />`声明渲染的；

这是为什么呢？，因为Redux会实现组件的`shouldComponentUpdate`方法，当路由变化时，该组件并没有接收到props表明发生了变更，需要更新组件。

那么如何解决问题呢？，要解决这个问题只需要简单的使用`react-router-dom`提供的`withRouter`方法包裹组件：

```javascript
import { withRouter } from 'react-router-dom'
export default withRouter(connect(mapStateToProps)(Home))
```

### Redux整合

在使用Redux以后，需要遵循redux的原则：单一可信数据来源，即所有数据来源都只能是reudx store，react路由状态也不应例外，所以需要将路由state与store state连接。

#### react-router-redux

连接React Router与Redux，需要使用`react-router-redux`库，而且react-router v4版本需要指定安装`@next`版本和`hsitory`库：

```shell
yarn add react-router-redux@next
yarn add history
```

然后，在创建store时，需要实现如下配置：

1. 创建一个history对象，对于web应用，我们选择browserHisotry，对应需要从`history/createBrowserHistory`模块引入`createHistory`方法以创建history对象；

   [点此查看更多history相关内容](https://reacttraining.com/react-router/web/api/history)

2. 添加`routerReducer`和`routerMiddleware`中间件“，其中`routerMiddleware`中间件接收history对象参数，连接store和history，等同于旧版本的`syncHistoryWithStore`；

```javascript
import createHistory from 'history/createBrowserHistory'
import { ConnectedRouter, routerReducer, routerMiddleware, push } from 'react-router-redux'
// Create a history of your choosing (we're using a browser history in this case)
export const history = createHistory()

// Build the middleware for intercepting and dispatching navigation actions
const middleware = routerMiddleware(history)

// Add the reducer to your store on the `router` key
// Also apply our middleware for navigating
const store = createStore(
  combineReducers({
    ...reducers,
    router: routerReducer
  }),
  applyMiddleware(middleware)
)

return store
```

在渲染根组件时，我们抽象出两个组件：

1. 初始化渲染根组件，挂载至DOM的根组件，由`<Provider>`组件包裹，注入store；
2. 路由配置组件，在根组件中，声明路由配置组件，初始化必要的应用路由定义及路由对象；

```javascript
import createStore from './store/'
import Routes from './routes/'
import appReducer from './store/appRedux'

const store = createStore({}, {
  app: appReducer
})

/**
 * 项目根组件
 * @class App
 * @extends Component
 */
class App extends Component {
  render () {
    const { store } = this.props

    return (
      <Provider store={store}>
        <div>
          <Routes />
        </div>
      </Provider>
    )
  }
}

// 渲染根组件
ReactDOM.render(
  <App store={store} />,
  document.getElementById('app')
)
```

上面的`<Routes>`组件是项目的路由组件：

```javascript
import { history } from '../store/'
import { ConnectedRouter } from 'react-router-redux'
import { Route } from 'react-router'

class Routes extends Component {
  render () {
    return (
      <ConnectedRouter history={history}>
        <div>
          <BlogHeader />
          <div>
            <Route exact path='/' component={Home} />
            <Route exact path='/posts/:id' component={Article} />
          </div>
        </div>
      </ConnectedRouter>
    )
  }
}
```

首先使用`react-router-redux`提供的`ConnectedRouter`组件包裹路由配置，该组件将自动使用`<Provider>`组件注入的`store`，我们需要做的是手动传入`history`属性，在组件内会调用`history.listen`方法监听浏览器`LOCATION_CHANGE`事件，最后返回`react-router`的`<Router >`组件，处理作为`this.props.children`传入的路由配置，[ConnectedRouter组件内容传送](https://github.com/ReactTraining/react-router/blob/master/packages/react-router-redux/modules/ConnectedRouter.js)。

#### dispatch切换路由

配置上面代码后，就能够以dispatch action的方式触发路由切换和组件更新了：

```react
import { push } from 'react-router-redux'
// Now you can dispatch navigation actions from anywhere!
store.dispatch(push('/about'))
```

这个reducer所做的只是将App导航路由状态合并入store。

## redux持久化

我们知道浏览器默认有资源的缓存功能并且提供本地持久化存储方式如localStorage，indexDb，webSQL等，通常可以将某些数据存储在本地，在一定周期内，当用户再次访问时，直接从本地恢复数据，可以极大提高应用启动速度，用户体验更有优势，我们可以使用localStorage存储一些数据，如果是较大量数据存储可以使用webSQL。

另外不同于以往的直接存储数据，启动应用时本地读取然后恢复数据，对于redux应用而言，如果只是存储数据，那么我们就得为每一个reducer拓展，当再次启动应用时去读取持久化的数据，这是比较繁琐而且低效的方式，是否可以尝试存储reducer key，然后根据key恢复对应的持久化数据，首先注册Rehydrate reducer，当触发action时根据其reducer key恢复数据，然后只需要在应用启动时分发action，这也很容易抽象成可配置的拓展服务，实际上三方库[redux-persist](https://github.com/rt2zz/redux-persist)已经为我们做好了这一切。

### redux-persist

要实现redux的持久化，包括redux store的本地持久化存储及恢复启动两个过程，如果完全自己编写实现，代码量比较复杂，可以使用开源库`redux-persist`，它提供`persistStore`和`autoRehydrate`方法分别持久化本地存储store及恢复启动store，另外还支持自定义传入持久化及恢复store时对store state的转换拓展。

```shell
yarn add redux-persist
```

#### 持久化store

如下在创建store时会调用persistStore相关服务-`RehydrationServices.updateReducers()`：

```react
// configure persistStore and check reducer version number
if (ReduxPersistConfig.active) {
  RehydrationServices.updateReducers(store);
}
```

该方法内实现了store的持久化存储：

```react
// Check to ensure latest reducer version
storage.getItem('reducerVersion').then((localVersion) => {
  if (localVersion !== reducerVersion) {
    // 清空 store
    persistStore(store, null, startApp).purge();
    storage.setItem('reducerVersion', reducerVersion);
  } else {
    persistStore(store, null, startApp);
  }
}).catch(() => {
  persistStore(store, null, startApp);
  storage.setItem('reducerVersion', reducerVersion);
})
```

会在localStorage存储一个reducer版本号，这个是在应用配置文件中可以配置，首次执行持久化时存储该版本号及store，若reducer版本号变更则清空原来存储的store，否则传入store给持久化方法`persistStore`即可。

```javascript
persistStore(store, [config], [callback])
```

该方法主要实现store的持久化以及分发rehydration action :

1. 订阅 redux store，当其发生变化时触发store存储操作；
2. 从指定的StorageEngine（如localStorage）中获取数据，进行转换，然后通过分发 REHYDRATE action，触发 REHYDRATE 过程；

接收参数主要如下：

1. store: 持久化的store；
2. config：配置对象
   1. storage：一个 持久化引擎，例如 LocalStorage 和 AsyncStorage；
   2. transforms： 在 rehydration 和 storage 阶段被调用的转换器；
   3. blacklist： 黑名单数组，指定持久化忽略的 reducers 的 key；
3. callback：ehydration 操作结束后的回调；

#### 恢复启动

和persisStore一样，依然是在创建redux store时初始化注册rehydrate拓展：

```react
// add the autoRehydrate enhancer
if (ReduxPersist.active) {
  enhancers.push(autoRehydrate());
}
```

该方法实现的功能很简单，即使用 持久化的数据恢复(rehydrate) store 中数据，它其实是注册了一个autoRehydarte reducer，会接收前文persistStore方法分发的rehydrate action，然后合并state。

当然，autoRehydrate不是必须的，我们可以自定义恢复store方式：

```react
import {REHYDRATE} from 'redux-persist/constants';

//...
case REHYDRATE:
  const incoming = action.payload.reducer
  if (incoming) {
    return {
      ...state,
      ...incoming
    }
  }
  return state;
```

#### 版本更新

需要注意的是redux-persist库已经发布到v5.x，而本文介绍的以v5.x为例，[v4.x](https://github.com/rt2zz/redux-persist/tree/f4a6e86c66693a0bd5e6ea73043fd98b14f44a96)参考此处，新版本有一些更新，可以选择性决定使用哪个版本，[详细请点击查看](https://github.com/rt2zz/redux-persist/releases)。

### 持久化与Immutable

前面已经提到Redux与Immutable的整合，上文使用的redux -persist默认也只能处理原生JavaScript对象的redux store state，所以需要拓展以兼容Immutable。

#### redux-persist-immutable

使用[redux-persist-immutable](https://github.com/rt2zz/redux-persist-immutable)库可以很容易实现兼容，所做的仅仅是使用其提供的`persistStore`方法替换redux-persist所提供的方法：

```react
import { persistStore } from 'redux-persist-immutable';
```

#### transform

我们知道持久化store时，针对的最好是原生JavaScript对象，因为通常Immutable结构数据有很多辅助信息，不易于存储，所以需要定义持久化及恢复数据时的转换操作：

```react
import R from 'ramda';
import Immutable, { Iterable } from 'immutable';

// change this Immutable object into a JS object
const convertToJs = (state) => state.toJS();

// optionally convert this object into a JS object if it is Immutable
const fromImmutable = R.when(Iterable.isIterable, convertToJs);

// convert this JS object into an Immutable object
const toImmutable = (raw) => Immutable.fromJS(raw);

// the transform interface that redux-persist is expecting
export default {
  out: (state) => {
    return toImmutable(state);
  },
  in: (raw) => {
    return fromImmutable(raw);
  }
};
```

如上，输出对象中的in和out分别对应持久化及恢复数据时的转换操作，实现的只是使用`fromJS()`和`toJS()`转换Js和Immutable数据结构，使用方式如下：

```react
import immutablePersistenceTransform from '../services/ImmutablePersistenceTransform'
persistStore(store, {
  transforms: [immutablePersistenceTransform]
}, startApp);
```

## Immutable

在项目中引入Immutable以后，需要尽量保证以下几点：

1. redux store整个state树的统一Immutable化；
2. redux持久化对Immutable数据的兼容；
3. React路由兼容Immutable；

关于Immutable及Redux，Reselect等的实践考验查看之前写的一篇文章：[Immutable.js与React,Redux及reselect的实践](http://blog.codingplayboy.com/2017/09/14/immutable-react-redux/)。

### Immutable与React路由

前面两点已经在前面两节阐述过，第三点react-router兼容Immutable，其实就是使应用路由状态兼容Immutable，在React路由一节已经介绍如何将React路由状态连接至Redux store，但是如果应用使用了Immutable库，则还需要额外处理，将react-router state转换为Immutable格式，routeReducer不能处理Immutable，我们需要自定义一个新的RouterReducer：

```javascript
import Immutable from 'immutable';
import { LOCATION_CHANGE } from 'react-router-redux';

const initialState = Immutable.fromJS({
  location: null
});

export default (state = initialState, action) => {
  if (action.type === LOCATION_CHANGE) {
    return state.set('location', action.payload);
  }
  
  return state;
};
```

将默认初始路由状态转换为Immutable，并且路由变更时使用Immutable API操作state。

### seamless-Immutable

当引入Immutable.js后，对应用状态数据结构的使用API就得遵循Immutable API，而不能再使用原生JavaScript对象，数组等的操作API了，诸如，数组解构（[a, b] = [b, c]），对象拓展符（...）等，存在一些问题：

1. Immutable数据辅助节点较多，数据较大：
2. 必须使用Immutable语法，和JavaScript语法有差异，不能很好的兼容；
3. 和Redux，react-router等JavaScript库写协作时，需要引入额外的兼容处理库；

针对这些问题，社区有了`seamless-immutable`可供替换选择：

1. 更轻：相对于Immutable.js`seamless-immutable`库更轻小；
2. 语法：对象和数组的操作语法更贴近原生JavaScript；
3. 和其他JavaScript库协作更方便；

## 异步任务流管理

最后要介绍的模块是异步任务管理，在应用开发过程中，最主要的异步任务就是数据HTTP请求，所以我们讲异步任务管理，主要关注在数据HTTP请求的流程管理。

### axios

本项目中使用[axios](https://github.com/axios/axios)作为HTTP请求库，axios是一个Promise格式的HTTP客户端，选择此库的原因主要有以下几点：

1. 能在浏览器发起XMLHttpRequest，也能在node.js端发起HTTP请求；
2. 支持Promise；
3. 能拦截请求和响应；
4. 能取消请求；
5. 自动转换JSON数据；

### redux-saga

redux-saga是一个致力于使应用中如数据获取，本地缓存访问等异步任务易于管理，高效运行，便于测试，能更好的处理异常的三方库。

Redux-saga是一个redux中间件，它就像应用中一个单独的进程，只负责管理异步任务，它可以接受应用主进程的redux action以决定启动，暂停或者是取消进程任务，它也可以访问redux应用store state，然后分发action。

#### 初始化saga

redux-saga是一个中间件，所以首先调用`createSagaMiddleware`方法创建中间件，然后使用redux的`applyMiddleware`方法启用中间件，之后使用compose辅助方法传给`createStore`创建store，最后调用`run`方法启动根saga：

```react
import { createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import rootSaga from '../sagas/'

const sagaMiddleware = createSagaMiddleware({ sagaMonitor });
middleware.push(sagaMiddleware);
enhancers.push(applyMiddleware(...middleware));

const store = createStore(rootReducer, initialState, compose(...enhancers));

// kick off root saga
sagaMiddleware.run(rootSaga);
```

#### saga分流

在项目中通常会有很多并列模块，每个模块的saga流也应该是并列的，需要以多分支形式并列，redux-saga提供的`fork`方法就是以新开分支的形式启动当前saga流：

```react
import { fork, takeEvery } from 'redux-saga/effects'
import { HomeSaga } from './Home/flux.js'
import { AppSaga } from './Appflux.js'

const sagas = [
  ...AppSaga,
  ...HomeSaga
]

export default function * root() {
  yield sagas.map(saga => fork(saga))
}
```

如上，首先收集所有模块根saga，然后遍历数组，启动每一个saga流根saga。

#### saga实例

以AppSaga为例，我们期望在应用启动时就发起一些异步请求，如获取文章列表数据将其填充至redux store，而不等待使用数据的组件渲染完才开始请求数据，提高响应速度：

```react
const REQUEST_POST_LIST = 'REQUEST_POST_LIST'
const RECEIVE_POST_LIST = 'RECEIVE_POST_LIST'

/**
 * 请求文章列表ActionCreator
 * @param {object} payload
 */
function requestPostList (payload) {
  return {
    type: REQUEST_POST_LIST,
    payload: payload
  }
}

/**
 * 接收文章列表ActionCreator
 * @param {*} payload
 */
function receivePostList (payload) {
  return {
    type: RECEIVE_POST_LIST,
    payload: payload
  }
}

/**
 * 处理请求文章列表Saga
 * @param {*} payload 请求参数负载
 */
function * getPostListSaga ({ payload }) {
  const data = yield call(getPostList)
  yield put(receivePostList(data))
}

// 定义AppSaga
export function * AppSaga (action) {
  // 接收最近一次请求，然后调用getPostListSaga子Saga
  yield takeLatest(REQUEST_POST_LIST, getPostListSaga)
}
```

1. `takeLatest`：在`AppSaga`内使用`takeLatest`方法监听`REQUEST_POST_LIST`action，若短时间内连续发起多次action，则会取消前面未响应的action，只发起最后一次action；
2. `getPostListSaga`子Saga：当接收到该action时，调用`getPostListSaga`，并将payload传递给它，`getPostListSaga`是AppSaga的子级Saga，在里面处理具体异步任务；
3. `getPostList`：`getPostListSaga`会调用`getPostList`方法，发起异步请求，拿到响应数据后，调用`receivePostList` ActionCreator，创建并分发action，然后由reducer处理相应逻辑；

`getPostList`方法内容如下：

```react
/**
 * 请求文章列表方法
 * @param {*} payload 请求参数
 *  eg: {
 *    page: Num,
 *    per_page: Num
 *  }
 */
function getPostList (payload) {
  return fetch({
    ...API.getPostList,
    data: payload
  }).then(res => {
    if (res) {
      let data = formatPostListData(res.data)
      return {
        total: parseInt(res.headers['X-WP-Total'.toLowerCase()], 10),
        totalPages: parseInt(res.headers['X-WP-TotalPages'.toLowerCase()], 10),
        ...data
      }
    }
  })
}
```

`put`是redux-saga提供的可分发action方法，take，call等都是`redux-saga`提供的API，更多内容[查看API文档](https://redux-saga.js.org/docs/api/)。

之后便可以在项目路由根组件注入ActionCreator，创建action，然后saga就会接收进行处理了。

### saga与Reactotron

前面已经配置好可以使用Reactotron捕获应用所有redux和action，而redux-saga是一类redux中间件，所以捕获sagas需要额外配置，创建store时，在saga中间件内添加sagaMonitor服务，监听saga:

```react
const sagaMonitor = Config.useReactotron ? console.tron.createSagaMonitor() : null;
const sagaMiddleware = createSagaMiddleware({ sagaMonitor });
middleware.push(sagaMiddleware);
...
```

## 总结

本文较详细的总结了个人从0到1搭建一个项目架构的过程，对React， Redux应用和项目工程实践都有了更深的理解及思考，在大前端成长之路继续砥砺前行。

**注：文中列出的所有技术栈，博主计划一步一步推进，目前源码中使用的技术有React，React Router，Redux，react-redux，react-router-redux，Redux-saga，axios。后期计划推进Immutable，Reactotron，Redux Persist。**

[完整项目代码见github](https://github.com/codingplayboy/react-blog)

## 参考

1. [React](https://reactjs.org/docs/integrating-with-other-libraries.html)
2. [Redux](https://redux.js.org/)
3. [React Router v4](https://reacttraining.com/react-router/web/guides/philosophy)
4. [redux-saga](https://redux-saga.js.org/)
5. [Redux Persist](https://github.com/rt2zz/redux-persist)