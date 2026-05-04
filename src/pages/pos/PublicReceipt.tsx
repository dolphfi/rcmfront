import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";
import { ShoppingCart, Calendar, User, Store, ArrowLeft, Download, CheckCircle2 } from "lucide-react";
import salesService from '../../context/api/salesService';
import { useSettings } from '../../context/SettingsContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

const PublicReceipt: React.FC = () => {
    const { receiptNo } = useParams<{ receiptNo: string }>();
    const [sale, setSale] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { currency } = useSettings();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchReceipt = async () => {
            if (!receiptNo) return;
            try {
                const data = await salesService.findByReceiptNo(receiptNo);
                setSale(data);
            } catch (error) {
                console.error('Failed to fetch receipt:', error);
                toast.error('Resi sa a pa jwenn nan sistèm nan.');
            } finally {
                setLoading(false);
            }
        };

        fetchReceipt();
    }, [receiptNo]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-white">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-muted-foreground">Ap chache detay resi a...</p>
                </div>
            </div>
        );
    }

    if (!sale) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-white p-6">
                <Card className="max-w-md w-full bg-background border-border text-center p-8">
                    <div className="bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingCart className="text-red-500 h-8 w-8" />
                    </div>
                    <CardTitle className="text-2xl text-white mb-2">Resi pa jwenn</CardTitle>
                    <p className="text-muted-foreground mb-6">Nou pa jwenn okenn tranzaksyon ki gen nimewo resi sa a (# {receiptNo}).</p>
                    <Button onClick={() => navigate('/')} className="w-full bg-blue-600 hover:bg-blue-700">
                        Retounen nan Akèy
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-10 px-4 flex justify-center">
            <div className="max-w-2xl w-full space-y-6">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" onClick={() => navigate('/')} className="text-muted-foreground hover:text-white flex gap-2 items-center">
                        <ArrowLeft className="h-4 w-4" /> Retounen
                    </Button>
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 px-3 py-1 flex gap-2 items-center">
                        <CheckCircle2 className="h-4 w-4" /> Tranzaksyon Verifye
                    </Badge>
                </div>

                <Card className="bg-background border-border shadow-2xl overflow-hidden">
                    <div className="h-2 bg-blue-600 w-full" />
                    <CardHeader className="text-center pb-2">
                        <div className="flex justify-center mb-4">
                            <div className="bg-blue-600/20 p-3 rounded-2xl">
                                <Store className="h-10 w-10 text-blue-500" />
                            </div>
                        </div>
                        <CardTitle className="text-3xl font-bold text-white uppercase tracking-wider">
                            {sale.pos?.name || 'Magazen Kolabo'}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground text-lg">Resi Ofisyèl # {sale.receiptNumber}</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4 py-4 px-2 bg-muted rounded-xl border border-border">
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest flex items-center gap-1">
                                    <Calendar className="h-3 w-3" /> Dat Tranzaksyon
                                </p>
                                <p className="text-white font-medium">{new Date(sale.createdAt).toLocaleString('fr-HT')}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest flex items-center gap-1">
                                    <User className="h-3 w-3" /> Kliyan
                                </p>
                                <p className="text-white font-medium">{sale.customer ? `${sale.customer.firstName} ${sale.customer.lastName}` : 'Walk-in Customer'}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-white font-bold flex items-center gap-2">
                                <ShoppingCart className="h-4 w-4 text-blue-500" /> Detay Atik yo
                            </h3>
                            <div className="space-y-3">
                                {sale.items?.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center group">
                                        <div className="flex gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-muted border border-border flex items-center justify-center text-xs text-muted-foreground group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-colors">
                                                {item.qty}x
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{item.name}</p>
                                                <p className="text-xs text-muted-foreground">{item.price.toLocaleString()} {currency} pa inite</p>
                                            </div>
                                        </div>
                                        <p className="text-white font-semibold">{(item.price * item.qty).toLocaleString()} {currency}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Separator className="bg-muted" />

                        <div className="space-y-3 bg-muted p-4 rounded-xl border border-border">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Sou-Total</span>
                                <span>{sale.subtotal.toLocaleString()} {currency}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Taks (10%)</span>
                                <span>{sale.tax.toLocaleString()} {currency}</span>
                            </div>
                            {sale.discount > 0 && (
                                <div className="flex justify-between text-red-400 font-medium">
                                    <span>Rabè</span>
                                    <span>- {sale.discount.toLocaleString()} {currency}</span>
                                </div>
                            )}
                            <Separator className="bg-muted" />
                            <div className="flex justify-between text-white text-2xl font-bold pt-2">
                                <span>TOTAL</span>
                                <span className="text-blue-500">{sale.total.toLocaleString()} {currency}</span>
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-center gap-4 pt-6 text-center">
                            <div className="space-y-1">
                                <p className="text-muted-foreground text-sm">Metòd Pèman: <span className="text-white font-bold">{sale.paymentMethod}</span></p>
                                {sale.paymentMethod === 'CREDIT' && sale.dueDate && (
                                    <p className="text-rose-400 text-sm font-bold">Dat limit pou peye: {format(new Date(sale.dueDate), 'dd/MM/yyyy')}</p>
                                )}
                                {sale.isPaid ? (
                                    <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30 border-none px-4 py-1">PEYE NÈT</Badge>
                                ) : (
                                    <Badge className="bg-red-500/20 text-red-500 hover:bg-red-500/30 border-none px-4 py-1">KI POKO FINI PEYE</Badge>
                                )}
                            </div>
                            
                            <p className="text-muted-foreground text-xs italic mt-4 max-w-sm">
                                Mèsi dèske ou chwazi {sale.pos?.name || 'Magazen Kolabo'}. Resi sa a sèvi kòm prèv tranzaksyon legal.
                            </p>
                        </div>
                    </CardContent>
                    
                    <div className="bg-blue-600/10 p-4 flex justify-center border-t border-border">
                        <Button variant="outline" className="bg-muted border-border text-white hover:bg-muted flex gap-2">
                            <Download className="h-4 w-4" /> Telechaje PDF
                        </Button>
                    </div>
                </Card>
                
                <div className="text-center text-muted-foreground text-[10px] uppercase tracking-widest pb-10">
                    Sistèm POS devlope pa Kolabo Tech
                </div>
            </div>
        </div>
    );
};

export default PublicReceipt;
