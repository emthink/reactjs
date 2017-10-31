/**
 * @desc [saga注册入口文件]
 * @author [xiongjiangang]
 */
import { fork, takeEvery } from 'redux-saga/effects';
import LoginSagas from './LoginSagas';
import StartAppSagas from './StartAppSagas';
/* ------------- Sagas ------------- */
// use redux-saga to manage the asynchronous tasks
const sagas = [
  ...LoginSagas,
  ...StartAppSagas
];

/* ------------- Connect Types To Sagas ------------- */

export default function * root() {
  yield sagas.map(saga => fork(saga)); 
};
