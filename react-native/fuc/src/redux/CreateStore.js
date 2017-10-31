/**
 * @desc [拓展createStore方法]
 */
import { createStore, applyMiddleware, compose } from 'redux';
import { autoRehydrate } from 'redux-persist-immutable';
import Config from '../config/DebugConfig';
import createSagaMiddleware from 'redux-saga';
import RehydrationServices from '../services/RehydrationServices';
import ReduxPersist from '../config/ReduxPersistConfig';
import ScreenTracking from '../middlewares/ScreenTrackingMiddleware';

// creates the store
export default (rootReducer, rootSaga, initialState) => {
  /* ------------- Redux Configuration ------------- */

  const middleware = [];
  const enhancers = [];

  /* ------------- Analytics Middleware ------------- */
  middleware.push(ScreenTracking);

  /* ------------- Saga Middleware ------------- */
  const sagaMonitor = Config.useReactotron ? console.tron.createSagaMonitor() : null;
  const sagaMiddleware = createSagaMiddleware({ sagaMonitor });
  middleware.push(sagaMiddleware);

  /* ------------- Assemble Middleware ------------- */

  enhancers.push(applyMiddleware(...middleware));

  /* ------------- AutoRehydrate Enhancer ------------- */

  // add the autoRehydrate enhancer
  if (ReduxPersist.active) {
    enhancers.push(autoRehydrate());
  }

  // if Reactotron is enabled (default for __DEV__), we'll create the store through Reactotron
  const createAppropriateStore = Config.useReactotron ? console.tron.createStore : createStore;
  const store = createAppropriateStore(rootReducer, initialState, compose(...enhancers));

  // configure persistStore and check reducer version number
  if (ReduxPersist.active) {
    RehydrationServices.updateReducers(store);
  }

  // kick off root saga
  sagaMiddleware.run(rootSaga);

  return store;
}
