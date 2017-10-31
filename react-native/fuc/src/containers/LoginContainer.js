import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { is } from 'immutable';
import { LoginScreen } from '../screens';
import { LoginActions } from '../redux/LoginRedux';
import { routes } from '../config';

class LoginContainer extends Component {
  constructor (...arg) {
    super(...arg);

    this.state = {};
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit (user) {
    if (!user.isLogin) {
      this.props.login(user, {
        routeName: routes.Main.name
      });
    }
  }

  shouldComponentUpdate (nextProps) {
    return !is(nextProps.user, this.props.user);
  }

  render () {
    const user = this.props.user.toJS();

    return <LoginScreen navigation={this.props.navigation}
      user={user}
      isLogin={user.isLogin}
      handleSubmit={this.handleSubmit}
    />
  }
}

const mapStateToProps = (state) => ({
  user: state.get('user')
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    login: LoginActions.login
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginContainer);