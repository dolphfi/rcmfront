import FloatingBarPos from "components/includes/FloatingBarPos";
import NavbarPos from "components/includes/NavbarPos";
import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";

export default function PosLayout() {
    const [sellType, setSellType] = useState(() => {
        return localStorage.getItem('pos_sellType') || 'Product';
    });

    useEffect(() => {
        localStorage.setItem('pos_sellType', sellType);
    }, [sellType]);

    return (

        <div className="flex h-screen overflow-hidden bg-gradient-to-br from-black via-gray-900 to-slate-900">
            <div className="flex flex-col flex-1 overflow-hidden">
                <NavbarPos sellType={sellType} setSellType={setSellType} />
                <main className="flex-1 overflow-y-auto">
                    <Outlet context={{ sellType }} />
                </main>
                <FloatingBarPos />
            </div>
        </div>
    );
}