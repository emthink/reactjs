/**
 * @desc [登录注销账号相关redux]
 */
import Immutable from 'immutable';
import { createAction } from '../helpers/createRedux';

/* Constants */
const LOGIN = 'LOGIN';
const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
const LOGIN_FAIL = 'LOGIN_FAIL';
const LOGOUT = 'LOGOUT';
const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';


export const LoginTypes = {
  LOGIN,
  LOGIN_SUCCESS,
  LOGIN_FAIL
}

export const LogoutTypes = {
  LOGOUT,
  LOGOUT_SUCCESS
};

/* Action Creators */
export const LoginActions = {
  login: createAction(LOGIN),
  loginSuccess: createAction(LOGIN_SUCCESS),
  loginFail: createAction(LOGIN_FAIL)
};

export const LogoutActions = {
  logout: createAction(LOGOUT),
  logoutSuccess: createAction(LOGOUT_SUCCESS)
};

const initialState = Immutable.fromJS({
  isLogin: false,
  username: '',
  password: ''
});

/* Reducers */
const loginReducer = (state = initialState, action) => {
  const type = action && action.type;

  switch(type) {
    case LOGIN_SUCCESS:
      const user = action.payload;
      return state.merge(user);
    case LOGIN_FAIL:
      return state;
    case LOGOUT_SUCCESS:
      return state.merge(initialState);
    default:
      return state;
  }
}

export const LoginReducers = {
  user: loginReducer
};
