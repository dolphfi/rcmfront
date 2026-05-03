import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Info, User, Users, ShoppingCart, ChevronDown, Loader2 } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "../ui/chart";
import { RadialBarChart, RadialBar, PolarGrid } from "recharts";
import { useTranslation } from 'react-i18next';
import reportService from '../../context/api/reportService';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "../ui/dropdown-menu";

interface CustomerStats {
    firstTime: number;
    returning: number;
    firstTimeGrowth: number;
    returningGrowth: number;
    label: string;
}

interface OverallInfoCardProps {
    data?: {
        totalSuppliers: number;
        totalCustomers: number;
        totalOrders: number;
    };
}

export const OverallInfoCard: React.FC<OverallInfoCardProps> = ({ data }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [period, setPeriod] = useState('today');
    const [isLoading, setIsLoading] = useState(false);
    const [stats, setStats] = useState<CustomerStats | null>(null);

    const fetchCustomerStats = async (p: string) => {
        try {
            setIsLoading(true);
            const res = await reportService.getCustomerOverview(p);
            setStats(res);
        } catch (error) {
            console.error('Error fetching customer stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomerStats(period);
    }, [period]);

    const chartData = [
        { category: "return", customers: stats?.returning || 0, fill: "#10b981" },
        { category: "firstTime", customers: stats?.firstTime || 0, fill: "#f97316" }
    ];

    const chartConfig = {
        customers: { label: t('dashboard.customers') },
        firstTime: { label: t('dashboard.first_time'), color: "#f97316" },
        return: { label: t('dashboard.returning'), color: "#10b981" }
    } satisfies ChartConfig;

    const periods = [
        { value: 'today', label: t('dashboard.today') },
        { value: '1W', label: t('dashboard.weekly') },
        { value: '1M', label: t('dashboard.monthly') },
        { value: '1Y', label: t('dashboard.yearly') }
    ];

    const currentPeriodLabel = periods.find(p => p.value === period)?.label || t('dashboard.today');

    return (
        <Card className="shadow-sm h-full border border-border flex flex-col">
            <CardContent className="p-6 flex flex-col h-full relative">
                <div className="flex items-center gap-2 px-6 -mx-6 pb-4 border-b border-border mb-2 min-h-[38px]">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Info className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{t('dashboard.overall_info')}</h3>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 px-6 -mx-6 pb-4 border-b border-border">
                    <div
                        className="flex flex-col items-center justify-center p-2 sm:p-4 border border-border bg-muted/50 rounded-xl hover:bg-primary/10 transition-colors cursor-pointer group"
                        onClick={() => navigate('/purchases/list')}
                    >
                        <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] sm:text-xs text-muted-foreground font-medium mb-1">{t('dashboard.suppliers')}</span>
                        <span className="text-sm sm:text-lg font-bold text-foreground">{data?.totalSuppliers || 0}</span>
                    </div>
                    <div
                        className="flex flex-col items-center justify-center p-2 sm:p-4 border border-border bg-muted/50 rounded-xl hover:bg-primary/10 transition-colors cursor-pointer group"
                        onClick={() => navigate('/clients')}
                    >
                        <Users className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] sm:text-xs text-muted-foreground font-medium mb-1">{t('dashboard.customers')}</span>
                        <span className="text-sm sm:text-lg font-bold text-foreground">{data?.totalCustomers || 0}</span>
                    </div>
                    <div
                        className="flex flex-col items-center justify-center p-2 sm:p-4 border border-border bg-muted/50 rounded-xl hover:bg-primary/10 transition-colors cursor-pointer group"
                        onClick={() => navigate('/sales/history')}
                    >
                        <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-secondary mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] sm:text-xs text-muted-foreground font-medium mb-1">{t('dashboard.orders')}</span>
                        <span className="text-sm sm:text-lg font-bold text-foreground">{data?.totalOrders || 0}</span>
                    </div>
                </div>

                <div className={isLoading ? "opacity-50 pointer-events-none transition-opacity" : "transition-opacity"}>
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-bold text-foreground">{t('dashboard.customers_overview')}</h4>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 text-xs border-border text-gray-500 hover:bg-primary/10 hover:text-primary gap-2">
                                    {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : currentPeriodLabel}
                                    <ChevronDown className="h-3 w-3" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {periods.map((p) => (
                                    <DropdownMenuItem
                                        key={p.value}
                                        onClick={() => setPeriod(p.value)}
                                        className="hover:bg-primary/10 cursor-pointer"
                                    >
                                        {p.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                            <ChartContainer config={chartConfig} className="w-full h-full">
                                <RadialBarChart data={chartData} innerRadius={30} outerRadius={60}>
                                    <ChartTooltip
                                        cursor={false}
                                        content={
                                            <ChartTooltipContent
                                                hideLabel
                                                nameKey="category"
                                                indicator="dot"
                                                className="bg-white border border-border text-foreground min-w-[120px] shadow-sm"
                                                labelClassName="text-gray-500 mb-1 border-b border-border pb-1"
                                            />
                                        }
                                    />
                                    <PolarGrid gridType="circle" />
                                    <RadialBar dataKey="customers" />
                                </RadialBarChart>
                            </ChartContainer>
                        </div>

                        <div className="flex-1 w-full flex items-center justify-around sm:pl-4">
                            <div className="flex flex-col items-center">
                                <h5 className="text-2xl font-bold text-foreground mb-1">
                                    {stats ? stats.firstTime >= 1000 ? (stats.firstTime/1000).toFixed(1) + 'K' : stats.firstTime : '0'}
                                </h5>
                                <p className="text-xs text-orange-500 font-medium mb-2">{t('dashboard.first_time')}</p>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded border ${stats && stats.firstTimeGrowth >= 0 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/20 text-rose-400 border-rose-500/20'}`}>
                                    {stats && stats.firstTimeGrowth >= 0 ? '+' : ''}{stats?.firstTimeGrowth || 0}%
                                </span>
                            </div>

                            <div className="h-12 w-px bg-border mx-2"></div>

                            <div className="flex flex-col items-center">
                                <h5 className="text-2xl font-bold text-foreground mb-1">
                                    {stats ? stats.returning >= 1000 ? (stats.returning/1000).toFixed(1) + 'K' : stats.returning : '0'}
                                </h5>
                                <p className="text-xs text-secondary font-medium mb-2">{t('dashboard.returning')}</p>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded border ${stats && stats.returningGrowth >= 0 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/20 text-rose-400 border-rose-500/20'}`}>
                                    {stats && stats.returningGrowth >= 0 ? '+' : ''}{stats?.returningGrowth || 0}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
