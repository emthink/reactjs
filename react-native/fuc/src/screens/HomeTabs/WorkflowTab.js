import React, { Component } from 'react';
import { NavigationActions } from 'react-navigation';
import { ScrollView, StyleSheet, Text, Image } from 'react-native';

export default class WorkflowTabScreen extends Component {
  constructor (...arg) {
    super(...arg);

    this.state = {};
  }

  render () {
    return (
      <ScrollView>
        <Text>{'工作台'}</Text>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  icon: {
    width: 26,
    height: 26
  }
});