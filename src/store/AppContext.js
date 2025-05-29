import React, {createContext, useState} from 'react';

export const AppContext = createContext();

export const AppProvider = ({children}) => {
  const [appKey, setAppKey] = useState(0);

  const restartApp = () => setAppKey(prev => prev + 1);

  return (
    <AppContext.Provider value={{appKey, restartApp}}>
      {children}
    </AppContext.Provider>
  );
};
