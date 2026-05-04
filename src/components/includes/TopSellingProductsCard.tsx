import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Package, TrendingUp, TrendingDown, ChevronDown, Loader2 } from 'lucide-react';
import { useTranslation } from "react-i18next";
import reportService from '../../context/api/reportService';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "../ui/dropdown-menu";

interface TopSellingProductsCardProps {
    products?: any[];
}

export const TopSellingProductsCard: React.FC<TopSellingProductsCardProps> = ({ products: initialProducts }) => {
    const { t } = useTranslation();
    const [period, setPeriod] = useState('today');
    const [isLoading, setIsLoading] = useState(false);
    const [products, setProducts] = useState<any[]>(initialProducts || []);

    const fetchTopProducts = async (p: string) => {
        try {
            setIsLoading(true);
            const res = await reportService.getTopSellingProducts(p);
            setProducts(res);
        } catch (error) {
            console.error('Error fetching top selling products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTopProducts(period);
    }, [period]);

    useEffect(() => {
        if (initialProducts && period === 'today' && products.length === 0) {
            setProducts(initialProducts);
        }
    }, [initialProducts, period, products.length]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'HTG',
        }).format(amount);
    };

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
                <div className="flex items-center justify-between pb-4 border-b border-border mb-4 px-6 -mx-6">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-pink-500/10 rounded-lg">
                            <Package className="h-5 w-5 text-pink-500" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">{t('dashboard.top_selling_products')}</h3>
                    </div>

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

                <div className={`flex flex-col gap-4 ${isLoading ? "opacity-50 pointer-events-none transition-opacity" : "transition-opacity"}`}>
                    {products.map((product, index) => (
                        <div key={index} className="flex items-center justify-between group">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <Avatar className="h-10 w-10 rounded-lg bg-gray-100">
                                    {product.imageUrl && <AvatarImage src={product.imageUrl} alt={product.productName} className="object-cover" />}
                                    <AvatarFallback className="bg-transparent text-gray-500 text-xs font-bold">
                                        <Package className="h-4 w-4" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                                        {product.productName}
                                    </span>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className="text-orange-500 font-bold">{formatCurrency(parseFloat(product.totalAmount))}</span>
                                        <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0"></span>
                                        <span className="truncate">{product.soldQty} {t('dashboard.sales')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-1 shrink-0 pl-2">
                                <div className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${product.growth >= 0 ? 'text-emerald-600 bg-emerald-500/10' : 'text-rose-600 bg-rose-500/10'}`}>
                                    {product.growth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                    {product.growth >= 0 ? '+' : ''}{product.growth}%
                                </div>
                            </div>
                        </div>
                    ))}
                    {products.length === 0 && !isLoading && (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            {t('dashboard.no_records_found')}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
