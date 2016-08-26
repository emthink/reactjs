# React入门与进阶（首篇）

早期，我们开发web应用，只能是通过请求服务器，服务端响应请求，返回一个页面，，每次浏览器都得对页面加载，渲染，非常影响用户体验；直到出现了ajax，人们感觉web开发的春天终于来了，ajax使得我们可以在不刷新整个页面的情况下，更新页面局部，开发者开始使用各种类库在浏览器端渲染应用，但是随着应用越来越大，这种方式也越来越难整合。

React的设计思路是将请求发生时渲染整个页面这种工作流放到客户端中。

## React初识

### 状态

首先，我们需要了解一下状态与状态机的概念：

- 状态

状态就是一种事物在之前一段时间经过人为或自主发展后的表现结果。在一个web应用中，状态是指经过用户操作，交互后应用的表现结果。

- 状态机

> 对于一组状态，随着时间变化，根据不同的输入，各状态不断进行转换，状态机即负责管理不同状态间的转换。

### React特性

在以前，每次交互后，应用状态变化，我们需要重新渲染整个页面，这是很慢的；尽管后来有了ajax，我们得以使用ajax异步请求数据，然后使用JavaScript查询获取DOM，使用新数据更新DOM，比原来体验好了许多，但这也必然引起浏览器对页面的重绘或重排，也有性能局限，我们的程序员又踏上了更高的追求。

React主要只负责两件事，都只和View视图相关：

	1. 更新DOM
	2. 响应事件


- 更新DOM

React使用了虚拟DOM（Virtual DOM）构造一个强悍的渲染系统：通过内部渲染函数计算出尽量少的DOM更新，触发最少的重绘改变应用的状态，为用户提供更友好的体验。

> 渲染函数，可以读取特定时间或操作下应用页面的状态，并将其转换为页面上的虚拟表现（这些虚拟表现由Virtual DOM构成），通过比较不同的虚拟表现，可以计算出状态改变后最少的DOM变化，提供给React的渲染系统。

- 响应事件

React只使用单个事件处理器，将所有事件委托给此事件处理器，使得应用更高效的处理所有事件。

## JSX

除了使用原生JavaScript语法编写React应用，React还提供一种在组件内构建标签的类XML语法--JSX(JavaScript XML)。

```

	// 旧版本React原生JavaScript语法
	var title1 = React.DOM.h1({className: 'react'}, 'React');

	// 新版本React原生JavaScript语法
	var title2 = React.createElement('h1', {className: 'react'}, 'React');

	// JSX语法
	var title3 = React.createClass({			
		render: function() {				
			return (
				<div onClick={this.handleClick}>
					<h1 className="react">
					React, {this.label_txt}
					</h1>
					<div className="component-cont">
						{this.props.children}
					</div>
					<p>{this.dateToString(new Date())}</p>
				</div>
			);
		},
		handleClick: function() {
		}
	});
```

和原生JavaScript语法不同，如果使用了JSX语法，我们需要将其转换成原生js执行：

### JSXTransformer.js

React提供JSXTransformer.js转换JSX语法，需要引入JSXTransformer.js并且将script标签type设置为text/jsx：

```

	<script type="text/jsx" src=""></script>
	<script type="text/jsx">...</script>
```

如图：

![JSXTransformer.js](http://blog-resource.bj.bcebos.com/photos/2016/08/react-jsx.png)

### babel

也可以使用babel转换JS语法：引入babel的browser.js,并且将script标签type设置为text/babel

![babel](http://blog-resource.bj.bcebos.com/photos/2016/08/babel.png)

```
	
	<script type="text/babel" src=""></script>
	<script type="text/babel">...</script>
```

**注：使用JSX语法后，如果是引入外部js文件的形式，浏览器会请求文件失败，且这种语法转换较慢，尽量在服务端预先转换语法。**




## React Component

React推荐创建组件处理特定需求，在应用中组合使用组件，实现特定功能。

### 单向数据流

React组件是一个状态机，每个组件内部都有自己的状态(state)，其状态只在内部作用域下操作修改。多个组件之间可以是复合的关系，即父子组件关系，React组件提供设置组件属性(props)，属性可以从父组件获取传递到各子组件。

> 父组件与子组件通信，最简单的方式是通过props,父组件通过props传递回调函数给子组件，在回调函数里可以更新state,触发组件重绘；在子组件中调用回调函数，也可以传入数据参数。

#### props

props即属性，我们可以给React组件设置属性，属性值可以是任意JavaScript数据类型，且在组件内应该是只读的。

- this.props

我们可以通过this.props访问到所有组件属性，但是该属性值是只读的。

- 挂载组件属性

可以在挂载组件时传入组件props，指定其属性值：

```

	var HelloReact = React.createClass({
		render: function() {
			return (
				<h1>{this.props.greetWord}</h1>
			);
		}	
	});
	
	var greet = "Hello, React";
	React.render(
        <HelloReact greetWord={greet} />,
        document.querySelector('body')
      );
```

- getDefaultProps

在创建组件时，可以定义getDefaultProps方法为组件设置默认属性值，该方法在调用创建组件类方法时即被调用：

```

	var HelloReact = React.createClass({
		getDefaultProps: function() {
			return {
				name: 'coding'
			};
		}
		// ...
	});
```

- setProps

我们也可以使用setProps()方法设置组件属性，但是只能在组建外或者子组件中调用该方法：

```

	var HelloReact = React.createClass({
		render: function() {
			return (
				<h1>{this.props.greetWord}</h1>
			);
		}
	});

	var helloReact = React.render(
        <HelloReact greetWord={greet} />,
        document.querySelector('body')
      );
	helloReact.setProps({greetWord: 'Hello, world!'});
```

- PropTypes

React提供了一种验证props的方式：定义一个propTypes对象，指定组件属性应该满足的数据类型，若不满足则会输出一条console.warn语句：

```
	
	var HelloReact = React.createClass({
		propTypes: {
			greetWord: React.PropTypes.func
		},
		render: function() {
			return (
				<h1>{this.props.greetWord}</h1>
			);
		}
	});

	var helloReact = React.render(
        <HelloReact greetWord={greet} />,
        document.querySelector('body')
    );
```

#### state

我们说每一个组件都是一个状态机，管理着各自的状态，就是所谓的state，state只存在于组件的内部。

- this.state

可以通过this.state访问组件状态值。

- getInitialState

React组件state默认是null，在定义组件类时我们可以定义getInitialState方法指定组件初始state值。

```

	var HelloReact = React.createClass({
		getInitialState: function() {
			return {
				isShowContent: false
			};
		},
		render: function() {
			if (this.state.isShowContent) {
				return (
					<div>state modified</div>
				);
					}
			return (
				<h1>{this.props.greetWord}</h1>
			);
		}
	});

	var helloReact = React.render(
        <HelloReact greetWord={greet} />,
        document.querySelector('body')
    );
```

- setState

在组件渲染到页面后，我们可以通过setState方法修改组件状态值，state变化后会自动调用render方法，重新渲染DOM。

```

	var HelloReact = React.createClass({
		getInitialState: function() {
			return {
				isShowContent: false
			};
		},
		render: function() {
			if (this.state.isShowContent) {
				return (
					<div>state modified</div>
				);
					}
			return (
				<h1 onClick={this.handleClick}>{this.props.greetWord}</h1>
			);
		},
		handleClick: function() {
			this.setState({
				isShowContent: !this.state.isShowContent
			});
		}
	});

	var helloReact = React.render(
        <HelloReact greetWord={greet} />,
        document.querySelector('body')
    );
```

- replaceState

更新组件状态有两种方法：setState和replaceState，和前者在原有state对象上拓展不同，replaceState是使用传入的参数直接替换原有的state。

**永远不要通过setState和replaceState方法以外的方式更新state，如：```this.state.isShowContent = true;```，这样更新state，React无法监控，组件无法重新渲染。**

#### props & state

state只存在与组件内部，它应该只是对应组件视图的某一种状态，是一种简单的值，任何不必要的或通过计算得出的值都不应该在这里出现。

如果需要在组件树中传递或给特定组件传入数据，可以通过props给上层组件设置属性值，可以是任意类型的数据；一旦属性传入组件，其应该是只读的。

### 组件的生命周期

每个组件拥有其生命周期：从实例化，到生存期，到被销毁。

#### 实例化

当一个组件在首次实例化时，调用的生命周期方法依次为：

	1. getDefaultProps
	2. getInitialState
	3. componentWillMount
	4. render
	5. componentDidMount

在组件的后续应用，则会依次调用如下方法：

	1. getInitialState
	2. componentWillMount
	3. render
	4. componentDidMount

- getDefaultProps

该方法返回一个对象设置实例的默认props值，在调用定义组件类方法时调用且只调用一次。

- getInitialState

此方法可以初始化每个实例的state，每次实例化都只会调用一次。

- componentWillMount

该方法在组件完成首次渲染之前调用，此时可以修改组件state。

- render

此方法创建虚拟DOM，返回一个虚拟表现；此方法是定义组件类是必需定义地方法。

- componentDidMount

此方法在render方法成功返回值，且真实DOM在页面渲染完成之后，调用，经常通过this.getDOMNode()方法获取真实DOM节点。

#### 生存期

组件渲染好，在页面中生成DOM并且可以与用户交互，即是组件的生存期。

在生存期，随着用户的交互，可能触发的生存期方法有：

	1. componentWillReceiveProps
	2. shouldComponentUpdate
	3. componentWillUpdate
	4. componentDidUpdate


- componentWillReceiveProps

React组件的props在其指定或被上级组件更改时，将触发此方法，此方法接收一个参数：更改后的props，我们可以在此方法内根据props值更改组件内部state值。

- shouldComponentUpdate

在组件首次渲染完后，如果我们改变了组件props或state值，将触发此方法，若该组件及其下级组件都不需要渲染新的props和state，则此方法返回false，不会调用render()方法，否则，返回true，调用render()方法重新渲染组件。我们可以自定义覆盖该方法，优化该组件决定是否重新渲染组件的规则，获得更适合需求的用户体验。

- componentWillUpdate

组件接收新的props或state后，render()方法触发前将调用此方法。

**注：不要在此方法内更新state.**

- componentDidUpdate

组件接收新的props或state后，render()方法触发，组件渲染好后将调用此方法。

#### 销毁

在使用完React组件后，我们需要将其从页面文档移除销毁。

- componentWillUnmount

当一个组件被移除时，将触发componentWillUnmount()方法，我们可以在此方法内清理之前的一些引用或事件监听程序。

### 事件处理

前文提到，React主要关注两件事：更新DOM，响应事件。关于更新DOM,前文已经阐述，接下来要学习React的单一事件处理器。

> 组件相当于一个状态机，其提供给用户一个视图（view），组件内部状态（state）对应特定的视图表现，用户与视图交互时，我们通过在组件上绑定事件处理器监听用户输入，事件触发时，在事件处理器中更新组件状态（state），React根据state值的变化决定是否更新（重绘或重新渲染）组件，组件在render方法内渲染新的state数据，更新视图表现。

#### 绑定事件处理器

React绑定事件处理器写法类似HTML内联事件写法，但其本质是通过事件代理实现的：

```

	render: function() {
			if (this.state.isShowContent) {
				return (
					<div>state modified</div>
				);
					}
			return (
				<h1 onClick={this.handleClick}>{this.props.greetWord}</h1>
			);
		}
```

React支持的事件类型可以参考：[http://facebook.github.io/react/docs/events.html](http://facebook.github.io/react/docs/events.html)

##### 触摸事件

若需要在React中使用触摸事件，则需要手动调用开启：```React.initializeTouchEvents(true);```

#### 事件与状态

只有组件的props或state变化才会触发组件重绘和渲染，如果组件需要随用户交互输入改变视图表现，则需要在事件处理程序里更新组件state。

```

	var HelloReact = React.createClass({
		getInitialState: function() {
			return {
				isShowContent: false
			};
		},
		render: function() {
			if (this.state.isShowContent) {
				return (
					<div>state modified</div>
				);
					}
			return (
				<h1 onClick={this.handleClick}>{this.props.greetWord}</h1>
			);
		},
		handleClick: function(event) {
			this.setState({
				isShowContent: !this.state.isShowContent
			});
		}
	});

	React.render(
            React.createElement(title3, null, 'this is my react practice.'),
            document.querySelector('.main')
    );
```

线上地址：[点此查看效果](http://demo.codingplayboy.com/demo/react/practice/event-state.html)

#### 事件对象

和原生DOM事件一样，React事件处理器函数会传入一个事件对象。React并不是直接把原生DOM的事件对象传给事件处理器函数，而是封装在SyntheticEvent对象中，但其使用和原始事件对象保持一致，并且可以通过其nativeEvent属性获取原生事件对象：

```

	handleClick: function(event) {
        console.log(event);
        console.log(event.nativeEvent);
        this.setState({
            isShowContent: !this.state.isShowContent
        });
    }
```

输出如下：

![React事件对象与原生事件对象](http://blog-resource.bj.bcebos.com/photos/2016/08/react-event.png)

线上地址，可以打开控制台查看打印消息。：[点此查看效果](http://demo.codingplayboy.com/demo/react/practice/event-state.html)


对于有一定基础的前端同学，经过本篇学习，应该可以使用React编写一个基本的程序了，接下来将深入学习React组件复合，通信。






