import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getApiBaseUrl, setApiBaseUrl, api } from '../services/api';

const ApiConfigContext = createContext(null);

export const ApiConfigProvider = ({ children }) => {
  const [baseUrl, setBaseUrlState] = useState(getApiBaseUrl());
  const [status, setStatus] = useState('checking'); // 'online' | 'offline' | 'checking'
  const [errorMessage, setErrorMessage] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  const checkConnectivity = useCallback(async () => {
    setStatus('checking');
    setErrorMessage(null);
    try {
      const result = await api.checkHealth();
      if (result.ok) {
        setStatus('online');
      } else {
        setStatus('offline');
        setErrorMessage(result.error || 'Server returned non-200 status');
      }
    } catch (err) {
      setStatus('offline');
      setErrorMessage(err.message || 'Cannot reach API server');
    } finally {
      setLastChecked(new Date());
    }
  }, []);

  useEffect(() => {
    checkConnectivity();
  }, [checkConnectivity]);

  const updateBaseUrl = (newUrl) => {
    setApiBaseUrl(newUrl);
    setBaseUrlState(getApiBaseUrl());
    checkConnectivity();
  };

  const resetToDefault = () => {
    setApiBaseUrl('');
    setBaseUrlState(getApiBaseUrl());
    checkConnectivity();
  };

  return (
    <ApiConfigContext.Provider
      value={{
        baseUrl,
        status,
        errorMessage,
        lastChecked,
        checkConnectivity,
        updateBaseUrl,
        resetToDefault,
        isConfigModalOpen,
        setIsConfigModalOpen,
      }}
    >
      {children}
    </ApiConfigContext.Provider>
  );
};

export const useApiConfig = () => {
  const context = useContext(ApiConfigContext);
  if (!context) {
    throw new Error('useApiConfig must be used within an ApiConfigProvider');
  }
  return context;
};
