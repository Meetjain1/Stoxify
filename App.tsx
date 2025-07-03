import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider, useDispatch } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import { store, AppDispatch } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { loadUser } from './src/store/userSlice';

const AppContent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  return (
    <>
      <AppNavigator />
      <StatusBar style="auto" />
    </>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <PaperProvider>
          <AppContent />
        </PaperProvider>
      </ThemeProvider>
    </Provider>
  );
}
