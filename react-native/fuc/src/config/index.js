/**
 * @desc [应用配置声明]
 * @author [xiongjiangang]
 */

const Config = {
  // 项目命名空间
  namespace: 'FUC',

  // 添加项目命名空间
  setNameSpaces (name, namespaces = '') {
    if (namespaces && typeof namespaces !== 'string') {
      for (let len = namespaces.length - 1; len >= 0; len--) {
        name = namespaces[len] + '.' + name;
      }
    } else {
      if (namespaces) {
        name = namespaces + '.' + name;
      }
    }
    return name;
  }
}

// 路由信息配置
const routes = {
  Login: {
    name: Config.setNameSpaces('Login', Config.namespace),
    path: 'login',
    title: '登录'
  },
  Main: {
    name: Config.setNameSpaces('Main', Config.namespace),
    path: '/'
  }
};

module.exports = {
  namespace: Config.namespace,
  routes
};