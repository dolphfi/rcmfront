import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { ShoppingCart, ChevronDown, Calendar } from 'lucide-react';
import { useTranslation } from "react-i18next";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "../ui/dropdown-menu";

const getStatusStyles = (status: string): string => {
    switch (status) {
        case 'COMPLETED':
            return 'bg-emerald-500/20 text-emerald-600';
        case 'CANCELLED':
            return 'bg-rose-500/20 text-rose-600';
        case 'PAUSED':
            return 'bg-amber-500/20 text-amber-600';
        case 'PENDING':
            return 'bg-primary/20 text-primary';
        default:
            return 'bg-gray-200 text-gray-600';
    }
};

interface RecentSalesCardProps {
    sales?: any[];
}

export const RecentSalesCard: React.FC<RecentSalesCardProps> = ({ sales }) => {
    const { t } = useTranslation();
    const [period, setPeriod] = useState('1W');

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'HTG',
        }).format(amount);
    };

    const getInitials = (firstName: string, lastName: string) => {
        if (!firstName && !lastName) return 'CU';
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
    };

    const displaySales = sales || [];

    const periods = [
        { value: 'today', label: t('dashboard.today') },
        { value: '1W', label: t('dashboard.weekly') },
        { value: '1M', label: t('dashboard.monthly') },
        { value: '1Y', label: t('dashboard.yearly') }
    ];

    const currentPeriodLabel = periods.find(p => p.value === period)?.label || t('dashboard.weekly');

    return (
        <Card className="shadow-sm h-full border border-border flex flex-col">
            <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-center justify-between pb-4 border-b border-border mb-4 px-6 -mx-6">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-pink-500/10 rounded-lg">
                            <ShoppingCart className="h-5 w-5 text-pink-500" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">{t('dashboard.recent_sales')}</h3>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 text-xs border-border text-gray-500 hover:bg-primary/10 hover:text-primary gap-2">
                                <Calendar className="h-3 w-3" />
                                {currentPeriodLabel}
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

                <div className="flex flex-col gap-4">
                    {displaySales.map((sale) => (
                        <div key={sale.id} className="flex items-center justify-between group">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <Avatar className="h-10 w-10 rounded-lg bg-gray-100">
                                    <AvatarFallback className="bg-transparent text-gray-500 text-xs font-bold">
                                        {getInitials(sale.customer?.firstName, sale.customer?.lastName)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                                        {sale.customer ? `${sale.customer.firstName} ${sale.customer.lastName}` : t('dashboard.walk_in_customer')}
                                    </span>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className="text-pink-500/80 shrink-0">{sale.receiptNumber}</span>
                                        <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0"></span>
                                        <span className="truncate">{formatCurrency(parseFloat(sale.total))}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-1 shrink-0 pl-2">
                                <span className="text-[10px] text-gray-500">
                                    {new Date(sale.createdAt).toLocaleDateString()}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getStatusStyles(sale.status)}`}>
                                    {t(`dashboard.status_${sale.status.toLowerCase()}`)}
                                </span>
                            </div>
                        </div>
                    ))}
                    {displaySales.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            {t('dashboard.no_records_found')}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
