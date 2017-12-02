# React Fiber初探

React 16版本已经推出多时，提出了包括Portal，异常边界等新特性，最重要的是重写了调和算法，推出了新版本算法实现-Fiber，于是博主历时三周，在业余时间学习Fiber架构实现和源码，对Fiber整体有了初步了解，并总结分享出来，若对一些源码不感兴趣，大可跳过，另博主水平有限，若有不对之处，欢迎指正。

## 前言

React的定位是一个构建用户界面的JavaScript类库，它使用JavaScript语言开发UI组件，可以使用多种方式渲染这些组件，输出用户界面，较大程度的达到了跨技术栈跨平台的兼容重用：

> We don’t make assumptions about the rest of your technology stack, so you can develop new features in React without rewriting existing code.

现在的React已然在以下几个方面发挥的都很不错：

1. React Web应用用户界面开发；
2. React Native App用户界面开发；
3. Node.js服务端渲染；

在这些不同场景，渲染的主体很明显是不一样的，有诸如web应用的DOM渲染，React Native的原生View渲染，服务端字符串渲染等，要做到兼容适应多种不同渲染环境，很显然，React不能局限固定渲染UI的方式。

React核心内容也确实只包括定义组件相关的内容和API，[源码可以查看](https://github.com/facebook/react/tree/master/packages/react)，实际项目中，可以看到首先需要使用如下代码：

```react
import React from 'react';
```

这句代码做的就是引入了React核心源码模块。

## 渲染

上一节已经说到React核心内容只涉及如何定义组件，并不涉及具体的组件渲染（即输出用户界面），这需要额外引入渲染模块，以渲染React定义的组件：

1. React DOM渲染模块：将React组件渲染为DOM，然后可以被浏览器处理呈现给用户，这就是通常在web应用中引入的`react-dom`模块：

   ```react
   import React from 'react';
   import { render } from 'react-dom';
   import App from './apps/App.js';

   render(
     <App />,
     document.getElementById('mainBox')
   );
   ```

   如上代码，`App`是使用React核心模块定义的组件，然后使用`react-dom`渲染模块提供的`render`方法将其渲染为DOM输出至页面。

2. React Native 渲染：将React组件渲染为移动端原生View，在React Native应用中引入`react-native`模块，它提供相应渲染方法可以渲染React组件：

   ```react
   import { AppRegistry } from 'react-native';
   import App from './src/app.js';

   AppRegistry.registerComponent('fuc', () => App);
   ```

   如上，`App`是React根组件，使用`react-native`渲染器的`AppRegistry.registerComponent`方法将其渲染为原生View。

3. React测试渲染：将React组件渲染为JSON树，用来完成[Jest](https://facebook.github.io/jest)的[快照测试](https://facebook.github.io/jest/blog/2016/07/27/jest-14.html)，内容在`react-test-renderer`模块：

   ```react
   import ReactTestRenderer from 'react-test-renderer';
    
   const renderer = ReactTestRenderer.create(
     <Link page="https://www.facebook.com/">Facebook</Link>
   );
    
   console.log(renderer.toJSON());
   // { type: 'a',
   //   props: { href: 'https://www.facebook.com/' },
   //   children: [ 'Facebook' ] }
   ```

4. React矢量图渲染：将React组件渲染为对应的适量图（[ART](https://github.com/sebmarkbage/art/)库）；

**web React应用是最常见的，也是最易于理解的，所以本篇后文均从React-DOM渲染器角度解析Fiber。**

## 调和（Reconciliation）

如前面两节所述，React核心是定义组件，渲染组件方式由环境决定，定义组件，组件状态管理，生命周期方法管理，组件更新等应该跨平台一致处理，不受渲染环境影响，这部分内容统一由[调和器（Reconciler）](https://github.com/facebook/react/tree/master/packages/react-reconciler)处理，[源码传送](https://github.com/facebook/react/tree/master/packages/react-reconciler)，不同渲染器都会使用该模块。调和器主要作用就是在组件状态变更时，调用组件树各组件的`render`方法，渲染，卸载组件。

### Stack Reconciler

我们知道浏览器渲染引擎是单线程的，在React 15.x版本及之前版本，计算组件树变更时将会阻塞整个线程，整个渲染过程是连续不中断完成的，而这时的其他任务都会被阻塞，如动画等，这可能会使用户感觉到明显卡顿，比如当你在访问某一网站时，输入某个搜索关键字，更优先的应该是交互反馈或动画效果，如果交互反馈延迟200ms，用户则会感觉较明显的卡顿，而数据响应晚200毫秒并没太大问题。这个版本的调和器可以称为栈调和器（Stack Reconciler），其调和算法大致过程见[React Diff算法](http://blog.codingplayboy.com/2016/10/27/react_diff/) 和[React Stack Reconciler实现](https://reactjs.org/docs/implementation-notes.html)。

Stack Reconcilier的主要缺陷就是不能暂停渲染任务，也不能切分任务，无法有效平衡组件更新渲染与动画相关任务间的执行顺序，即不能划分任务优先级，有可能导致重要任务卡顿，动画掉帧等问题。

### Fiber Reconciler

React 16版本提出了一个更先进的调和器，它允许渲染进程分段完成，而不必须一次性完成，中间可以返回至主进程控制执行其他任务。而这是通过计算部分组件树的变更，并暂停渲染更新，询问主进程是否有更高需求的绘制或者更新任务需要执行，这些高需求的任务完成后才开始渲染。这一切的实现是在代码层引入了一个新的数据结构-Fiber对象，每一个组件实例对应有一个fiber实例，此fiber实例负责管理组件实例的更新，渲染任务及与其他fiber实例的联系。

这个新推出的调和器就叫做纤维调和器（Fiber Reconciler），它提供的新功能主要有：

1. 可切分，可中断任务；
2. 可重用各分阶段任务，且可以设置优先级；
3. 可以在父子组件任务间前进后退切换任务；
4. `render`方法可以返回多元素（即可以返回数组）；
5. 支持异常边界处理异常；

说了这么多，终于要正式出场本篇主角：Fiber了，React最新版本已经升到16.1.1，估计16.x稳定版不会太远，让我们先睹为快吧。

## Fiber与JavaScript

前面说到Fiber可以异步实现不同优先级任务的协调执行，那么对于DOM渲染器而言，在JavaScript层是否提供这种方式呢，还是说只能使用setTimeout模拟呢？目前新版本主流浏览器已经提供了可用API：`requestIdleCallback`和`requestAnimationFrame`:

1. [requestIdleCallback](https://www.w3.org/TR/requestidlecallback/): 在线程空闲时期调度执行低优先级函数；
2. [requestAnimationFrame](https://www.w3.org/TR/animation-timing/): 在下一个动画帧调度执行高优先级函数；

### 空闲期（Idle Period）

通常，客户端线程执行任务时会以帧的形式划分，大部分设备控制在30-60帧是不会影响用户体验；在两个执行帧之间，主线程通常会有一小段空闲时间，`requestIdleCallback`可以在这个**空闲期（Idle Period）**调用**空闲期回调（Idle Callback）**，执行一些任务。

![requestIdleCallback](http://blog.codingplayboy.com/wp-content/uploads/2017/12/request-idle-callback.png)

### Fiber与requestIdleCallback

Fiber所做的就是需要分解渲染任务，然后根据优先级使用API调度，异步执行指定任务：

1. 低优先级任务由`requestIdleCallback`处理；
2. 高优先级任务，如动画相关的由`requestAnimationFrame`处理；
3. `requestIdleCallback`可以在多个空闲期调用空闲期回调，执行任务；
4. `requestIdleCallback`方法提供deadline，即任务执行限制时间，以切分任务，避免长时间执行，阻塞UI渲染而导致掉帧；

具体[执行任务实现源码传送](https://github.com/facebook/react/blob/master/packages/shared/ReactDOMFrameScheduling.js)：

1. 若支持原生API，具体原生实现见上文给出的链接：

   ```react
   rIC = window.requestIdleCallback;
   cIC = window.cancelIdleCallback;
   export {now, rIC, cIC};
   ```

2. 若不支持，则自定义实现：

   ```react
   let isIdleScheduled = false; // 是否在执行空闲期回调
   let frameDeadlineObject = {
     didTimeout: false,
     timeRemaining() {
       // now = Performance.now || Date.now
       const remaining = frameDeadline - now();
       // 计算得到当前帧运行剩余时间
       return remaining > 0 ? remaining : 0;
     },
   };
   // 帧回调
   const animationTick = function(rafTime) {
     ...
     if (!isIdleScheduled) {
       // 不在执行空闲期回调，表明可以调用空闲期回调
       isIdleScheduled = true;
       // 执行Idle空闲期回调
       idleTick();
     }
   };
   // 空闲期回调
   const idleTick = function() {
     // 重置为false，表明可以调用空闲期回调
     isIdleScheduled = false;
     const currentTime = now();
     if (frameDeadline - currentTime <= 0) {
       // 帧到期时间小于当前时间，说明已过期
       if (timeoutTime !== -1 && timeoutTime <= currentTime) {
         // 此帧已过期，且发生任务处理函数（执行具体任务，传入的回调）的超时
         // 需要执行任务处理，下文将调用；
         frameDeadlineObject.didTimeout = true;
       } else {
         // 帧已过期，但没有发生任务处理函数的超时，暂时不调用任务处理函数
         if (!isAnimationFrameScheduled) {
           // 当前没有调度别的帧回调函数
           // 调度下一帧
           isAnimationFrameScheduled = true;
           requestAnimationFrame(animationTick);
         }
         // Exit without invoking the callback.
         return;
       }
     } else {
       // 这一帧还有剩余时间
       // 标记未超时，之后调用任务处理函数
       frameDeadlineObject.didTimeout = false;
     }

     // 缓存的任务处理函数
     timeoutTime = -1;
     const callback = scheduledRICCallback;
     scheduledRICCallback = null;
     if (callback !== null) {
       // 执行回调
       callback(frameDeadlineObject);
     }
   }

   // 自定义模拟requestIdleCallback
   rIC = function(
     callback: (deadline: Deadline) => void, // 传入的任务处理函数参数
     options?: {timeout: number} // 其他参数
   ) {
     // 回调函数
     scheduledRICCallback = callback;
     if (options != null && typeof options.timeout === 'number') {
       // 计算过期时间
       timeoutTime = now() + options.timeout;
     }
     if (!isAnimationFrameScheduled) {
       // 当前没有调度别的帧回调函数
       isAnimationFrameScheduled = true;
       // 初始开始执行帧回调 
       requestAnimationFrame(animationTick);
     }
     return 0;
   };
   ```

   1. `frameDeadline`：是以启发法，从30fps（即30帧）开始调整得到的更适于当前环境的一帧限制时间；
   2. `timeRemaining`：计算`requestIdleCallback`此次空闲（帧）执行任务剩余时间，即距离deadline的时间；
   3. `options.timeout`：Fiber内部调用`rIC`API执行异步任务时，传递的任务到期时间参数；
   4. `frameDeadlineObject`：计算得到的某一帧可用时间对象，两个属性分别表示：
      1. didTimeout：传入的异步任务  处理函数是否超时；
      2. timeRemaining：当前帧可执行任务处理函数的剩余空闲时间；
   5. `frameDeadlineObject`对象是基于传入的`timeout`参数和此模块内部自调整得到的`frameDeadline`参数计算得出；

## Fiber与组件

我们已经知道了Fiber的功能及其主要特点，那么其如何和组件联系，并且如何实现效果的呢，以下几点可以概括：

1. React应用中的基础单元是组件，应用以组件树形式组织，渲染组件；
2. Fiber调和器基础单元则是fiber（调和单元），应用以fiber树形式组织，应用Fiber算法；
3. 组件树和fiber树结构对应，一个组件实例有一个对应的fiber实例；
4. Fiber负责整个应用层面的调和，fiber实例负责对应组件的调和；

**注意Fiber与fiber的区别，Fiber是指调和器算法，fiber则是调和器算法组成单元，和组件与应用关系类似，每一个组件实例会有对应的fiber实例负责该组件的调和。**

## Fiber数据结构

截止目前，我们对Fiber应该有了初步的了解，在具体介绍Fiber的实现与架构之前，准备先简单介绍一下Fiber的数据结构，数据结构能一定程度反映其整体工作架构。

其实，一个fiber就是一个JavaScript对象，以键值对形式存储了一个关联组件的信息，包括组件接收的props，维护的state，最后需要渲染出的内容等。接下来我们将介Fiber对象的主要属性。

### Fiber对象

首先[Fiber对象](https://github.com/facebook/react/blob/master/packages/react-reconciler/src/ReactFiber.js)的定义如下：

```react
// 一个Fiber对象作用于一个组件
export type Fiber = {|
  // 标记fiber类型tag.
  tag: TypeOfWork,
  // fiber对应的function/class/module类型组件名.
  type: any,
  // fiber所在组件树的根组件FiberRoot对象
  stateNode: any,
  // 处理完当前fiber后返回的fiber，
  // 返回当前fiber所在fiber树的父级fiber实例
  return: Fiber | null,
  // fiber树结构相关链接
  child: Fiber | null,
  sibling: Fiber | null,
  index: number,

  // 当前处理过程中的组件props对象
  pendingProps: any, 
  // 缓存的之前组件props对象
  memoizedProps: any, // The props used to create the output.
  // The state used to create the output
  memoizedState: any,

  // 组件状态更新及对应回调函数的存储队列
  updateQueue: UpdateQueue<any> | null,


  // 描述当前fiber实例及其子fiber树的数位，
  // 如，AsyncUpdates特殊字表示默认以异步形式处理子树，
  // 一个fiber实例创建时，此属性继承自父级fiber，在创建时也可以修改值，
  // 但随后将不可修改。
  internalContextTag: TypeOfInternalContext,

  // 更新任务的最晚执行时间
  expirationTime: ExpirationTime,

  // fiber的版本池，即记录fiber更新过程，便于恢复
  alternate: Fiber | null,

  // Conceptual aliases
  // workInProgress : Fiber ->  alternate The alternate used for reuse happens
  // to be the same as work in progress.
|};
```

1. type & key：同React元素的值；
2. type：描述fiber对应的React组件；
   1. 对于组合组件：值为function或class组件本身；
   2. 对于原生组件（div等）：值为该元素类型字符串；
3. key：调和阶段，标识fiber，以检测是否可重用该fiber实例；
4. child & sibling：组件树，对应生成fiber树，类比的关系；
5. pendingProps & memoizedProps：分别表示组件当前传入的及之前的props；
6. return：返回当前fiber所在fiber树的父级fiber实例，即当前组件的父组件对应的fiber；
7. alternate：fiber的版本池，即记录fiber更新过程，便于恢复重用；
8. workInProgress：正在处理的fiber，概念上叫法，实际上没有此属性；

#### alternate fiber

可以理解为一个fiber版本池，用于交替记录组件更新（切分任务后变成多阶段更新）过程中fiber的更新，因为在组件更新的各阶段，更新前及更新过程中fiber状态并不一致，在需要恢复时（如，发生冲突），即可使用另一者直接回退至上一版本fiber。

> 1. 使用alternate属性双向连接一个当前fiber和其work-in-progress，当前fiber实例的alternate属性指向其work-in-progress，work-in-progress的alternate属性指向当前稳定fiber；
> 2. 当前fiber的替换版本是其work-in-progress，work-in-progress的交替版本是当前fiber；
> 3. 当work-in-progress更新一次后，将同步至当前fiber，然后继续处理，同步直至任务完成；
> 4. work-in-progress指向处理过程中的fiber，而当前fiber总是维护处理完成的最新版本的fiber。

####  创建Fiber实例

创建fiber实例即返回一个带有上一小节描述的诸多属性的JavaScript对象，`FiberNode`即根据传入的参数构造返回一个初始化的对象：

```react
var createFiber = function(
  tag: TypeOfWork,
  key: null | string,
  internalContextTag: TypeOfInternalContext,
) {
  return new FiberNode(tag, key, internalContextTag);
};
```

创建alternate fiber以处理任务的实现如下：

```react
// 创建一个alternate fiber处理任务
export function createWorkInProgress(
  current: Fiber,
  pendingProps: any,
  expirationTime: ExpirationTime,
) {
  let workInProgress = current.alternate;
  if (workInProgress === null) {
    workInProgress = createFiber(
      current.tag,
      current.key,
      current.internalContextTag,
    );
    workInProgress.type = current.type;
    workInProgress.stateNode = current.stateNode;
    // 形成alternate关系，互相交替模拟版本池
    workInProgress.alternate = current;
    current.alternate = workInProgress;
  } 

  workInProgress.expirationTime = expirationTime;
  workInProgress.pendingProps = pendingProps;
  workInProgress.child = current.child;
  workInProgress.memoizedProps = current.memoizedProps;
  workInProgress.memoizedState = current.memoizedState;
  workInProgress.updateQueue = current.updateQueue;
  ...
  return workInProgress;
}
```

### Fiber类型

上一小节，Fiber对象中有个`tag`属性，标记fiber类型，而fiber实例是和组件对应的，所以其类型基本上对应于组件类型，源码见[ReactTypeOfWork模块](https://github.com/facebook/react/blob/master/packages/shared/ReactTypeOfWork.js)：

```react
export type TypeOfWork = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export const IndeterminateComponent = 0; // 尚不知是类组件还是函数式组件
export const FunctionalComponent = 1; // 函数式组件
export const ClassComponent = 2; // Class类组件
export const HostRoot = 3; // 组件树根组件，可以嵌套
export const HostPortal = 4; // 子树. Could be an entry point to a different renderer.
export const HostComponent = 5; // 标准组件，如地div， span等
export const HostText = 6; // 文本
export const CallComponent = 7; // 组件调用
export const CallHandlerPhase = 8; // 调用组件方法
export const ReturnComponent = 9; // placeholder（占位符）
export const Fragment = 10; // 片段
```

在调度执行任务的时候会根据不同类型fiber，即fiber.tag值进行不同处理。

### FiberRoot对象

`FiberRoot`对象，主要用来管理组件树组件的更新进程，同时记录组件树挂载的DOM容器相关信息，具体定义见[ReactFiberRoot模块](https://github.com/facebook/react/blob/master/packages/react-reconciler/src/ReactFiberRoot.js)：

```react
export type FiberRoot = {
  // fiber节点的容器元素相关信息，通常会直接传入容器元素
  containerInfo: any,
  // 当前fiber树中激活状态（正在处理）的fiber节点，
  current: Fiber,
  // 此节点剩余的任务到期时间
  remainingExpirationTime: ExpirationTime,
  // 更新是否可以提交
  isReadyForCommit: boolean,
  // 准备好提交的已处理完成的work-in-progress
  finishedWork: Fiber | null,
  // 多组件树FirberRoot对象以单链表存储链接，指向下一个需要调度的FiberRoot
  nextScheduledRoot: FiberRoot | null,
};
```

#### 创建FiberRoot实例

```react
import {
  ClassComponent,
  HostRoot
} from 'shared/ReactTypeOfWork';

// 创建返回一个初始根组件对应的fiber实例
function createHostRootFiber(): Fiber {
  // 创建fiber
  const fiber = createFiber(HostRoot, null, NoContext);
  return fiber;
}

export function createFiberRoot(
  containerInfo: any,
  hydrate: boolean,
) {
  // 创建初始根组件对应的fiber实例
  const uninitializedFiber = createHostRootFiber();
  // 组件树根组件的FiberRoot对象
  const root = {
    // 根组件对应的fiber实例
    current: uninitializedFiber,
    containerInfo: containerInfo,
    pendingChildren: null,
    remainingExpirationTime: NoWork,
    isReadyForCommit: false,
    finishedWork: null,
    context: null,
    pendingContext: null,
    hydrate,
    nextScheduledRoot: null,
  };
  // 组件树根组件fiber实例的stateNode指向FiberRoot对象
  uninitializedFiber.stateNode = root;
  return root;
}
```

### ReactChildFiber

在生成组件树的FiberRoot对象后，会为子组件生成各自的fiber实例，这一部分由[ReactChildFiber模块](https://github.com/facebook/react/blob/master/packages/react-reconciler/src/ReactChildFiber.js)实现：

```react
// 调和（处理更新）子fibers
export const reconcileChildFibers = ChildReconciler(true);
// 挂载（初始化）子fibers
export const mountChildFibers = ChildReconciler(false);
```

而`ChildReconciler`方法所做的则是根据传入参数判断是调用初始化子组件fibers逻辑还是执行调和已有子组件fibers逻辑。

`ChildReconciler`方法，返回`reconcileChildFibers`方法：

1. 判断子级传递内容的数据类型，执行不同的处理，这也对应着我们写React组件时传递`props.children`时，其类型可以是对象或数组，字符串，是数字等；
2. 然后具体根据子组件类型，调用不同的具体调和处理函数；
3. 最后返回根据子组件创建或更新得到的fiber实例；

```react
function ChildReconciler(a) {
  function reconcileChildFibers(
  	returnFiber: Fiber, currentFirstChild: Fiber | null,
    newChild: any, expirationTime: ExpirationTime,
  ) {
    // Handle object types
    const isObject = typeof newChild === 'object' && newChild !== null;

    if (isObject) {
      // 子组件实例类型，以Symbol符号表示的
      switch (newChild.$$typeof) {
        // React Element
        case REACT_ELEMENT_TYPE:
          return placeSingleChild(
            reconcileSingleElement(
              returnFiber, currentFirstChild,
              newChild, expirationTime
            )
          );
        // React组件调用
        case REACT_CALL_TYPE:
          return placeSingleChild(reconcileSingleCall(...));
        // placeholder
        case REACT_RETURN_TYPE:
          return ...;
        case REACT_PORTAL_TYPE:
          return ...;
      }
    }
    if (typeof newChild === 'string' || typeof newChild === 'number') {
      return placeSingleChild(reconcileSingleTextNode(...));
    }
    if (isArray(newChild)) {
      return reconcileChildrenArray(...);
    }
    if (getIteratorFn(newChild)) {
      return reconcileChildrenIterator(...);
    }
    ...   
  }
}
```



## Fiber架构

在学习Fiber的时候，我尝试去阅读源码，发现通过这种方式很难快速理解，学习Fiber，而先了解调和器是干什么的及调和器在React中的存在形式，然后再学习Fiber的结构及算法实现思路，明白从组件被定义到渲染至页面它需要做什么，这也是本篇文章的组织形式。

### 优先级（ExpirationTime VS PriorityLevel）

我们已经知道Fiber可以切分任务并设置不同优先级，那么是如何实现划分优先级的呢，其表现形式什么呢？

#### ExpirationTime

Fiber切分任务并调用`requestIdleCallback`和`requestAnimationFrame`API，保证渲染任务和其他任务，在不影响应用交互，不掉帧的前提下，稳定执行，而实现调度的方式正是给每一个fiber实例设置到期执行时间，不同时间即代表不同优先级，到期时间越短，则代表优先级越高，需要尽早执行。

> 所谓的到期时间（ExpirationTime），是相对于调度器初始调用的起始时间而言的一个时间段；调度器初始调用后的某一段时间内，需要调度完成这项更新，这个时间段长度值就是到期时间值。

Fiber提供[ReactFiberExpirationTime](https://github.com/facebook/react/blob/master/packages/react-reconciler/src/ReactFiberExpirationTime.js)模块实现到期时间的定义：

```react
export const NoWork = 0; // 没有任务等待处理
export const Sync = 1; // 同步模式，立即处理任务
export const Never = 2147483647; // Max int32: Math.pow(2, 31) - 1
const UNIT_SIZE = 10; // 过期时间单元（ms）
const MAGIC_NUMBER_OFFSET = 2; // 到期时间偏移量

// 以ExpirationTime特定单位（1单位=10ms）表示的到期执行时间
// 1 unit of expiration time represents 10ms.
export function msToExpirationTime (ms) {
  // 总是增加一个偏移量，在ms<10时与Nowork模式进行区别
  return ((ms / UNIT_SIZE) | 0) + MAGIC_NUMBER_OFFSET;
}
// 以毫秒表示的到期执行时间
export function expirationTimeToMs(expirationTime: ExpirationTime) {
  return (expirationTime - MAGIC_NUMBER_OFFSET) * UNIT_SIZE;
}
// 向上取整（整数单位到期执行时间）
// precision范围精度：弥补任务执行时间误差
function ceiling(num, precision) {
  return (((num / precision) | 0) + 1) * precision;
}

// 计算处理误差时间在内的到期时间
export function computeExpirationBucket(currentTime, expirationInMs, bucketSizeMs,) {
  return ceiling(
    currentTime + expirationInMs / UNIT_SIZE,
    bucketSizeMs / UNIT_SIZE
  );
}
```

该模块提供的功能主要有：

1. Sync：同步模式，在UI线程立即执行此类任务，如动画反馈等；
2. 异步模式：
   1. 转换：到期时间特定单位和时间单位（ms）的相互转换；
   2. 计算：计算包含允许误差在内的到期时间；

#### PriorityLevel

其实在15.x版本中出现了对于任务的优先层级划分，[ReactPriorityLevel模块](https://github.com/facebook/react/blob/15.6-dev/src/renderers/shared/fiber/ReactPriorityLevel.js)：

```react
export type PriorityLevel = 0 | 1 | 2 | 3 | 4 | 5;

module.exports = {
  NoWork: 0, // No work is pending.
  SynchronousPriority: 1, // For controlled text inputs. Synchronous side-effects.
  AnimationPriority: 2, // Needs to complete before the next frame.
  HighPriority: 3, // Interaction that needs to complete pretty soon to feel responsive.
  LowPriority: 4, // Data fetching, or result from updating stores.
  OffscreenPriority: 5, // Won't be visible but do the work in case it becomes visible.
};
```

相对于PriorityLevel的简单层级划分，在16.x版本中使用的则是ExpirationTime的到期时间方式表示任务的优先级，可以更好的对任务进行切分，调度。

### 调度器（Scheduler）

前面介绍调和器主要作用就是在组件状态变更时，调用组件树各组件的`render`方法，渲染，卸载组件，而Fiber使得应用可以更好的协调不同任务的执行，调和器内关于高效协调的实现，我们可以称它为调度器（Scheduler）。

> 顾名思义，调度器即调度资源以执行指定任务，React应用中应用组件的更新与渲染，需要占用系统CPU资源，如果不能很好的进行资源平衡，合理调度，优化任务执行策略，那很容易造成CPU这一紧缺资源的消耗和浪费，容易造成页面卡顿，动画掉帧，组件更新异常等诸多问题，就像城市交通调度一样，如果不能有效调度，交通状况很可能将拥堵不堪。

在React 15.x版本中，组件的状态变更将直接导致其子组件树的重新渲染，新版本Fiber算法将在调度器方面进行全面改进，主要的关注点是：

1. 合并多次更新：没有必要在组件的每一个状态变更时都立即触发更新任务，有些中间状态变更其实是对更新任务所耗费资源的浪费，就比如用户发现错误点击时快速操作导致组件某状态从A至B再至C，这中间的B状态变更其实对于用户而言并没有意义，那么我们可以直接合并状态变更，直接从A至C只触发一次更新；
2. 任务优先级：不同类型的更新有不同优先级，例如用户操作引起的交互动画可能需要有更好的体验，其优先级应该比完成数据更新高；
3. 推拉式调度：基于推送的调度方式更多的需要开发者编码间接决定如何调度任务，而拉取式调度更方便React框架层直接进行全局自主调度；

[传送查看源码](https://github.com/facebook/react/blob/master/packages/react-reconciler/src/ReactFiberScheduler.js)

```react
export default function () {
  ...
  return {
    computeAsyncExpiration,
    computeExpirationForFiber,
    scheduleWork,
    batchedUpdates,
    unbatchedUpdates,
    flushSync,
    deferredUpdates,
  };
}
```

如上调度器主要输出API为实现调度任务，拉取更新，延迟更新等功能。

#### 调度器与优先级

调度器如何切分任务划分优先级的呢？在React调和算法中，任务由fiber实例描述，所以要划分任务优先级，等效于设置fiber的到期时间（expirationTime），调度器内提供了`computeExpirationForFiber`方法以计算某一个fiber的到期时间：

```react
import { 
  NoWork, Sync, Never, msToExpirationTime,
  expirationTimeToMs, computeExpirationBucket
} from './ReactFiberExpirationTime';

// 表示下一个要处理的任务的到期时间，默认为NoWork，即当前没有正在等待执行的任务；
// Nowork默认更新策略：异步模式下，异步执行任务；同步模式下同步执行任务
let expirationContext = NoWork;
// 下一次渲染到期时间
let nextRenderExpirationTime = NoWork;
// 异步更新
export const AsyncUpdates = 1;
// 初始时间（ms）.
const startTime = now();
// ExpirationTime单位表示的当前时间（ExpirationTime单位，初始值传入0）
let mostRecentCurrentTime = msToExpirationTime(0);

// 计算fiber的到期时间
function computeExpirationForFiber(fiber) {
  let expirationTime;

  if (isWorking) {
    if (isCommitting) {
      // 在提交阶段的更新任务
      // 需要明确设置同步优先级（Sync Priority）
      expirationTime = Sync;
    } else {
      // 在渲染阶段发生的更新任务
      // 需要设置为下一次渲染时间的到期时间优先级
      expirationTime = nextRenderExpirationTime;
    }
  } else {
    // 不在任务执行阶段，需要计算新的过期时间

    // 明确传递useSyncScheduling为true表明期望同步调用
    // 且fiber.internalContextTag != AsyncUpdates
    if (useSyncScheduling && !(fiber.internalContextTag & AsyncUpdates)) {
      // 同步更新，设置为同步标记
      expirationTime = Sync;
    } else {
      // 异步更新，计算异步到期时间
      expirationTime = computeAsyncExpiration();
    }
  }
  return expirationTime;
}
```

1. 若当前处于任务提交阶段（更新提交至DOM渲染）时，设置当前fiber到期时间为`Sync`，即同步执行模式；
2. 若处于DOM渲染阶段时，则需要延迟此fiber任务，将fiber到期时间设置为下一次DOM渲染到期时间；
3. 若不在任务执行阶段，则需重新设置fiber到期时间：
   1. 若明确设置`useSyncScheduling`且`fiber.internalContextTag`值不等于`AsyncUpdates`，则表明是同步模式，设置为`Sync`；
   2. 否则，调用`computeAsyncExpiration`方法重新计算此fiber的到期时间；

```react
// 重新计算当前时间（ExpirationTime单位表示）
function recalculateCurrentTime() {
  const ms = now() - startTime;
  // ExpirationTime单位表示的当前时间
  // 时间段值为 now() - startTime（起始时间）
  mostRecentCurrentTime = msToExpirationTime(ms);
  return mostRecentCurrentTime;
}

// 计算异步任务的到期时间
function computeAsyncExpiration() {
  // 计算得到ExpirationTime单位的当前时间
  // 聚合相似的更新在一起
  // 更新应该在 ~1000ms，最多1200ms内完成
  const currentTime = recalculateCurrentTime();
  // 对于每个fiber的期望到期时间的增值，最大值为1000ms
  const expirationMs = 1000;
  // 到期时间的可接受误差时间，200ms
  const bucketSizeMs = 200;
  // 返回包含误差时间在内的到期时间
  return computeExpirationBucket(currentTime, expirationMs, bucketSizeMs);
}
```

对于每一个fiber我们期望的到期时间参数是1000ms，另外由于任务执行时间误差，接受200ms误差，最后计算得到的到期时间默认返回值为ExpirationTime单位。

#### 任务调度

上一节介绍了调度器主要提供`computeExpirationForFiber`等方法支持计算任务优先级（到期时间），接下来介绍调度器如何调度任务。

> React应用更新时，Fiber从当前处理节点，层层遍历至组件树根组件，然后开始处理更新，调用前面的`requestIdleCallback`等API执行更新处理。

主要调度逻辑实现在`scheduleWork`：

1. 通过`fiber.return`属性，从当前fiber实例层层遍历至组件树根组件；
2. 依次对每一个fiber实例进行到期时间判断，若大于传入的期望任务到期时间参数，则将其更新为传入的任务到期时间；
3. 调用`requestWork`方法开始处理任务，并传入获取的组件树根组件FiberRoot对象和任务到期时间；

```react
// 调度任务
// expirationTime为期望的任务到期时间
function scheduleWork(fiber, expirationTime: ExpirationTime) {
  return scheduleWorkImpl(fiber, expirationTime, false);
}

function scheduleWorkImpl(
  fiber, expirationTime
) {
  let node = fiber;
  while (node !== null) {
    // 向上遍历至根组件fiber实例，并依次更新expirationTime到期时间
    if (
      node.expirationTime === NoWork ||
      node.expirationTime > expirationTime
    ) {
      // 若fiber实例到期时间大于期望的任务到期时间，则更新fiber到期时间
      node.expirationTime = expirationTime;
    }
    // 同时更新alternate fiber的到期时间
    if (node.alternate !== null) {
      if (
        node.alternate.expirationTime === NoWork ||
        node.alternate.expirationTime > expirationTime
      ) {
        // 若alternate fiber到期时间大于期望的任务到期时间，则更新fiber到期时间
        node.alternate.expirationTime = expirationTime;
      }
    }
    // node.return为空，说明到达组件树顶部
    if (node.return === null) {
      if (node.tag === HostRoot) {
        // 确保是组件树根组件并获取FiberRoot实例
        const root = node.stateNode;
        // 请求处理任务
        requestWork(root, expirationTime);
      } else {
        return;
      }
    }
    // 获取父级组件fiber实例
    node = node.return;
  }
}
```

处理任务的`requestWork`方法实现如下：

1. 首先比较任务剩余到期时间和期望的任务到期时间，若大于，则更新值；
2. 判断任务期望到期时间（expirationTime），区分同步或异步执行任务；

```react
// 当根节点发生更新时，调度器将调用requestWork方法开始任务处理过程
// It's up to the renderer to call renderRoot at some point in the future.
function requestWork(root: FiberRoot, expirationTime) {
  const remainingExpirationTime = root.remainingExpirationTime;
  if (remainingExpirationTime === NoWork ||
    expirationTime < remainingExpirationTime) {
    // 若任务剩余到期时间大于期望的任务到期时间，则需要更新
    root.remainingExpirationTime = expirationTime;
  }

  if (expirationTime === Sync) {
    // 同步
    performWork(Sync, null);
  } else {
    // 异步
    scheduleCallbackWithExpiration(expirationTime);
  }
}
```

### 更新队列（UpdateQueue）

我们知道如果需要实现组件的异步更新，肯定需要在更新前将更新任务进行存储，然后异步任务开始的时候读取更新并实现组件更新，存储更新任务就需要一个数据结构，最常见的就是栈和队列，Fiber的实现方式就是队列。

Fiber切分任务为多个任务单元（Work Unit）后，需要划分优先级然后存储在更新队列，随后按优先级进行调度执行。我们知道每一个组件都对应有一个fiber实例，fiber实例即负责管理调度组件的任务单元，所以需要为每一个组件fiber实例维护一个更新队列。

Fiber更新队列由[ReactFiberUpdateQueue模块](https://github.com/facebook/react/blob/master/packages/react-reconciler/src/ReactFiberUpdateQueue.js)实现，主要涉及：

1. 创建更新队列；
2. 添加更新至更新队列；
3. 添加更新至fiber（即fiber实例对应的更新队列）；
4. 处理更新队列中的更新并返回新状态对象：

```react
// 一个更新对应的数据结构
export type Update<State> = {
  expirationTime: ExpirationTime,
  partialState: PartialState<any, any>,
  callback: Callback | null,
  isReplace: boolean,
  isForced: boolean,
  next: Update<State> | null,
};

// 更新队列，以单链表形式表示并持久化
// 调度一个更新任务时，将其添加至当前（current）fiber和work-in-progress fiber的更新队列中;
// 这两个更新队列相互独立但共享同一个持久化数据结构；
// work-in-progress更新队列通常是current fiber更新队列的子集；
// 发生调和时，更新任务从work-in-progress fiber更新队列移除，
// current fiber内的更新任务则保留，当work-in-progress中断时可以从current fiber恢复；
// 提交完更新时，work-in-progress fiber就会变成current fiber
export type UpdateQueue<State> = {
  // 若存在更早添加至队列的更新未被处理，
  // 则此已处理的更新并不会从队列中移除-先进先出原则
  // 所以需要维护baseState，代表第一个未处理的更新的基础状态，
  // 通常这就是队列中的第一个更新，因为在队列首部的已处理更新会被移除
  baseState: State,
  // 同理，需要维护最近的未处理的更新的到期时间，
  // 即未处理更新中到期时间值最小的
  expirationTime: ExpirationTime,
  first: Update<State> | null,
  last: Update<State> | null,
  callbackList: Array<Update<State>> | null,
  hasForceUpdate: boolean,
  isInitialized: boolean
};

// 添加更新至更新队列
export function insertUpdateIntoQueue<State>(
  queue: UpdateQueue<State>,
  update: Update<State>
){
  // 添加更新至队列尾部
  if (queue.last === null) {
    // 队列为空
    queue.first = queue.last = update;
  } else {
    queue.last.next = update;
    queue.last = update;
  }
  if (
    queue.expirationTime === NoWork ||
    queue.expirationTime > update.expirationTime
  ) {
    // 更新最近到期时间
    queue.expirationTime = update.expirationTime;
  }
}
// 添加更新至fiber实例
export function insertUpdateIntoFiber<State>(
  fiber: Fiber,
  update: Update<State>,
) {
  // 可以创建两个独立的更新队列
  // alternate主要用来保存更新过程中各版本更新队列，方便崩溃或冲突时回退
  const alternateFiber = fiber.alternate;
  let queue1 = fiber.updateQueue;
  if (queue1 === null) {
    // 更新队列不存在，则创建一个空的更新队列
    queue1 = fiber.updateQueue = createUpdateQueue((null));
  }

  let queue2;
  if (alternateFiber !== null) {
    // alternate fiber实例存在，则需要为此
    queue2 = alternateFiber.updateQueue;
    if (queue2 === null) {
      queue2 = alternateFiber.updateQueue = createUpdateQueue((null: any));
    }
  } else {
    queue2 = null;
  }
  queue2 = queue2 !== queue1 ? queue2 : null;

  // 如果只存在一个更新队列
  if (queue2 === null) {
    insertUpdateIntoQueue(queue1, update);
    return;
  }

  // 如果任意更新队列为空，则需要将更新添加至两个更新队列
  if (queue1.last === null || queue2.last === null) {
    insertUpdateIntoQueue(queue1, update);
    insertUpdateIntoQueue(queue2, update);
    return;
  }

  // 如果2个更新队列均非空，则添加更新至第一个队列，并更新另一个队列的尾部更新项
  insertUpdateIntoQueue(queue1, update);
  queue2.last = update;
}

// 处理更新队列任务，返回新状态对象
export function processUpdateQueue<State>(
  current, workInProgress, queue, instance, props,
  renderExpirationTime,
) {
  if (current !== null && current.updateQueue === queue) {
    // 克隆current fiber以创建work-in-progress fiber
    const currentQueue = queue;
    queue = workInProgress.updateQueue = {
      baseState: currentQueue.baseState,
      expirationTime: currentQueue.expirationTime,
      first: currentQueue.first,
      last: currentQueue.last,
      isInitialized: currentQueue.isInitialized,
      // These fields are no longer valid because they were already committed. Reset them.
      callbackList: null,
      hasForceUpdate: false,
    };
  }

  // Reset the remaining expiration time. If we skip over any updates, we'll
  // increase this accordingly.
  queue.expirationTime = NoWork;

  let dontMutatePrevState = true;
  let update = queue.first;
  let didSkip = false;
  while (update !== null) {
    const updateExpirationTime = update.expirationTime;
    if (updateExpirationTime > renderExpirationTime) {
      // 此更新优先级不够，不处理，跳过
      if (queue.expirationTime === NoWork ||
          queue.expirationTime > updateExpirationTime
         ) {
        // 重新设置最近未处理更新的到期时间
        queue.expirationTime = updateExpirationTime;
      }
      update = update.next;
      continue;
    }

    // 优先级足够，处理
    let partialState;
    if (update.isReplace) {
      // 使用replaceState()直接替换状态对象方式更新时
      // 获取新状态对象
      state = getStateFromUpdate(update, instance, state, props);
      // 不需要合并至之前状态对象，标记为true
      dontMutatePrevState = true;
    } else {
      // 更新部分状态方式
      // 获取更新部分状态时的状态对象
      partialState = getStateFromUpdate(update, instance, state, props);
      if (partialState) {
        if (dontMutatePrevState) {
          // 上一次是替换状态，所以不能影响state
          state = Object.assign({}, state, partialState);
        } else {
          // 更新部分状态，直接将新状态合并至上一次状态
          state = Object.assign(state, partialState);
        }
        // 重置标记为false
        dontMutatePrevState = false;
      }
    }
    // 强制立即更新
    if (update.isForced) {
      queue.hasForceUpdate = true;
    }
    // 添加回调函数
    if (update.callback !== null) {
      // Append to list of callbacks.
      let callbackList = queue.callbackList;
      if (callbackList === null) {
        callbackList = queue.callbackList = [];
      }
      callbackList.push(update);
    }
    // 遍历下一个更新任务
    update = update.next;
  }
  // 返回最新的状态对象
  return state;
}
```

### 更新器（Updater）

调度器协调，调度的任务主要就是执行组件或组件树更新，而这些任务则具体由更新器（Updater）完成，可以说调度器是在整个应用组件树层面掌控全局，而更新器则深入到个更具体的每一个组件内部执行。

每一个组件实例化时都会被注入一个更新器，负责协调组件与React核心进程的通信，其职责主要可以概括为以下几点：

1. 找到组件实例对应的fiber实例；
2. 询问调度器当前组件fiber实例的优先级；
3. 将更新推入fiber的更新队列；
4. 根据优先级调度更新任务；

更新器实现见[ReactFiberClassComponent模块](https://github.com/facebook/react/blob/master/packages/react-reconciler/src/ReactFiberClassComponent.js)：

```react
export default function(
  scheduleWork: (fiber: Fiber, expirationTime: ExpirationTime) => void,
  computeExpirationForFiber: (fiber: Fiber) => ExpirationTime,
  memoizeProps: (workInProgress: Fiber, props: any) => void,
  memoizeState: (workInProgress: Fiber, state: any) => void,
) {
  // Class component state updater
  const updater = {
    isMounted,
    // 状态变更，更新入队列
    enqueueSetState(instance, partialState, callback) {
      // 获取fiber
      const fiber = ReactInstanceMap.get(instance);
      const expirationTime = computeExpirationForFiber(fiber);
      // 创建更新任务
      const update = {
        expirationTime,
        partialState,
        callback,
        isReplace: false,
        isForced: false,
        nextCallback: null,
        next: null,
      };
      // 添加更新任务至fiber
      insertUpdateIntoFiber(fiber, update);
      // 调用调度器API以调度fiber任务
      scheduleWork(fiber, expirationTime);
    },
    // 替换状态时
    enqueueReplaceState(instance, state, callback) {
      const fiber = ReactInstanceMap.get(instance);
      const expirationTime = computeExpirationForFiber(fiber);
      const update = {
        expirationTime,
        partialState: state,
        callback,
        isReplace: true,
        isForced: false,
        nextCallback: null,
        next: null,
      };
      // 添加更新任务至fiber
      insertUpdateIntoFiber(fiber, update);
      scheduleWork(fiber, expirationTime);
    },
    // 强制更新
    enqueueForceUpdate(instance, callback) {
      const fiber = ReactInstanceMap.get(instance);
      const expirationTime = computeExpirationForFiber(fiber);
      const update = {
        expirationTime,
        partialState: null,
        callback,
        isReplace: false,
        isForced: true,
        nextCallback: null,
        next: null,
      };
      insertUpdateIntoFiber(fiber, update);
      scheduleWork(fiber, expirationTime);
    },
  };
  
  // 调用组件实例生命周期方法并调用更新器API
  function callComponentWillReceiveProps(
    workInProgress, instance, newProps, newContext
  ) {
    const oldState = instance.state;
    instance.componentWillReceiveProps(newProps, newContext);

    if (instance.state !== oldState) {
      // 调用更新器入队列方法
      updater.enqueueReplaceState(instance, instance.state, null);
    }
  }

  // 设置Class组件实例的更新器和fiber
  function adoptClassInstance(workInProgress, instance): {
    // 设置更新器
    instance.updater = updater;
    workInProgress.stateNode = instance;
    // 设置fiber
    ReactInstanceMap.set(instance, workInProgress);
  }

  // 实例化Class组件实例
  function constructClassInstance(workInProgress, props) {
    const ctor = workInProgress.type;
    const unmaskedContext = getUnmaskedContext(workInProgress);
    const needsContext = isContextConsumer(workInProgress);
    const context = needsContext
    ? getMaskedContext(workInProgress, unmaskedContext)
    : emptyObject;
    // 实例化组件类型
    const instance = new ctor(props, context);
    // 设置Class实例的更新器和fiber
    adoptClassInstance(workInProgress, instance);

    return instance;
  }
  
  // 挂载组件实例
  function mountClassInstance(
    workInProgress, renderExpirationTime) {
    if (typeof instance.componentWillMount === 'function') {
      callComponentWillMount(workInProgress, instance);
    }
  }
  
 // 更新组件实例 
  function updateClassInstance(
    current, workInProgress, renderExpirationTime
  ) {
    // 组件实例
    const instance = workInProgress.stateNode;
    // 原Props或新Props
    const oldProps = workInProgress.memoizedProps;
    let newProps = workInProgress.pendingProps;
    if (!newProps) {
      // 没有新Props则直接使用原Props
      newProps = oldProps;
    }
    
    if (typeof instance.componentWillReceiveProps === 'function' &&
      (oldProps !== newProps)) {
      // 调用方法进行更新器相关处理
      callComponentWillReceiveProps(
        workInProgress, instance, newProps
      );
    }

    // 根据原状态对象和更新队列计算得到新状态对象
    const oldState = workInProgress.memoizedState;
    let newState;
    if (workInProgress.updateQueue !== null) {
      // 处理更新队列更新，计算得到新State对象
      newState = processUpdateQueue(
        current,
        workInProgress,
        workInProgress.updateQueue,
        instance,
        newProps,
        renderExpirationTime,
      );
    } else {
      newState = oldState;
    }

    // 检查是否需要更新组件
    const shouldUpdate = checkShouldComponentUpdate(...);

    if (shouldUpdate) {
      if (typeof instance.componentWillUpdate === 'function') {      
        instance.componentWillUpdate(newProps, newState, newContext);      
      }
    }
    // 调用生命周期方法
    ...
    return shouldUpdate;
  }
  
  return {
    adoptClassInstance,
    constructClassInstance,
    mountClassInstance,
    updateClassInstance
  };
}
```

主要实现以下几个功能：

1. 初始化组件实例并为其设置fibre实例和更新器；

2. 初始化或更新组件实例，根据更新队列计算得到新状态等；

3. 调用组件实例生命周期方法，并且调用更新器API更新fiber实例等，如更新组件实例调用的`callComponentWillReceiveProps`方法，该方法调用组件实例的`componentWillReceiveProps`生命周期方法，并调用更新器`updater.enqueueReplaceState`方法，更新fiber实例，并将更新添加至更新队列:

   ```react
   // 调用组件实例生命周期方法并调用更新器API
   function callComponentWillReceiveProps(
   workInProgress, instance, newProps, newContext
   ) {
     const oldState = instance.state;
     instance.componentWillReceiveProps(newProps, newContext);

     if (instance.state !== oldState) {
       // 调用更新器入队列方法
       updater.enqueueReplaceState(instance, instance.state, null);
     }
   }
   ```

   ​

另外需要重点关注的是`insertUpdateIntoFiber`方法，该方法实现将更新任务添加至组件fiber实例，内部会处理将任务添加至fiber更新队列，源码见上文更新队列中介绍的[ReactFiberUpdateQueue模块](https://github.com/facebook/react/blob/master/packages/react-reconciler/src/ReactFiberUpdateQueue.js)，最终还是调用`insertUpdateIntoQueue`。

#### 获取fiber实例

获取fiber实例比较简单，fiber实例通过[`ReactInstanceMap`模块](https://github.com/facebook/react/blob/master/packages/shared/ReactInstanceMap.js)提供的API进行维护：

```react
export function get(key) {
  return key._reactInternalFiber;
}
export function set(key, value) {
  key._reactInternalFiber = value;
}
```

使用节点上的`_reactInternalFiber`属性维护fiber实例，调用`get`方法即可获取。

#### 获取优先级

fiber实例的优先级是由调度器控制，所以需要询问调度器关于当前fiber实例的优先级，调度器提供`computeExpirationForFiber`获取特定fiber实例的优先级，即获取特点fiber实例的到期时间（expirationTime），方法具体实现见调度器与优先级章节。

#### 将更新任务添加至更新队列

组件状态变更时，将对应的组件更新任务划分优先级并根据优先级从高到低依次推入fiber实例的更新队列，诸如使用`setState`方法触发的更新任务通常是添加至更新队列尾部。

调度器完成切分任务为任务单元后，将使用`performUnitOfWork`方法开始处理任务单元，然后按调用组件的更新器（实现见上文介绍）相关API，按优先级将任务单元添加至fiber实例的更新队列：

1. 从work-in-progress的alternate属性获取当前稳定fiber，然后调用`beginWork`开始处理更新；

   ```react
   // 处理任务单元
   function performUnitOfWork(workInProgress: Fiber): Fiber | null {
     // 当前最新版本fiber实例使用fiber的alternate属性获取
     const current = workInProgress.alternate;
     // 开始处理，返回子组件fiber实例
     let next = beginWork(current, workInProgress, nextRenderExpirationTime);
     if (next === null) {
       // 不存在子级fiber，完成单元任务的处理，之后继续处理下一个任务
       next = completeUnitOfWork(workInProgress);
     }
     return next;
   }
   ```

   ​

2. `beginWork`返回传入fiber实例的子组件fiber实例，，若为空，则代表此组件树任务处理完成，否则会在`workLoop` 方法内迭代调用`performUnitOfWork`方法处理：

   1. `deadline`：是调用`requestIdleCallback`API执行任务处理函数时返回的帧时间对象；
   2. `nextUnitOfWork`：下一个要处理的任务单元；
   3. `shouldYield`：判断是否暂停当前任务处理过程；

   ```react
   function workLoop(expirationTime) {
     // 渲染更新至DOM的到期时间值 小于 调度开始至开始处理此fiber的时间段值
     // 说明任务已经过期
     if (nextRenderExpirationTime <= mostRecentCurrentTime) {
       // Flush all expired work， 处理所有已经到期的更新
       while (nextUnitOfWork !== null) {
         nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
       }
     } else {
       // Flush asynchronous work until the deadline runs out of time.
       // 依次处理异步更新，直至deadline到达
       while (nextUnitOfWork !== null && !shouldYield()) {
         nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
       }
     }
   }
   // 处理异步任务时, 调和器将询问渲染器是否暂停执行；
   // 在DOM中，使用requestIdleCallback API实现
   function shouldYield() {
     if (deadline === null) {
       return false;
     }
     if (deadline.timeRemaining() > 1) {
       // 这一帧帧还有剩余时间，不需要暂停;
       // 只有非过期任务可以到达此判断条件
       return false;
     }
     deadlineDidExpire = true;
     return true;
   }
   ```

   ​

3. `beginWork`方法内根据组件类型调用不同方法，这些方法内调用更新器API将更新添加至更新队列，具体实现见[ReactFiberBeginWork模块](https://github.com/facebook/react/blob/master/packages/react-reconciler/src/ReactFiberBeginWork.js):

   ```react
   // 引入更新器模块
   import ReactFiberClassComponent from './ReactFiberClassComponent';

   export default function(
     config, hostContext, hydrationContext,
     scheduleWork: (fiber: Fiber, expirationTime: ExpirationTime) => void,
     computeExpirationForFiber: (fiber: Fiber) => ExpirationTime,
   ) {
     // 初始化更新器模块，获取API
     const {
       adoptClassInstance, constructClassInstance,
       mountClassInstance, updateClassInstance
     } = ReactFiberClassComponent(
       scheduleWork, computeExpirationForFiber,
       memoizeProps, memoizeState
     );
     
     // beginWork，开始任务处理
     function beginWork(
       current, workInProgress, renderExpirationTime
     ) {
       switch (workInProgress.tag) {
         // 对应不同类型fiber，执行不同处理逻辑
         case IndeterminateComponent:
           ...
         case FunctionalComponent:
           return updateFunctionalComponent(current, workInProgress);
         case ClassComponent:
           // 更新类组件，返回子级fiber实例
           return updateClassComponent(
             current, workInProgress, renderExpirationTime
           );
         case HostRoot:
           return updateHostRoot(current, workInProgress, renderExpirationTime);
         case HostComponent:
           ...
         case HostText:
           return updateHostText(current, workInProgress);
         case CallHandlerPhase:
           // This is a restart. Reset the tag to the initial phase.
           workInProgress.tag = CallComponent;
         case CallComponent:
           ...
         case ReturnComponent:
           // A return component is just a placeholder, we can just run through the
           // next one immediately.
           return null;
         case HostPortal:
           ...
         case Fragment:
           return updateFragment(current, workInProgress);
         default:;
       }
     }
     
     return {
       beginWork,
       beginFailedWork
     };
   }
   ```

   1. 引入`ReactFiberClassComponent`更新器相关模块并初始化获得API；

   2. `beginWork`方法内根据传入的work-in-progress的fiber类型（tag）调用不同逻辑处理；

   3. 在逻辑处理里面会调用更新期API，将更新添加至更新队列；

   4. 以`ClassComponent`为例，将调用`updateClassComponent`方法：

      1. 判断若第一次则初始化并挂载组件实例，否则调用`updateClassInstance`方法更新组件实例；

      2. 最后调用`finishClassComponent`方法，调和处理其子组件并返回其子级fiber实例；

         ```react
         // 更新类组件
         function updateClassComponent(
           current, workInProgress, renderExpirationTime
         ) {
           let shouldUpdate;
           if (current === null) {
             if (!workInProgress.stateNode) {
               // fiber没有组件实例时需要初始化组件实例
               constructClassInstance(workInProgress, workInProgress.pendingProps);
               // 挂载组件实例
               mountClassInstance(workInProgress, renderExpirationTime);
               // 默认需要更新
               shouldUpdate = true;
             }
           } else {
             // 处理实例更新并返回是否需要更新组件
             shouldUpdate = updateClassInstance(
               current,
               workInProgress,
               renderExpirationTime,
             );
           }
           // 更新完成后，返回子组件fiber实例
           return finishClassComponent(
             current, workInProgress, shouldUpdate, hasContext
           );
         }

         // 类组件更新完成
         function finishClassComponent(
           current, workInProgress, shouldUpdate, hasContext
         ) {
           if (!shouldUpdate) {
             // 明确设置不需要更新时，不处理更新，
             // 如shouldCOmponentUpdate方法return false
             return bailoutOnAlreadyFinishedWork(current, workInProgress);
           }

           const instance = workInProgress.stateNode;
           // 重新渲染
           ReactCurrentOwner.current = workInProgress;
           // 返回组件子组件树等内容
           let nextChildren = instance.render();
           // 调和子组件树，将迭代处理每一个组件
           // 函数内将调用ReactChildFiber模块提供的API
           reconcileChildren(current, workInProgress, nextChildren);
           // 返回子组件fiber实例
           return workInProgress.child;
         }
         ```

#### 调度更新任务

上一节更新器已经能按照优先级将更新添加至更新队列，那么如何调度执行更新任务呢？

在更新器实现[ReactFiberClassComponent模块](https://github.com/facebook/react/blob/master/packages/react-reconciler/src/ReactFiberClassComponent.js)中，在`enqueueSetState`，`enqueueReplaceState`和`enqueueForceUpdate`入队列方法中，均会调用如下方法：

```react
insertUpdateIntoFiber(fiber, update);
scheduleWork(fiber, expirationTime);
```

1. `insertUpdateIntoFiber`：将更新添加至fiber实例，最终会添加至更新队列；
2. `scheduleWork`：调度任务，传入fiber实例和任务到期时间；

## 渲染与调和

在调和阶段，不涉及任何DOM处理，在处理完更新后，需要渲染模块将更新渲染至DOM，这也是React应用中虚拟DOM（Virtual DOM）的概念，即所有的更新计算都基于虚拟DOM，计算完后才将优化后的更新渲染至真实DOM。Fiber使用`requestIdleCallback`API更高效的执行渲染更新的任务，实现任务的切分。

### 源码简单分析

本小节针对React渲染模块及调和算法模块代码层关系做简要探讨，不感兴趣可以跳过此劫（节）。

#### react-dom渲染模块

在项目中，如果要将应用渲染至页面，通常会有如下代码：

```react
import ReactDOM from 'react-dom';
import App form './App'; // 应用根组件

ReactDOM.render(
  <App>,
  document.querySelector('#App') // 应用挂载容器DOM
);
```

`react-dom`模块就是适用于浏览器端渲染React应用的渲染方案，[ReactDOM模块源码](https://github.com/facebook/react/blob/master/packages/react-dom/src/client/ReactDOM.js)结构如：

```react
const ReactDOM = {
  render(
    element: React$Element<any>, // React元素，通常是项目根组件
    container: DOMContainer, // React应用挂载的DOM容器
    callback: ?Function,  // 回调函数
  ) {
    return renderSubtreeIntoContainer(
      null,
      element,
      container,
      false,
      callback,
    );
  }
};
```

常用的渲染组件至DOM的`render`方法如上，调用`renderSubtreeIntoContainer`方法，渲染组件的子组件树：

```react
// 渲染组件的子组件树至父容器
function renderSubtreeIntoContainer(
  parentComponent: ?React$Component<any, any>,
  children: ReactNodeList,
  container: DOMContainer,
  forceHydrate: boolean,
  callback: ?Function,
) {
  let root = container._reactRootContainer;
  if (!root) {
    // 初次渲染时初始化
    // 创建react根容器
    const newRoot = DOMRenderer.createContainer(container, shouldHydrate);
    // 缓存react根容器至DOM容器的reactRootContainer属性
    root = container._reactRootContainer = newRoot;
    // 初始化容器相关
    // Initial mount should not be batched.
    DOMRenderer.unbatchedUpdates(() => {
      DOMRenderer.updateContainer(children, newRoot, parentComponent, callback);
    });
  } else {
    // 如果不是初次渲染则直接更新容器
    DOMRenderer.updateContainer(children, root, parentComponent, callback);
  }
  // 返回根容器fiber树的根fiber实例
  return DOMRenderer.getPublicRootInstance(root);      
}
```

##### DOM渲染器对象

`DOMRenderer`是调用调和算法返回的DOM渲染器对象，在此处会传入渲染模块的渲染UI操作API，如：

```react
// 调用调和算法方法
const DOMRenderer = ReactFiberReconciler(
  // 传递至调和算法中的渲染UI（react-dom模块即DOM）
  // 实际操作API
  {
  getPublicInstance(instance) {
    return instance;
  },
  createInstance(
    type: string,
    props: Props,
    rootContainerInstance: Container,
    hostContext: HostContext,
    internalInstanceHandle: Object,
  ) {
    // 创建DOM元素
  	const domElement = createElement(
      type,
      props,
      rootContainerInstance,
      parentNamespace,
    );
    precacheFiberNode(internalInstanceHandle, domElement);
    updateFiberProps(domElement, props);
    return domElement;      
  },
  now: ReactDOMFrameScheduling.now,
  mutation: {
    // 提交渲染
    commitMount(
      domElement: Instance,
      type: string,
      newProps: Props,
      internalInstanceHandle: Object,
    ) {
      ((domElement: any):
        | HTMLButtonElement
        | HTMLInputElement
        | HTMLSelectElement
        | HTMLTextAreaElement).focus();
    },
	// 提交更新
    commitUpdate(
      domElement: Instance,
      updatePayload: Array<mixed>,
      type: string,
      oldProps: Props,
      newProps: Props,
      internalInstanceHandle: Object,
    ) {
      // 更新属性
      updateFiberProps(domElement, newProps);
      // 对DOM节点进行Diff算法分析
      updateProperties(domElement, updatePayload, type, oldProps, newProps);
    },
   	// 清空文本内容
    resetTextContent(domElement: Instance): void {
      domElement.textContent = '';
    },
    // 添加为子级
    appendChild(
      parentInstance: Instance,
      child: Instance | TextInstance,
    ): void {
      parentInstance.appendChild(child);
    }
    ...
  }
});
```

[ReactDOMFrameScheduling.now源码见Github](https://github.com/facebook/react/blob/master/packages/shared/ReactDOMFrameScheduling.js)。

在任务完成时将执行`createInstance`方法，然后调用`createElement`创建DOM元素并添加至文档。

#### 调和算法入口

[调和算法](https://github.com/facebook/react/blob/master/packages/react-reconciler/src/ReactFiberReconciler.js)入口：

```react
import ReactFiberScheduler from './ReactFiberScheduler';
import {insertUpdateIntoFiber} from './ReactFiberUpdateQueue';

export default function Reconciler(
  // all parameters as config object
  // 下文用到的config参数即从此处传入
  getPublicInstance,
  createInstance,
  ...
) {
  // 生成调度器API
  var {
    computeAsyncExpiration, computeExpirationForFiber, scheduleWork,
    batchedUpdates, unbatchedUpdates, flushSync, deferredUpdates,
  } = ReactFiberScheduler(config);

  return {
    // 创建容器
    createContainer(containerInfo, hydrate: boolean) {
      // 创建根fiber实例
      return createFiberRoot(containerInfo, hydrate);
    },
    // 更新容器内容
    updateContainer(
      element: ReactNodeList,
      container: OpaqueRoot,
      parentComponent: ?React$Component<any, any>,
      callback: ?Function,
    ): void {
      const current = container.current;
      ...
      // 更新
      scheduleTopLevelUpdate(current, element, callback);
    },
    ...
    // 获取容器fiber树的根fiber实例
    getPublicRootInstance (container) {
      // 获取fiber实例
      const containerFiber = container.current;
      if (!containerFiber.child) {
        return null;
      }
      switch (containerFiber.child.tag) {
        case HostComponent:
          return getPublicInstance(containerFiber.child.stateNode);
        default:
          return containerFiber.child.stateNode;
      }
    },
	unbatchedUpdates
  }
}
```

在`react-dom`渲染模块调用`createContainer`创建容器和根fiber实例，FiberRoot对象，调用`updateContainer`方法更新容器内容。

##### 开始更新

```react
// 更新
function scheduleTopLevelUpdate(
    current: Fiber,
    element: ReactNodeList,
    callback: ?Function,
  ) {
  callback = callback === undefined ? null : callback;
  const update = {
    expirationTime,
    partialState: {element},
    callback,
    isReplace: false,
    isForced: false,
    nextCallback: null,
    next: null,
  };
  // 更新fiber实例
  insertUpdateIntoFiber(current, update);
  // 执行任务
  scheduleWork(current, expirationTime);
}
```

##### 处理更新

调用`scheduleWork`方法处理更新任务，实现见上文，[源码](https://github.com/facebook/react/blob/master/packages/react-reconciler/src/ReactFiberScheduler.js)。

##### 提交更新

处理完更新后需要确认提交更新至渲染模块，然后渲染模块才能将更新渲染至DOM。

```react
import ReactFiberCommitWork from './ReactFiberCommitWork';

const {
    commitResetTextContent,
    commitPlacement,
    commitDeletion,
    commitWork,
    commitLifeCycles,
    commitAttachRef,
    commitDetachRef,
  } = ReactFiberCommitWork(config, captureError);

function commitRoot(finishedWork) {
  ...
  commitAllHostEffects();
}
// 循环执行提交更新
function commitAllHostEffects() {
  while (nextEffect !== null) {
    let primaryEffectTag =
        effectTag & ~(Callback | Err | ContentReset | Ref | PerformedWork);
      switch (primaryEffectTag) {
        case Placement: {
          commitPlacement(nextEffect);
          nextEffect.effectTag &= ~Placement;
          break;
        }
        case PlacementAndUpdate: {
          // Placement
          commitPlacement(nextEffect);
          nextEffect.effectTag &= ~Placement;
          // Update
          const current = nextEffect.alternate;
          commitWork(current, nextEffect);
          break;
        }
        case Update: {
          const current = nextEffect.alternate;
          commitWork(current, nextEffect);
          break;
        }
        case Deletion: {
          isUnmounting = true;
          commitDeletion(nextEffect);
          isUnmounting = false;
          break;
        }
      }
      nextEffect = nextEffect.nextEffect;
  }
}
// Flush sync work.
let finishedWork = root.finishedWork;
if (finishedWork !== null) {
  // This root is already complete. We can commit it.
  root.finishedWork = null;
  root.remainingExpirationTime = commitRoot(finishedWork);
}
```

[提交更新](https://github.com/facebook/react/blob/master/packages/react-reconciler/src/ReactFiberCommitWork.js)是最后确认更新组件的阶段，主要逻辑如下：

```react
export default function (mutation, ...) {
  const {
    commitMount,
    commitUpdate,
    resetTextContent,
    commitTextUpdate,
    appendChild,
    appendChildToContainer,
    insertBefore,
    insertInContainerBefore,
    removeChild,
    removeChildFromContainer,
  } = mutation; 
  
  function commitWork(current: Fiber | null, finishedWork: Fiber): void {
    switch (finishedWork.tag) {
      case ClassComponent: {
        return;
      }
      case HostComponent: {
        const instance: I = finishedWork.stateNode;
        if (instance != null) {
          // Commit the work prepared earlier.
          const newProps = finishedWork.memoizedProps;
          // For hydration we reuse the update path but we treat the oldProps
          // as the newProps. The updatePayload will contain the real change in
          // this case.
          const oldProps = current !== null ? current.memoizedProps : newProps;
          const type = finishedWork.type;
          // TODO: Type the updateQueue to be specific to host components.
          const updatePayload = finishedWork.updateQueue:;
          finishedWork.updateQueue = null;
          if (updatePayload !== null) {
            commitUpdate(
              instance,
              updatePayload,
              type,
              oldProps,
              newProps,
              finishedWork,
            );
          }
        }
        return;
      }
      case HostText: {   
        const textInstance = finishedWork.stateNode;
        const newText = finishedWork.memoizedProps;
        // For hydration we reuse the update path but we treat the oldProps
        // as the newProps. The updatePayload will contain the real change in
        // this case.
        const oldText: string =
          current !== null ? current.memoizedProps : newText;
        commitTextUpdate(textInstance, oldText, newText);
        return;
      }
      case HostRoot: {
        return;
      }
      default: {
      }
    }
  }
}
```

## 参考

1. [React Source Code](https://github.com/facebook/react/)
2. [React Fiber Architecture](https://github.com/acdlite/react-fiber-architecture)
3. [A look inside React Fiber](http://makersden.io/blog/look-inside-fiber/)
4. [An overview of React 16 features and Fiber](https://edgecoders.com/react-16-features-and-fiber-explanation-e779544bb1b7)
5. [requestIdleCallback](https://www.w3.org/TR/requestidlecallback/)