import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { HomeTabScreens } from '../../screens';
import { LogoutActions } from '../../redux/LoginRedux';
import { routes } from '../../config';

class MyselfTabContainer extends Component {
  constructor (...arg) {
    super(...arg);

    this.state = {};
    this.handleLogoutClick = this.handleLogoutClick.bind(this);
  }

  handleLogoutClick () {
    this.props.logout({
      routeName: routes.Login.name
    });
  }

  render () {
    return (
      <HomeTabScreens.MyselfTabScreen handleLogoutClick={this.handleLogoutClick} />
    )
  }
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators({
    logout: LogoutActions.logout
  }, dispatch);
}

export default connect(null, mapDispatchToProps)(MyselfTabContainer);