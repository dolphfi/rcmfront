import React, { useEffect, useState, useCallback } from 'react';
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
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "components/ui/dialog";
import { Search, Wallet, DollarSign, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import salesService from 'context/api/salesService';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Label } from 'components/ui/label';
import { useSettings } from 'context/SettingsContext';

const CreditManagement: React.FC = () => {
    const { t } = useTranslation();
    const { currency } = useSettings();
    const [credits, setCredits] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCredit, setSelectedCredit] = useState<any>(null);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState<number | ''>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchCredits = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await salesService.getAllCredits();
            setCredits(data);
        } catch (error) {
            console.error('Error fetching credits:', error);
            toast.error(t('credit.msg_load_error'));
        } finally {
            setIsLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchCredits();
    }, [fetchCredits]);

    const handleOpenPayment = (credit: any) => {
        setSelectedCredit(credit);
        const debt = Number(credit.total) - Number(credit.amountPaid);
        setPaymentAmount(debt);
        setIsPaymentOpen(true);
    };

    const handleSettlePayment = async () => {
        if (!selectedCredit || paymentAmount === '') return;
        
        setIsSubmitting(true);
        try {
            await salesService.payCredit(selectedCredit.id, Number(paymentAmount));
            toast.success(t('credit.msg_save_success'));
            setIsPaymentOpen(false);
            fetchCredits();
        } catch (error) {
            console.error('Error settling credit:', error);
            toast.error(t('credit.msg_save_error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredCredits = credits.filter(credit =>
        credit.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        credit.customer?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        credit.customer?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        credit.customer?.phone?.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                        <Wallet className="h-8 w-8 text-yellow-500" />
                        {t('credit.title')}
                    </h2>
                    <p className="text-slate-400">
                        {t('credit.subtitle')}
                    </p>
                </div>
            </div>

            <Card className="bg-slate-900/50 border-white/10 backdrop-blur-xl">
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <CardTitle className="text-white text-lg font-medium">{t('credit.table_title')}</CardTitle>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder={t('credit.search_placeholder')}
                                className="pl-9 bg-slate-800/50 border-white/10 text-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-white/10 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-800/50">
                                <TableRow className="border-white/10 hover:bg-transparent">
                                    <TableHead className="text-slate-300">{t('credit.table_customer')}</TableHead>
                                    <TableHead className="text-slate-300">{t('credit.table_receipt')}</TableHead>
                                    <TableHead className="text-slate-300">Dat Lavant</TableHead>
                                    <TableHead className="text-slate-300">Delè (Due Date)</TableHead>
                                    <TableHead className="text-right text-slate-300">{t('credit.table_total')}</TableHead>
                                    <TableHead className="text-right text-slate-300">{t('credit.table_advance')}</TableHead>
                                    <TableHead className="text-right text-slate-300">{t('credit.table_debt')}</TableHead>
                                    <TableHead className="text-right text-slate-300">{t('credit.table_actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow className="border-white/10">
                                        <TableCell colSpan={8} className="h-24 text-center text-slate-400">
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                {t('credit.loading')}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredCredits.length === 0 ? (
                                    <TableRow className="border-white/10">
                                        <TableCell colSpan={8} className="h-24 text-center text-slate-400">
                                            {t('credit.no_data')}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCredits.map((credit) => {
                                        const debt = Number(credit.total) - Number(credit.amountPaid);
                                        return (
                                            <TableRow key={credit.id} className="border-white/10 hover:bg-white/5 transition-colors">
                                                <TableCell className="text-white font-medium">
                                                    <div className="flex flex-col">
                                                        <span>{credit.customer?.firstName} {credit.customer?.lastName}</span>
                                                        <span className="text-[10px] text-slate-400">{credit.customer?.phone || t('credit.no_phone')}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-slate-300 font-mono text-xs">
                                                    {credit.receiptNumber}
                                                </TableCell>
                                                <TableCell className="text-slate-400 text-xs">
                                                    {format(new Date(credit.createdAt), 'dd/MM/yyyy HH:mm')}
                                                </TableCell>
                                                <TableCell className="text-slate-300 font-medium">
                                                    {credit.dueDate ? (
                                                        <div className="flex flex-col">
                                                            <span>{format(new Date(credit.dueDate), 'dd/MM/yyyy')}</span>
                                                            {new Date(credit.dueDate) < new Date() && (
                                                                <span className="text-[10px] text-rose-500 font-bold uppercase tracking-tighter">Reta (Overdue)</span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-500 italic text-xs">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right text-slate-300">
                                                    {Number(credit.total).toLocaleString()} {currency}
                                                </TableCell>
                                                <TableCell className="text-right text-emerald-400">
                                                    {Number(credit.amountPaid).toLocaleString()} {currency}
                                                </TableCell>
                                                <TableCell className="text-right text-rose-500 font-bold font-mono">
                                                    {debt.toLocaleString()} {currency}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleOpenPayment(credit)}
                                                        className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 gap-1"
                                                    >
                                                        <DollarSign className="h-4 w-4" />
                                                        {t('credit.btn_pay')}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Payment Dialog */}
            <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
                <DialogContent className="bg-slate-900 border-white/10 text-white max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                            {t('credit.dialog_title')}
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            {t('credit.dialog_desc')}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedCredit && (
                        <div className="space-y-4 py-4">
                            <div className="space-y-1 bg-slate-800/50 p-3 rounded-lg border border-white/5">
                                <Label className="text-xs text-slate-400 uppercase tracking-wider">{t('credit.table_customer')}</Label>
                                <p className="text-white font-medium">{selectedCredit.customer?.firstName} {selectedCredit.customer?.lastName}</p>
                                <p className="text-xs text-slate-500">{t('credit.table_receipt')}: {selectedCredit.receiptNumber}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1 bg-slate-800/30 p-2 rounded-md border border-white/5">
                                    <Label className="text-[10px] text-slate-400 uppercase">{t('credit.table_total')}</Label>
                                    <p className="text-sm text-white font-mono">{Number(selectedCredit.total).toLocaleString()} {currency}</p>
                                </div>
                                <div className="space-y-1 bg-slate-800/30 p-2 rounded-md border border-white/5">
                                    <Label className="text-[10px] text-slate-400 uppercase">{t('credit.table_debt')}</Label>
                                    <p className="text-2xl font-bold text-emerald-400">{(Number(selectedCredit.total) - Number(selectedCredit.amountPaid)).toLocaleString()} {currency}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="amount" className="text-sm font-medium text-slate-300">{t('credit.label_amount')}</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                                    <Input
                                        id="amount"
                                        type="number"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value ? Number(e.target.value) : '')}
                                        className="pl-9 bg-slate-800/50 border-white/10 text-white text-lg h-12 focus:ring-emerald-500"
                                        autoFocus
                                    />
                                </div>
                                <p className="text-[10px] text-slate-500 italic">
                                    {t('credit.payment_hint', { amount: (Number(selectedCredit.amountPaid)).toLocaleString() })}
                                </p>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsPaymentOpen(false)}
                            className="bg-transparent border-white/10 text-white hover:bg-white/5 flex-1"
                        >
                            {t('credit.btn_cancel')}
                        </Button>
                        <Button
                            onClick={handleSettlePayment}
                            disabled={isSubmitting || paymentAmount === '' || Number(paymentAmount) <= 0}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <ArrowRight className="h-4 w-4 mr-2" />
                            )}
                            {t('credit.btn_validate')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CreditManagement;
