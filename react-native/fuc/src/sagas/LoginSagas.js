import { put, take, takeLatest } from 'redux-saga/effects';
import { NavigationActions } from 'react-navigation'
import { LoginTypes, LogoutTypes,
  LoginActions, LogoutActions
} from '../redux/LoginRedux';
import { API, fetch } from '../api';
import { routes } from '../config';

function requestLogin (data) {
  return fetch({
    url: API.LoginAPIs.login,
    data
  });
}

function * login (action) {
  const { username, password } = action.payload || {};

  if (username && password) {
    const res = yield requestLogin({
      username,
      password
    });

    const { data } = res || {};

    if (data && data.success) {
      yield put(LoginActions.loginSuccess({
        username,
        password,
        isLogin: true
      }));
    } else {
      yield put(LoginActions.loginFail({
        username,
        password,
        isLogin: false
      }));
    }
  } else {
    yield put(LoginActions.loginFail({
      username,
      password,
      isLogin: false
    }));
  }
}

function * loginSuccess (action) {
  // 登录成功后导航至正确页面
  yield put(NavigationActions.navigate({
    routeName: action.routeName || routes.Main.name
  }));
}

function * logout (action) {
  const { routeName } = (action && action.payload) || {};

  yield put(LogoutActions.logoutSuccess());
  // 退出后回到登录页面
  yield put(NavigationActions.navigate({
    routeName: routeName || routes.Login.name,
    params: {}
  }));
}

// process login actions
export function * loginSaga () {
  yield takeLatest(LoginTypes.LOGIN, login);
}

export function * loginSuccessSaga () {
  yield takeLatest(LoginTypes.LOGIN_SUCCESS, loginSuccess);
}

export function * logoutSaga () {
  yield takeLatest(LogoutTypes.LOGOUT, logout);
}

const sagas = [
  loginSaga,
  loginSuccessSaga,
  logoutSaga
];

export default sagas;