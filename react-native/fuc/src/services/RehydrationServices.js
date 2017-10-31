import { AsyncStorage } from 'react-native';
import { persistStore } from 'redux-persist-immutable';
import { StartAppActions } from '../redux/StartAppRedux';
import ReduxPersist from '../config/ReduxPersistConfig';
import DebugConfig from '../config/DebugConfig';

const updateReducers = (store) => {
  const reducerVersion = ReduxPersist.reducerVersion;
  const config = ReduxPersist.storeConfig;
  const startApp = () => store.dispatch(StartAppActions.startApp());

  // Check to ensure latest reducer version
  AsyncStorage.getItem('reducerVersion').then((localVersion) => {
    if (localVersion !== reducerVersion) {
      if (DebugConfig.useReactotron) {
        console.tron.display({
          name: 'PURGE',
          value: {
            'Old Version:': localVersion,
            'New Version:': reducerVersion
          },
          preview: 'Reducer Version Change Detected',
          important: true
        });
      }
      // Purge store
      persistStore(store, config, startApp).purge();
      AsyncStorage.setItem('reducerVersion', reducerVersion);
    } else {
      persistStore(store, config, startApp);
    }
  }).catch(() => {
    persistStore(store, config, startApp);
    AsyncStorage.setItem('reducerVersion', reducerVersion);
  })
}

export default { updateReducers };
