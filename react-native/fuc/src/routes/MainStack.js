import { StackNavigator } from 'react-navigation';
import HomeTabs from './HomeTabs';
import { routes } from '../config';

const MainStack = StackNavigator({
  Home: HomeTabs
});

export default {
  path: routes.Main.path,
  screen: MainStack,
  navigationOptions: {
    gesturesEnabled: false,
  },
};