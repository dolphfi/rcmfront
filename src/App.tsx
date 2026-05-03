import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/Routes';
import { Toaster } from './components/ui/sonner';

import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <RouterProvider router={router} />
        <Toaster />
      </SettingsProvider>
    </AuthProvider>
  );
}
export default App;
