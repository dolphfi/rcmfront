import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

const PrivateRoute: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
                    <p className="text-slate-400">Verifikasyon...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirije nan login si l pa konekte
        return <Navigate to="/" replace />;
    }

    // Afficher les sous-routes si l'utilisateur est authentifié
    return <Outlet />;
};

export default PrivateRoute;