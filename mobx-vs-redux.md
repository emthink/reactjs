# 你需要Mobx还是Redux？

在过去一年，越来越多的项目继续或者开始使用React和Redux开发，这是目前前端业内很普遍的一种前端项目解决方案，但是随着开发项目越来越多，越来越多样化时，个人又有了不同的感受和想法。是不是因为已经有了一个比较普遍的，熟悉的项目技术栈，我们就一直完全沿用呢，有没有比他更适合的方案呢？恰逢团队最近有一个新项目，于是博主开始思考，有没有可能使用其他可替代技术开发呢？既能提高开发效率，又能拓展技术储备和眼界，经过调研，选择了Mobx，最终使用React+Mobx搭建了新项目，本篇总结分享从技术选型到项目实现的较完整过程，希望共同进步。

## 前言

当我们使用React开发web应用程序时，在React组件内，可以使用`this.setState()`和`this.state`处理或访问组件内状态，但是随着项目变大，状态变复杂，通常需要考虑组件间通信问题，主要包括以下两点：

1. 某一个状态需要在多个组件间共享（访问，更新）；
2. 某组件内交互需要触发其他组件的状态更新；

关于这些问题，React组件开发实践推荐将公用组件状态提升：

> Often, several components need to reflect the same changing data. We recommend lifting the shared state up to their closest common ancestor
>
> 通常多组件需要处理同一状态，我们推荐将共享状态提升至他们的共同最近祖先组件内。[更多详情查看](https://reactjs.org/docs/lifting-state-up.html)

当项目越发复杂时，我们发现仅仅是提升状态已经无法适应如此复杂的状态管理了，程序状态变得比较难同步，操作，到处是回调，发布，订阅，这意味着我们需要更好的状态管理方式，于是就引入了状态管理库，如[Redux](https://redux.js.org/)，[Mobx](https://mobx.js.org/index.html)，[Jumpsuit](https://jumpsuit.js.org/)，[Alt.js](http://alt.js.org/)等。

## 状态管理

状态管理库，无论是Redux，还是Mobx这些，其本质都是为了解决状态管理混乱，无法有效同步的问题，甜美都支持：

1. 统一维护管理应用状态；
2. 某一状态只有一个可信数据来源（通常命名为store，指状态容器）；
3. 操作更新状态方式统一，并且可控（通常以action方式提供更新状态的途径）；
4. 支持将store与React组件连接，如`react-redux`，`mobx-react`；通常使用状态管理库后，我们将React组件从业务上划分为两类：
   1. 容器组件（Container Components）：负责处理具体业务和状态数据，将业务或状态处理函数传入展示型组件；
   2. 展示型组件（Presentation Components）：负责展示视图，视图交互回调内调用传入的处理函数；

## Mobx VS Redux

目前来看，Redux已是React应用状态管理库中的霸主了，而Mobx则是一方诸侯，我们为什么要选择Mobx，而不是继续沿用Redux呢，那就需要比较他们的异同了。

Mobx和Redux都是JavaScript应用状态管理库，都适用于React，Angular，VueJs等框架或库，而不是局限于某一特定UI库。

### Redux

要介绍Redux，我们就不得不谈到Flux了:

> Flux is the application architecture that Facebook uses for building client-side web applications.It's more of a pattern rather than a formal framework
>
> Flux是Facebook用来开发客户端-服务端web应用程序的应用架构，它更多是一种架构模式，而非一个特定框架。[详解Flux](http://blog.codingplayboy.com/2016/09/25/react_flux/)。

而Redux更多的是遵循Flux模式的一种实现，是一个JavaScript库，它关注点主要是以下几方面：

1. Action：一个JavaScript对象，描述动作相关信息，主要包含type属性和payload属性：
   1. type：action 类型；
   2. payload：负载数据；
2. Reducer：定义应用状态如何响应不同动作（action），如何更新状态；
3. Store：管理action和reducer及其关系的对象，主要提供以下功能：
   1. 维护应用状态并支持访问状态（getState()）；
   2. 支持监听action的分发，更新状态（dispatch(action)）；
   3. 支持订阅store的变更（subscribe(listener)）；
4. 异步流：由于Redux所有对store状态的变更，都应该通过action触发，异步任务（通常都是业务或获取数据任务）也不例外，而为了不将业务或数据相关的任务混入React组件中，就需要使用其他框架配合管理异步任务流程，如`redux-thunk`，`redux-saga`等；

### Mobx

Mobx是一个透明函数响应式编程（Transparently Functional Reactive Programming，TFRP）的状态管理库，它使得状态管理简单可伸缩：

> Anything that can be derived from the application state, should be derived. Automatically.
>
> 任何起源于应用状态的数据应该自动获取。

其原理如图：

![Mobx Philosophy](https://mobx.js.org/docs/flow.png)

1. Action：定义改变状态的动作函数，包括如何变更状态；

2. Store：集中管理模块状态（State）和动作（action）；

3. Derivation（衍生）：从应用状态中派生而出，且没有任何其他影响的数据，我们称为derivation（衍生），衍生在以下情况下存在：

   1. 用户界面；

   2. 衍生数据；

      衍生主要有两种：

      1. Computed Values（计算值）：计算值总是可以使用纯函数（pure function）从当前可观察状态中获取；
      2. Reactions（反应）：反应指状态变更时需要自动发生的副作用，这种情况下，我们需要实现其读写操作；

```javascript
import {observable, autorun} from 'mobx';

var todoStore = observable({
    /* some observable state */
    todos: [],

    /* a derived value */
    get completedCount() {
        return this.todos.filter(todo => todo.completed).length;
    }
});

/* a function that observes the state */
autorun(function() {
    console.log("Completed %d of %d items",
        todoStore.completedCount,
        todoStore.todos.length
    );
});

/* ..and some actions that modify the state */
todoStore.todos[0] = {
    title: "Take a walk",
    completed: false
};
// -> synchronously prints: 'Completed 0 of 1 items'

todoStore.todos[0].completed = true;
// -> synchronously prints: 'Completed 1 of 1 items'
```

### 函数式和面向对象

Redux更多的是遵循函数式编程（Functional Programming, FP）思想，而Mobx则更多从面相对象角度考虑问题。

Redux提倡编写函数式代码，如reducer就是一个纯函数（pure function），如下：

```javascript
(state, action) => {
  return Object.assign({}, state, {
    ...
  })
}
```

纯函数，接受输入，然后输出结果，除此之外不会有任何影响，也包括不会影响接收的参数；对于相同的输入总是输出相同的结果。

Mobx设计更多偏向于面向对象编程（OOP）和响应式编程（Reactive Programming），通常将状态包装成可观察对象，于是我们就可以使用可观察对象的所有能力，一旦状态对象变更，就能自动获得更新。

### 单一store和多store

store是应用管理数据的地方，在Redux应用中，我们总是将所有共享的应用数据集中在一个大的store中，而Mobx则通常按模块将应用状态划分，在多个独立的store中管理。

### JavaScript对象和可观察对象

Redux默认以JavaScript原生对象形式存储数据，而Mobx使用可观察对象：

1. Redux需要手动追踪所有状态对象的变更；
2. Mobx中可以监听可观察对象，当其变更时将自动触发监听；

### 不可变（Immutable）和可变（Mutable）

Redux状态对象通常是不可变的（Immutable）：

```javascript
switch (action.type) {
  case REQUEST_POST:
  	return Object.assign({}, state, {
      post: action.payload.post
  	});
  default:
    retur nstate;
}
```

我们不能直接操作状态对象，而总是在原来状态对象基础上返回一个新的状态对象，这样就能很方便的返回应用上一状态；而Mobx中可以直接使用新值更新状态对象。

### mobx-react和react-redux

使用Redux和React应用连接时，需要使用`react-redux`提供的`Provider`和`connect`：

1. `Provider`：负责将Store注入React应用；
2. `connect`：负责将store state注入容器组件，并选择特定状态作为容器组件props传递；

对于Mobx而言，同样需要两个步骤：

1. `Provider`：使用`mobx-react`提供的`Provider`将所有stores注入应用；
2. 使用`inject`将特定store注入某组件，store可以传递状态或action；然后使用`observer`保证组件能响应store中的可观察对象（observable）变更，即store更新，组件视图响应式更新。

## 选择Mobx的原因

1. 学习成本少：Mobx基础知识很简单，学习了半小时官方文档和示例代码就搭建了新项目实例；而Redux确较繁琐，流程较多，需要配置，创建store，编写reducer，action，如果涉及异步任务，还需要引入`redux-thunk`或`redux-saga`编写额外代码，Mobx流程相比就简单很多，并且不需要额外异步处理库；
2. 面向对象编程：Mobx支持面向对象编程，我们可以使用`@observable` and `@observer`，以面向对象编程方式使得JavaScript对象具有响应式能力；而Redux最推荐遵循函数式编程，当然Mobx也支持函数式编程；
3. 模版代码少：相对于Redux的各种模版代码，如，actionCreater，reducer，saga／thunk等，Mobx则不需要编写这类模板代码；

## 不选择Mobx的可能原因

1. 过于自由：Mobx提供的约定及模版代码很少，这导致开发代码编写很自由，如果不做一些约定，比较容易导致团队代码风格不统一，所以当团队成员较多时，确实需要添加一些约定；
2. 可拓展，可维护性：也许你会担心Mobx能不能适应后期项目发展壮大呢？确实Mobx更适合用在中小型项目中，但这并不表示其不能支撑大型项目，关键在于大型项目通常需要特别注意可拓展性，可维护性，相比而言，规范的Redux更有优势，而Mobx更自由，需要我们自己制定一些规则来确保项目后期拓展，维护难易程度；

## 代码对比

接下来我们使用Redux和Mobx简单实现同一应用，对比其代码，看看它们各自有什么表现。

### 架构

在Redux应用中，我们首先需要配置，创建store，并使用`redux-thunk`或`redux-saga`中间件以支持异步action，然后使用`Provider`将store注入应用：

```javascript
// src/store.js
import { applyMiddleware, createStore } from "redux";
import createSagaMiddleware from 'redux-saga'
import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { composeWithDevTools } from 'redux-devtools-extension';
import rootReducer from "./reducers";
import App from './containers/App/';

const sagaMiddleware = createSagaMiddleware()
const middleware = composeWithDevTools(applyMiddleware(sagaMiddleware));

export default createStore(rootReducer, middleware);

// src/index.js
…
ReactDOM.render(
  <BrowserRouter>
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>,
  document.getElementById('app')
);
```

Mobx应用则可以直接将所有store注入应用：

```javascript
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'mobx-react';
import { BrowserRouter } from 'react-router-dom';
import { useStrict } from 'mobx';
import App from './containers/App/';
import * as stores from './flux/index';

// set strict mode for mobx
// must change store through action
useStrict(true);

render(
  <Provider {...stores}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>,
  document.getElementById('app')
);
```

### 注入Props

Redux：

```javascript
// src/containers/Company.js
…
class CompanyContainer extends Component {
  componentDidMount () {
    this.props.loadData({});
  }
  render () {
    return <Company
      infos={this.props.infos}
      loading={this.props.loading}
    />
  }
}
…

// function for injecting state into props
const mapStateToProps = (state) => {
  return {
    infos: state.companyStore.infos,
    loading: state.companyStore.loading
  }
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators({
      loadData: loadData
  }, dispatch);
}

// injecting both state and actions into props
export default connect(mapStateToProps, { loadData })(CompanyContainer);
```

Mobx：

```javascript
@inject('companyStore')
@observer
class CompanyContainer extends Component {
  componentDidMount () {
    this.props.companyStore.loadData({});
  }
  render () {
    const { infos, loading } = this.props.companyStore;
    return <Company
      infos={infos}
      loading={loading}
    />
  }
}
```

### 定义Action／Reducer等

Redux：

```javascript
// src/flux/Company/action.js
…
export function fetchContacts(){
  return dispatch => {
    dispatch({
      type: 'FREQUEST_COMPANY_INFO',
      payload: {}
    })
  }
}
…

// src/flux/Company/reducer.js
const initialState = {};
function reducer (state = initialState, action) {
  switch (action.type) {
    case 'FREQUEST_COMPANY_INFO': {
      return {
        ...state,
        contacts: action.payload.data.data || action.payload.data,
        loading: false
      }
    }
    default:
      return state;
  }
}
```

Mobx:

```javascript
// src/flux/Company/store.js
import { observable, action } from 'mobx';

class CompanyStore {
  constructor () {
    @observable infos = observable.map(infosModel);
  }

  @action
  loadData = async(params) => {
    this.loading = true;
    this.errors = {};
    return this.$fetchBasicInfo(params).then(action(({ data }) => {
      let basicInfo = data.data;
      const preCompanyInfo = this.infos.get('companyInfo');
      this.infos.set('companyInfo', Object.assign(preCompanyInfo, basicInfo));
      return basicInfo;
    }));
  }

  $fetchBasicInfo (params) {
    return fetch({
      ...API.getBasicInfo,
      data: params
    });
  }
}
export default new CompanyStore();
```

### 异步Action

如果使用Redux，我们需要另外添加`redux-thunk`或`redux-saga`以支持异步action，这就需要另外添加配置并编写模板代码，而Mobx并不需要额外配置。

redux-saga主要代码有：

```javascript
// src/flux/Company/saga.js
// Sagas
// ------------------------------------
const $fetchBasicInfo = (params) => {
  return fetch({
    ...API.getBasicInfo,
    data: params
  });
}

export function *fetchCompanyInfoSaga (type, body) {
  while (true) {
    const { payload } = yield take(REQUEST_COMPANY_INFO)
    console.log('payload:', payload)
    const data = yield call($fetchBasicInfo, payload)
    yield put(receiveCompanyInfo(data))
  }
}
export const sagas = [
  fetchCompanyInfoSaga
];
```

## 一些想法

无论前端还是后端，遇到问题，大多数时候也许大家总是习惯于推荐已经普遍推广使用的，习惯，熟悉就很容易变成顺理成章的，我们应该更进一步去思考，合适的才是更好的。

当然对于“Redux更规范，更靠谱，应该使用Redux”或"Redux模版太多，太复杂了，应该选择Mobx"这类推断，我们也应该避免，这些都是相对而言，每个框架都有各自的实现，特色，及其适用场景，正比如Redux流程更复杂，但熟悉流程后就更能把握它的一些基础／核心理念，使用起来可能更有心得及感悟；而Mobx简单化，把大部分东西隐藏起来，如果不去特别研究就不能接触到它的核心／基本思想，也许使得开发者一直停留在使用层次。

所以无论是技术栈还是框架。类库，并没有绝对的比较我们就应该选择什么，抛弃什么，我们应该更关注它们解决什么问题，它们解决问题的关注点，或者说实现方式是什么，它们的优缺点还有什么，哪一个更适合当前项目，以及项目未来发展。

## 参考

1. [An in-depth explanation of Mobx](https://hackernoon.com/becoming-fully-reactive-an-in-depth-explanation-of-mobservable-55995262a254)
2. [Redux & Mobx](https://www.robinwieruch.de/redux-mobx-confusion/)
3. [Mobx](https://mobx.js.org/index.html)
4. [Redux vs Mobx](https://codeburst.io/mobx-vs-redux-with-react-a-noobs-comparison-and-questions-382ba340be09)