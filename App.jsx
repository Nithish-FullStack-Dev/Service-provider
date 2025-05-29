import React, {useContext} from 'react';
import {Provider} from 'react-redux';
import {store} from './src/store/Store';
import Main from './src/Main';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {AppContext, AppProvider} from './src/store/AppContext';

const App = () => {
  return (
    <AppProvider>
      <MainWrapper />
    </AppProvider>
  );
};

const MainWrapper = () => {
  const {appKey} = useContext(AppContext);

  return (
    <GestureHandlerRootView style={{flex: 1}} key={appKey}>
      <SafeAreaProvider>
        <Provider store={store}>
          <SafeAreaView style={{flex: 1}}>
            <Main />
          </SafeAreaView>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
