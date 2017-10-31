import axios from 'axios';
import ApiConfig from './config';

/**
 * 检查接口响应状态码
 *
 * @param {Object} response axios返回的响应对象
 * @return {Object} 状态码正常时返回响应本身，否则返回 reject 信息
 */
function checkStatus (response) {
  console.log(response);
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    const message = getErrorMsgByStatusCode(response.status);
    return Promise.reject({ message, response });
  }
}

/**
 * 返回状态码对应文本提示信息
 *
 * @param {number} code 响应状态码
 * @return {string} 文本提示
 */
function getErrorMsgByStatusCode (code) {
  let result = '未知错误';

  if (code >= 400 && code < 500) {
    switch (code) {
      case 401:
        result = '您尚未登录,请登录后访问.';
        break;
      case 403:
        result = '您所请求的资源被禁止访问.';
        break;
      case 404:
        result = '您所请求的资源并不存在.';
        break;
      case 405:
        result = '非法请求被禁止.';
        break;
      default:
        result = `抱歉，程序出了问题(${code}).`;
    }
  } else if (code >= 500 && code < 600) {
    result = '服务器出错啦.';
  }
  return result;
}

/**
 * 异常处理函数，包含错误提示
 *
 * @param {Object} e 错误信息
 */
function handleError (e) {
  console.log('request failed', e);
  if (!e.response) {
    // 断网情况
    e.message = '网络异常';
  } else {
    console.log(e.message);
  }

  // mock
  // return {
  //   data: {
  //     success: true
  //   }
  // }
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({
        data: {
          success: true
        }
      });
    }, 2000);
  });
  throw e;
}

export default (params = {}) => {
  return axios({
    url: params.api || (ApiConfig.host + ApiConfig.apiPrefix + params.url),
    method: params.method || 'POST',
    data: params.data || {},
    timeout: params.timeout || ApiConfig.timeout
  }).then(checkStatus)
  .then(res => res)
  .catch(handleError);
}
