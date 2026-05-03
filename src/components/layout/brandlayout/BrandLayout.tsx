import { Sidebar } from "components/includes/Sidebar";
import { SidebarProvider } from "../SidebarContext";
import { Topbar } from "components/includes/Topbar";
import { Outlet } from "react-router-dom";
import { SystemsFooter } from "components/includes/SystemsFooter";

export default function BrandLayout() {
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