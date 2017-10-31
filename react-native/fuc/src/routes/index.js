/**
 * @desc [应用导航配置声明]
 * @author [xiongjiangang]
 */
import { Platform } from 'react-native';
import { StackNavigator } from 'react-navigation';
import Main from './MainStack';
import { routes } from '../config';
import LoginContainer from '../containers/LoginContainer'

export default StackNavigator({
  [routes.Main.name]: Main,
  [routes.Login.name]: {
    path: routes.Login.path,
    screen: LoginContainer,
    title: routes.Login.title
  }
}, {
  initialRouteName: routes.Login.name,
  headerMode: 'none', // 去除顶部导航栏
  /**
   * Use modal on iOS because the card mode comes from the right,
   * which conflicts with the drawer example gesture
   */
  mode: Platform.OS === 'ios' ? 'modal' : 'card'
});