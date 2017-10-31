/**
 * @desc [Navigation导航相关Redux]
 */
import Immutable from 'immutable';
import AppNavigation from '../routes';
import { routes } from '../config';

const initialState = Immutable.fromJS({
  index: 0,
  routes: [{
    routeName: routes.Login.name,
    key: routes.Login.name
  }]
});

const NavigationReducer = (state = initialState, action) => {
  const newState = state.merge(AppNavigation.router.getStateForAction(action, state.toJS()));
  return newState || state;
};

export const NavigationReducers = {
  nav: NavigationReducer
};
