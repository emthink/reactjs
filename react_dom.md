# React DOM

为了性能和跨浏览器的兼容性，React实现了一个独立于浏览器的DOM系统。对于用户来说，不需要考虑很多不同的浏览器实现和行为。本篇介绍React中的DOM以及与HTML DOM的对比。

React中，所有的DOM，除了aria-*和data-*属性需要小写，其他特性property和属性attribute（包括事件处理器）必须是驼峰式命名。

## 属性对比

React和HTML的DOM系统有很多不同的属性，下面进行阐述：

### className

React组件中，如果要给DOM添加一个特定类名，不能使用class属性，而应该使用React提供的className属性，这适用于所有DOM或SVG元素。

### checked

单选`<input type="checkbox" />`和复选框`<input type="radio" />`支持checked属性,该属性设置DOM是否被选中。

在React中，可以使用该属性值来控制组件的选中状态；不同的是，React提供defaultChecked属性，该属性指定组件初次渲染的时候是否处于选中状态，随后是不能用来控制组件状态的。

### selected

select元素的option项支持selected属性，标明哪一项被选中，React使用该属性来标明哪一个组件被选中。

### dangerouslySetInnerHTML

我们知道HTML的DOM元素有一个innerHTML属性，它可以设置该元素内的HTML内容，但是我们知道使用代码设置HTML内容是很危险的，因为这样很容易发生XSS(cross-site scripting attack)攻击,恶意第三方可以通过这样插入script片段，其中的js是会被执行的。

在React中，我们直接通过设置dangerouslySetInnerHTML属性，其值是一个Object对象，该对象指定__html属性，该属性的值就是我们需要插入的html内容。

### htmlFor

React使用htmlFor代替JavaSript中的保留字for。

### onChange

React使用onChange事件来实时处理用户的输入

### value

`<input /><textarea />`输入框都支持value属性，可以取得或设置输入框的值，React中，我们使用该值控制输入组件的值。对应的defaultValue，可以设置初次渲染时输入组件的默认值，但随后不能用来控制组件值。

### suppressContentEditableWarning

HTML5新增了contentEditable属性，可以设置元素内容可编辑，但是如果该元素拥有子元素，设置该值，浏览器将会发出警告，React使用该值禁止这个警告。

### style

style属性用来标明元素的样式，不同于HTML中的字符串类型值，React中，需要为该属性传递一个Object对象，该对象的属性名为驼峰式命名。

```

    var divStyle = {
      color: 'blue',
      backgroundImage: 'url(' + imgUrl + ')',
    
    };
    
    function HelloWorldComponent() {
        return <div style={divStyle}>Hello World!</div>;
    }
    
    var divStyle = {
      WebkitTransition: 'all', // note the capital 'W' here
      msTransition: 'all' // 'ms' is the only lowercase vendor prefix
    };
    
    function ComponentWithTransition() {
        return <div style={divStyle}>This should work cross-browser</div>;
    }
```

style属性值对象的键名采用驼峰式命名是为了兼容JavaScript处理DOM元素样式：`p.style.fontSize`。

#### 兼容性

除了ms前缀是小写的，其他都必须以大写字母开头，如WebkitTransition.

## React DOM支持属性

React支持所有的data-*和aria-*属性以及大部分HTML和SVG属性,

- [支持的HTML属性详细内容请查看](https://facebook.github.io/react/docs/dom-elements.html#all-supported-html-attributes)
- [支持的SVG属性详细内容请查看](https://facebook.github.io/react/docs/dom-elements.html#all-supported-svg-attributes)

 