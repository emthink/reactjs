/**
 * @desc [Tab分页导航]
 */

import { Platform } from 'react-native';
import { TabNavigator } from 'react-navigation';
import { HomeTabScreens } from '../screens';
import { MyselfTabContainer } from '../containers/HomeTabContainers';

const HomeTabs = TabNavigator(
  {
    Workflow: {
      screen: HomeTabScreens.WorkflowTabScreen,
      path: 'workflow',
      navigationOptions: {
        title: '工作台'
      }
    },
    CustomerMap: {
      screen: HomeTabScreens.CustomerMapTabScreen,
      path: 'customer_map',
      navigationOptions: {
        title: '客户地图'
      }
    },
    Notification: {
      screen: HomeTabScreens.NotificationTabScreen,
      path: 'notification',
      navigationOptions: {
        title: '消息通知'
      }
    },
    Myself: {
      screen: MyselfTabContainer,
      path: 'myself',
      navigationOptions: {
        title: '我的'
      }
    },
  },
  {
    tabBarOptions: {
      activeTintColor: Platform.OS === 'ios' ? '#e91e63' : '#fff',
    },
    swipeEnabled: true
  }
);

export default {
  name: 'Home Tabs',
  description: 'Tabs following platform conventions',
  headerMode: 'none',
  screen: HomeTabs
};
