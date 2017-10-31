import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StackNavigator } from 'react-navigation';
import { StyleSheet,
  Button,
  View,
  TextInput,
  TouchableOpacity
} from 'react-native';
import { routes } from '../config';

export default class LoginScreen extends Component {
  constructor(...arg) {
    super(...arg);

    this.state = {
      hasClickSubmit: false,
      username: this.props.user.username,
      password: this.props.user.password
    };

    this.submit = this.submit.bind(this);
    this.handlePasswordInput = this.handlePasswordInput.bind(this);
    this.handleUsernameInput = this.handleUsernameInput.bind(this);
  }

  handleUsernameInput (username) {
    this.setState({
      username
    });
  }

  handlePasswordInput (password) {
    this.setState({
      password
    });
  }

  submit () {
    if (this.state.hasClickSubmit) {
      return;
    }
    const { username, password } = this.state;

    if (username && password) {
      this.setState({
        hasClickSubmit: true
      });
      
      this.props.handleSubmit({
        username,
        password
      });
    }
  }

  render() {
    const { username, password } = this.props.user;
    let submitExtraStyles = (this.state.hasClickSubmit && !this.props.isLogin) ? styles.submitLoading: {};
    submitExtraStyles = (username && password) ? styles.submitLoading: {};

    return (
      <View style={styles.container}>
        <TextInput
          placeholder='Type username here...'
          autoCapitalize={'none'}
          returnKeyType={'done'}
          autoCorrect={false}
          defaultValue={username}
          onChangeText={this.handleUsernameInput} />
        <TextInput
          secureTextEntry={true}
          placeholder='Type password here...'
          returnKeyType={'done'}
          autoCapitalize={'none'}
          autoCorrect={false}
          defaultValue={password}
          onChangeText={this.handlePasswordInput} />
        <TouchableOpacity activeOpacity={1} style={[styles.submit, submitExtraStyles]}>
          <Button onPress={this.submit} title={'Login'} style={styles.text} />
				</TouchableOpacity>
      </View>
    )
  }
}

LoginScreen.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  isLogin: PropTypes.bool
};
LoginScreen.defaultProps = {
  isLogin: false
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  submit: {
    marginTop: 10,
    width: 80,
    backgroundColor: 'blue'
  },
  submitLoading: {
    backgroundColor: 'grey'
  }
});
