
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "../SidebarContext";
import { Sidebar } from "../../includes/Sidebar";
import { Topbar } from "../../includes/Topbar";
import { SystemsFooter } from "../../includes/SystemsFooter";

export default function ExpiredProductsLayout() {
    return (
        <SidebarProvider>
            <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
                <Sidebar />
                <div className="flex flex-col flex-1 overflow-hidden">
                    <Topbar />
                    <main className="flex-1 overflow-y-auto p-4">
                        <Outlet />
                    </main>
                    <SystemsFooter />
                </div>
            </div>
        </SidebarProvider>
    );
}