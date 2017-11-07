# React Native App应用架构设计

在上一篇介绍了[React Native开发环境搭建](https://github.com/codingplayboy/reactjs/blob/master/react-native-install.md)，我们已经可以在本地成功运行一个helloword应用了，本节将开始详细分析如何搭建一个React Native App应用架构，并支持完整本地运行预览，当然，本文所介绍大部分结构也适用于React应用。

[完整代码见github](https://github.com/codingplayboy/reactjs/tree/master/react-native/fuc)

## 前言

现在已经有很多脚手架工具，如[ignite](https://github.com/infinitered/ignite)，支持一键创建一个React Native App项目结构，很方便，但是享受方便的同时，也失去了对项目架构及技术栈完整学习的机会，而且通常脚手架创建的应用技术架构并不能完全满足我们的业务需求，需要我们自己修改，完善，所以如果希望对项目架构有更深掌控，最好还是从0到1理解一个项目。

## 项目结构与技术栈

首先使用`react-native-cli`工具创建一个React Native应用：

```shell
react-native init fuc
```

生成项目结构如下图：

![RN项目初始结构](http://blog.codingplayboy.com/wp-content/uploads/2017/10/project-structure-original.png)

1. andorid和ios目录分别存放对应原生平台代码;
2. `package.json`为项目依赖管理文件；
3. `index.ios.js`为ios平台入口文件，`index.android.js`为android平台入口文件，通常用来注册React Native App根组件；
4. `.babelrc`文件，babel的配置文件，React Native默认使用babel编译JavaScript代码；
5. `__tests__`项目测试目录。

我们看到并没有存放React Native原生JavaScript代码的目录，这需要我们自己进行创建了，通常创建一个`src`目录作为App应用Javascript部分所有代码和资源的根目录，一个`src/constants`目录以保存全局共享常量数据，一个`src/config`目录保存全局配置，一个`src/helpers`存放全局辅助，工具类方法，一个`src/app.js`作为RN部分入口文件，另外通常还需要创建保存各模块redux的目录，redux中间件的目录等。

### 技术栈

项目架构搭建很大部分依赖于项目的技术栈，所以先对整个技术栈进行分析，总结：

1. react native + react库是项目前提
2. App应用导航（不同于React应用的路由概念）
3. 应用状态管理容器
4. 是否需要Immutable数据
5. 应用状态的持久化
6. 异步任务管理
7. 测试及辅助工具或函数
8. 开发调试工具

根据以上划分决定选用以下第三方库和工具构成项目的完整技术栈：

1. react-native + react类库；
2. react-navigation管理应用导航；
3. redux作为JavaScript状态容器，react-redux将React Native应用与redux连接；
4. Immutable.js支持Immutable化状态，redux-immutable使整个redux store状态树Immutable化；
5. 使用redux-persist支持redux状态树的持久化，并添加redux-persist-immutable拓展以支持Immutable化状态树的持久化；
6. 使用redux-saga管理应用内的异步任务，如网络请求，异步读取本地数据等；
7. 使用jest集成应用测试，使用lodash，ramda等可选辅助类，工具类库；
8. 使用reactotron调试工具

针对以上分析，完善后的项目结构如图：

![RN项目结构](http://blog.codingplayboy.com/wp-content/uploads/2017/10/project-structure-rn.png)

如上图，在项目根目录下创建`src`目录，而在src目录中依次创建12个目录与1个React Native部分入口js文件。

## 开发调试工具

React Native App开发目前已经有诸多调试工具，常用的如atom和[Nuclide](https://nuclide.io/)，移动端模拟器自带的调试工具，[Reactron](https://github.com/infinitered/reactotron)等。

### Nuclide

[Nuclide](https://nuclide.io/docs/quick-start/getting-started/)是由Facebook提供的基于atom的集成开发环境，可用于编写、[运行](http://nuclide.io/docs/platforms/react-native/#running-applications)和 [调试](http://nuclide.io/docs/platforms/react-native/#debugging)React Native应用。

### 模拟器调试工具

在模拟器启动运行App后，浏览器会自动打开 `http://localhost:8081/debugger-ui`页，可以在控制台进行js调试输出及远端js断点调试；在模拟器终端使用快捷键`command`加`D`键即可打开调试工具，包括重新加载应用，开启热加载，切换DOM审视器等：

![RN应用调试工具](http://blog.codingplayboy.com/wp-content/uploads/2017/10/react-native-debug.png)

### Reactotron

[Reactotron](https://github.com/infinitered/reactotron)是一款跨平台调试React及React Native应用的桌面应用，能动态实时监测并输出React应用等redux，action，saga异步请求等信息，如图：

![Reactotron](https://github.com/infinitered/reactotron/raw/master/docs/images/readme/reactotron-demo-app.gif)

首先初始化Reactotron相关配置：

```react
import Config from './DebugConfig';
import Immutable from 'immutable';
import Reactotron from 'reactotron-react-native';
import { reactotronRedux as reduxPlugin } from 'reactotron-redux';
import sagaPlugin from 'reactotron-redux-saga';

if (Config.useReactotron) {
  // refer to https://github.com/infinitered/reactotron for more options!
  Reactotron
    .configure({ name: 'Os App' })
    .useReactNative()
    .use(reduxPlugin({ onRestore: Immutable }))
    .use(sagaPlugin())
    .connect();

  // Let's clear Reactotron on every time we load the app
  Reactotron.clear();

  // Totally hacky, but this allows you to not both importing reactotron-react-native
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

React Native应用依然遵循React组件化开发原则，组件负责渲染UI，组件不同状态对应不同UI，通常遵循以下组件设计思路：

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

## 跨平台适应

创建跨平台应用时，虽然React Native做了大量跨平台兼容的工作，但是依然存在一些需要为不同平台开发不同代码的情况，这时候需要额外处理。

### 跨平台目录

我们可以将不同平台代码文件以不同目录区分开来，如：

```javascript
/common/components/
/android/components/
/ios/components/
```

`common`目录下存放公用文件，`android`目录存放android文件代码，`ios`存放ios文件代码，但是通常都选择React Native提供的更好方式，后文介绍。

### Platform模块

React Native内置了一个Platform模块，用以区分应用当前运行平台，当运行在ios平台下时，`Platform.OS`值为`ios`，运行在android平台下则为`android`，可以利用此模块加载对应平台文件：

```react
var StatusBar = Platform.select({
  ios: () => require('ios/components/StatusBar'),
  android: () => require('android/components/StatusBar'),
})();
```

然后正常使用该StatusBar组件即可。

### React Native平台检测

当引用某组件时，React Native会检测该文件是否存在`.android`或`.ios`后缀，如果存在则根据当前平台加载对应文件组件，如：

```javascript
StatusBar.ios.js
StatusBar.indroid.js
```

同一目录下存在以上两个文件，则可以使用以下方式引用：

```react
import StatusBar from './components/StatusBar';
```

React将会根据当前平台加载对应后缀文件，推荐使用此方式做平台组件级代码适配，而对于局部小部分需要适配平台的代码可以使用`Platform.OS`值，如下，若仅仅需要在ios平台下添加一个更高的margin-top值且不是公用样式时：

```react
var styles = StyleSheet.create({
  marginTop: (Platform.OS === 'ios') ? 20 : 10,
});
```

## App应用导航与路由

不同于React应用的单页面路由，React Native通常都是多页面形式存在，以导航方式在不同页面和组件间切换，而不是路由方式控制不同组件展示，最常使用的是react-navigation导航库。

### 导航和路由

在React web应用中，页面UI组件展示和切换完全由路由控制，每一个路由都有对应的URL及路由信息，在React Native应用则不是由路由驱动组件展示，而是由导航控制切换屏展示，每一屏有各自的路由信息。

或许你已经依赖react-router的单页面应用路由配置方式，希望创建一个Url驱动的跨平台App应用，托福于活跃的的开源社区，你可以使用[react-router-native](https://github.com/jmurzy/react-router-native)，但是并不推荐，因为对于App而言，从交互和体验考虑，还是更适合使用多页面（屏）形式。

### react-navigation

使用react-navigation可以定义跨平台的应用导航结构，也支持配置渲染跨平台的导航栏，tab栏等组件。

#### 内置导航模块

react-navigation提供以下几个方法支持创建不同的导航类型：

1. StackNavigator：创建导航屏栈（stack），所有屏（screen）以栈的方式存在，一次渲染一屏，在切换屏时提高变换动画，当打开某一屏时，将该屏放置在栈顶；
2. TabNavigator：创建一个Tab式导航，渲染一个Tab菜单栏，使用户可以切换不同屏；
3. DrawerNavigator：创建抽屉式导航，从屏的左边滑出一屏；

#### StackNavigator

[StackNavigator](https://reactnavigation.org/docs/navigators/stack)支持跨平台以变换方式切换不同屏，并且将当前屏放置在栈顶，调用方式如下：

```javascript
StackNavigator(RouteConfigs, StackNavigatorConfig)
```

##### RouteConfigs

导航栈路由（route）配置对象，定义route名和route对象，该route对象定义当前路由对应的展示组件，如：

```react
// routes为路由信息对象
StackNavigator({
  [routes.Main.name]: Main,
  [routes.Login.name]: {
    path: routes.Login.path,
    screen: LoginContainer,
    title: routes.Login.title
  }
}
```

如上，表明当应用导航至路由`routes.Login.name`时，渲染`LoginContainer`组件，由对象screen属性指定；而导航至路由`routes.Main.name`值时，对应渲染MainStack，代码中`Main`对象为：

```react
{
  path: routes.Main.path,
  screen: MainStack,
  navigationOptions: {
    gesturesEnabled: false,
  },
}
```

而MainStack是一个Stacknavigator：

```react
const MainStack = StackNavigator({
  Home: HomeTabs
})
```

HomeTabs是一个TabNavigator：

```react
{
  name: 'Home Tabs',
  description: 'Tabs following Home Tabs',
  headerMode: 'none',
  screen: HomeTabs
};
```

##### StackNavigatorConfig

路由配置对象，可以选择性配置可选属性，如：

1. `initialRouteName`，初始导航栈默认屏，必须是路由配置对象中的某一键名；
2. `initialRouteParams`，初始路由的默认参数；
3. `navigationOptions`，设置默认的导航屏配置；
   1. title：导航屏顶部标题；
4. `headerMode`，是否显示顶部导航栏：
   1. none：不显示导航栏；
   2. float：在顶部渲染一个独立的导航栏，并且在切换屏时伴有动画，通常是ios的展示模式；
   3. screen：为每一屏绑定一个导航栏，并且伴随着屏切换淡入淡出，通常是android的展示模式；
5. `mode`，导航切换屏时的样式和变换效果：
   1. `card`：默认方式，标准的屏变换；
   2. `modal`：仅在ios平台有效，使屏幕底部滑出新屏；

```react
{
  initialRouteName: routes.Login.name,
  headerMode: 'none', // 去除顶部导航栏
  /**
   * Use modal on iOS because the card mode comes from the right,
   * which conflicts with the drawer example gesture
   */
  mode: Platform.OS === 'ios' ? 'modal' : 'card'
}
```

#### TabNavigator

使用[TabNavigator](https://reactnavigation.org/docs/navigators/tab)可以创建一屏，拥有TabRouter可以切换不同Tab，调用方式如：

```react
TabNavigator(RouteConfigs, TabNavigatorConfig)
```

##### RouteConfigs

Tab路由配置对象，格式类似StackNavigator。

##### TabNavigatorConfig

Tab导航相关配置对象，如：

1. tabBarComponent: tab菜单栏使用的组件，ios平台默认使用`TabBarBottom`组件，android平台默认使用`TabBarTop`组件；
2. tabBarPosition：tab菜单栏位置，`top`或`bottom`;
3. tabBarOptions: tab菜单栏配置：
   1. activeTintColor：激活tab的菜单栏项的字体和图标的颜色
4. initialRouteName: 初始加载时的默认tabRoute路由的routeName，对应路由配置对象的键名
5. order：tab排序，routeName组成的数组；

```react
const HomeTabs = TabNavigator(
  {
    Notification: {
      screen: NotificationTabContainer,
      path: 'notification',
      navigationOptions: {
        title: '消息通知'
      }
    },
    Myself: {
      screen: MyselfTabContainer,
      path: 'myself',
      navigationOptions: {
        title: '我的'
      }
    }
  },
  {
    tabBarOptions: {
      activeTintColor: Platform.OS === 'ios' ? '#e91e63' : '#fff',
    },
    swipeEnabled: true
  }
);
```

#### DrawerNavigator

使用[DrawerNavigator](https://reactnavigation.org/docs/navigators/drawer)可以创建抽屉式导航屏，调用方式如下：

```react
DrawerNavigator(RouteConfigs, DrawerNavigatorConfig)
```

```react
const MyDrawer = DrawerNavigator({
  Home: {
    screen: MyHomeDrawerScreen,
  },
  Notifications: {
    screen: MyNotificationsDrawerScreen,
  },
});
```

##### RouteConfigs

抽屉式导航路由配置对象，格式类似StackNavigator。

##### DrawerNavigatorConfig

 抽屉式导航屏配置对象，如：

1. drawerWidth：抽屉屏的宽度；
2. drawerPosition：抽屉屏位置，`left`或`right`；
3. contentComponent：抽屉屏内容组件，如内置提供的`DrawerItems`；
4. initialRouteName：初始路由的路由名；

```react
import { DrawerItems } from 'react-navigation';

const CustomDrawerContentComponent = (props) => (
  <View style={styles.container}>
    <DrawerItems {...props} />
  </View>
);

const DrawerNavi = DrawerNavigator({}, {
  drawerWidth: 200,
  drawerPosition: 'right',
  contentComponent: props => <CustomDrawerContentComponent  {...props}/>,
  drawerBackgroundColor: 'transparent'
})
```

#### Navigation prop

RN应用的每一屏将接受一个navigation属性包含以下方法和属性：

1. navigate：导航至其他屏的辅助方法；
2. setParams：变更路由参数方法；
3. goBack：关闭当前屏并后退；
4. state：当前屏的状态或路由信息；
5. dispatch：发布action；

##### navigate

使用navigate方法导航至其他屏：

```react
navigate(routeName, params, action)
```

1. routeName：目标路由名，在App导航路由注册过的路由键名；
2. params：目标路由携带的参数；
3. action：如果目标路由存在子路由，则在子路由内执行此action；

##### setParams

改变当前导航路由信息，如设置修改导航标题等信息：

```react
class ProfileScreen extends React.Component {
  render() {
    const { setParams } = this.props.navigation;
    return (
      <Button
        onPress={() => setParams({name: 'Jh'})}
        title="Set title"
      />
     )
   }
}
```

##### goBack

从当前屏（参数为空）或者指定屏（参数为屏路由键名）导航回退至该屏的上一屏，并且关闭该屏；若传递`null`参数，则未指定来源屏，即不会关闭屏。

##### state

每一屏都有自己的路由信息，可以通过`this.props.navigation.state`访问，其返回数据格式如：

```react
{
  // the name of the route config in the router
  routeName: 'Login',
  //a unique identifier used to sort routes
  key: 'login',
  //an optional object of string options for this screen
  params: { user: 'jh' }
}
```

##### dispatch

该方法用来分发导航action至路由，实现导航，可以使用`react-navigation`默认提供的action创建函数`NavigationActions`，如下为分发一个navigate导航切换屏action：

```react
import { NavigationActions } from 'react-navigation'

const navigateAction = NavigationActions.navigate({
  routeName: routeName || routes.Login.name,
  params: {},
  // navigate can have a nested navigate action that will be run inside the child router
  action: NavigationActions.navigate({ routeName: 'Notification'})
});

// dispatch the action
this.props.navigation.dispatch(navigateAction);
```



### Navigation与Redux

在使用Redux以后，需要遵循redux的原则：单一可信数据来源，即所有数据来源都只能是reudx store，Navigation路由状态也不应例外，所以需要将Navigation state与store state连接，可以创建一个Navigation reducer以合并Navigation state至store：

```react
import AppNavigation from '../routes';

const NavigationReducer = (state = initialState, action) => {
  const newState = Object.assign({}, state, AppNavigation.router.getStateForAction(action, state));
  return newState || state;
};

export const NavigationReducers = {
  nav: NavigationReducer
};
```

这个reducer所做的只是将App导航路由状态合并入store。

## Redux

现代的任何大型web应用如果少了状态管理容器，那这个应用就缺少了时代特征，可选的库诸如mobx，redux等，实际上大同小异，各取所需，以redux为例，redux是最常用的react应用状态容器库，对于React Native应用也适用。

### react-redux

和React应用一样，需要将Redux和应用连接起来，才能统一使用redux管理应用状态，使用官方提供的[react-redux](https://github.com/reactjs/react-redux)库。

```react
class App extends Component {
  render () {
    return (
      <Provider store={store}>
        <AppContainer />
      </Provider>
    )
  }
}
```

### createStore

使用redux提供的`createStore`方法创建redux store，但是在实际项目中我们常常需要拓展redux添加某些自定义功能或服务，如添加redux中间件，添加异步任务管理saga，增强redux等：

```react
// creates the store
export default (rootReducer, rootSaga, initialState) => {
  /* ------------- Redux Configuration ------------- */
  const middleware = [];
  const enhancers = [];

  /* ------------- Analytics Middleware ------------- */
  middleware.push(ScreenTracking);

  /* ------------- Saga Middleware ------------- */
  const sagaMonitor = Config.useReactotron ? console.tron.createSagaMonitor() : null;
  const sagaMiddleware = createSagaMiddleware({ sagaMonitor });
  middleware.push(sagaMiddleware);

  /* ------------- Assemble Middleware ------------- */
  enhancers.push(applyMiddleware(...middleware));

  /* ------------- AutoRehydrate Enhancer ------------- */
  // add the autoRehydrate enhancer
  if (ReduxPersist.active) {
    enhancers.push(autoRehydrate());
  }

  // if Reactotron is enabled (default for __DEV__), 
  // we'll create the store through Reactotron
  const createAppropriateStore = Config.useReactotron ? console.tron.createStore : createStore;
  const store = createAppropriateStore(rootReducer, initialState, compose(...enhancers));

  // configure persistStore and check reducer version number
  if (ReduxPersist.active) {
    RehydrationServices.updateReducers(store);
  }

  // kick off root saga
  sagaMiddleware.run(rootSaga);

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
    ...NavigationReducers,
    ...LoginReducers
  });

  return configureStore(rootReducer, rootSaga, initialState);
}
```

如上代码，可以看见我们传入的`initialState`是一个`Immutable.Map`类型数据，我们将redux整个state树丛根源开始Immutable化，另外传入了可以处理Immutable state的reducers和sagas。

另外每一个state树节点数据都是Immutable结构，如`NavigationReducer`：

```react
const initialState = Immutable.fromJS({
  index: 0,
  routes: [{
    routeName: routes.Login.name,
    key: routes.Login.name
  }]
});

const NavigationReducer = (state = initialState, action) => {
  const newState = state.merge(AppNavigation.router.getStateForAction(action, state.toJS()));
  return newState || state;
};
```

reducer默认state节点使用Immutable.fromJS()方法将其转化为Immutable结构，并且更新state时使用Immutable方法`state.merge()`，保证状态统一可预测。

## redux持久化

我们知道浏览器默认有资源的缓存功能并且提供本地持久化存储方式如localStorage，indexDb，webSQL等，通常可以将某些数据存储在本地，在一定周期内，当用户再次访问时，直接从本地恢复数据，可以极大提高应用启动速度，用户体验更有优势，对于App应用而言，本地持久化一些启动数据甚至离线应用更是常见的需求，我们可以使用[AsyncStorage](http://facebook.github.io/react-native/docs/asyncstorage.html#content)（类似于web的localStorage）存储一些数据，如果是较大量数据存储可以使用SQLite。

另外不同于以往的直接存储数据，启动应用时本地读取然后恢复数据，对于redux应用而言，如果只是存储数据，那么我们就得为每一个reducer拓展，当再次启动应用时去读取持久化的数据，这是比较繁琐而且低效的方式，是否可以尝试存储reducer key，然后根据key恢复对应的持久化数据，首先注册Rehydrate reducer，当触发action时根据其reducer key恢复数据，然后只需要在应用启动时分发action，这也很容易抽象成可配置的拓展服务，实际上三方库[redux-persist](https://github.com/rt2zz/redux-persist)已经为我们做好了这一切。

### redux-persist

要实现redux的持久化，包括redux store的本地持久化存储及恢复启动两个过程，如果完全自己编写实现，代码量比较复杂，可以使用开源库`redux-persist`，它提供`persistStore`和`autoRehydrate`方法分别持久化本地存储store及恢复启动store，另外还支持自定义传入持久化及恢复store时对store state的转换拓展。

#### 持久化store

如下在创建store时会调用persistStore相关服务-`RehydrationServices.updateReducers()`：

```react
// configure persistStore and check reducer version number
if (ReduxPersist.active) {
  RehydrationServices.updateReducers(store);
}
```

该方法内实现了store的持久化存储：

```react
// Check to ensure latest reducer version
AsyncStorage.getItem('reducerVersion').then((localVersion) => {
  if (localVersion !== reducerVersion) {
    if (DebugConfig.useReactotron) {
      console.tron.display({
        name: 'PURGE',
        value: {
          'Old Version:': localVersion,
          'New Version:': reducerVersion
        },
        preview: 'Reducer Version Change Detected',
        important: true
      });
    }
    // Purge store
    persistStore(store, config, startApp).purge();
    AsyncStorage.setItem('reducerVersion', reducerVersion);
  } else {
    persistStore(store, config, startApp);
  }
}).catch(() => {
  persistStore(store, config, startApp);
  AsyncStorage.setItem('reducerVersion', reducerVersion);
})
```

会在AsyncStorage存储一个reducer版本号，这个是在应用配置文件中可以配置，首次执行持久化时存储该版本号及store，若reducer版本号变更则清空原来存储的store，否则传入store给持久化方法`persistStore`即可。

```react
persistStore(store, [config, callback])
```

该方法主要实现store的持久化以及分发rehydration action :

1. 订阅 redux store，当其发生变化时触发store存储操作；
2. 从指定的StorageEngine（如AsyncStorage）中获取数据，进行转换，然后通过分发 REHYDRATE action，触发 REHYDRATE 过程；

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

需要注意的是redux-persist库已经发布到v5.x，而本文介绍的以[v4.x](https://github.com/rt2zz/redux-persist/tree/f4a6e86c66693a0bd5e6ea73043fd98b14f44a96)为准，新版本有一些更新，[详细请点击查看](https://github.com/rt2zz/redux-persist/releases)。

### 持久化与Immutable

前面已经提到Redux与Immutable的整合，上文使用的redux-persist默认也只能处理原生JavaScript对象的redux store state，所以需要拓展以兼容Immutable。

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
3. App Navigation兼容Immutable；

### Immutable与App Navigation

前面两点已经在前面两节阐述过，第三点过于Navigation兼容Immutable，其实就是使Navigation路由状态兼容Immutable，在App应用导航与路由一节已经介绍如何将Navigation路由状态连接至Redux store，如果应用使用了Immutable库，则需要另外处理，将Navigation router state转换为Immutable，修改前面提到的NavigationReducer：

```react
const initialState = Immutable.fromJS({
  index: 0,
  routes: [{
    routeName: routes.Login.name,
    key: routes.Login.name
  }]
});

const NavigationReducer = (state = initialState, action) => {
  const newState = state.merge(AppNavigation.router.getStateForAction(action, state.toJS()));
  return newState || state;
};
```

将默认初始状态转换为Immutable，并且合并state时使用`merge()`方法。

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
import { fork, takeEvery } from 'redux-saga/effects';
import LoginSagas from './LoginSagas';

const sagas = [
  ...LoginSagas,
  ...StartAppSagas
];

export default function * root() {
  yield sagas.map(saga => fork(saga)); 
};
```

如上，首先收集所有模块根saga，然后遍历数组，启动每一个saga流根saga。

#### saga实例

以LoginSagas为例，对于登录这一操作，可能在用户开始登录，登录成功后需要进行一些异步请求，所以列出loginSaga， loginSuccessSaga，另外用户退出账户时也可能需要进行HTTP请求，所以将logoutSaga放在此处：

```react
...

// process login actions
export function * loginSaga () {
  yield takeLatest(LoginTypes.LOGIN, login);
}

export function * loginSuccessSaga () {
  yield takeLatest(LoginTypes.LOGIN_SUCCESS, loginSuccess);
}

export function * logoutSaga () {
  yield takeLatest(LogoutTypes.LOGOUT, logout);
}

const sagas = [
  loginSaga,
  loginSuccessSaga,
  logoutSaga
];

export default sagas;
```

在loginSaga内使用`takeLatest`方法监听`LoginTypes.LOGIN`action，当接收到该action时，调用`login`，login本质上还是一个saga，在里面处理异步任务：

```react
function * login (action) {
  const { username, password } = action.payload || {};

  if (username && password) {
    const res = yield requestLogin({
      username,
      password
    });

    const { data } = res || {};

    if (data && data.success) {
      yield put(LoginActions.loginSuccess({
        username,
        password,
        isLogin: true
      }));
    } else {
      yield put(LoginActions.loginFail({
        username,
        password,
        isLogin: false
      }));
    }
  } else {
    yield put(LoginActions.loginFail({
      username,
      password,
      isLogin: false
    }));
  }
}
```

`requestLogin`方法就是一个登录HTTP请求，用户名和密码参数从`LoginTypes.LOGIN`action传递的负载取得，`yield`语句取回请求响应，赋值给res，随后通过响应内容判断登录是否成功：

1. 登录成功，分发`LoginActions.loginSuccess`action，随后将执行监听此action的reducer及`loginSuccessSaga`saga;
2. 登录失败，分发`LoginActions.loginFail`action;

put是redux-saga提供的可分发action方法。

### saga与Reactotron

前面已经配置好可以使用Reactotron捕获应用所有redux和action，而redux-saga是一类redux中间件，所以捕获sagas需要额外配置，创建store时，在saga中间件内添加sagaMonitor服务，监听saga:

```react
const sagaMonitor = Config.useReactotron ? console.tron.createSagaMonitor() : null;
const sagaMiddleware = createSagaMiddleware({ sagaMonitor });
middleware.push(sagaMiddleware);
...
```

## 总结

本文较详细的总结了个人从0到1搭建一个项目架构的过程，对React，React Native， Redux应用和项目工程实践都有了更深的理解及思考，在大前端成长之路继续砥砺前行。

[完整代码见github](https://github.com/codingplayboy/reactjs/tree/master/react-native/fuc)

## 参考

1. [react native](https://facebook.github.io/react-native/)
2. [react native中文网](https://reactnative.cn/docs/0.49/getting-started.html)
3. [react navigation](https://reactnavigation.org/docs/)
