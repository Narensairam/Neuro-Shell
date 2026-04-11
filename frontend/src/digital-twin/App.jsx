import React, { useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { usePlantStore } from './store/plantStore';
export function App() {
  const { initialize } = usePlantStore();
  useEffect(() => {
    initialize();
  }, [initialize]);
  return <AppLayout />;
}
