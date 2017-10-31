import React, { Component } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

export default class MySelfTabScreen extends Component {
  constructor (...arg) {
    super(...arg);

    this.state = {};
    this.handleLogoutClick = this.handleLogoutClick.bind(this);
  }

  handleLogoutClick () {
    this.props.handleLogoutClick();
  }

  render () {
    return (
      <ScrollView>
        <TouchableOpacity onPress={this.handleLogoutClick}>
          <Text>{'退出'}</Text>
        </TouchableOpacity>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  icon: {
    width: 26,
    height: 26,
  },
});
