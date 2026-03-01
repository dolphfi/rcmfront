import React, { useEffect, useState } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "components/ui/card";
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import {
    TrendingUp,
    Users,
    Package,
    DollarSign,
    ShoppingCart,
    Calendar,
    Download,
    FileStack,
    Truck,
    Store
} from 'lucide-react';
import { Button } from 'components/ui/button';
import reportService from 'context/api/reportService';
import { format } from 'date-fns';

const Reports: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [chartData, setChartData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [summary, chart] = await Promise.all([
                reportService.getSummary(),
                reportService.getSalesChart(7)
            ]);
            setStats(summary);
            setChartData(chart);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const analyticsCards = [
        {
            title: "Vant Total",
            value: `${stats?.totalSales.toFixed(2) || '0.00'} HTG`,
            description: "Total tout lavant fèt",
            icon: DollarSign,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        },
        {
            title: "Pwofi (Estime)",
            value: `${stats?.totalProfit.toFixed(2) || '0.00'} HTG`,
            description: "Pwofi sou vant pwodwi",
            icon: TrendingUp,
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            title: "Kantite Kòmande",
            value: stats?.totalOrders || 0,
            description: "Total resi ki bay",
            icon: ShoppingCart,
            color: "text-orange-500",
            bg: "bg-orange-500/10"
        },
        {
            title: "Stock ki Ba",
            value: stats?.lowStockCount || 0,
            description: "Pwodwi ki bezwen achte",
            icon: Package,
            color: "text-rose-500",
            bg: "bg-rose-500/10"
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                        <FileStack className="h-8 w-8 text-blue-500" />
                        Analytics & Rapports
                    </h2>
                    <p className="text-slate-400">
                        Wè kijan biznis la ap mache ak done reyèl
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="bg-slate-800 border-white/10 text-white">
                        <Calendar className="mr-2 h-4 w-4" /> 7 Dènye Jou
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {analyticsCards.map((card, i) => (
                    <Card key={i} className="bg-slate-900/50 border-white/10 backdrop-blur-xl border-l-4 border-l-transparent hover:border-l-current transition-all overflow-hidden" style={{ borderLeftColor: card.color.includes('emerald') ? '#10b981' : card.color.includes('blue') ? '#3b82f6' : card.color.includes('orange') ? '#f59e0b' : '#f43f5e' }}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">
                                {card.title}
                            </CardTitle>
                            <div className={`p-2 rounded-lg ${card.bg}`}>
                                <card.icon className={`h-4 w-4 ${card.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{card.value}</div>
                            <p className="text-xs text-slate-500 mt-1">
                                {card.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Sales Chart */}
            <Card className="bg-slate-900/50 border-white/10 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="text-white text-lg font-medium">Tandans Lavant (Vant pa Jou)</CardTitle>
                    <CardDescription className="text-slate-400">Montre evolisyon lavant ou sou dènye jou yo</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px] pt-4">
                    {isLoading ? (
                        <div className="h-full w-full flex items-center justify-center text-slate-500 italic">
                            Ap chaje done yo...
                        </div>
                    ) : chartData.length === 0 ? (
                        <div className="h-full w-full flex items-center justify-center text-slate-500 italic">
                            Okenn done poko disponib pou peryòd sa
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickFormatter={(val) => format(new Date(val), 'dd MMM')}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickFormatter={(val) => `${val} HTG`}
                                />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff20', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#3b82f6' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorTotal)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Placeholder for other reports or top products */}
                <Card className="bg-slate-900/50 border-white/10 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-white">Aksè Rapò Detaye</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 h-24 flex flex-col gap-2">
                            <ShoppingCart className="h-6 w-6 text-emerald-500" />
                            <span>Rapò Lavant</span>
                        </Button>
                        <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 h-24 flex flex-col gap-2">
                            <Truck className="h-6 w-6 text-orange-500" />
                            <span>Rapò Acha</span>
                        </Button>
                        <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 h-24 flex flex-col gap-2">
                            <Package className="h-6 w-6 text-blue-500" />
                            <span>Rapò Stock</span>
                        </Button>
                        <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 h-24 flex flex-col gap-2">
                            <Users className="h-6 w-6 text-purple-500" />
                            <span>Rapò Kliyan</span>
                        </Button>
                    </CardContent>
                </Card>

                {/* Info Card */}
                <Card className="bg-blue-600/20 border-blue-500/30 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-white">Note sou Done yo</CardTitle>
                    </CardHeader>
                    <CardContent className="text-slate-300 space-y-4">
                        <p>Done pwofi yo se yon estimasyon baze sou dènye pri ou antre nan sistèm nan. Pou gen yon rapò ki pi presi, asire ou toujou antre pri acha (Cost Price) kòrèk lè w ap resevwa stock.</p>
                        <p>Ou ka chanje peryòd tan an pou wè tandans sou yon mwa oswa yon ane (Devlopman ap kontinye).</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Reports;
