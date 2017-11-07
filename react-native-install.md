# React Native开发环境搭建

最近开始全面使用React技术栈开发，耳听得团队不久的将来有计划使用React Native开发app，迫不及待来尝试一波，首先搭建好开发环境并跑起来咱们程序界的经典程序，期间也有一些坑，在这里记录分享给大家。

## 安装包管理工具

本人使用的是Mac环境，所以以Mac为例，对于Windows，其实差别不大。

### 安装Homebrew

Homebrew是为Mac OS量身定制的一款集成包管理工具，我们使用它很方便的安装Node.js及切换Node.js版本。

```
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

注：在Max OS X 10.x版本中使用Homebrew安装软件时可能会发生`/usr/local`目录不可写的权限问题，此时可以使用如下命令修复：

```
sudo chown -R `whoami` /usr/local
```

### 安装Node.js

接下来使用Homebrew安装Node.js，Windows环境可以直接去官网下载安装[Node.js](https://nodejs.org/zh-cn/download/)：

```
brew install node
```

如果安装下载速度过慢，可以设置使用国内淘宝提供的镜像：

```
npm config set registry https://registry.npm.taobao.org --global
npm config set disturl https://npm.taobao.org/dist --global
```

### 安装包管理

我们可以自由选择直接使用NPM或者另外安装Yarn包管理工具，对于NPM的使用相信大家都已经很熟悉了，我们这里以Yarn为例：

> [Yarn](http://yarnpkg.com/)是Facebook提供的替代npm的工具，可以加速node模块的下载。

依然需要使用NPM安装Yarn包：

```
npm install -g yarn
```

随后我们就可以使用`yarn add`代替`npm install --save`了。

## 安装react-native-cli脚手架

React Native官方提供了一键生成项目初始结构的脚手架，初学者或体验者可以直接安装使用：

```
npm install -g react-native-cli
```

## 安装设置编辑器

Mac我们使用Xcode开发iOS APP，安卓开发可以使用Eclipse等，另外需要对Xcode编辑器进行简单配置以支持react native：

依次点击打开Xcode编辑器的Menu-》Preferences-》Locations，配置如下图红框中的命令行工具项：

![Xcode命令行工具配置](http://blog.codingplayboy.com/wp-content/uploads/2017/09/xcode-clt.png)


## 初始化项目及解决运行异常

接下来可以使用脚手架初始化一个示例程序了：

```
// 初始化一个hello项目
react-native init hello
cd hello
```

进入项目根目录后，使用`run-ios`指令启动该iOS APP：

```
react-native run-ios
```

对于版本高于0.45的创建项目，也许你会看到如下错误：

```
Error:
 
Build failed:
Unpacking /Users/zjy/.rncache/boost_1_63_0.tar.gz...

Print: Entry, ":CFBundleIdentifier", Does Not Exist
```

### 降级版本方案

本人经过多方查找，发现是创建项目下载安装node依赖模块时的资源缺失问题，目前最新的0.45及以上版本需要下载boost库，该库过大，导致下载出问题，参考:

1. [https://github.com/facebook/react-native/issues/14368](https://github.com/facebook/react-native/issues/14368)
2. [https://github.com/facebook/react-native/issues/14447](https://github.com/facebook/react-native/issues/14447)

解决方案有两种，如果不追求新版本新特性，可以降低创建项目的版本，使用`--version`指令明确设置项目版本：

```
react-native init MyApp --version 0.44.3
```

### 替换资源文件方案

依然希望使用新版本的解决方案则是手动下载相关文件替换：

下载如下四个相关文件放到项目根目录下的`.rncache`目录下，进行替换：

![rncache文件](http://blog.codingplayboy.com/wp-content/uploads/2017/09/rncache.png)

下载地址：[https://pan.baidu.com/s/1kV5iVzD.](https://pan.baidu.com/s/1kV5iVzD)

下载后替换：

```
cd ~/.rncache
cp ~/Downloads/boost_1_63_0.tar.gz ~/.rncache/
```

依次使用`cp`指令复制替换四个文件；

然后删除第三方库文件，在`node_modules/react-native/third-party/`目录下：

```
rm -r project/node_modules/react-native/third-part
```

再次执行启动程序：

```
react-native run-ios
```

发现可以正常运行了，接下来我们可以在编辑器里编辑我们的项目了，如我们的react-native入口js文件--`index.ios.js`文件，刷新即可看到变更。

## 其他工具

### Nuclide

Nuclide是由Facebook提供的一款基于atom编辑器的集成开发环境，可用于编写、[运行](http://nuclide.io/docs/platforms/react-native/#running-applications)和 [调试](http://nuclide.io/docs/platforms/react-native/#debugging)React Native应用。

[Nuclide的入门文档](http://nuclide.io/docs/quick-start/getting-started/)