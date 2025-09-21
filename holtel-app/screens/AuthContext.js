import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ user: null, token: null, role: null });

  useEffect(() => {
    // Load persisted auth on mount
    (async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userJson = await AsyncStorage.getItem('user');
        if (token && userJson) {
          const user = JSON.parse(userJson);
          setAuth({ user, token, role: user.role });
        }
      } catch (e) {
        console.warn('Failed to load auth from storage', e);
      }
    })();
  }, []);

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    } catch (e) {
      console.warn('Failed to clear auth storage', e);
    }
    setAuth({ user: null, token: null, role: null });
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};