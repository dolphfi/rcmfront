import React from "react";
import { Card, CardContent } from "../../components/ui/card";
import { FloatingSettings } from "../../components/includes/FloatingSettings";
import { Button } from "../../components/ui/button";
import {
    Calendar,
    AlertCircle,
    FileText,
    RefreshCw,
    Package,
    ShieldCheck,
    Layers,
    Clock,
    Wallet,
    Undo2,
    X,
    TrendingUp,
    TrendingDown
} from "lucide-react";
import { SalesPurchaseCard } from "../../components/includes/SalesPurchaseCard";
import { OverallInfoCard } from "../../components/includes/OverallInfoCard";
import { TopSellingProductsCard } from "../../components/includes/TopSellingProductsCard";
import { LowStockProductsCard } from "../../components/includes/LowStockProductsCard";
import { RecentSalesCard } from "../../components/includes/RecentSalesCard";
import { SalesStatisticsCard } from "../../components/includes/SalesStatisticsCard";
import { RecentTransactionsCard } from "../../components/includes/RecentTransactionsCard";
import { TopCustomersCard } from "../../components/includes/TopCustomersCard";
import { TopCategoriesCard } from "../../components/includes/TopCategoriesCard";
import { OrderStatisticsCard } from "components/includes/OrderStatisticsCard";
import { useTranslation } from "react-i18next";


const Dashboard: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="space-y-4 pb-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">{t('dashboard.welcome_admin')}</h1>
                    <p className="text-slate-400 text-sm mt-0.5">
                        {t('dashboard.orders_today', { count: 200 })}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="h-8 bg-white/5 backdrop-blur-sm border-white/10 text-slate-300 hover:bg-white/10 hover:text-white text-xs">
                        <Calendar className="mr-2 h-3.5 w-3.5" />
                        12/27/2025 - 01/02/2026
                    </Button>
                </div>
            </div>

            {/* Alert Section */}
            <div className="bg-orange-50/10 border border-orange-500/20 rounded-lg p-3 flex items-start justify-between">
                <div className="flex items-center gap-2 text-orange-200 text-sm">
                    <AlertCircle className="h-4 w-4 text-orange-500 shrink-0" />
                    <p>
                        {t('dashboard.low_stock_alert', { name: "Apple Iphone 15", count: 5 })}
                        <span className="ml-1 underline cursor-pointer hover:text-white">{t('dashboard.add_stock')}</span>
                    </p>
                </div>
                <button className="text-orange-200/50 hover:text-white transition-colors">
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* Main Stats Row (Colored Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Sales */}
                <Card className="bg-orange-500 border-none text-white relative overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                            <div className="min-w-0">
                                <h3 className="text-xl font-bold text-white truncate">$48,988,078</h3>
                                <p className="text-orange-100/80 text-xs font-medium mt-0.5 truncate">{t('dashboard.total_sales')}</p>
                            </div>
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm shrink-0">
                                <FileText className="h-5 w-5 text-white" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs">
                            <div className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                +22%
                            </div>
                            <span className="text-orange-100/60 text-[10px]">{t('dashboard.vs_last_month')}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Total Sales Return */}
                <Card className="bg-slate-900 border-slate-800 text-white relative overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                            <div className="min-w-0">
                                <h3 className="text-xl font-bold text-white truncate">$16,478,145</h3>
                                <p className="text-slate-400 text-xs font-medium mt-0.5 truncate">{t('dashboard.total_sales_return')}</p>
                            </div>
                            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm shrink-0">
                                <RefreshCw className="h-5 w-5 text-white" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs">
                            <div className="bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center">
                                <TrendingDown className="h-3 w-3 mr-1" />
                                -22%
                            </div>
                            <span className="text-slate-500 text-[10px]">{t('dashboard.vs_last_month')}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Total Purchase */}
                <Card className="bg-teal-600 border-none text-white relative overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                            <div className="min-w-0">
                                <h3 className="text-xl font-bold text-white truncate">$24,145,789</h3>
                                <p className="text-teal-100/80 text-xs font-medium mt-0.5 truncate">{t('dashboard.total_purchase')}</p>
                            </div>
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm shrink-0">
                                <Package className="h-5 w-5 text-white" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs">
                            <div className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                +22%
                            </div>
                            <span className="text-teal-100/60 text-[10px]">{t('dashboard.vs_last_month')}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Total Purchase Return */}
                <Card className="bg-blue-600 border-none text-white relative overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                            <div className="min-w-0">
                                <h3 className="text-xl font-bold text-white truncate">$18,458,747</h3>
                                <p className="text-blue-100/80 text-xs font-medium mt-0.5 truncate">{t('dashboard.total_purchase_return')}</p>
                            </div>
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm shrink-0">
                                <ShieldCheck className="h-5 w-5 text-white" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs">
                            <div className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                +22%
                            </div>
                            <span className="text-blue-100/60 text-[10px]">{t('dashboard.vs_last_month')}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Secondary Stats Row (White Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Profit */}
                <Card className="bg-white/5 border border-white/10 text-white backdrop-blur-sm shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                            <div className="min-w-0">
                                <h3 className="text-xl font-bold text-white truncate">$8,458,798</h3>
                                <p className="text-slate-400 text-xs font-medium mt-0.5 truncate">{t('dashboard.profit')}</p>
                            </div>
                            <div className="p-1.5 bg-sky-500/20 rounded-lg shrink-0">
                                <Layers className="h-4 w-4 text-sky-500" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs">
                            <span className="text-emerald-500 font-semibold">+35%</span>
                            <span className="text-slate-400">{t('dashboard.vs_last_month')}</span>
                            <Button variant="link" className="text-white h-auto p-0 underline hover:text-sky-500">{t('dashboard.view_all')}</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Invoice Due */}
                <Card className="bg-white/5 border border-white/10 text-white backdrop-blur-sm shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                            <div className="min-w-0">
                                <h3 className="text-xl font-bold text-white truncate">$48,988,78</h3>
                                <p className="text-slate-400 text-xs font-medium mt-0.5 truncate">{t('dashboard.invoice_due')}</p>
                            </div>
                            <div className="p-1.5 bg-emerald-500/20 rounded-lg shrink-0">
                                <Clock className="h-4 w-4 text-emerald-500" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs">
                            <span className="text-emerald-500 font-semibold">+35%</span>
                            <span className="text-slate-400">{t('dashboard.vs_last_month')}</span>
                            <Button variant="link" className="text-white h-auto p-0 underline hover:text-emerald-500">{t('dashboard.view_all')}</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Total Expenses */}
                <Card className="bg-white/5 border border-white/10 text-white backdrop-blur-sm shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                            <div className="min-w-0">
                                <h3 className="text-xl font-bold text-white truncate">$8,980,097</h3>
                                <p className="text-slate-400 text-xs font-medium mt-0.5 truncate">{t('dashboard.total_expenses')}</p>
                            </div>
                            <div className="p-1.5 bg-orange-500/20 rounded-lg shrink-0">
                                <Wallet className="h-4 w-4 text-orange-500" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs">
                            <span className="text-emerald-500 font-semibold">+41%</span>
                            <span className="text-slate-400">{t('dashboard.vs_last_month')}</span>
                            <Button variant="link" className="text-white h-auto p-0 underline hover:text-orange-500">{t('dashboard.view_all')}</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Total Payment Returns */}
                <Card className="bg-white/5 border border-white/10 text-white backdrop-blur-sm shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                            <div className="min-w-0">
                                <h3 className="text-xl font-bold text-white truncate">$78,458,798</h3>
                                <p className="text-slate-400 text-xs font-medium mt-0.5 truncate">{t('dashboard.total_payment_returns')}</p>
                            </div>
                            <div className="p-1.5 bg-indigo-500/20 rounded-lg shrink-0">
                                <Undo2 className="h-4 w-4 text-indigo-500" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs">
                            <span className="text-rose-500 font-semibold">-20%</span>
                            <span className="text-slate-400">{t('dashboard.vs_last_month')}</span>
                            <Button variant="link" className="text-white h-auto p-0 underline hover:text-indigo-500">{t('dashboard.view_all')}</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Sales & Purchase, Overall Information */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    <SalesPurchaseCard />
                </div>
                <div className="lg:col-span-1">
                    <OverallInfoCard />
                </div>
            </div>

            {/* Products Overview Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="lg:col-span-1">
                    <TopSellingProductsCard />
                </div>
                <div className="lg:col-span-1">
                    <LowStockProductsCard />
                </div>
            </div>

            {/* Recent Sales */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
                <div className="lg:col-span-1">
                    <RecentSalesCard />
                </div>
            </div>

            {/* Sales Statistics & Recent Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="lg:col-span-1">
                    <SalesStatisticsCard />
                </div>
                <div className="lg:col-span-1">
                    <RecentTransactionsCard />
                </div>
            </div>

            {/* Top Customers & Top Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="lg:col-span-1">
                    <TopCustomersCard />
                </div>
                <div className="lg:col-span-1">
                    <TopCategoriesCard />
                </div>
            </div>

            {/* Order Statistics */}
            <div className="mt-4">
                <OrderStatisticsCard />
            </div>

            {/* Floating Settings Button */}
            <FloatingSettings />
        </div>
    );
};
export default Dashboard;
