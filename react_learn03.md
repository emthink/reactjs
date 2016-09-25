# React入门与进阶之Flux

[上一篇](http://blog.codingplayboy.com/2016/08/28/react_learn_02/)，我们学习了React组件间的复合和通信，本篇我们详细介绍为React设计的架构模式Flux。Flux为React提供了一种单向数据流模式，使用此模式能够很方便的监控数据变化的原因和过程。

[本篇相关代码可点此查看](https://github.com/codingplayboy/reactjs/tree/master/react-notes)

## Flux初识

> Flux是Facebook用来创建客户端web应用的一种架构模式，它使用单向数据流方式实现了React组件的复合和通信。

一个Flux应用主要包含三大部分：dispatcher,store和views(即React Component)。如果细分一下，也可以分为四部分：dispatcher,action,store和views。Flux模式下各部分均相互独立。

### 数据流

贯穿Flux的一个核心概念是单向数据流(undirectional data flow)，盗个官方图：

![React Flux Data Flow](http://blog.codingplayboy.com/wp-content/uploads/2016/09/react-flux-df.png)

如图，Flux各部分相互独立，使用Action creators辅助函数创建一个action，提供给dispatcher；在store中给dispatcher注册回调函数，dispatcher通过回调函数将每个action分发给所有store；store根据action进行更新操作，并发布特定变化事件，views订阅该特定变化事件，并注册回调函数；特定变化事件触发后回调函数执行，该函数可以接收数据参数并将数据传递给React组件，调用setState()方法，整个组件进行重新渲染。

## Action

Action creator是一个辅助函数，该辅助函数创建一个action，且将该action传递给dispatcher；该函数接收一个对象参数，该对象拥有type属性，表示所创建action的类型，也可以包含其他数据。

> dispatcher提供一个方法，允许我们触发一个dispatch，该方法接收一个对象做参数，随后将这个对象分发给所有store，我们把该对象叫做action，此方法就是我们通常说的action creator。

```
	var NotingDispatcher = require('../dispatcher/NotingDispatcher');
	var _CONSTANT = require('../commons/variables');
	var NotingActions = {
		create: function(content) {
			NotingDispatcher.dispatch({
				type: _CONSTANT.CREATE,
				content: content
			});
		}
	};
```

代码中，使用dispatcher提供的dispatch方法，创建一个action给dispatcher,该action对象有type属性代表action类型，也可以有其他任何属性，如此处的noting内容属性。


## Dispatcher

Dispatcher提供一个register方法，该方法允许我们为该dispatcher注册一个回调函数，该回调函数接收一个action参数，在回调中将action传递给store。

Diapatcher还提供一个dispatch方法，在action中触发注册的回调函数。

> dispatcher是Flux应用管理数据流的中心线。

**注:dispatcher允许我们将每一个action分发给所有store。**

```

	var NotingDispatcher = require('flux').Dispatcher;
```

对于dispatcher，我们只需要使用Flux提供的Dispatcher;

## Store

store主要负责给dispatcher注册回调函数，在回调函数中根据传入的action进行相应处理，更新store（更新应用状态），并发布一个变化事件，该事件在views中触发对该事件的订阅，可以通过事件回调函数将新的应用状态作为参数传入views。

> 在Flux应用中，我们在store内维护应用状态和逻辑。

**注：store中的应用状态不是React组件中所说的state。**

### 发布订阅模式

Flux store中使用发布订阅模式维护，传递应用状态，这里使用events模块提供发布订阅功能的实现。


```

	var EventEmitter = require('events').EventEmitter;
	var NotingDispatcher = require('../dispatcher/NotingDispatcher');
	var Utils = require('../commons/utils');
	var notings = require('../commons/NotingData');
	var _CONSTANT = require('../commons/variables');

	var NotingStore = Utils.extend({}, EventEmitter.prototype, {
		create: function(content) {
			var id = Utils.makeUID();
			notings[id] = {
				id: id,
				content: content
			};
		},
		getAllNotings: function() {
			return notings;
		},
		emitChange: function() {
			this.emit(_CONSTANT.CHANGEEVENT);
		},
		bindChangeEvent: function(callback) {
			this.on(_CONSTANT.CHANGEEVENT, callback);
		},
		removeChangeEvent: function(callback) {
			this.removeListener(_CONSTANT.CHANGEEVENT, callback);
		}
	});

	NotingDispatcher.register(function(action) {
		var content = action && action.content;

		switch(action.type) {
			case _CONSTANT.CREATE:
				if (content !== '') {
					NotingStore.create(content);
					NotingStore.emitChange();
				} 
				break;
		}
	});
```

在store中，我们使用dispatcher提供的register方法为dispatcher注册回调函数，回调函数接收一个action，根据action类型和数据做相应的逻辑处理。我们也可以看到，整个应用的状态（主要指数据）在store中进行维护，并通过发布/订阅模式结合回调函数的方式将应用状态的更新发布到views，使得views能将数据传递给React组件树，改变组件状态。

## Views

Flux中的views负责在组件渲染后监听（订阅）由store发布的变化事件，在事件回调中，新的数据作为参数传入，然后调用React组件的setState()方法，更新组件状态，触发组件的重新渲染。

> views从store接收数据并将数据传给组件树，组件树根据传入的数据更新state。

**注：Flux的views是一种特殊的控制视图(control-views)。**

```

	var React = require('react');
	var NotingStore = require('../stores/NotingStore');
	var NotingList = require('./NotingList');

	function getNotingState() {
    	console.log(NotingStore.getAllNotings());
    	return {
        	notings: NotingStore.getAllNotings()
    	};
	}

	var NotingApp = React.createClass({
    	_onChange: function() {
        	this.setState(getNotingState());
    	},
    	getInitialState: function() {
        	return getNotingState();
    	},
    	componentDidMount: function() {
        	NotingStore.bindChangeEvent(this._onChange);
    	},
    	componentWillUnMount: function() {
        	NotingStore.removeChangeEvent(this._onChange);
    	},
    	render: function() {
        	return (
            	<div>
                	<h2>React Noting</h2>
                	<NotingList notings={this.state.notings}></NotingList>
            	</div>
        	);
   		}
	});

```

如代码中，在组件生命周期函数componentDidMount即组件渲染完成后触发订阅stor管理的变化事件，在组件卸载的时候取消订阅（componentWillUnMount函数中实现）。

[本篇相关代码可点此查看](https://github.com/codingplayboy/reactjs/tree/master/react-notes)

关于Flux，本篇就介绍到这里，更深入的学习和讲解，会在本系列后续章节阐述。
