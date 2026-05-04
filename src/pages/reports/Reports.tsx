import React, { useEffect, useState, useCallback } from 'react';
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
    Calendar as CalendarIcon,
    Download,
    X,
    Loader2,
    FileSpreadsheet,
    FileText,
    ChevronDown,
    Truck,
    ChartLine
} from 'lucide-react';
import { Button } from 'components/ui/button';
import reportService from 'context/api/reportService';
import settingsService from 'context/api/settingsService';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';
import { fr, ht, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { useSettings } from 'context/SettingsContext';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "components/ui/popover";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "components/ui/dropdown-menu";
import { jsPDF } from "jspdf";
import { Calendar } from "components/ui/calendar";
import { cn } from "lib/utils";
import { DateRange } from "react-day-picker";

const Reports: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [stats, setStats] = useState<any>(null);
    const [chartData, setChartData] = useState<any[]>([]);
    const [posData, setPosData] = useState<any[]>([]);
    const [productPosData, setProductPosData] = useState<any[]>([]);
    const [businessName, setBusinessName] = useState('Kolabo POS');
    const [logoUrl, setLogoUrl] = useState('');
    const { currency: globalCurrency } = useSettings();
    const [isLoading, setIsLoading] = useState(true);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subDays(new Date(), 7),
        to: new Date(),
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await settingsService.getAll();
                const name = response.data.find((s: any) => s.key === 'BUSINESS_NAME')?.value;
                const logo = response.data.find((s: any) => s.key === 'BUSINESS_LOGO_URL')?.value;
                if (name) setBusinessName(name);
                if (logo) setLogoUrl(logo);
            } catch (error) {
                console.error("Error fetching business settings:", error);
            }
        };
        fetchSettings();
    }, []);

    const getDateLocale = () => {
        switch (i18n.language) {
            case 'ht': return ht;
            case 'fr': return fr;
            default: return enUS;
        }
    };

    const handleDateSelect = (range: DateRange | undefined) => {
        setDateRange(range);
        if (range?.from && range?.to) {
            setIsCalendarOpen(false);
        }
    };

    const fetchData = useCallback(async () => {
        if (!dateRange?.from || !dateRange?.to) return;
        setIsLoading(true);
        try {
            const startDate = format(startOfDay(dateRange.from), "yyyy-MM-dd HH:mm:ss");
            const endDate = format(endOfDay(dateRange.to), "yyyy-MM-dd HH:mm:ss");

            const [summary, chart, posSummary, productPosSummary] = await Promise.all([
                reportService.getSummary(startDate, endDate),
                reportService.getSalesChart('1W', startDate, endDate),
                reportService.getPosSummary(startDate, endDate),
                reportService.getSalesByProductPos(startDate, endDate)
            ]);
            setStats(summary);
            setChartData(chart);
            setPosData(posSummary);
            setProductPosData(productPosSummary);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setIsLoading(false);
        }
    }, [dateRange]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const formatCurrency = (amount: number) => {
        try {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: globalCurrency || 'HTG',
                maximumFractionDigits: 0,
            }).format(amount);
        } catch (e) {
            return `${new Intl.NumberFormat('en-US', {
                maximumFractionDigits: 0,
            }).format(amount)} ${globalCurrency}`;
        }
    };

    const handleExportCSV = () => {
        if (!stats && posData.length === 0) return;

        let csvContent = "data:text/csv;charset=utf-8,";

        // Header
        csvContent += `Rapo ${businessName} - Period: ${dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : 'Tout tan'} - ${dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : ''}\n\n`;

        // Summary Stats
        csvContent += "REZIME JENERAL\n";
        csvContent += `Lavant Total,${stats?.totalSales || 0} ${globalCurrency}\n`;
        csvContent += `Pwofi Estime,${stats?.totalProfit || 0} ${globalCurrency}\n`;
        csvContent += `Kantite Lòd,${stats?.totalOrders || 0}\n`;
        csvContent += `Stock ki Ba,${stats?.lowStockCount || 0}\n\n`;

        // POS Performance Table
        if (posData.length > 0) {
            csvContent += "PÈFOMANS PA PWEN DE VANT\n";
            csvContent += `Pwen de Vant,Lòd,Lavant (${globalCurrency}),Pwofi (${globalCurrency})\n`;
            posData.forEach(pos => {
                csvContent += `${pos.name},${pos.totalOrders},${pos.totalSales},${pos.totalProfit}\n`;
            });
            csvContent += "\n";
        }

        // Product by POS Table
        if (productPosData.length > 0) {
            csvContent += "VANT PA PWODWI AK PWEN DE VANT\n";
            csvContent += `Pwodwi,Pwen de Vant,Kantite,Total (${globalCurrency})\n`;
            productPosData.forEach(item => {
                csvContent += `${item.productName},${item.posName},${item.totalQty},${item.totalAmount}\n`;
            });
        }

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `rapo_${format(new Date(), "yyyyMMdd_HHmm")}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getBase64ImageFromUrl = async (url: string): Promise<string> => {
        const res = await fetch(url);
        const blob = await res.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.addEventListener("load", () => resolve(reader.result as string), false);
            reader.addEventListener("error", () => reject());
            reader.readAsDataURL(blob);
        });
    };

    const handleExportPDF = async () => {
        if (!stats && posData.length === 0) return;

        const doc = new jsPDF();
        let yPos = 115;
        const pageWidth = doc.internal.pageSize.getWidth();
        const dateStr = format(new Date(), "yyyy-MM-dd HH:mm");
        const periodStr = `${dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : 'Tout tan'} ${dateRange?.to ? '- ' + format(dateRange.to, "yyyy-MM-dd") : ''}`;

        // Header
        doc.setFillColor(30, 41, 59); // Slate-800
        doc.rect(0, 0, pageWidth, 40, 'F');

        let textXOffset = 15;
        if (logoUrl) {
            try {
                const imgData = await getBase64ImageFromUrl(logoUrl);
                doc.addImage(imgData, 'PNG', 15, 8, 24, 24);
                textXOffset = 45;
            } catch (error) {
                console.error("Could not load for PDF", error);
            }
        }

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text(businessName.toUpperCase(), textXOffset, 20);

        doc.setFontSize(10);
        doc.text("RAPÒ ANALITIK & PWOFI", textXOffset, 30);
        doc.text(`Jenere le: ${dateStr}`, pageWidth - 15, 30, { align: 'right' });

        // Period Info
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`Peryod: ${periodStr}`, 15, 50);

        // General Summary
        doc.setFontSize(14);
        doc.text("1. REZIME JENERAL", 15, 65);
        doc.setDrawColor(226, 232, 240);
        doc.line(15, 68, 80, 68);

        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.text(`Lavant Total:`, 15, 78);
        doc.setFont("helvetica", "bold");
        doc.text(`${formatCurrency(stats?.totalSales || 0)}`, 100, 78, { align: 'right' });

        doc.setFont("helvetica", "normal");
        doc.text(`Pwofi Estime:`, 15, 86);
        doc.setFont("helvetica", "bold");
        doc.text(`${formatCurrency(stats?.totalProfit || 0)}`, 100, 86, { align: 'right' });

        doc.setFont("helvetica", "normal");
        doc.text(`Kantite Lod:`, 15, 94);
        doc.setFont("helvetica", "bold");
        doc.text(`${stats?.totalOrders || 0}`, 100, 94, { align: 'right' });

        // POS Performance Table
        if (posData.length > 0) {
            yPos = 115;
            doc.setFontSize(14);
            doc.text("2. PEFOMANS PA PWEN DE VANT", 15, yPos);
            doc.line(15, yPos + 3, 100, yPos + 3);

            yPos += 15;
            // Table Header
            doc.setFillColor(241, 245, 249);
            doc.rect(15, yPos - 5, pageWidth - 30, 8, 'F');
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text("Pwen de Vant", 20, yPos);
            doc.text("Lod", 110, yPos, { align: 'right' });
            doc.text(`Lavant (${globalCurrency})`, 150, yPos, { align: 'right' });
            doc.text(`Pwofi (${globalCurrency})`, 190, yPos, { align: 'right' });

            doc.setFont("helvetica", "normal");
            yPos += 10;
            posData.forEach((pos, idx) => {
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                }
                doc.text(pos.name, 20, yPos);
                doc.text((pos.totalOrders || 0).toString(), 110, yPos, { align: 'right' });
                doc.text(formatCurrency(pos.totalSales || 0).replace(globalCurrency, '').trim(), 150, yPos, { align: 'right' });
                doc.text(formatCurrency(pos.totalProfit || 0).replace(globalCurrency, '').trim(), 190, yPos, { align: 'right' });

                doc.setDrawColor(241, 245, 249);
                doc.line(15, yPos + 2, pageWidth - 15, yPos + 2);
                yPos += 10;
            });
        }

        // Product by POS Table
        if (productPosData.length > 0) {
            // Add new page if not enough space
            if (yPos > 240) {
                doc.addPage();
                yPos = 20;
            } else {
                yPos += 20;
            }

            doc.setFontSize(14);
            doc.setTextColor(30, 41, 59);
            doc.setFont("helvetica", "bold");
            doc.text("3. VANT PA PWODWI AK PWEN DE VANT", 15, yPos);
            doc.setDrawColor(226, 232, 240);
            doc.line(15, yPos + 3, 110, yPos + 3);

            yPos += 15;
            // Table Header
            doc.setFillColor(241, 245, 249);
            doc.rect(15, yPos - 5, pageWidth - 30, 8, 'F');
            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");
            doc.text("Pwodwi", 20, yPos);
            doc.text("Pwen de Vant", 80, yPos);
            doc.text("Kantite", 150, yPos, { align: 'right' });
            doc.text(`Total (${globalCurrency})`, 190, yPos, { align: 'right' });

            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            yPos += 10;
            productPosData.forEach((item, idx) => {
                if (yPos > 275) {
                    doc.addPage();
                    yPos = 20;
                    // Repeat Header on new page
                    doc.setFillColor(241, 245, 249);
                    doc.rect(15, yPos - 5, pageWidth - 30, 8, 'F');
                    doc.setFont("helvetica", "bold");
                    doc.text("Pwodwi", 20, yPos);
                    doc.text("Pwen de Vant", 80, yPos);
                    doc.text("Kantite", 150, yPos, { align: 'right' });
                    doc.text(`Total (${globalCurrency})`, 190, yPos, { align: 'right' });
                    doc.setFont("helvetica", "normal");
                    yPos += 10;
                }

                // Product name might be long, truncate if necessary or use smaller font
                const prodName = item.productName.length > 30 ? item.productName.substring(0, 27) + '...' : item.productName;
                doc.text(prodName, 20, yPos);
                doc.text(item.posName, 80, yPos);
                doc.setFont("helvetica", "bold");
                doc.text((item.totalQty || 0).toString(), 150, yPos, { align: 'right' });
                doc.setFont("helvetica", "normal");
                doc.text(formatCurrency(item.totalAmount || 0).replace(globalCurrency, '').trim(), 190, yPos, { align: 'right' });

                doc.setDrawColor(241, 245, 249);
                doc.line(15, yPos + 2, pageWidth - 15, yPos + 2);
                yPos += 8;
            });
        }

        doc.save(`rapo_${businessName}_${format(new Date(), "yyyyMMdd_HHmm")}.pdf`);
    };

    const analyticsCards = [
        {
            title: t('dashboard.total_sales'),
            value: formatCurrency(stats?.totalSales || 0),
            description: t('dashboard.total_sales_desc', "Total tout lavant fèt"),
            icon: DollarSign,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            growth: dateRange?.from && dateRange?.to ? null : stats?.salesPercentage
        },
        {
            title: t('dashboard.profit', "Pwofi (Estime)"),
            value: formatCurrency(stats?.totalProfit || 0),
            description: t('dashboard.profit_desc', "Pwofi sou vant pwodwi"),
            icon: TrendingUp,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            growth: dateRange?.from && dateRange?.to ? null : stats?.profitPercentage
        },
        {
            title: t('dashboard.orders', "Kantite Kòmande"),
            value: stats?.totalOrders || 0,
            description: t('dashboard.orders_desc', "Total resi ki bay"),
            icon: ShoppingCart,
            color: "text-primary",
            bg: "bg-primary/10",
            growth: dateRange?.from && dateRange?.to ? null : stats?.ordersPercentage
        },
        {
            title: t('dashboard.low_stock', "Stock ki Ba"),
            value: stats?.lowStockCount || 0,
            description: t('dashboard.low_stock_desc', "Pwodwi ki bezwen achte"),
            icon: Package,
            color: "text-rose-500",
            bg: "bg-rose-500/10"
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                        <ChartLine className="h-8 w-8 text-primary" />
                        {t('reports.title', "Rapò Analitik")}
                    </h2>
                    <p className="text-muted-foreground">
                        {t('reports.subtitle', "Track pèfòmans biznis ou an tan reyèl")}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="bg-white border-slate-200 text-foreground min-w-[240px] justify-start text-left font-normal"
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange?.from ? (
                                    dateRange.to ? (
                                        <>
                                            {format(dateRange.from, "LLL dd, y", { locale: getDateLocale() })} -{" "}
                                            {format(dateRange.to, "LLL dd, y", { locale: getDateLocale() })}
                                        </>
                                    ) : (
                                        format(dateRange.from, "LLL dd, y", { locale: getDateLocale() })
                                    )
                                ) : (
                                    <span>{t('reports.select_date', "Chwazi dat")}</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-white border-slate-200" align="end">
                            <div className="p-3 border-b border-slate-100 flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">{t('reports.select_period', "Chwazi peryòd")}</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-[10px] text-primary hover:text-primary/80"
                                    onClick={() => setIsCalendarOpen(false)}
                                >
                                    {t('common.done', "OK")}
                                </Button>
                            </div>
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={dateRange?.from}
                                selected={dateRange}
                                onSelect={handleDateSelect}
                                numberOfMonths={2}
                                locale={getDateLocale()}
                                className="bg-white border-none text-foreground"
                            />
                        </PopoverContent>
                    </Popover>

                    {dateRange && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDateRange({
                                from: subDays(new Date(), 7),
                                to: new Date(),
                            })}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
                                <Download className="h-4 w-4" />
                                {t('common.export', "Export")}
                                <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white border-slate-200">
                            <DropdownMenuItem
                                onClick={handleExportCSV}
                                className="cursor-pointer gap-2"
                            >
                                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                                <span>{t('reports.export_csv', "Telechaje CSV")}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={handleExportPDF}
                                className="cursor-pointer gap-2"
                            >
                                <FileText className="h-4 w-4 text-blue-600" />
                                <span>{t('reports.export_pdf', "Telechaje PDF")}</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {analyticsCards.map((card, i) => (
                    <Card key={i} className="bg-white border-slate-200 shadow-sm border-l-4" style={{ borderLeftColor: card.color.includes('emerald') ? '#10b981' : card.color.includes('blue') ? '#3b82f6' : card.color.includes('orange') ? '#f59e0b' : '#f43f5e' }}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {card.title}
                            </CardTitle>
                            <div className={`p-2 rounded-lg ${card.bg}`}>
                                <card.icon className={`h-4 w-4 ${card.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">
                                {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : card.value}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                {card.description}
                                {card.growth !== undefined && card.growth !== null && (
                                    <span className={cn(
                                        "ml-auto text-[10px] font-bold px-1 rounded",
                                        card.growth >= 0 ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
                                    )}>
                                        {card.growth >= 0 ? "+" : ""}{card.growth}%
                                    </span>
                                )}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Sales Chart */}
            <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-foreground text-lg font-bold flex items-center gap-2">
                        {t('reports.sales_trend', "Tandans Lavant (Vant pa Jou)")}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">{t('reports.sales_trend_desc', "Montre evolisyon lavant ou sou peryòd chwazi a")}</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px] pt-4">
                    {isLoading ? (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground italic">
                            <Loader2 className="h-8 w-8 animate-spin mr-2" />
                            {t('common.loading', "Ap chaje done yo...")}
                        </div>
                    ) : chartData.length === 0 ? (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground italic">
                            {t('common.no_data_period', "Okenn done poko disponib pou peryòd sa")}
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#94a3b8"
                                    fontSize={10}
                                    tickFormatter={(val) => format(new Date(val), 'dd MMM', { locale: getDateLocale() })}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    fontSize={10}
                                    tickFormatter={(val) => `${val > 1000 ? (val / 1000).toFixed(1) + 'k' : val}`}
                                />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a' }}
                                    itemStyle={{ color: '#2563eb' }}
                                    formatter={(val: any) => [`${val} ${globalCurrency}`, t('dashboard.revenue', "Revenue")]}
                                    labelFormatter={(label) => format(new Date(label), 'dd MMMM yyyy', { locale: getDateLocale() })}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#2563eb"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorTotal)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>

            {/* POS Performance */}
            <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-foreground text-lg font-bold flex items-center gap-2">
                        <Package className="h-5 w-5 text-primary" />
                        {t('reports.pos_performance', "Pèfòmans pa Pwen de Vant")}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">{t('reports.pos_performance_desc', "Konparezon lavant ak pwofi pou chak filyal")}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 text-muted-foreground text-xs uppercase tracking-wider">
                                    <th className="px-4 py-3 font-medium">{t('reports.pos_name', "Pwen de Vant")}</th>
                                    <th className="px-4 py-3 font-medium text-right">{t('reports.pos_orders', "Lòd")}</th>
                                    <th className="px-4 py-3 font-medium text-right">{t('reports.pos_sales', "Lavant")}</th>
                                    <th className="px-4 py-3 font-medium text-right">{t('reports.pos_profit', "Pwofi")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground italic">
                                            <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                                            {t('common.loading', "Ap chaje...")}
                                        </td>
                                    </tr>
                                ) : posData.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground italic">
                                            {t('common.no_data', "Okenn done poko disponib")}
                                        </td>
                                    </tr>
                                ) : (
                                    posData.map((pos, idx) => (
                                        <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-4 text-sm font-medium text-foreground">{pos.name}</td>
                                            <td className="px-4 py-4 text-sm text-right text-muted-foreground">{pos.totalOrders}</td>
                                            <td className="px-4 py-4 text-sm text-right text-emerald-600 font-medium">{formatCurrency(pos.totalSales)}</td>
                                            <td className="px-4 py-4 text-sm text-right text-blue-600 font-medium">{formatCurrency(pos.totalProfit)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Sales by Product and POS */}
            <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-foreground text-lg font-bold flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Vant pa Pwodwi ak Pwen de Vant
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">Kantite chak pwodwi vann nan chak branch pwen de vant</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 text-muted-foreground text-xs uppercase tracking-wider">
                                    <th className="px-4 py-3 font-medium">Pwodwi</th>
                                    <th className="px-4 py-3 font-medium">Pwen de Vant</th>
                                    <th className="px-4 py-3 font-medium text-right">Kantite</th>
                                    <th className="px-4 py-3 font-medium text-right">Total Lavant</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground italic">
                                            <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                                            Ap chaje...
                                        </td>
                                    </tr>
                                ) : productPosData.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground italic">
                                            Okenn done poko disponib
                                        </td>
                                    </tr>
                                ) : (
                                    productPosData.map((item, idx) => (
                                        <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-4 text-sm font-medium text-foreground">{item.productName}</td>
                                            <td className="px-4 py-4 text-sm text-muted-foreground">{item.posName}</td>
                                            <td className="px-4 py-4 text-sm text-right text-orange-600 font-bold">{item.totalQty}</td>
                                            <td className="px-4 py-4 text-sm text-right text-emerald-600 font-medium">{formatCurrency(item.totalAmount)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Detailed Reports Access */}
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-foreground">{t('reports.detailed_reports', "Aksè Rapò Detaye")}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button variant="outline" className="border-slate-200 text-foreground hover:bg-slate-50 h-24 flex flex-col gap-2">
                            <ShoppingCart className="h-6 w-6 text-emerald-600" />
                            <span>{t('reports.sales_report', "Rapò Lavant")}</span>
                        </Button>
                        <Button variant="outline" className="border-slate-200 text-foreground hover:bg-slate-50 h-24 flex flex-col gap-2">
                            <Truck className="h-6 w-6 text-orange-600" />
                            <span>{t('reports.purchase_report', "Rapò Acha")}</span>
                        </Button>
                        <Button variant="outline" className="border-slate-200 text-foreground hover:bg-slate-50 h-24 flex flex-col gap-2">
                            <Package className="h-6 w-6 text-blue-600" />
                            <span>{t('reports.stock_report', "Rapò Stock")}</span>
                        </Button>
                        <Button variant="outline" className="border-slate-200 text-foreground hover:bg-slate-50 h-24 flex flex-col gap-2">
                            <Users className="h-6 w-6 text-primary" />
                            <span>{t('reports.customer_report', "Rapò Kliyan")}</span>
                        </Button>
                    </CardContent>
                </Card>

                {/* Info Card */}
                <Card className="bg-primary/5 border-primary/20 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-primary font-bold">{t('reports.note_data', "Note sou Done yo")}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground space-y-4 text-sm">
                        <p>{t('reports.profit_disclaimer', "Done pwofi yo se yon estimasyon baze sou dènye pri ou antre nan sistèm nan. Pou gen yon rapò ki pi presi, asire ou toujou antre pri acha (Cost Price) kòrèk lè w ap resevwa stock.")}</p>
                        <p>{t('reports.date_range_info', "Ou ka chwazi nenpòt peryòd dat ou vle pou w wè rezilta biznis ou sou tèm sa.")}</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Reports;
