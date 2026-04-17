import React, { useEffect, useState } from 'react';
import { useNetworkStatus } from '../../hooks/useNetwork';
import { Wifi, WifiOff, CloudOff } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useTranslation } from 'react-i18next';
import { db } from '../../context/db/database';
import { useLiveQuery } from 'dexie-react-hooks';

export const NetworkIndicator: React.FC = () => {
    const { isOnline } = useNetworkStatus();
    const { t } = useTranslation();

    // Observe local DB for any pending sales
    const pendingSalesCount = useLiveQuery(
        () => db.pendingSales.where('status').equals('pending').count(),
        [],
        0
    );

    return (
        <div className="flex items-center gap-3">
            {pendingSalesCount > 0 && (
                <Badge variant="outline" className="border-orange-500/30 text-orange-400 bg-orange-400/10 flex items-center gap-1.5 px-2.5 py-1">
                    <CloudOff className="h-3.5 w-3.5" />
                    <span>{pendingSalesCount} lavant an atant</span>
                </Badge>
            )}

            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${isOnline ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                {isOnline ? 'Online' : 'Offline'}
            </div>
        </div>
    );
};
