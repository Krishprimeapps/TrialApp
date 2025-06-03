
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import { AndroidAuto , AndroidAutoModule } from './src/AndroidAuto';
if (Platform.OS === 'ios') {
    AppRegistry.registerComponent('Example', () => App);
  } else {
    AppRegistry.registerRunnable('AndroidAuto', () => App);
  }
  AppRegistry.registerComponent(appName, () => App);
  //AppRegistry.registerRunnable('AndroidAuto',() => App);

// if (Platform.OS === 'android') {
  
//   AppRegistry.registerRunnable('AndroidAuto', AndroidAutoModule);
//   AppRegistry.registerComponent('TrialApp', () => App);
// }
// else{
//     AppRegistry.registerComponent('TrialApp', () => App);
// }