# react-router browserHistory刷新页面404问题解决

使用React开发新项目时，遇见了刷新页面，直接访问二级或三级路由时，访问失败，出现404或资源加载异常的情况，本篇针对此问题进行分析并总结解决方案。

## 背景

使用webpack-dev-server做本地开发服务器时，正常情况只需要简单使用`webpack-dev-server`指令启动即可，但是当项目处于以下两种情况时，往往需要有嵌套路由和异步加载路由：

1. 我们使用react-router这种路由库构建单页面应用路由；
2. 使用`html-webpack-plugin`插件动态将加载js的`<script>`标签注入html文档；

这时，访问`localhost:9090`是可以正常加载页面和js等文件的，但是当我们需要访问二级甚至三级路由或者刷新页面时，如`localhost:9090/posts/92`时，可能会出现两种情况：

1. 页面加载失败，返回`Cannot Get（404）`；
2. 服务响应，但是没有返回webpack处理输出的html文件，导致无法加载js资源，第二种情况如图：

![react-router-browser-history](http://blog.codingplayboy.com/wp-content/uploads/2017/12/react-router-browser-history-404.png)

那么我们怎么处理才能正常访问，各页面路由呢？博主追踪溯源，查找文档配置后解决了问题，本篇就是对整个解决问题过程的总结。

## 分析问题

发现问题后，我们就要开始分析，解决问题了，我们判断这个问题一般是两方面原因造成：

1. react-router路前端由配置；
2. webpack-dev-server服务配置；

### react-router

因为前端路由更容易确定问题，更方便分析，而且对于react-router更熟悉，所以首先去查询react-router路由库相关配置信息，发现文档中提到了使用`browserHistory`时，会创建真实的URL，处理初始`/`请求没有问题，但是对于跳转路由后，刷新页面或者直接访问该URL时，会发现无法正确相应，更多信息[查看参考文档](https://react-guide.github.io/react-router-cn/docs/guides/basics/Histories.html)，文档中也提供了几种服务器配置解决方式：

#### Node

```javascript
const express = require('express')
const path = require('path')
const port = process.env.PORT || 8080
const app = express()

// 通常用于加载静态资源
app.use(express.static(__dirname + '/public'))

// 在你应用 JavaScript 文件中包含了一个 script 标签
// 的 index.html 中处理任何一个 route
app.get('*', function (request, response){
  response.sendFile(path.resolve(__dirname, 'public', 'index.html'))
})

app.listen(port)
console.log("server started on port " + port)
```

在使用Node作为服务时，需要使用通配符`*`监听所有请求，返回目标html文档（引用js资源的html）。

#### Nginx

如果使用的是nginx服务器，则只需要使用[`try_files` 指令](http://nginx.org/en/docs/http/ngx_http_core_module.html#try_files)：

```javascript
server {
  ...
  location / {
    try_files $uri /index.html
  }
}
```

#### Apache

如果使用Apache服务器，则需要在项目根目录创建`.htaccess`文件，文件包含如下内容：

```shell
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

以下都是针对服务器的配置，可惜的是我们目前还没引入相关服务器，只是使用了webpack-dev-server的内置服务，但是我们已经找到问题所在了，就是路由请求无法匹配返回html文档，所以接下来就该去webpack-dev-server文档中查找解决方式了。

### webpack-dev-server

在这里不得不吐槽一下webpack-dev-server官方文档，博主反复看了几遍，才看清楚了问题所在，这里也分两种情况：

1. 没有修改`output.publicPath`，即webpack配置文件中没有声明值，属于默认情况；
2. 设置了`output.publicPath`为自定义值；

[点此查看文档](https://webpack.github.io/docs/webpack-dev-server.html#the-historyapifallback-option)

#### 默认情况

默认情况下，没有修改`output.publicPath`值，只需要设置webpack-dev-server的`historyApiFallback`配置：

```json
devServer: {
  historyApiFallback: true
}
```

> If you are using the HTML5 history API you probably need to serve your `index.html` in place of 404 responses, which can be done by setting `historyApiFallback: true`
>
> 如果你的应用使用HTML5 history API，你可能需要使用`index.html`响应404或者问题请求，只需要设置g `historyApiFallback: true`即可

#### 自定义值

> However, if you have modified `output.publicPath` in your Webpack configuration, you need to specify the URL to redirect to. This is done using the `historyApiFallback.index` option
>
> 如果你在webpack配置文件中修改了 `output.publicPath` 值，那么你就需要声明请求重定向，配置`historyApiFallback.index` 值。

```json
// output.publicPath: '/assets/'
historyApiFallback: {
  index: '/assets/'
}
```

####Proxy

发现使用以上方式，并不能完全解决我的问题，总会有路由请求响应异常，于是博主继续查找更好的解决方案：

[点此查看文档](https://webpack.github.io/docs/webpack-dev-server.html#bypass-the-proxy)

> The proxy can be optionally bypassed based on the return from a function. The function can inspect the HTTP request, response, and any given proxy options. It must return either `false` or a URL path that will be served *instead* of continuing to proxy the request.
>
> 代理提供通过函数返回值响应请求方式，针对不同请求进行不同处理，函数参数接收HTTP请求和响应体，以及代理配置对象，这个函数必须返回false或URL路径，以表明如何继续处理请求，返回URL时，源请求将被代理到该URL路径请求。

```json
proxy: {
  '/': {
    target: 'https://api.example.com',
    secure: false,
    bypass: function(req, res, proxyOptions) {
      if (req.headers.accept.indexOf('html') !== -1) {
        console.log('Skipping proxy for browser request.');
        return '/index.html';
      }
    }
  }
}
```

如上配置，可以监听`https://api.example.com`域下的`/`开头的请求（等效于所有请求），然后判断请求头中`accept`字段是否包含`html`，若包含，则代理请求至`/index.html`，随后将返回index.html文档至浏览器。

## 解决问题

综合以上方案，因为在webpack配置中修改了`output.publicPath`为`/assets/`，所以博主采用webpack-dev-server Proxy代理方式解决了问题：

```json
const PUBLICPATH = '/assets/'
...
proxy: {
  '/': {
    bypass: function (req, res, proxyOptions) {
      console.log('Skipping proxy for browser request.')
      return `${PUBLICPATH}/index.html`
    }
  }
}
```

监听所有前端路由，然后直接返回``${PUBLICPATH}/index.html``，`PUBLICPATH`就是设置的`output.publicPath`值。

另外，博主总是习惯性的声明，虽然不设置该属性也能满足预期访问效果：

```json
historyApiFallback: true
```

