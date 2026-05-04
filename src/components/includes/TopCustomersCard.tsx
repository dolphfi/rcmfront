import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Users, ChevronDown, TrendingUp, TrendingDown, Loader2, ShoppingBag } from 'lucide-react';
import { useTranslation } from "react-i18next";
import reportService from '../../context/api/reportService';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "../ui/dropdown-menu";

interface TopCustomersCardProps {
    customers?: any[];
}

export const TopCustomersCard: React.FC<TopCustomersCardProps> = ({ customers: initialData }) => {
    const { t } = useTranslation();
    const [selectedPeriod, setSelectedPeriod] = useState('today');
    const [customersData, setCustomersData] = useState<any[]>(initialData || []);
    const [isLoading, setIsLoading] = useState(false);

    const periods = [
        { id: 'today', label: t('dashboard.today') },
        { id: '1W', label: t('dashboard.weekly') },
        { id: '1M', label: t('dashboard.monthly') },
        { id: '1Y', label: t('dashboard.yearly') },
    ];

    const fetchTopCustomers = async (period: string) => {
        try {
            setIsLoading(true);
            const res = await reportService.getTopCustomers(period);
            setCustomersData(res);
        } catch (error) {
            console.error('Error fetching top customers:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (selectedPeriod !== 'today' || !initialData) {
            fetchTopCustomers(selectedPeriod);
        } else if (initialData) {
            setCustomersData(initialData);
        }
    }, [selectedPeriod, initialData]);

    const formatCurrency = (amount: number | string) => {
        const value = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'HTG',
            maximumFractionDigits: 0,
        }).format(value);
    };

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'CU';
    };

    return (
        <Card className="shadow-sm h-full border border-border flex flex-col">
            <CardContent className="p-6 flex flex-col h-full relative">
                <div className="flex items-center justify-between pb-4 border-b border-border mb-4 px-6 -mx-6">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-orange-500/10 rounded-lg">
                            <Users className="h-5 w-5 text-orange-500" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">{t('dashboard.top_customers')}</h3>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 text-xs border-border text-gray-500 hover:bg-primary/10 hover:text-primary gap-2">
                                {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : periods.find(p => p.id === selectedPeriod)?.label || t('dashboard.today')}
                                <ChevronDown className="h-3 w-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {periods.map((p) => (
                                <DropdownMenuItem
                                    key={p.id}
                                    onSelect={() => setSelectedPeriod(p.id)}
                                    className="hover:bg-primary/10 cursor-pointer"
                                >
                                    {p.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className={`flex flex-col gap-4 flex-1 transition-opacity ${isLoading ? "opacity-50" : "opacity-100"}`}>
                    {customersData.map((customer, index) => (
                        <div key={index} className="flex items-center justify-between group">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <Avatar className="h-10 w-10 rounded-lg bg-gray-100 border border-border">
                                    <AvatarFallback className="bg-transparent text-gray-500 text-xs font-bold">
                                        {getInitials(customer.firstName, customer.lastName)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-bold text-foreground group-hover:text-orange-500 transition-colors truncate">
                                        {customer.firstName} {customer.lastName}
                                    </span>
                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                        <span className="text-teal-600 font-bold">{formatCurrency(customer.totalSpent)}</span>
                                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                                        <span className="flex items-center gap-1">
                                            <ShoppingBag className="h-2.5 w-2.5" />
                                            {customer.orderCount} {t('dashboard.orders')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-1 shrink-0 pl-2">
                                <div className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                    customer.growth >= 0
                                    ? "text-emerald-600 bg-emerald-500/10"
                                    : "text-rose-600 bg-rose-500/10"
                                }`}>
                                    {customer.growth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                    {customer.growth >= 0 ? "+" : ""}{customer.growth}%
                                </div>
                            </div>
                        </div>
                    ))}
                    {customersData.length === 0 && !isLoading && (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                            <Users className="h-8 w-8 opacity-20" />
                            <span className="text-sm">{t('common.no_data')}</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
