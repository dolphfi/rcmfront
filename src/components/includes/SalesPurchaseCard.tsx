import React from 'react';
import { Card, CardContent } from "../ui/card";
import { ShoppingCart } from "lucide-react";
import { Button } from "../ui/button";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import { useTranslation } from 'react-i18next';

interface SalesPurchaseCardProps {
    data?: any[];
    period?: string;
    onPeriodChange?: (period: string) => void;
    isLoading?: boolean;
}

export const SalesPurchaseCard: React.FC<SalesPurchaseCardProps> = ({ data, period = '1W', onPeriodChange, isLoading }) => {
    const { t } = useTranslation();

    const chartConfig = {
        sales: { label: t('dashboard.sales'), color: "#f97316" },
        purchase: { label: t('dashboard.purchase'), color: "#fdba74" },
    } satisfies ChartConfig;

    const formatXAxis = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            if (period === '1D') return date.getHours() + ':00';
            if (period === '1Y' || period === '6M') return date.toLocaleDateString(undefined, { month: 'short' });
            return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
        } catch (e) {
            return dateStr;
        }
    };

    const displayData = (data || []).map((item: any) => ({
        ...item,
        time: formatXAxis(item.date)
    }));

    const totalSales = displayData.reduce((acc: number, curr: any) => acc + curr.sales, 0);
    const totalPurchase = displayData.reduce((acc: number, curr: any) => acc + curr.purchase, 0);

    const formatShortNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toFixed(2);
    };

    return (
        <Card className="shadow-sm flex-1 border border-border flex flex-col">
            <CardContent className="p-6 flex flex-col h-full relative">
                {isLoading && (
                    <div className="absolute inset-x-0 bottom-0 top-[70px] bg-white/70 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-b-xl">
                        <div className="flex space-x-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                        </div>
                    </div>
                )}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 -mx-6 pb-4 border-b border-border mb-0">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-orange-100/80 rounded-lg">
                            <ShoppingCart className="h-5 w-5 text-orange-500" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">{t('dashboard.sales_purchase')}</h3>
                    </div>
                    <div className="flex bg-muted p-1 rounded-lg border border-border overflow-x-auto max-w-full no-scrollbar">
                        {['1D', '1W', '1M', '3M', '6M', '1Y'].map((p) => (
                            <Button
                                key={p}
                                variant="ghost"
                                size="sm"
                                onClick={() => onPeriodChange?.(p)}
                                className={`h-7 px-3 text-xs font-medium rounded-md whitespace-nowrap transition-all ${p === period ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-500 hover:text-primary hover:bg-primary/10'}`}
                            >
                                {p}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-2 pt-2">
                    <div className="border border-border rounded-xl p-3 bg-muted/50 w-full">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-orange-300 shrink-0"></span>
                            <span className="text-muted-foreground text-xs font-medium truncate">{t('dashboard.total_purchase_label')}</span>
                        </div>
                        <h4 className="text-xl font-bold text-foreground ml-4">{formatShortNumber(totalPurchase)}</h4>
                    </div>
                    <div className="border border-border rounded-xl p-3 bg-muted/50 w-full">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0"></span>
                            <span className="text-muted-foreground text-xs font-medium truncate">{t('dashboard.total_sales_label')}</span>
                        </div>
                        <h4 className="text-xl font-bold text-foreground ml-4">{formatShortNumber(totalSales)}</h4>
                    </div>
                </div>

                <div className="w-full h-[230px] px-6 pb-2">
                    <ChartContainer config={chartConfig} className="h-full w-full max-h-full">
                        <BarChart accessibilityLayer data={displayData} width={undefined} height={undefined} style={{ width: '100%', height: '100%' }}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(0,0,0,0.07)" />
                            <XAxis
                                dataKey="time"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                tick={{ fill: '#9ca3af', fontSize: 10 }}
                            />
                            <YAxis
                                width={30}
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                tick={{ fill: '#9ca3af', fontSize: 10 }}
                                tickFormatter={(value) => `${value}`}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={
                                    <ChartTooltipContent
                                        indicator="dot"
                                        className="bg-white border border-border text-foreground min-w-[120px] shadow-sm"
                                        labelClassName="text-gray-500 mb-1 border-b border-border pb-1"
                                    />
                                }
                            />
                            <Bar dataKey="sales" stackId="a" fill="var(--color-sales)" radius={[0, 0, 4, 4]} barSize={32} />
                            <Bar dataKey="purchase" stackId="a" fill="var(--color-purchase)" radius={[4, 4, 0, 0]} fillOpacity={0.3} barSize={32} />
                        </BarChart>
                    </ChartContainer>
                </div>
            </CardContent>
        </Card>
    );
};
