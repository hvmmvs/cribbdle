import React from 'react';
import {SafeAreaView, StatusBar, StyleSheet} from 'react-native';
import GameScreen from './src/screens/GameScreen';

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <GameScreen />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
});

export default App;

