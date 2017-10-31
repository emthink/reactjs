import { select, put, takeEvery } from 'redux-saga/effects';
import { StartAppTypes } from '../redux/StartAppRedux';
import { LoginActions } from '../redux/LoginRedux';
import { routes } from '../config';

const getUserInfo = state => state.get('user');

// 可以在登录至APP前作一些启动工作
function * start() {
  let user = yield select(getUserInfo);

  if (user) {
    user = user.toJS();
    // auto login
    if (user.isLogin) {
      yield new Promise((resolve) => {
        setTimeout(() => {
          resolve(1)
        }, 1000);
      });
      yield put(LoginActions.loginSuccess(user, {
        routeName: routes.Main.name
      }));
    } else {
      yield put(LoginActions.login(user));
    }
  }
}

function * startApp () {
  // start some operations after rehydration
  yield takeEvery(StartAppTypes.STARTAPP, start);
}

const sagas = [
  startApp
];

export default sagas;