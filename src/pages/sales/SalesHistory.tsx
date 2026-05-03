import React, { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "components/ui/table";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "components/ui/card";
import { Badge } from "components/ui/badge";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "components/ui/dialog";
import { ScrollArea } from "components/ui/scroll-area";
import { Search, Eye, Filter, Download, History, Store, User, CreditCard, ShoppingBag, Receipt, Loader2 } from "lucide-react";
import salesService from 'context/api/salesService';
import { useSettings } from 'context/SettingsContext';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from 'lib/utils';

const SalesHistory: React.FC = () => {
    const [sales, setSales] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { currency } = useSettings();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSale, setSelectedSale] = useState<any>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);

    const handleViewDetails = (sale: any) => {
        setSelectedSale(sale);
        setIsDetailsOpen(true);
    };

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        setIsLoading(true);
        try {
            const data = await salesService.findAll();
            setSales(data);
        } catch (error) {
            console.error('Error fetching sales:', error);
            toast.error("Impossible de charger l'historique des ventes");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredSales = sales.filter(sale =>
        sale.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.cashier?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.cashier?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customer?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customer?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleReprintReceipt = async () => {
        if (!selectedSale?.id) return;
        setIsPrinting(true);

        const receiptUrl = `${process.env.REACT_APP_BACKEND_API_URL}/pdf/receipt/${selectedSale.id}`;

        try {
            toast.info("Ap chaje resi a pou enpresyon...");
            const response = await fetch(receiptUrl, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
            });

            if (!response.ok) throw new Error("Echwe pou rale resi a.");

            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const printIframe = document.createElement('iframe');
            printIframe.style.display = 'none';
            printIframe.src = blobUrl;

            document.body.appendChild(printIframe);

            printIframe.onload = () => {
                try {
                    if (printIframe.contentWindow) {
                        printIframe.contentWindow.focus();
                        printIframe.contentWindow.print();
                    }
                } catch (error) {
                    console.error("Print error:", error);
                    toast.info("Enpresyon otomatik bloke, ap telechaje pito...");
                    const link = document.createElement('a');
                    link.href = blobUrl;
                    link.download = `Resi_kopi_${selectedSale.receiptNumber}.pdf`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }

                setTimeout(() => {
                    try { document.body.removeChild(printIframe); } catch (e) { }
                    URL.revokeObjectURL(blobUrl);
                }, 10000);
            };
        } catch (error) {
            console.error("Error reprinting receipt:", error);
            toast.error("Vant sa petèt pa gen modèl resi lye oswa sèvè a echwe.");
        } finally {
            setIsPrinting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                        <History className="h-8 w-8 text-emerald-500" />
                        Istorik Lavant
                    </h2>
                    <p className="text-slate-400">
                        Wè tout lavant ki fèt nan sistèm nan
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="bg-slate-800 border-white/10 text-white hover:bg-slate-700">
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                </div>
            </div>

            <Card className="bg-slate-900/50 border-white/10 backdrop-blur-xl">
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <CardTitle className="text-white text-lg font-medium">Lavant Resan</CardTitle>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Chache reçu, kesye..."
                                    className="pl-9 bg-slate-800/50 border-white/10 text-white"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" size="icon" className="bg-slate-800 border-white/10 text-white">
                                <Filter className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-white/10 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-800/50">
                                <TableRow className="border-white/10 hover:bg-transparent">
                                    <TableHead className="text-slate-300">Reçu #</TableHead>
                                    <TableHead className="text-slate-300">Dat</TableHead>
                                    <TableHead className="text-slate-300">Kesye</TableHead>
                                    <TableHead className="text-slate-300">Kliyan</TableHead>
                                    <TableHead className="text-slate-300">Peman</TableHead>
                                    <TableHead className="text-right text-slate-300">Total</TableHead>
                                    <TableHead className="text-center text-slate-300">Status</TableHead>
                                    <TableHead className="text-right text-slate-300">Aksyon</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow className="border-white/10">
                                        <TableCell colSpan={8} className="h-24 text-center text-slate-400">
                                            Ap chaje...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredSales.length === 0 ? (
                                    <TableRow className="border-white/10">
                                        <TableCell colSpan={8} className="h-24 text-center text-slate-400">
                                            Okenn lavant pa jwenn.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredSales.map((sale) => (
                                        <TableRow key={sale.id} className="border-white/10 hover:bg-white/5 transition-colors">
                                            <TableCell className="font-medium text-white">
                                                {sale.receiptNumber}
                                            </TableCell>
                                            <TableCell className="text-slate-300">
                                                {format(new Date(sale.createdAt), 'dd/MM/yyyy HH:mm')}
                                            </TableCell>
                                            <TableCell className="text-slate-300">
                                                {sale.cashier ? `${sale.cashier.firstName} ${sale.cashier.lastName}` : 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-slate-300">
                                                {sale.customer ? `${sale.customer.firstName} ${sale.customer.lastName}` : 'Walk-in'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge 
                                                    variant="outline" 
                                                    className={cn(
                                                        "uppercase text-[10px] border-0",
                                                        sale.paymentMethod === 'CREDIT' 
                                                            ? "bg-amber-500/20 text-amber-500" 
                                                            : "bg-blue-500/10 text-blue-400"
                                                    )}
                                                >
                                                    {sale.paymentMethod === 'CREDIT' ? 'Credit' : sale.paymentMethod}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right text-emerald-400 font-bold">
                                                {Number(sale.total).toFixed(2)} {currency}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge className="bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30 border-0">
                                                    {sale.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-slate-400 hover:text-white hover:bg-white/10"
                                                    onClick={() => handleViewDetails(sale)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Sale Details Dialog */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl max-h-[90vh] flex flex-col p-0">
                    <DialogHeader className="p-6 pb-4 border-b border-white/5 shrink-0">
                        <DialogTitle className="text-xl font-bold flex items-center justify-between">
                            <span>Détails de la Vente</span>
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-sm px-3 py-1">
                                {selectedSale?.status}
                            </Badge>
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Reçu: <span className="text-white font-mono">{selectedSale?.receiptNumber}</span>
                        </DialogDescription>
                    </DialogHeader>

                    {selectedSale && (
                        <ScrollArea className="flex-1 overflow-y-auto w-full">
                            <div className="p-6 space-y-6">
                                {/* Informational Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-slate-800/50 p-4 rounded-lg border border-white/5">
                                        <div className="flex items-center gap-2 mb-3 text-slate-400">
                                            <Store className="h-4 w-4 text-orange-400" />
                                            <span className="font-medium text-sm">Point de Vente</span>
                                        </div>
                                        <p className="text-white font-medium">{selectedSale.pos?.name || 'N/A'}</p>
                                        <p className="text-slate-400 text-sm mt-1">{format(new Date(selectedSale.createdAt), 'dd MMMM yyyy HH:mm')}</p>
                                    </div>
                                    <div className="bg-slate-800/50 p-4 rounded-lg border border-white/5">
                                        <div className="flex items-center gap-2 mb-3 text-slate-400">
                                            <User className="h-4 w-4 text-blue-400" />
                                            <span className="font-medium text-sm">Personnel & Client</span>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-400">Caissier:</span>
                                                <span className="text-white">{selectedSale.cashier ? `${selectedSale.cashier.firstName} ${selectedSale.cashier.lastName}` : 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-400">Client:</span>
                                                <span className="text-white">{selectedSale.customer ? `${selectedSale.customer.firstName} ${selectedSale.customer.lastName}` : 'Walk-in'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Items List */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <ShoppingBag className="h-4 w-4 text-emerald-400" />
                                        <h3 className="font-medium text-white">Articles ({selectedSale.items?.length || 0})</h3>
                                    </div>
                                    <div className="bg-slate-800/30 rounded-lg border border-white/5 overflow-hidden">
                                        <Table>
                                            <TableHeader className="bg-slate-800/50">
                                                <TableRow className="border-white/5 hover:bg-transparent">
                                                    <TableHead className="text-slate-400 h-9">Article</TableHead>
                                                    <TableHead className="text-slate-400 h-9 text-center">Qté</TableHead>
                                                    <TableHead className="text-slate-400 h-9 text-right">Prix</TableHead>
                                                    <TableHead className="text-slate-400 h-9 text-right">Total</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {selectedSale.items?.map((item: any, index: number) => (
                                                    <TableRow key={index} className="border-white/5 hover:bg-white/5">
                                                        <TableCell className="font-medium text-slate-200">
                                                            {item.name}
                                                        </TableCell>
                                                        <TableCell className="text-center text-slate-300">
                                                            x{item.qty}
                                                        </TableCell>
                                                        <TableCell className="text-right text-slate-300">
                                                            {Number(item.price).toLocaleString()} {currency}
                                                        </TableCell>
                                                        <TableCell className="text-right text-emerald-400 font-medium">
                                                            {Number(item.total).toLocaleString()} {currency}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>

                                {/* Totals */}
                                <div className="flex justify-end pt-4 border-t border-white/5">
                                    <div className="w-full md:w-1/2 space-y-2">
                                        <div className="flex justify-between text-sm text-slate-400">
                                            <span>Sous-total:</span>
                                            <span>{Number(selectedSale.subtotal).toLocaleString()} {currency}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-slate-400">
                                            <span>Taxes:</span>
                                            <span>{Number(selectedSale.tax).toLocaleString()} {currency}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-orange-400">
                                            <span>Rabais:</span>
                                            <span>-{Number(selectedSale.discount).toLocaleString()} {currency}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-lg font-bold text-white pt-2 border-t border-white/10 mt-2">
                                            <span>Total Payé:</span>
                                            <span className="text-emerald-400">{Number(selectedSale.total).toLocaleString()} {currency}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm mt-1">
                                            <span className="text-slate-400">Méthode de Paiement:</span>
                                            <Badge variant="outline" className="bg-slate-800 text-slate-300 mt-1 flex items-center gap-1">
                                                <CreditCard className="h-3 w-3" />
                                                {selectedSale.paymentMethod}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    )}
                    <div className="p-4 border-t border-white/5 bg-slate-900/50 shrink-0 flex justify-between">
                        <Button
                            variant="default"
                            onClick={handleReprintReceipt}
                            disabled={isPrinting}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                        >
                            {isPrinting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Receipt className="h-4 w-4" />
                            )}
                            Re-enprime Resi
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setIsDetailsOpen(false)}
                            className="bg-slate-800 border-white/10 text-white hover:bg-slate-700"
                        >
                            Fermer
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
};

export default SalesHistory;
