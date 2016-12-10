# 认识React的diff算法

React提供一种声明式API，使得我们不需要了解在每次更新时具体改变了什么。这使得开发应用很简单，但是React如何实现这一点并不明显。本篇文章介绍React的diff算法为何在满足高性能应用要求时，React组件的更新是可预测的。

## 前言

在使用React时，我们首先思考创建React节点树的render()方法，在下一次state或props更新时，render()方法将返回另一个React元素树，随后React比较两颗不同的React节点树，并据此更新页面视图。

已经有一些基本方案解决在最小化操作下比较一颗React节点树到新的React节点树之间的不同。但是，最先进的算法时间复杂度也是O(n^3),n是节点树的元素数量。

## diff算法

如果在React中使用这些算法，展示1000个元素将要进行10亿次比较，这个性能太低；React实现了一个时间复杂度为O(n)的探索式算法，该算法基于两点假设：

- 1.不同类型的元素生成不同的节点树
- 2.开发者通过key属性的不同表现指出哪个子元素更稳定。

实际上，这两点假设对于大多数实践是有效的。

在比较两个React节点树时，React首先比较根元素，随后的行为取决于根元素类型。

### 根节点不同类型

只要根节点类型不同，React就会销毁旧节点树，创建新节点树。

- 在销毁节点树时，旧的DOM节点会被销毁，React组件实例触发componentWillUnmount()方法。
- 在创建新节点树时，新的DOM节点被插入DOM树，React组件实例依次触发componentWillMount()方法和componentDidMount()方法。

根节点类型不同，根节点下任何组件或元素节点都会被卸载，并且把其state销毁，比如如下两棵节点树，diff后，卸载旧的Home组件，挂载一个新的Home组件实例：

```

    <div><Home /></div>
    <a><Home /></a>
```
## 节点同类型

当比较两个相同类型的React节点（包括组件和html元素）时（包括所有节点，根节点和所有子节点），React比较两者的属性，不改变DOM节点，只更新当前节点需要改变的属性，如：

```

    <div className="red" data-index="1"></div>
    <div className="blue" data-index="1"></div>
```
对于如上两个元素，React仅会改变当前节点需要改变的className属性。

### 样式更新

如果节点需要更新样式属性，React仅会更新当前节点需要改变的样式属性，如：

```

    <div style={{fontSize: '16px', color: '#aaa';}}  calssName="red"/>
    <div style={{fontSize: '18px', color: '#aaa';}}  calssName="red"/>
```

React仅会更新当前节点的font-size属性值。

React重复以上步骤，递归比较处理两棵React节点树.

### 组件节点同类型

前面的diff比较都是以html元素为例，但是对于组件，前文的理论依然适用，只是关于组件的比较，我们还需要了解更多内容：当某一组件更新了，组件实例还没有改变，其组件状态是通过渲染维护的。React更新当前组件实例的（props）属性以匹配新元素，并且调用当前实例的componentWillReceiveProps()方法和componentWillUpdate()方法；然后调用render()方法并且使用diff算法递归比较已经更新的节点树和新返回的节点树。

## 递归比较子节点

默认地，在递归比较DOM节点的子节点时，React同时遍历两个子节点列表，当发现不同时，立即做出改变。

比如，需要在一个节点的子节点后插入一个子节点，性能是很好的，比较如下两棵节点树：

```

    <ul>
        <li>first</li>
        <li>second</li>
    </ul>
    
    <ul>
        <li>first</li>
        <li>second</li>
        <li>third</li>
    </ul>
```

React匹配ul节点的子节点列表，依次比较```<li>first</li>和<li>second</li>```，直到发现当前元素缺少子节点```<li>third</li>```，就立即插入一个```<li>third</li>```节点。

但是如果不是在末尾插入新的子节点，而是在头部插入：

 
```

    <ul>
        <li>first</li>
        <li>second</li>
    </ul>
    
    <ul>
        <li>third</li>
        <li>first</li>
        <li>second</li>
    </ul>
```

React比较第一个子节点时，就发现不同，立马改变该节点，随后全部子节点都需要改变,这样的性能表现很不好。

## key属性

为了解决上面提到子节点比较的问题，React提供了key属性，如果某子节点拥有key属性，React会在原始子节点树里使用key值来比较该子节点，比如，对于如上实例，使用key属性：

```

    <ul>
        <li key="1">first</li>
        <li key="2">second</li>
    </ul>
    
    <ul>
        <li key="3">third</li>
        <li key="1">first</li>
        <li key="2">second</li>
    </ul>
```
对于如上这种结构，React会创建key值为3的节点，而只是移动key值为1和2的节点。

### key属性值与唯一性

既然通过key值比较子节点，那么很明显，至少在子节点树里，每个key值必须是唯一的，但是并不需要保证key值是全局唯一的。

**通常我们可以使用服务端返回的列表项数据中的id或index当key值。**

## diff算法的不足

我们必须明白，React diff算法决定如何重新渲染组件，但这只是一个细节实现，React可以对每一个action行为都重新渲染整个应用，最后的视图都是一样的，我们在不断地精炼探索式算法以提高应用性能。

目前的实现方式中，如前文的实例，我们知道在子节点间是可以不被重新渲染而只发生移动的，但是除此之外，子节点并不能被重用，算法将会重新渲染整个子节点树。

前文提到，React的diff算法是探索式的，基于两点假设，如果这两点假设不满足，性能就会降低：

- 1.算法不会比较不同组件类型的子节点
- 2.key值应该是稳定的，可预测的，唯一的。不稳定的key值会产生很多不必要的重绘和子组件状态的丢失。

