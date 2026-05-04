import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Layers, ChevronDown, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { useTranslation } from "react-i18next";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "../ui/chart";
import reportService from '../../context/api/reportService';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "../ui/dropdown-menu";

interface TopCategoriesCardProps {
    categories?: any[];
}

const COLORS = ['#0052cc', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

const chartConfig = {
    totalSales: { label: "Total Sales" }
} satisfies ChartConfig;

export const TopCategoriesCard: React.FC<TopCategoriesCardProps> = ({ categories: initialData }) => {
    const { t } = useTranslation();
    const [selectedPeriod, setSelectedPeriod] = useState('today');
    const [categoriesData, setCategoriesData] = useState<any[]>(initialData || []);
    const [isLoading, setIsLoading] = useState(false);

    const periods = [
        { id: 'today', label: t('dashboard.today') },
        { id: '1W', label: t('dashboard.weekly') },
        { id: '1M', label: t('dashboard.monthly') },
        { id: '1Y', label: t('dashboard.yearly') },
    ];

    const fetchTopCategories = async (period: string) => {
        try {
            setIsLoading(true);
            const res = await reportService.getTopCategories(period);
            setCategoriesData(res);
        } catch (error) {
            console.error('Error fetching top categories:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (selectedPeriod !== 'today' || !initialData) {
            fetchTopCategories(selectedPeriod);
        } else if (initialData) {
            setCategoriesData(initialData);
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

    const getInitials = (name: string) => {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'CA';
    };

    return (
        <Card className="shadow-sm h-full border border-border flex flex-col">
            <CardContent className="p-6 flex flex-col h-full relative">
                <div className="flex items-center justify-between pb-4 border-b border-border mb-4 px-6 -mx-6">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                            <Layers className="h-5 w-5 text-indigo-500" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">{t('dashboard.top_categories')}</h3>
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

                <div className={`flex flex-col sm:flex-row gap-6 h-full transition-opacity ${isLoading ? "opacity-50" : "opacity-100"}`}>
                    <div className="w-full sm:w-1/2 h-48 flex items-center justify-center">
                        {categoriesData.length > 0 ? (
                            <ChartContainer config={chartConfig} className="h-full w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoriesData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={41}
                                            outerRadius={70}
                                            paddingAngle={5}
                                            dataKey="totalSales"
                                            stroke="none"
                                        >
                                            {categoriesData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <ChartTooltip
                                            cursor={false}
                                            content={
                                                <ChartTooltipContent
                                                    hideLabel
                                                    nameKey="categoryName"
                                                    indicator="dot"
                                                    className="bg-white border border-border text-foreground min-w-[120px] shadow-sm"
                                                />
                                            }
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-muted-foreground gap-2 opacity-50">
                                <Layers className="h-8 w-8" />
                                <span className="text-[10px]">{t('common.no_data')}</span>
                            </div>
                        )}
                    </div>

                    <div className="w-full sm:w-1/2 flex flex-col gap-3 justify-center">
                        {categoriesData.map((category, index) => (
                            <div key={index} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <Avatar className="h-8 w-8 rounded-lg" style={{ backgroundColor: `${COLORS[index % COLORS.length]}20` }}>
                                        <AvatarFallback className="bg-transparent text-gray-600 text-[10px] font-bold">
                                            {getInitials(category.categoryName)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                                            {category.categoryName}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground font-bold">
                                            {formatCurrency(category.totalSales)}
                                        </span>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                                    category.growth >= 0
                                    ? "text-emerald-600 bg-emerald-500/10"
                                    : "text-rose-600 bg-rose-500/10"
                                }`}>
                                    {category.growth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                    {category.growth >= 0 ? "+" : ""}{category.growth}%
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
