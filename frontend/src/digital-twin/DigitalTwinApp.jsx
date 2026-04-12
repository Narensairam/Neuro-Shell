import React, { useEffect } from 'react';
import { ErrorBoundary } from './components/core/ErrorBoundary';
import { AppLayout } from './components/layout/AppLayout';
import { usePlantStore } from './store/plantStore';

export function DigitalTwinApp() {
  const { initialize } = usePlantStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <ErrorBoundary>
      <AppLayout />
    </ErrorBoundary>
  );
}
