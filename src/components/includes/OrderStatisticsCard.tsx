import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Box, Calendar, ChevronDown, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import reportService from '../../context/api/reportService';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "../ui/dropdown-menu";

interface OrderStatisticsCardProps {
    data?: any[];
}

export const OrderStatisticsCard: React.FC<OrderStatisticsCardProps> = ({ data: initialData }) => {
    const { t } = useTranslation();
    const [orderData, setOrderData] = useState<any[]>(initialData || []);
    const [selectedPeriod, setSelectedPeriod] = useState('1M');
    const [isLoading, setIsLoading] = useState(false);

    const periods = [
        { id: '1W', label: t('dashboard.weekly') },
        { id: '1M', label: t('dashboard.monthly') },
        { id: '1Y', label: t('dashboard.yearly') },
    ];

    const days = [
        t('common.days.mon'), t('common.days.tue'), t('common.days.wed'),
        t('common.days.thu'), t('common.days.fri'), t('common.days.sat'), t('common.days.sun')
    ];

    const timeSlots = ['22:00','20:00','18:00','16:00','14:00','12:00','10:00','08:00','06:00','04:00','02:00','00:00'];
    const hours = [22, 20, 18, 16, 14, 12, 10, 8, 6, 4, 2, 0];
    const dayIndices = [2, 3, 4, 5, 6, 7, 1];

    const fetchOrderStats = async (period: string) => {
        try {
            setIsLoading(true);
            const res = await reportService.getOrderStats(period);
            setOrderData(res);
        } catch (error) {
            console.error('Error fetching order stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderStats(selectedPeriod);
    }, [selectedPeriod]);

    const dataGrid = hours.map(h => {
        return dayIndices.map(d => {
            const entry = orderData?.find(item => item.day === d && item.hour === h);
            const count = entry?.count || 0;
            if (count > 20) return 4;
            if (count > 10) return 3;
            if (count > 5) return 2;
            if (count > 0) return 1;
            return 0;
        });
    });

    const getColor = (intensity: number) => {
        switch (intensity) {
            case 4: return 'bg-orange-600 shadow-[0_0_8px_rgba(234,88,12,0.4)]';
            case 3: return 'bg-orange-500';
            case 2: return 'bg-orange-400';
            case 1: return 'bg-orange-300/60';
            default: return 'bg-muted';
        }
    };

    return (
        <Card className="shadow-sm h-full border border-border flex flex-col">
            <CardContent className="p-6 flex flex-col h-full relative">
                <div className="flex items-center justify-between pb-4 border-b border-border mb-4 px-6 -mx-6">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                            <Box className="h-5 w-5 text-indigo-500" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">{t('dashboard.order_statistics')}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                        {isLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 text-[10px] border-border text-gray-500 hover:bg-primary/10 hover:text-primary gap-2 px-2">
                                    <Calendar className="h-3 w-3" />
                                    {periods.find(p => p.id === selectedPeriod)?.label || t('dashboard.weekly')}
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
                </div>

                <div className={`flex-1 overflow-hidden transition-opacity ${isLoading ? "opacity-50" : "opacity-100"}`}>
                    <div className="overflow-x-auto pb-2 no-scrollbar h-full">
                        <div className="flex gap-4 min-h-[300px] min-w-[340px] h-full">
                            <div className="flex flex-col justify-between py-2 text-[10px] text-gray-400 font-bold w-8">
                                {timeSlots.map((time) => (
                                    <div key={time} className="h-6 flex items-center justify-end whitespace-nowrap">
                                        {time}
                                    </div>
                                ))}
                            </div>

                            <div className="flex-1 flex flex-col justify-between">
                                <div className="flex-1 grid grid-rows-12 gap-1.5 pb-2">
                                    {dataGrid.map((row, rowIndex) => (
                                        <div key={rowIndex} className="grid grid-cols-7 gap-1.5">
                                            {row.map((intensity, colIndex) => (
                                                <div
                                                    key={`${rowIndex}-${colIndex}`}
                                                    className={`rounded-sm h-full w-full transition-all duration-300 hover:scale-110 hover:z-10 cursor-pointer ${getColor(intensity)}`}
                                                    title={`${orderData?.find(item => item.day === dayIndices[colIndex] && item.hour === hours[rowIndex])?.count || 0} orders`}
                                                />
                                            ))}
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-7 gap-1.5">
                                    {days.map((day) => (
                                        <div key={day} className="text-[10px] text-gray-400 text-center font-bold uppercase tracking-wider">
                                            {day}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
