import { useState, useEffect } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  isOffline: boolean;
}

/**
 * Hook to detect if the user's browser currently has internet connection.
 * Useful for switching between online API calls and local offline IndexedDB logic.
 */
export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const syncPendingSales = async () => {
      // Import explicitly to prevent circular dependencies in the hook setup
      const salesService = (await import('../context/api/salesService')).default;
      const { db } = await import('../context/db/database');
      
      const pending = await db.pendingSales.filter(s => s.status === 'pending').toArray();
      if (pending.length === 0) return;

      console.log(`[Offline Sync] Synchronizing ${pending.length} pending sales...`);
      for (const sale of pending) {
        try {
          // Force network call by temporarily bypassing the navigator.onLine check? 
          // The navigator.onLine is true since this triggered on 'online' event
          await salesService.create(sale.payload);
          // Delete from local DB upon success
          if (sale.id) await db.pendingSales.delete(sale.id);
        } catch (error) {
          console.error(`[Offline Sync] Failed to sync sale ${sale.id}:`, error);
        }
      }
    };

    const handleOnline = () => {
      setIsOnline(true);
      syncPendingSales();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check just in case we have items pending from a hard refresh while connected
    if (navigator.onLine) {
        syncPendingSales();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, isOffline: !isOnline };
}
