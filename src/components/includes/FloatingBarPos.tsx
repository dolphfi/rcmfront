import { Button } from '../ui/button';
import {
    Pause,
    ShoppingCart,
    RotateCcw,
    Receipt,
    Eye,
    History,
    Store,
    User,
    ShoppingBag,
    CreditCard,
    Loader2
} from 'lucide-react';
import { UserNav } from './UserAvatar';
import { useState, useEffect } from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "../ui/sheet";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "../ui/dialog";
import { useAuth } from 'context/AuthContext';
import { format } from 'date-fns';
import { toast } from 'sonner';
import salesService from 'context/api/salesService';
import proformaService from 'context/api/proformaService';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';

export default function FloatingBarPos() {
    const { user } = useAuth();

    // Panel States
    const [isHoldOpen, setIsHoldOpen] = useState(false);
    const [isSalesOpen, setIsSalesOpen] = useState(false);
    const [isReturnsOpen, setIsReturnsOpen] = useState(false);
    const [isTransactionsOpen, setIsTransactionsOpen] = useState(false);

    // Data States
    const [sales, setSales] = useState<any[]>([]);
    const [proformas, setProformas] = useState<any[]>([]);
    const [isLoadingSales, setIsLoadingSales] = useState(false);
    const [isLoadingProformas, setIsLoadingProformas] = useState(false);

    // Details & Print States
    const [selectedSale, setSelectedSale] = useState<any>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);

    const handleViewDetails = (sale: any) => {
        setSelectedSale(sale);
        setIsDetailsOpen(true);
    };

    useEffect(() => {
        if (isSalesOpen || isTransactionsOpen) {
            fetchSales();
        }
    }, [isSalesOpen, isTransactionsOpen]);

    useEffect(() => {
        if (isHoldOpen) {
            fetchProformas();
        }
    }, [isHoldOpen]);

    const fetchSales = async () => {
        setIsLoadingSales(true);
        try {
            const data = await salesService.findAll();
            // Filter by current POS
            const filteredData = data.filter((sale: any) => sale.posId === user?.posId);
            // Sort by most recent
            filteredData.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            setSales(filteredData);
        } catch (error) {
            console.error('Error fetching sales:', error);
            toast.error("Impossible de charger l'historique des ventes");
        } finally {
            setIsLoadingSales(false);
        }
    };

    const fetchProformas = async () => {
        setIsLoadingProformas(true);
        try {
            const data = await proformaService.findAll();
            const now = new Date();
            // Filter by current POS, pending status, and not expired
            const filteredData = data.filter((proforma: any) => {
                const isNotExpired = new Date(proforma.expiresAt) >= new Date(now.setHours(0, 0, 0, 0));
                return proforma.posId === user?.posId && proforma.status === 'PENDING' && isNotExpired;
            });
            // Sort by most recent
            filteredData.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            setProformas(filteredData);
        } catch (error) {
            console.error('Error fetching proformas:', error);
            toast.error("Impossible de charger les ventes en attente");
        } finally {
            setIsLoadingProformas(false);
        }
    };

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
        <div className="py-2 sm:py-3 px-2 sm:px-4 border-t border-white/10 bg-black/40 backdrop-blur-xl z-30">
            <div className="flex items-center justify-between gap-2">
                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap flex-1">
                    {/* Hold Button */}
                    <Button
                        onClick={() => setIsHoldOpen(true)}
                        className="bg-slate-900 border border-white/10 hover:bg-orange-800 text-white gap-2 h-9 sm:h-10 px-3 sm:px-6 shadow-lg relative"
                        title="Hold Order"
                    >
                        <Pause className="h-4 w-4" />
                        <span className="font-medium hidden sm:inline">Vente en Attente</span>
                    </Button>

                    {/* View Orders Button */}
                    <Button
                        onClick={() => setIsSalesOpen(true)}
                        className="bg-slate-900 border border-white/10 hover:bg-slate-800 text-white gap-2 h-9 sm:h-10 px-3 sm:px-6 shadow-lg"
                        title="View Orders"
                    >
                        <ShoppingCart className="h-4 w-4" />
                        <span className="font-medium hidden sm:inline">Mes Ventes</span>
                    </Button>

                    {/* Return Button */}
                    <Button
                        onClick={() => setIsReturnsOpen(true)}
                        className="bg-slate-900 border border-white/10 hover:bg-blue-700 text-white gap-2 h-9 sm:h-10 px-3 sm:px-6 shadow-lg"
                        title="Reset"
                    >
                        <RotateCcw className="h-4 w-4" />
                        <span className="font-medium hidden sm:inline">Retour</span>
                    </Button>

                    {/* Transaction Button */}
                    <Button
                        onClick={() => setIsTransactionsOpen(true)}
                        className="bg-slate-900 border border-white/10 hover:bg-rose-700 text-white gap-2 h-9 sm:h-10 px-3 sm:px-6 shadow-lg"
                        title="Transaction"
                    >
                        <Receipt className="h-4 w-4" />
                        <span className="font-medium hidden sm:inline">Mes Transactions</span>
                    </Button>
                </div>

                {/* User Avatar - Mobile Only */}
                <div className="sm:hidden">
                    <UserNav />
                </div>
            </div>

            {/* Slide-out Panels */}

            {/* Vente en Attente (Hold Orders) */}
            <Sheet open={isHoldOpen} onOpenChange={setIsHoldOpen}>
                <SheetContent side="right" className="w-[400px] sm:w-[540px] bg-slate-900 border-l border-white/10 text-white p-0 flex flex-col h-full">
                    <SheetHeader className="p-4 border-b border-white/10 shrink-0">
                        <SheetTitle className="text-white text-lg flex items-center gap-2">
                            <Pause className="h-5 w-5 text-orange-400" />
                            Ventes en Attente
                        </SheetTitle>
                        <SheetDescription className="text-slate-400">
                            Vos ventes mises en attente pour ce point de vente.
                        </SheetDescription>
                    </SheetHeader>
                    <ScrollArea className="flex-1 p-4">
                        <div className="flex flex-col gap-3">
                            {isLoadingProformas ? (
                                <div className="text-center text-slate-500 py-8 italic text-sm animate-pulse">
                                    Chargement des ventes en attente...
                                </div>
                            ) : proformas.length === 0 ? (
                                <div className="text-center text-slate-500 py-8 italic text-sm bg-white/5 rounded-lg border border-dashed border-white/10">
                                    Aucune vente en attente trouvée pour ce poste.
                                </div>
                            ) : (
                                proformas.map((proforma) => (
                                    <div key={proforma.id} className="bg-slate-800/50 border border-white/10 rounded-lg p-3 hover:bg-slate-800 transition-colors group">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className="font-mono text-xs text-orange-400 block mb-1">{proforma.proformaNumber}</span>
                                                <h4 className="font-medium text-sm text-white">Client: {proforma.customer?.name || 'Walk-in'}</h4>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs text-slate-400 block mb-1">{format(new Date(proforma.createdAt), 'dd/MM/yyyy HH:mm')}</span>
                                                <span className="font-bold text-orange-400">{Number(proforma.total).toLocaleString()} HTG</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                                            <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/20 text-[10px]">
                                                {proforma.items?.length || 0} Articles
                                            </Badge>
                                            <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white h-7 text-xs">
                                                Convertir en Vente
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </SheetContent>
            </Sheet>

            {/* Mes Ventes (Sales) */}
            <Sheet open={isSalesOpen} onOpenChange={setIsSalesOpen}>
                <SheetContent side="right" className="w-[400px] sm:w-[540px] bg-slate-900 border-l border-white/10 text-white p-0 flex flex-col h-full">
                    <SheetHeader className="p-4 border-b border-white/10 shrink-0">
                        <SheetTitle className="text-white text-lg flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5 text-emerald-400" />
                            Mes Ventes
                        </SheetTitle>
                        <SheetDescription className="text-slate-400">
                            Historique des ventes récentes effectuées à votre poste.
                        </SheetDescription>
                    </SheetHeader>
                    <ScrollArea className="flex-1 p-4">
                        <div className="flex flex-col gap-3">
                            {isLoadingSales ? (
                                <div className="text-center text-slate-500 py-8 italic text-sm animate-pulse">
                                    Chargement de vos ventes...
                                </div>
                            ) : sales.length === 0 ? (
                                <div className="text-center text-slate-500 py-8 italic text-sm bg-white/5 rounded-lg border border-dashed border-white/10">
                                    Aucune vente trouvée pour ce poste.
                                </div>
                            ) : (
                                sales.map((sale) => (
                                    <div key={sale.id} className="bg-slate-800/50 border border-white/10 rounded-lg p-3 hover:bg-slate-800 transition-colors group">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className="font-mono text-xs text-emerald-400 block mb-1">{sale.receiptNumber}</span>
                                                <h4 className="font-medium text-sm text-white">Client: {sale.customer?.name || 'Walk-in'}</h4>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs text-slate-400 block mb-1">{format(new Date(sale.createdAt), 'dd/MM/yyyy HH:mm')}</span>
                                                <span className="font-bold text-emerald-400">{Number(sale.total).toLocaleString()} HTG</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                                            <div className="flex gap-2">
                                                <Badge variant="outline" className="bg-slate-500/10 text-slate-400 border-slate-500/20 text-[10px]">
                                                    {sale.items?.length || 0} Articles
                                                </Badge>
                                                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] uppercase">
                                                    {sale.paymentMethod}
                                                </Badge>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-7 p-0 text-slate-400 hover:text-white hover:bg-white/10"
                                                onClick={() => handleViewDetails(sale)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </SheetContent>
            </Sheet>

            {/* Retour (Returns) */}
            <Sheet open={isReturnsOpen} onOpenChange={setIsReturnsOpen}>
                <SheetContent side="right" className="w-[400px] sm:w-[540px] bg-slate-900 border-l border-white/10 text-white p-0 flex flex-col h-full">
                    <SheetHeader className="p-4 border-b border-white/10 shrink-0">
                        <SheetTitle className="text-white text-lg flex items-center gap-2">
                            <RotateCcw className="h-5 w-5 text-blue-400" />
                            Retours de Produits
                        </SheetTitle>
                        <SheetDescription className="text-slate-400">
                            Gérer les retours de produits pour vos ventes.
                        </SheetDescription>
                    </SheetHeader>
                    <ScrollArea className="flex-1 p-4">
                        <div className="flex flex-col gap-4">
                            <div className="text-center text-slate-500 py-8 italic text-sm bg-white/5 rounded-lg border border-dashed border-white/10">
                                Module de retours et remboursements à venir.
                            </div>
                        </div>
                    </ScrollArea>
                </SheetContent>
            </Sheet>

            {/* Mes Transactions */}
            <Sheet open={isTransactionsOpen} onOpenChange={setIsTransactionsOpen}>
                <SheetContent side="right" className="w-[400px] sm:w-[540px] bg-slate-900 border-l border-white/10 text-white p-0 flex flex-col h-full">
                    <SheetHeader className="p-4 border-b border-white/10 shrink-0">
                        <SheetTitle className="text-white text-lg flex items-center gap-2">
                            <Receipt className="h-5 w-5 text-rose-400" />
                            Mes Transactions
                        </SheetTitle>
                        <SheetDescription className="text-slate-400">
                            Détails des transactions financières de la caisse.
                        </SheetDescription>
                    </SheetHeader>
                    <ScrollArea className="flex-1 p-4">
                        <div className="flex flex-col gap-3">
                            {isLoadingSales ? (
                                <div className="text-center text-slate-500 py-8 italic text-sm animate-pulse">
                                    Chargement des transactions...
                                </div>
                            ) : sales.length === 0 ? (
                                <div className="text-center text-slate-500 py-8 italic text-sm bg-white/5 rounded-lg border border-dashed border-white/10">
                                    Aucune transaction trouvée.
                                </div>
                            ) : (
                                sales.map((sale) => (
                                    <div key={`trans-${sale.id}`} className="flex items-center justify-between p-3 border-b border-white/5 hover:bg-white/5 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                                                <History className="h-4 w-4 text-rose-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white">{sale.receiptNumber}</p>
                                                <p className="text-xs text-slate-400">{format(new Date(sale.createdAt), 'dd MMMM yyyy, HH:mm')}</p>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-2">
                                            <div>
                                                <p className="text-sm font-bold text-rose-400">+{Number(sale.total).toLocaleString()} HTG</p>
                                                <p className="text-xs text-slate-400 uppercase">{sale.paymentMethod}</p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-7 p-0 text-slate-400 hover:text-white hover:bg-white/10"
                                                onClick={() => handleViewDetails(sale)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </SheetContent>
            </Sheet>

            {/* Sale Details & Reprint Dialog */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] p-0 flex flex-col bg-slate-900 border-white/10 text-white gap-0">
                    <DialogHeader className="p-6 shrink-0 bg-slate-900/50 border-b border-white/5 pb-4">
                        <DialogTitle className="text-2xl font-bold flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <Receipt className="h-6 w-6 text-emerald-500" />
                                Reçu {selectedSale?.receiptNumber}
                            </span>
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-sm py-1">
                                {selectedSale?.status}
                            </Badge>
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 text-base">
                            Détails complets de la transaction.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedSale && (
                        <ScrollArea className="flex-1 px-6 py-4">
                            <div className="space-y-6">
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
                                                <span className="text-white">{selectedSale.customer?.name || 'Walk-in'}</span>
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
                                    <div className="bg-slate-800/30 rounded-lg border border-white/5 overflow-hidden p-3 text-sm">
                                        {selectedSale.items?.map((item: any, index: number) => (
                                            <div key={index} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0 hover:bg-white/5 rounded px-2">
                                                <div className="flex-1 font-medium text-slate-200">
                                                    {item.qty}x {item.name}
                                                </div>
                                                <div className="w-1/4 text-right text-slate-300 hidden sm:block">
                                                    {Number(item.price).toLocaleString()} HTG
                                                </div>
                                                <div className="w-1/4 text-right text-emerald-400 font-medium">
                                                    {Number(item.total).toLocaleString()} HTG
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Totals */}
                                <div className="flex justify-end pt-4 border-t border-white/5">
                                    <div className="w-full md:w-1/2 space-y-2">
                                        <div className="flex justify-between text-sm text-slate-400">
                                            <span>Sous-total:</span>
                                            <span>{Number(selectedSale.subtotal).toLocaleString()} HTG</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-slate-400">
                                            <span>Taxes:</span>
                                            <span>{Number(selectedSale.tax).toLocaleString()} HTG</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-orange-400">
                                            <span>Rabais:</span>
                                            <span>-{Number(selectedSale.discount).toLocaleString()} HTG</span>
                                        </div>
                                        <div className="flex justify-between items-center text-lg font-bold text-white pt-2 border-t border-white/10 mt-2">
                                            <span>Total Payé:</span>
                                            <span className="text-emerald-400">{Number(selectedSale.total).toLocaleString()} HTG</span>
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
}