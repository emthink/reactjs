# Immutable.js与React,Redux及reselect的实践

本篇文章将聚焦Immutable与Redux,reselect的项目实践，将从多方面阐述Immutable及Redux：包括什么是Immutable，为什么需要使用Immutable，Immutable.js与React，Redux及reselect的组合实践及优化，最后总结使用Immutable可能遇到的一些问题及解决方式。

## Immutable

Immutable来自于函数式编程的世界，我们可以称它为不可变，试想如下代码：

```javascript
var object = { x:1, y: 2 };
var object2 = { x: 1, y: 2 };
object == object2// false
object === object2 // false
```

相等性检查将包括两个部分：

1. 值检查
2. 引用检查

### 引用检查

JavaScript的对象是一个非常复杂的数据结构，它的键可以指向任意值，包括object。JavaScript创建的对象将存储在计算机内存中（对应一个物理地址），然后它返回一个引用，JavaScript引擎通过该引用可以访问该对象，该引用赋值给某个变量后，我们便可以通过该变量以引用的方式操作该对象。引用检查即检查两个对象的引用地址是否相同。

### 值检查

层层循环检查对象各属性值是否相同。

### React重新渲染

React通过对组件属性（props）和状态（state）进行变更检查以决定是否更新并重新渲染该组件，若组件状态太过庞大，组件性能就会下降，因为对象越复杂，其相等性检查就会越慢。

1. 对于嵌套对象，必须迭代层层进行检查判断，耗费时间过长；
2. 若仅修改对象的属性，其引用保持不变，相等性检查中的引用检查结果不变；

Immutable提供一直简单快捷的方式以判断对象是否变更，对于React组件更新和重新渲染性能可以有较大帮助。

## Immutable数据

> Never mutated, instead copy it and then make change.
>
> 绝对不要突然修改对象，首先复制然后修改复制对象，再返回这个新对象，保持原对象不变。

Immutable对象和原生JavaScript对象的主要差异可以概括为以下两点：

1. 持久化数据结构（Persistent data structures）
2. 结构共享（Structures sharing [Trie](https://en.wikipedia.org/wiki/Trie)）

### 持久化数据结构

持久数据结构主张所有操作都返回该数据结构的更新副本，并保持原有结构不变，而不是改变原来的结构。通常利用[Trie](https://en.wikipedia.org/wiki/Trie)构建它不可变的持久性数据结构，它的整体结构可以看作一棵树，一个树节点可以对应代表对象某一个属性，节点值即属性值。

### 结构共享

一旦创建一个Immutable Trie型对象，我们可以把该Trie型对象想象成如下一棵树，在之后的对象变更尽可能的重用树节点：

![Structures sharing](http://blog.codingplayboy.com/wp-content/uploads/2017/09/trie-share.png)



当我们要更新一个Immutable对象的属性值时，就是对应着需要重构该Trie树中的某一个节点，对于Trie树，我们修改某一节点只需要重构该节点及受其影响的节点，即其祖先节点，如上图中的四个绿色节点，而其他节点可以完全重用。

### 参考

1. [Immutable Persistent Data Structures](https://medium.com/@dtinth/immutable-js-persistent-data-structures-and-structural-sharing-6d163fbd73d2)
2. [Trie](https://en.wikipedia.org/wiki/Trie)

## 为什么需要Immutable

上一节简单介绍了什么是Immutable，本节介绍为什么需要使用Immutable。

### 不可变，副作用及突变

我们不鼓励突然变更对象，因为那通常会打断时间旅行及bug相关调试，并且在react-redux的`connect`方法中状态突变将导致组件性能低下：

1. 时间旅行：Redux DevTools开发工具期望应用在重新发起某个历史action时将仅仅返回一个状态值，而不改变任何东西，即无副作用。突变和异步操作将导致时间旅行混乱，行为不可预测。
2. react-redux：`connect`方法将检查`mapStateToProps`方法返回的props对象是否变更以决定是否需要更新组件。为了提高这个检查变更的性能，`connect`方法基于Immutabe状态对象进行改进，使用浅引用相等性检查来探测变更。这意味着对对象或数组的直接变更将无法被探测，导致组件无法更新。

在reducer函数中的诸如生成唯一ID或时间戳的其他副作用也会导致应用状态不可预测，难以调试和测试。

若Redux的某一reducer函数返回一个可以突变的状态对象，意味着我们不能追踪，预测状态，这可能导致组件发生多余的更新，重新渲染或者在需要更新时没有响应，也会导致难以跟踪调试bug。Immutable.js能提供一种Immutable方案解决如上提到的问题，同时其丰富的API也足够支撑我们复杂的开发。

### 参考

1. [Why and When to use Immutable](https://www.ibm.com/developerworks/java/library/j-jtp02183/index.html)
2. [Why do we need Immutable class](https://stackoverflow.com/questions/3769607/why-do-we-need-immutable-class)

## 如何使用Immutable

Immutable能给我们的应用提供较大的性能提升，但是我们必须正确的使用它，否则得不偿失。目前关于Immutable已经有一些类库，对于React应用，首选的是Immutable.js。

### Immutable.js与React

首先需要明白的是React组件状态必须是一个原生JavaScript对象，而不能是一个Immutable对象，因为React的`setState`方法期望接受一个对象然后使用`Object.assign`方法将其与之前的状态对象合并。

```react
class  Component  extends React.Component {
	Constructor (props)  {
		super(props)

		this.state = {
            data: Immutable.Map({
            count:0,
            todos: List()
            })
		}
		this.handleAddItemClick = 		this.handleAddItemClick.bind(this)
	}

	handleAddItemClick () {
		this.setState(({data}) => {
			data: data.update('todos', todos => todos.push(data.get('count')))
		})
	}

	render () {
        const data = this.state.data;
        Return (
            <div>
            	<button onclick={this.handleAddItemClick}></button>
            	<ul>
            		{data.get('todos').map(item =>
                         <li>Saved:
             			{item}</li>
                     )}
            	</ul>
            </div>
        )
    }
}
```

1. 使用Immutable.js的访问API访问state，如`get()`,`getIn()`;

2. 使用Immutable.js的集合操作生成组件子元素：

   使用高阶函数如`map()`，`reduce()`等创建React元素的子元素：

   ```react
   {data.get('todos').map(item =>
   	<li>Saved:
   	{item}</li>
   )}
   ```

3. 使用Immutable.js的更新操作API更新state；

   ```react
   this.setState(({data}) => ({
        data: data.update('count', v => v + 1)
   }))
   ```

   或者

   ```react
   this.setState(({data}) => ({
        data: data.set('count', data.get('count') + 1)
   }));
   ```

参考：

1. [Immutable as React state](https://github.com/facebook/immutable-js/wiki/Immutable-as-React-state)

### Immutable.js与Pure render

`shouldComponentUpdate`方法作为React应用渲染性能优化最常见的一个优化点，默认的该方法总是返回true，意味着总是会执行组件`render`方法，进行Diff算法比较Virtual DOM，进而根据结果判断如何更新组件，有很多时候，如果明确不需要更新组件，我们可以直接在`shouldComponentUpdate`方法内返回false，可以极大提高性能。

#### Pure render

通常所说的Pure render即是重写`shouldComponentUpdate`方法，明确缩小更新组件的情况，同时尽量保证该方法的性能，权衡达到较大性能提升，如下，该方式通过浅比较两次props对象和state对象：

```react
function shouldComponentUpdate(nextProps, nextState) {
  return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState);
}
```

`shallowEqual`浅比较如：

```javascript
function shallowEqual(objA, objB) {
  if (objA === objB) {
    return true;
  }

  if (typeof objA !== 'object' || objA === null ||
      typeof objB !== 'object' || objB === null) {
    return false;
  }

  var keysA = Object.keys(objA);
  var keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  // Test for A's keys different from B.
  var bHasOwnProperty = Object.prototype.hasOwnProperty.bind(objB);
  for (var i = 0; i < keysA.length; i++) {
    if (!bHasOwnProperty(keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
      return false;
    }
  }

  return true;
}
```

首先进行引用检查，若引用检查通过，则不需要继续检查，直接返回true；否则，进行类型判断，属性长度判断，不相等则直接返回false；最后遍历比较目标对象属性，并将其值与比较源对象的该属性值进行相等性检查（引用检查，值检查），不迭代对象，返回检查结果。

当然你也可以在`shouldComponentUpdate`方法内使用深比较，循环遍历对象比较，但是深比较很费性能，不建议使用。

#### Immutable.js与shouldComponentUpdate

Immutable 提供了简洁高效的数据变更检查变方法，只需 `===` 和 `is` 比较就可以知道是否需要更新组件，而且这个**检查操作成本极低**，可以极大提高性能。使用Immutable.js修改 `shouldComponentUpdate` 如：

```javascript
import { is } from 'immutable';

shouldComponentUpdate: (nextProps = {}, nextState = {}) => {
  const props = this.props || {}, state = this.state || {};

  if (Object.keys(props).length !== Object.keys(nextProps).length ||
      Object.keys(state).length !== Object.keys(nextState).length) {
    return true;
  }

  for (const key in nextProps) {
    if (!is(props[key], nextProps[key])) {
      return true;
    }
  }

  for (const key in nextState) {
    if (state[key] !== nextState[key] || !is(state[key], nextState[key])) {
      return true;
    }
  }
  return false;
}
```

首先进行属性长度比较，然后分别浅遍历props和state对象，然后对同名属性值进行`===`和`is`两种方式比较，若任何一种比较方式返回false，则表明组件有变更，则`shouldComponentUpdate`方法返回true，否则返回false。

### Immutable.js和Redux

React本身是专注于视图层的一个JavaScript类库，所以其单独使用时状态一般不会过于复杂，所以其和Immutable.js的协作比较简单，更重要也是我们需要更多关注的地方是其与React应用状态管理容器的协作，下文就Immutable.js如何高效的与Redux协作进行阐述。

**我们在Redux中讲状态（state）主要是指应用状态，而不是组件状态。**

#### redux-immutable

原始Redux的`combineReducers`方法期望接受原生JavaScript对象并且它把state作为原生对象处理，所以当我们使用`createStore`方法并且接受一个Immutable对象作应用初始状态时，`reducer`将会返回一个错误，源代码如下：

```javascript
if   (!isPlainObject(inputState)) {
	return   (                              
    	`The   ${argumentName} has unexpected type of "` +                                    ({}).toString.call(inputState).match(/\s([a-z|A-Z]+)/)[1] +
      ".Expected argument to be an object with the following + 
      `keys:"${reducerKeys.join('", "')}"`   
	)  
}
```

如上表明，原始类型reducer接受的state参数应该是一个原生JavaScript对象，我们需要对`combineReducers`其进行增强，以使其能处理Immutable对象，redux-immutable 即是用来创建一个可以和[Immutable.js](https://facebook.github.io/immutable-js/)协作的Redux [combineReducers](http://redux.js.org/docs/api/combineReducers.html)。

```react
const StateRecord = Immutable.Record({
    foo: 'bar'
 });
const rootReducer = combineReducers({
  first: firstReducer
}, StateRecord);
```

##### react-router-redux

如果在项目中使用了react-router-redux类库，那么我们需要知道routeReducer不能处理Immutable，我们需要自定义一个新的reducer：

```react
import Immutable from 'immutable';
import { LOCATION_CHANGE } from 'react-router-redux';

const initialState = Immutable.fromJS({
   locationBeforeTransitions: null
});

export default (state = initialState, action) => {
   if (action.type === LOCATION_CHANGE) {
     return state.set('locationBeforeTransitions', action.payload);
   }
  
	return state;
 };
```

当我们使用`syncHistoryWithStore`方法连接history对象和store时，需要将routing负载转换成一个JavaScript对象，如下传递一个`selectLocationState`参数给`syncHistoryWithStore`方法：

```react
import { browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';

const history = syncHistoryWithStore(browserHistory, store, {
   selectLocationState (state) {
       return state.get('routing').toJS();
	}
});
```

#### Immutable.js与Redux实践

当使用Immutable.js和Redux协作开发时，可以从如下几方面思考我们的实践。

##### JavaScript对象转换为Immutable对象

1. 不要在Immutable对象中混用原生JavaScript对象；

2. 当在Immutable对象内添加JavaScript对象时，首先使用`fromJS()`方法将JavaScript对象转换为Immutable对象，然后使用`update()`,`merge()`,`set()`等更新API对Immutable对象进行更新操作；

   ```javascript
   // avoid
   const newObj = { key: value }
   const newState = state.setIn(['prop1'], newObj)
   // newObj has been added as a plain JavaScript object, NOT as an Immutable.JS Map

   // recommended
   const newObj = { key: value }
   const newState = state.setIn(['prop1'], fromJS(newObj))
   ```

##### Immutable与Redux state tree

1. 使用Immutable对象表示完整的Redux状态树；

   对于一个Redux应用，完整的状态树应该由一个Immutable对象表示，而没有原生JavaScript对象。

2. 使用`fromJS()`方法创建状态树

   状态树对象可以是一个Immutable.Record或者任何其他的实现了`get`,`set`,`withMutations`方法的Immutable集合的实例。

3. 使用redux-immutable库调整`combineReducers`方法使其能处理Immutable。

##### Immutable与Redux组件

当使用Redux作React应用状态管理容器时，我们通常将组件分为容器组件和展示型组件，Immutable与Redux组件的实践也主要围绕这两者。

1. 除了在展示型组件内，其他地方一律使用Immutable方式操作状态对象；

   为了保证应用性能，在容器组件，选择器（selectors），reducer函数，action创建函数，sagas和thunks函数内等所有地方均使用Immutable，但是不在展示型组件内使用。

2. 在容器组件内使用Immutable

   容器组件可以使用react-redux提供的`connect`方法访问redux的store，所以我们需要保证选择器（selectors）总是返回Immutable对象，否则，将会导致不必要的重新渲染。另外，我们可以使用诸如reselect的第三方库缓存选择器（selectors）以提高部分情景下的性能。

##### Immutable对象转换为JavaScript对象

`toJS()`方法功能就是把一个Immutable对象转换为一个JavaScript对象，而我们通常尽可能将Immutable对象转换为JavaScript对象这一操作放在容器组件中，这也与容器组件的宗旨吻合。另外`toJS`方法性能极低，应该尽量限制该方法的使用，如在`mapStateToProps`方法和展示型组件内。

1. 绝对不要在`mapStateToProps`方法内使用`toJS()`方法

   `toJS()`方法每次会调用时都是返回一个原生JavaScript对象，如果在`mapStateToProps`方法内使用`toJS()`方法，则每次状态树（Immutable对象）变更时，无论该`toJS()`方法返回的JavaScript对象是否实际发生改变，组件都会认为该对象发生变更，从而导致不必要的重新渲染。

2. 绝对不要在展示型组件内使用`toJS()`方法

   如果传递给某组件一个Immuatble对象类型的prop，则该组件的渲染取决于该Immutable对象，这将给组件的重用，测试和重构带来更多困难。

3. 当容器组件将Immutable类型的属性（props）传入展示型组件时，需使用高阶组件（HOC）将其转换为原生JavaScript对象。

   该高阶组件定义如下：

   ```react
   import React from 'react'
   import { Iterable } from 'immutable'

   export const toJS = WrappedComponent => wrappedComponentProps => {
   	const KEY = 0
       const VALUE = 1
   	const propsJS = Object.entries(wrappedComponentProps)
       .reduce((newProps, wrappedComponentProp) => {
       	newProps[wrappedComponentProp[KEY]] = 	Iterable.isIterable(wrappedComponentProp[VALUE]) ? wrappedComponentProp[VALUE].toJS() : wrappedComponentProp[VALUE]
        	return newProps
   	}, {})
       
   	return <WrappedComponent {...propsJS} />
   }
   ```

   该高阶组件内，首先使用`Object.entries`方法遍历传入组件的props，然后使用`toJS()`方法将该组件内Immutable类型的prop转换为JavaScript对象，该高阶组件通常可以在容器组件内使用，使用方式如下：

   ```react
   import { connect } from 'react-redux'
   import { toJS } from './to-js'
   import DumbComponent from './dumb.component'

   const mapStateToProps = state => {
   	return {
         // obj is an Immutable object in Smart Component, but it’s converted to a plain
         // JavaScript object by toJS, and so passed to DumbComponent as a pure JavaScript
         // object. Because it’s still an Immutable.JS object here in mapStateToProps, though,
         // there is no issue with errant re-renderings.
       	obj:getImmutableObjectFromStateTree(state)
      }
    }

    export default connect(mapStateToProps)(toJS(DumbComponent))
   ```

   这类高阶组件不会造成过多的性能下降，因为高阶组件只在被连接组件（通常即展示型组件）属性变更时才会被再次调用。你也许会问既然在高阶组件内使用`toJS()`方法必然会造成一定的性能下降，为什么不在展示型组件内也保持使用Immutable对象呢？事实上，相对于高阶组件内使用`toJS()`方法的这一点性能损失而言，避免Immutable渗透入展示型组件带来的可维护性，可重用性及可测试性是我们更应该看重的。

##### 参考

1. [Immutable.js Best practices](http://redux.js.org/docs/recipes/UsingImmutableJS.html#immutable-js-best-practices)



### Immutable.js与reselect

#### reselect

使用Redux管理React应用状态时，`mapStateToProps`方法作为从Redux Store上获取数据过程中的重要一环，它一定不能有性能缺陷，它本身是一个函数，通过计算返回一个对象，这个计算过程通常是基于Redux Store状态树进行的，而很明显的Redux状态树越复杂，这个计算过程可能就越耗时，我们应该要能够尽可能减少这个计算过程，比如重复在相同状态下渲染组件，多次的计算过程显然是多余的，我们是否可以缓存该结果呢？这个问题的解决者就是reselect，它可以提高应用获取数据的性能。

> reselect的原理是，只要相关状态不变，即直接使用上一次的缓存结果。

#### 选择器

reselect通过创建选择器（selectors），该函数接受一个state参数，然后返回我们需要在`mapStateToProps`方法内返回对象的某一个数据项，一个选择器的处理可以分为两个步骤：

1. 接受state参数，根据我们提供的映射函数数组分别进行计算，如果返回结果和上次第一步的计算结果一致，说明命中缓存，则不进行第二步计算，直接返回上次第二步的计算结果，否则继续第二步计算。第一步的结果比较，通常仅仅是`===`相等性检查，性能是足够的。

2. 根据第一步返回的结果，计算，返回最终结果。

   以TODO为例，有如下选择器函数：

   ```javascript
   import { createSelector } from 'reselect'
   import { FilterTypes } from '../constants'

   export const selectFilterTodos = createSelector(
   	[getTodos, getFilters],
   	(todos, filters) => {
         switch(filters) {
           case FilterTypes.ALL:
           	return todos;
           case FilterTypes.COMPLETED:
           	return todos.filter((todo) => todo.completed)
           default:
           	return todos
         }
   	}
   )
   ```

   如上，createSelector方法，接受两个参数：

   1. 第一个参数是一个映射函数数组，选择器处理流程的第一步所处理的数据即为该数组内各函数的返回值，这些返回值也依次作为参数传入第二步处理函数；
   2. 第二个参数则是，第二步的具体计算函数，也即缓存结果处理函数，其返回结果也即`mapStateToProps`方法所需的数据；

   然后在`mapStateToProps`内使用该选择器函数，接受state参数：

   ```react
   const mapStateToProps = (state) => {
     return {
       todos: selectFilterTodos(state)
     }
   }
   ```

   上文中的映射函数，内容如：

   ```javascript
   const getTodos = (state) => {state.todos}
   const getFilter = (state) => {state.filter}
   ```

##### Immutable概念数据

另外需要注意的是，传入`createSelector`的映射函数返回的状态应该是不可变的，因为默认缓存命中检测函数使用引用检查，如果使用JavaScript对象，仅改变该对象的某一属性，引用检测是无法检测到属性变更的，这将导致组件无法响应更新。在缓存结果处理函数内执行如下代码，是不行的：

```react
todos.map(todo => {
  todo.completed = !areAllMarked
  return todo
})
```

这种突然性的改变某一状态对象后，其差异检测无法通过，将命中缓存，无法更新，在未使用Immutable.js库时，应该采用如下这种方式：

```react
todos.map(todo => Object.assign({}, todo, {
  completed: !areAllMarked
}))
```

总是返回一个新对象，而不影响原对象。

#### 自定义选择器

前面使用`createSelector`方法创建的选择器函数默认缓存间隔是1，只缓存上一次的计算结果，即选择器处理流程的第一步，仅会将当前计算结果与紧邻的上一次计算结果对比。

有时候也许我们会想是否可以加大缓存程度呢？比如当前状态a，变化到状态b，此时缓存的仅仅是状态b下的选择器计算结果，如果状态再次变为a，比对结果自然是false，依然会执行复杂的计算过程，那我们是否能缓存第一次状态a下的选择器计算结果呢？答案就在`createSelectorCreator`。

##### defaultMemoize

```javascript
defaultMemoize(func, equalityCheck = defaultEqualityCheck)
```

defaultMemoize将缓存传递的第一个函数参数`func`的返回结果，该函数是使用`createSelector`创建选择器时传入的缓存结果处理函数，其默认缓存度为1。

`equalityCheck`是创建的选择器使用的缓存命中检测函数，默认函数代码如：

```javascript
function defaultEqualityCheck(currentVal, previousVal) {
  return currentVal === previousVal
}
```

只是简单的进行引用检查。

##### createSelectorCreator

`createSelectorCreator`方法支持我们创建一个自定义的`createSelector`函数，并且支持我们传入自定义的缓存计算函数，覆盖默认的`defaultMemoize`函数，定义格式如下：

```javascript
createSelectorCreator(memoize, ...memoizeOptions)
```

1. `memoize`参数是一个缓存函数，用以替代`defaultMemoize`，该函数接受的第一个参数就是创建选择器时传入的缓存结果处理函数;
2. `…memoizeOptions`是0或多个配置对象，将传递给`memoize`缓存函数作为后续参数，如可以传递一个自定义缓存检测函数覆盖`defaultEqualityCheck`;

```react
// 使用lodash.isEqual覆盖默认的‘===’引用等值检测
import isEqual from 'lodash.isEqual'
import { createSelectorCreator, defaultMemoize } from 'reselect'

// 自定义选择器创建函数
const customSelectorCreator = createSelectorCreator(
  customMemoize, // 自定义缓存函数，也可以直接使用defaultMemoize
  isEqual, // 配置项
  option2 // 配置项
)

// 自定义选择器
const customSelector = customSelectorCreator(
  input1, // 映射函数
  input2, // 映射函数
  resultFunc // 缓存结果处理函数
)

// 调用选择器
const mapStateToProps = (state) => {
  todos: customSelector(state)   
}
```

在自定义选择器函数内部，会执行缓存函数：

```javascript
customMemoize(resultFunc, isEqual, option2)
```

#### 结合Immutable.js

如上文为例，reselect是内在需要使用Immutable概念数据的，当我们把整个Redux状态树Immutable化以后，需要进行一些修改。

修改映射函数：

```javascript
const getTodos = (state) => {state.get('todos')}
const getFilter = (state) => {state.get('filter')}
```

特别需要注意的是在选择器第二步处理函数内，如果涉及Immutable操作，也需要额外修改成Immutable对应方式。

## Immutable实践中的问题

无论什么情况，都不存在绝对完美的事物或者技术，使用Immutable.js也必然会带来一些问题，我们能做的则是尽量避免或者尽最大可能的分化这些问题，而可以更多的去发扬该技术带来的优势，使用Immutable.js最常见的问题如下。

1. 很难进行内部协作

   Immutable对象和JavaScript对象之间存在的巨大差异，使得两者之间的协作通常较麻烦，而这也正是许多问题的源头。

   1. 使用Immutable.js后我们不再能使用点号和中括号的方式访问对象属性，而只能使用其提供的`get`,`getIn`等API方式；
   2. 不再能使用ES6提供的解构和展开操作符；
   3. 和第三方库协作困难，如lodash和JQuery等。

2. 渗透整个代码库

   Immutable代码将渗透入整个项目，这种对于外部类库的强依赖会给项目的后期带来很大约束，之后如果想移除或者替换Immutable是很困难的。

3. 不适合经常变更的简单状态对象

   Immutable和复杂的数据使用时有很大的性能提升，但是对于简单的经常变更的数据，它的表现并不好。

4. 切断对象引用将导致性能低下

   Immutable最大的优势是它的浅比较可以极大提高性能，当我们多次使用`toJS`方法时，尽管对象实际没有变更，但是它们之间的等值检查不能通过，将导致重新渲染。更重要的是如果我们在`mapStateToProps`方法内使用`toJS`将极大破坏组件性能，如果真的需要，我们应该使用前面介绍的高阶组件方式转换。

5. 难以调试

   当我们审查一个Immutable对象时，浏览器会打印出Immutable.js的整个嵌套结构，而我们实际需要的只是其中小一部分，这导致我们调试较困难，可以使用Immutable.js Object Formatter浏览器插件解决。