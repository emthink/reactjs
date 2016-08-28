# React入门与进阶（二）

在[上一篇](http://blog.codingplayboy.com/2016/08/20/react/)，我们学习了React基础知识，JSX语法；props和state；组件的生命周期和生命周期方法；组件的事件处理相关知识，对React有了一定的了解，但主要是对单个React组件的学习，本篇我们开始学习React组件的复合和通信。

[查看本篇相关代码](https://github.com/codingplayboy/reactjs/tree/master/react-comment)

## 组件的复合（composability）

React应用中，组件是构成应用的基本单元，每一个基础组件提供一个基本功能，多个基础组件组合起来可以提供一个更大的功能，如果想要开发一个完整的React应用，我们有必要对组件间的复合足够了解。

### 评论列表实例

以一个评论或状态列表为实例，当我们需要实现一个展示评论列表或状态列表，比如：

![评论列表](http://blog.codingplayboy.com/wp-content/uploads/2016/08/react_02_prac_01.png)

拿到这么一个功能，我们首先需要思考如何设计开发结构，从上到下，由外到内，评论或状态列表是一个独立组件，可以在应用复用；在列表里面，有很多列表项，这些项之间只有数据不同，于是可以抽象出一个评论或状态组件，进行复用；开发识，我们可以从外到内进行，先创建一个评论或状态组件：

```

	var Comment = React.createClass({               
        render: function() {             
            return (
                <div className="comment">
                    <h2 className="commentTitle">
                        {this.props.title}
                    </h2>
                    <span>{this.props.children.toString()}</span>
                </div>
			);
        }
    });

	var comment = {
		id: '10001',
		title: '前端',
		text: 'React',
		isShow: true
	};
	
	React.render(<Comment title={comment.title} key={comment.id} isShow={comment.isShow}>
                        {comment.text}
                    </Comment>, document.getElementById('content'));
```
结果如图：
![单组件](http://blog.codingplayboy.com/wp-content/uploads/2016/08/react_02_prac_02.png)

#### 组件复用

再创建一个列表组件，并在组件中使用之前定义的单项组件，如下，只有一项的列表：

```

	var CommentList = React.createClass({
        render: function() {
			var comment = this.props.comment;
            return (
                <div className="commentList">
                    <Comment title={comment.title} key={comment.id} isShow={comment.isShow}>
                        {comment.text}
                    </Comment>
                </div>
            );
        }
    });
	var comment = {
		id: '10001',
		title: '前端',
		text: 'React',
		isShow: true
	};
		
	React.render(<CommentList comment={comment}></CommentList>, document.getElementById('content'));
```
结果如图：
![组件复合](http://blog.codingplayboy.com/wp-content/uploads/2016/08/react_02_prac_03.png)

当然，我们的列表不可能只有一项，我们需要对列表数据进行映射，每一项对应一个组件，通常我们使用map函数：

```

	var CommentList = React.createClass({
	    render: function() {

			// 映射生成多列表项
	        var commentNodes = this.props.comments.map(function(comment) {
		        return (
		            <Comment title={comment.title} key={comment.id} isShow={comment.isShow}>
		                {comment.text}
		            </Comment>
		        );
	        });

	        return (
		        <div className="commentList">
		            {commentNodes}
		        </div>
		    );
	    }
	});

	var comments = [{
		id: '10001',
		title: '前端',
		text: 'React',
		isShow: true
	}, {
		id: '10002',
		title: '后端',
		text: 'Java',
		isShow: true
	}];
		
	React.render(<CommentList comments={comments}></CommentList>, document.getElementById('content'));
```

结果如图：

![组件复用](http://blog.codingplayboy.com/wp-content/uploads/2016/08/react_02_prac_04.png)

## 组件间关系

本篇的主旨是阐述多组件间的复合与通信，类似人一样，每一个人是一个单独的个体，但在群体人与人之间拥有很多关系，组件也是如此。

### 从属关系

如上文组件的复合实例，CommentList组件实例内拥有Comment组件实例，在CommentList组件实例设置了Comment组件实例的props。在React中，一个组件设置另一个组件的props，把这两个组件间的关系称为从属关系(owner-ownee)，也可以叫主从关系，前者是主组件，后者是属组件。

```

	var CommentList = React.createClass({
        render: function() {
			var comment = this.props.comment;
            return (
                <div className="commentList">
                    <Comment title={comment.title} key={comment.id} isShow={comment.isShow}>
                        {comment.text}
                    </Comment>
                </div>
            );
        }
    });
```
这里，CommentList组件就是主组件，在其render()方法内创建实例的Comment组件就是属组件。

**通常，主从关系表现为在主组件的render()方法内创建属组件实例。**

### 父子关系

不同于React组件的从属关系，组件的父子关系就像DOM里的元素的父子关系，
如上CommentList实例,Comment组件实例是类名为commentList的div的子元素，这种关系就是父子关系。

```

	return (
        <div className="commentList">
            <Comment title={comment.title} key={comment.id} isShow={comment.isShow}>
                {comment.text}
            </Comment>
        </div>
    );
```

- this.props.children

React提供props的children属性，可以访问实例化时传递过来的子级内容：

```

	var Type = React.createClass({
		render: function() {
			return (
				<span>{this.props.type}</span>
			);
		}
	});

	var Comment = React.createClass({               
        render: function() {             
            return (
                <div className="comment">
                    <h2 className="commentTitle">
                        {this.props.title}
                    </h2>
                    <div>{this.props.children}</div>
                </div>
			);
        }
    });

	var comment = {
		id: '10001',
		title: '前端',
		text: 'React',
		type: '新闻',
		isShow: true
	};
	
	React.render(<Comment title={comment.title} key={comment.id} isShow={comment.isShow}>
                        <Type type={comment.type}></Type>
                    </Comment>, document.getElementById('content'));
```

上例中，通过this.props.children访问了子组件(Type组件)的子级内容，将其放在父组件(Comment组件)视图的div元素下。

结果如图：

![this.props.children](http://blog.codingplayboy.com/wp-content/uploads/2016/08/react_02_props_children.png)


## 组件通信

上文阐述了组件的复合及组件间的关系，接下来需要关注的是组件间的通信。

### 单向数据流

在React中，数据流通过props从主组件流向属组件，是组件间通信最简单的方式，前文已经阐述。

> 单向数据绑定：主组件将基于自己的props或state计算出来的值绑定到属组件的props，如此在组件树中递归，就形成了一条单向数据流，我们称这种方式是单向数据绑定。

### 逆向数据流

有时候，我们需要从属组件，传递数据到主组件，一般在主组件render()方法内绑定回调函数给属组件props，而在属组件内调用回调函数（直接调用或者将其注册为DOM事件处理程序），并传入参数，这些参数可以在主组件访问到，可以利用这些数据进行其他逻辑处理或更新主组件state，触发组件的重绘，达到一种逆向数据流的效果。

```

	var Comment = React.createClass({ 
		itemClick: function() {
			this.props.handleClick(this.props);
		},              
	    render: function() {             
	        return (
	            <div className="comment" onClick={this.itemClick}>
	                <h2 className="commentTitle">
	                    {this.props.title}
	                </h2>
                    <span>{this.props.children.toString()}</span>
	            </div>
			);
	    }
	});

	var CommentList = React.createClass({
	    handleClick: function(comment) {
			console.log(comment);
	    },
	    render: function() {
	        var commentNodes = this.props.comments.map(function(comment) {
		        return (
		            <Comment handleClick={this.handleClick} title={comment.title} key={comment.id} isShow={comment.isShow}>
		                {comment.text}
		            </Comment>
		        );
	        }.bind(this));

	        return (
		        <div className="commentList">
		            {commentNodes}
		        </div>
		    );
	    }
	});

	var comments = [{
		id: '10001',
		title: '前端',
		text: 'React',
		isShow: true
	}, {
		id: '10002',
		title: '后端',
		text: 'Java',
		isShow: true
	}];
		
	React.render(<CommentList comments={comments}></CommentList>, document.getElementById('content2'));
```

如上，在列表项上绑定了点击事件，事件处理程序是主组件CommentList通过绑定回调函数到props传入的，该回调函数接收参数，事件触发时，回调函数执行，传入的参数可以在主组件内访问。

### 平行数据流

对于不存在主从关系或父子关系的组件，可以说是平行组件，他们之间的通信，我们可以使用发布订阅模式的全局事件系统管理通信：在组件的componentDidMount()方法内订阅某事件，在收到事件触发信号时调用组件setState()方法更新组件state；在componentWillUnmount()方法内取消订阅事件，React提供的一个全局管理数据流的架构模式--Flux，即是此方式的一种实现，关于Flux将在以后介绍。

