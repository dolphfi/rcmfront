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
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ht, fr, enUS } from "date-fns/locale";


import { useReports } from "../../hooks/useReports";
import { useAuth } from "../../context/AuthContext";
import { Skeleton } from "../../components/ui/skeleton";
import { useSettings } from "../../context/SettingsContext";

const Dashboard: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { currency: globalCurrency } = useSettings();
    const { stats, chartData, chartPeriod, setChartPeriod, isLoading, isChartLoading, error } = useReports();
    const [showLowStockAlert, setShowLowStockAlert] = React.useState(true);

    const formatCurrency = (amount: number) => {
        try {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: globalCurrency || 'HTG',
            }).format(amount);
        } catch (e) {
            // Fallback for custom currencies like $HT
            return `${new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(amount)} ${globalCurrency}`;
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4 pb-8">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-10 w-64 bg-white/5" />
                    <Skeleton className="h-10 w-32 bg-white/5" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32 bg-white/5" />
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-24 bg-white/5" />
                    ))}
                </div>
                <Skeleton className="h-64 bg-white/5" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-white space-y-4">
                <AlertCircle className="h-12 w-12 text-rose-500" />
                <h2 className="text-xl font-bold">{t('common.error')}</h2>
                <p className="text-slate-400">{error}</p>
                <Button onClick={() => window.location.reload()} variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10">
                    {t('common.retry')}
                </Button>
            </div>
        );
    }

    const getLocale = (lang: string) => {
        if (lang === 'ht') return ht;
        if (lang === 'fr') return fr;
        return enUS;
    };

    const formattedDate = format(new Date(), "EEEE, d MMMM yyyy", { locale: getLocale(i18n.language) });
    const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

    return (
        <div className="space-y-4 pb-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">{t('dashboard.welcome_user', { name: user?.firstName || 'User' })}</h1>
                    <p className="text-slate-400 text-sm mt-0.5">
                        {t('dashboard.orders_today', { count: stats?.ordersToday || 0 })}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="h-8 bg-white/5 backdrop-blur-sm border-white/10 text-slate-300 hover:bg-white/10 hover:text-white text-xs">
                        <Calendar className="mr-2 h-3.5 w-3.5" />
                        {t('dashboard.today')}: {capitalizedDate}
                    </Button>
                </div>
            </div>

            {/* Alert Section for Low Stock */}
            {showLowStockAlert && stats?.lowStockCount > 0 && (
                <div className="bg-orange-50/10 border border-orange-500/20 rounded-lg p-3 flex items-start justify-between">
                    <div className="flex items-center gap-2 text-orange-200 text-sm">
                        <AlertCircle className="h-4 w-4 text-orange-500 shrink-0" />
                        <p>
                            {t('dashboard.low_stock_notice', { count: stats.lowStockCount })}
                            <span 
                                onClick={() => navigate('/stock')}
                                className="ml-1 underline cursor-pointer hover:text-white"
                            >
                                {t('dashboard.view_details')}
                            </span>
                        </p>
                    </div>
                    <button 
                        onClick={() => setShowLowStockAlert(false)}
                        className="text-orange-200/50 hover:text-white transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* Main Stats Row (Colored Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Sales Today */}
                <Card className="bg-orange-500 border-none text-white relative overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                            <div className="min-w-0">
                                <h3 className="text-xl font-bold text-white truncate">{formatCurrency(stats?.salesToday || 0)}</h3>
                                <p className="text-orange-100/80 text-xs font-medium mt-0.5 truncate">{t('dashboard.sales_today')}</p>
                            </div>
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm shrink-0">
                                <FileText className="h-5 w-5 text-white" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs">
                            <div className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center">
                                {(stats?.salesPercentage || 0) >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                                {(stats?.salesPercentage || 0) >= 0 ? '+' : ''}{stats?.salesPercentage || 0}%
                            </div>
                            <span 
                                onClick={() => navigate('/sales/history')}
                                className="text-orange-100/60 text-[10px] underline cursor-pointer hover:text-white"
                            >
                                {t('dashboard.vs_last_month')}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Sales Return Today */}
                <Card className="bg-slate-900 border-slate-800 text-white relative overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                            <div className="min-w-0">
                                <h3 className="text-xl font-bold text-white truncate">{formatCurrency(stats?.salesReturnsToday || 0)}</h3>
                                <p className="text-slate-400 text-xs font-medium mt-0.5 truncate">{t('dashboard.sales_return_today')}</p>
                            </div>
                            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm shrink-0">
                                <RefreshCw className="h-5 w-5 text-white" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs">
                            <div className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center ${ (stats?.returnsPercentage || 0) > 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400' }`}>
                                {(stats?.returnsPercentage || 0) >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                                {(stats?.returnsPercentage || 0) >= 0 ? '+' : ''}{stats?.returnsPercentage || 0}%
                            </div>
                            <span 
                                onClick={() => navigate('/sales/returns')}
                                className="text-slate-500 text-[10px] underline cursor-pointer hover:text-white"
                            >
                                {t('dashboard.vs_last_month')}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Purchase Today */}
                <Card className="bg-teal-600 border-none text-white relative overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                            <div className="min-w-0">
                                <h3 className="text-xl font-bold text-white truncate">{formatCurrency(stats?.purchasesToday || 0)}</h3>
                                <p className="text-teal-100/80 text-xs font-medium mt-0.5 truncate">{t('dashboard.purchase_today')}</p>
                            </div>
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm shrink-0">
                                <Package className="h-5 w-5 text-white" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs">
                            <div className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center">
                                {(stats?.purchasesPercentage || 0) >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                                {(stats?.purchasesPercentage || 0) >= 0 ? '+' : ''}{stats?.purchasesPercentage || 0}%
                            </div>
                            <span 
                                onClick={() => navigate('/purchases/list')}
                                className="text-teal-100/60 text-[10px] underline cursor-pointer hover:text-white"
                            >
                                {t('dashboard.vs_last_month')}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Purchase Return Today */}
                <Card className="bg-blue-600 border-none text-white relative overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                            <div className="min-w-0">
                                <h3 className="text-xl font-bold text-white truncate">{formatCurrency(stats?.purchaseReturnsToday || 0)}</h3>
                                <p className="text-blue-100/80 text-xs font-medium mt-0.5 truncate">{t('dashboard.purchase_return_today')}</p>
                            </div>
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm shrink-0">
                                <ShieldCheck className="h-5 w-5 text-white" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs">
                            <div className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center">
                                {(stats?.purchaseReturnsPercentage || 0) >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                                {(stats?.purchaseReturnsPercentage || 0) >= 0 ? '+' : ''}{stats?.purchaseReturnsPercentage || 0}%
                            </div>
                            <span 
                                onClick={() => navigate('/purchases/list')}
                                className="text-blue-100/60 text-[10px] underline cursor-pointer hover:text-white"
                            >
                                {t('dashboard.vs_last_month')}
                            </span>
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
                                <h3 className="text-xl font-bold text-white truncate">{formatCurrency(stats?.totalProfit || 0)}</h3>
                                <p className="text-slate-400 text-xs font-medium mt-0.5 truncate">{t('dashboard.profit')}</p>
                            </div>
                            <div className="p-1.5 bg-sky-500/20 rounded-lg shrink-0">
                                <Layers className="h-4 w-4 text-sky-500" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs">
                            <span className={`font-semibold flex items-center ${(stats?.profitPercentage || 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {(stats?.profitPercentage || 0) >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                                {(stats?.profitPercentage || 0) >= 0 ? '+' : ''}{stats?.profitPercentage || 0}%
                            </span>
                            <span className="text-slate-400">{t('dashboard.vs_last_month')}</span>
                            <Button 
                                variant="link" 
                                className="text-white h-auto p-0 underline hover:text-sky-500"
                                onClick={() => navigate('/reports')}
                            >
                                {t('dashboard.view_all')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Invoice Due (Placeholder) */}
                <Card className="bg-white/5 border border-white/10 text-white backdrop-blur-sm shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                            <div className="min-w-0">
                                <h3 className="text-xl font-bold text-white truncate">{formatCurrency(0)}</h3>
                                <p className="text-slate-400 text-xs font-medium mt-0.5 truncate">{t('dashboard.invoice_due')}</p>
                            </div>
                            <div className="p-1.5 bg-emerald-500/20 rounded-lg shrink-0">
                                <Clock className="h-4 w-4 text-emerald-500" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs">
                            <span className="text-emerald-500 font-semibold">0%</span>
                            <span className="text-slate-400">{t('dashboard.vs_last_month')}</span>
                            <Button 
                                variant="link" 
                                className="text-white h-auto p-0 underline hover:text-emerald-500"
                                onClick={() => navigate('/sales/history')}
                            >
                                {t('dashboard.view_all')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Total Expenses (Placeholder) */}
                <Card className="bg-white/5 border border-white/10 text-white backdrop-blur-sm shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                            <div className="min-w-0">
                                <h3 className="text-xl font-bold text-white truncate">{formatCurrency(0)}</h3>
                                <p className="text-slate-400 text-xs font-medium mt-0.5 truncate">{t('dashboard.total_expenses')}</p>
                            </div>
                            <div className="p-1.5 bg-orange-500/20 rounded-lg shrink-0">
                                <Wallet className="h-4 w-4 text-orange-500" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs">
                            <span className="text-emerald-500 font-semibold">0%</span>
                            <span className="text-slate-400">{t('dashboard.vs_last_month')}</span>
                            <Button 
                                variant="link" 
                                className="text-white h-auto p-0 underline hover:text-orange-500"
                                onClick={() => navigate('/reports')}
                            >
                                {t('dashboard.view_all')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Total Payment Returns (Placeholder) */}
                <Card className="bg-white/5 border border-white/10 text-white backdrop-blur-sm shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                            <div className="min-w-0">
                                <h3 className="text-xl font-bold text-white truncate">{formatCurrency(0)}</h3>
                                <p className="text-slate-400 text-xs font-medium mt-0.5 truncate">{t('dashboard.total_payment_returns')}</p>
                            </div>
                            <div className="p-1.5 bg-indigo-500/20 rounded-lg shrink-0">
                                <Undo2 className="h-4 w-4 text-indigo-500" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs">
                            <span className="text-rose-500 font-semibold">0%</span>
                            <span className="text-slate-400">{t('dashboard.vs_last_month')}</span>
                            <Button 
                                variant="link" 
                                className="text-white h-auto p-0 underline hover:text-indigo-500"
                                onClick={() => navigate('/sales/returns')}
                            >
                                {t('dashboard.view_all')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    <SalesPurchaseCard 
                        data={chartData} 
                        period={chartPeriod} 
                        onPeriodChange={setChartPeriod}
                        isLoading={isChartLoading}
                    />
                </div>
                <div className="lg:col-span-1">
                    <OverallInfoCard data={stats?.overallInfo} />
                </div>
            </div>

            {/* Products Overview Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="lg:col-span-1">
                    <TopSellingProductsCard products={stats?.topSellingProducts} />
                </div>
                <div className="lg:col-span-1">
                    <LowStockProductsCard products={stats?.lowStockProducts} />
                </div>
            </div>

            {/* Recent Sales */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
                <div className="lg:col-span-1">
                    <RecentSalesCard sales={stats?.recentSales} />
                </div>
            </div>

            {/* Sales Statistics & Recent Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="lg:col-span-1">
                    <SalesStatisticsCard data={stats?.monthlyStats} />
                </div>
                <div className="lg:col-span-1">
                    <RecentTransactionsCard data={stats?.recentSales} />
                </div>
            </div>

            {/* Top Customers & Top Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="lg:col-span-1">
                    <TopCustomersCard customers={stats?.topCustomers} />
                </div>
                <div className="lg:col-span-1">
                    <TopCategoriesCard categories={stats?.topCategories} />
                </div>
            </div>

            {/* Order Statistics */}
            <div className="mt-4">
                <OrderStatisticsCard data={stats?.hourlyStats} />
            </div>

            {/* Floating Settings Button */}
            <FloatingSettings />
        </div>
    );
};
export default Dashboard;
