import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "components/ui/button";
import { Home, AlertCircle } from "lucide-react";

const NotFound: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 flex flex-center items-center justify-center p-6 text-center">
            <div className="max-w-md w-full space-y-8">
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
                    <AlertCircle className="h-32 w-32 text-blue-500 mx-auto relative z-10 animate-pulse" />
                </div>

                <div className="space-y-2 relative z-10">
                    <h1 className="text-6xl font-black text-white tracking-tighter">404</h1>
                    <h2 className="text-2xl font-bold text-slate-200">Nanpwen paj sa a!</h2>
                    <p className="text-slate-400">Paj w ap chèche a sanble li pa egziste oswa li deplase. Tanpri verifye lyen an oswa retounen nan tablodbò a.</p>
                </div>

                <div className="pt-4 relative z-10">
                    <Button
                        onClick={() => navigate('/dashboard')}
                        className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-8 text-lg font-bold gap-2"
                    >
                        <Home className="h-5 w-5" />
                        Retounen nan Tablodbò
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
