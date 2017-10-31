/**
 * @desc [screen记录中间件]
 */
import { NavigationActions } from 'react-navigation';
import { Iterable } from 'immutable';

// gets the current screen from navigation state
const getCurrentRouteName = (navigationState) => {
  if (!navigationState) {
    return null;
  }

  if (Iterable.isIterable(navigationState)) {
    navigationState = navigationState.toJS();
  }

  const route = navigationState.routes[navigationState.index];
  // dive into nested navigators
  if (route.routes) {
    return getCurrentRouteName(route);
  }
  return route.routeName;
}

const screenTracking = ({ getState }) => next => (action) => {
  if (
    action.type !== NavigationActions.NAVIGATE &&
    action.type !== NavigationActions.BACK
  ) {
    const { payload } = action;
    if (Iterable.isIterable(payload)) {
      console.log(123);
      action.payload = payload.toJS();
    }

    try{

      return next(action);
    }catch(e){
      console.log(e);
    }
  }

  const currentScreen = getCurrentRouteName(getState().get('nav'));
  const result = next(action);
  const nextScreen = getCurrentRouteName(getState().get('nav'));
  if (nextScreen !== currentScreen) {
    try {
      console.tron.log(`NAVIGATING ${currentScreen} to ${nextScreen}`);
      // Example: Analytics.trackEvent('user_navigation', {currentScreen, nextScreen})
    } catch (e) {
      console.tron.log(e);
    }
  }
  return result;
}

export default screenTracking;
