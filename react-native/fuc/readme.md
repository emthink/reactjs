# React Native App

This is a demo structure of the React Native App.

## Startup

1. Install the react-native-cli
  ```
  npm install -g react-native-cli
  ```
  Mac OSX下打开Xcode编辑器的Menu -> Preferences -> Locations，然后配置命令行工具选择Xcode。

2. `npm install -g yarn`
3. `yarn install`
4. `react-native run-ios` 

## Stacks and Structures

### Stacks

1. react-native + react类库；
2. react-navigation管理应用导航路由；
3. redux作为JavaScript状态容器，react-redux将React Native应用与redux连接；
4. Immutable.js支持Immutable化状态，redux-immutable使整个redux store状态树Immutable化；
5. 使用redux-persist支持redux状态树的持久化(AsyncStorage)，并添加redux-persist-immutable拓展以支持Immutable化状态树的持久化；
6. 使用redux-saga管理应用内的异步任务，如网络请求，异步读取本地数据等；
7. 使用jest集成应用测试，使用lodash，ramda等可选辅助类，工具类库；
8. 使用reactotron调试工具

### Directory Structures

- src - App项目React Native部分目录

- ├── api - 应用网络请求相关配置
- ├── app.js  - React Native部分入口js文件
- ├── components  - 可复用纯UI组件，也可作elements
- ├── config  - 应用全局配置
- ├── constants - 应用全局变量
- ├── containers  - 容器组件
- ├── helpers - 全局工具／辅助方法
- ├── middlewares - 中间件
- ├── redux - redux目录
- ├── routes  - 应用导航路由配置
- ├── sagas - 应用异步任务管理sagas目录
- ├── screens - 应用组件屏目录，通常是展示型组件
- └── services  - 应用内服务模块目录，如应用状态持久化及恢复服务