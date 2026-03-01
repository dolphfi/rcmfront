import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import {
    Printer,
    ArrowLeft,
    Download,
    FileText,
    Calendar,
    User,
    MapPin,
    Info,
    RotateCw
} from 'lucide-react';
import { Button } from 'components/ui/button';
import { Card, CardContent } from 'components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'components/ui/table';
import { Badge } from 'components/ui/badge';
import proformaService from 'context/api/proformaService';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ProformaDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [proforma, setProforma] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    useEffect(() => {
        if (id) {
            fetchProformaDetails();
        }
    }, [id]);

    const fetchProformaDetails = async () => {
        setIsLoading(true);
        try {
            const data = await proformaService.findOne(id!);
            setProforma(data);
        } catch (error) {
            console.error('Error fetching proforma details:', error);
            toast.error(t("proforma.error_fetch_details"));
            navigate('/proforma/list');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        const element = document.getElementById('printable-proforma');
        if (!element) return;

        setIsGeneratingPDF(true);
        try {
            const canvas = await html2canvas(element, {
                scale: 3, // Higher scale for better print quality
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                onclone: (clonedDoc) => {
                    const clonedElement = clonedDoc.getElementById('printable-proforma');
                    if (clonedElement) {
                        clonedElement.style.padding = '40px';
                        clonedElement.style.backgroundColor = 'white';
                        clonedElement.style.width = '1000px';

                        // Hide everything else in the cloned document
                        const layoutElements = clonedDoc.querySelectorAll('.sidebar-container, .topbar-container, .no-print, aside, nav, button');
                        layoutElements.forEach((el: any) => {
                            el.style.display = 'none';
                            el.style.visibility = 'hidden';
                        });

                        // Force light theme
                        const allElements = clonedElement.querySelectorAll('*');
                        allElements.forEach((el: any) => {
                            if (!el.classList.contains('text-blue-500') && !el.classList.contains('bg-blue-600')) {
                                el.style.color = 'black';
                            }
                            if (el.classList.contains('bg-slate-900/50') || el.classList.contains('bg-slate-800/50')) {
                                el.style.backgroundColor = 'transparent';
                                el.style.border = '1px solid #e2e8f0';
                            }
                            if (el.classList.contains('border-white/10')) {
                                el.style.borderColor = '#e2e8f0';
                            }
                        });
                    }
                }
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'in',
                format: 'letter'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`proforma-${proforma.proformaNumber}.pdf`);
            toast.success(t('proforma.pdf_download_success') || 'PDF telechaje ak siksè');
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error(t('proforma.pdf_download_error') || 'Erè pandan jenerasyon PDF a');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <RotateCw className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!proforma) return null;

    const subtotal = proforma.items.reduce((acc: number, item: any) => acc + (item.price * item.qty), 0);
    const tax = subtotal * 0.10; // Assuming 10% tax for display
    const discount = parseFloat(proforma.discount || 0);
    const total = subtotal + tax - discount;

    return (
        <div className="space-y-6 pb-12">
            {/* Header / Actions - Hidden on Print */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        className="text-slate-400 hover:text-white"
                        onClick={() => navigate('/proforma/list')}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        {t('common.back')}
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                            <FileText className="h-8 w-8 text-blue-500" />
                            {t('proforma.title_details')}
                        </h2>
                        <p className="text-slate-400">{proforma.proformaNumber}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        className="bg-slate-800 border-white/10 text-white gap-2"
                        onClick={handleDownloadPDF}
                        disabled={isGeneratingPDF}
                    >
                        {isGeneratingPDF ? (
                            <RotateCw className="h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="h-4 w-4" />
                        )}
                        {isGeneratingPDF ? t('common.loading') : t('common.download')}
                    </Button>
                    <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                        <Printer className="h-4 w-4" />
                        {t('proforma.print_button')}
                    </Button>
                </div>
            </div>

            {/* Proforma View / Print Content */}
            <div className="print:m-0 print:p-0 print:bg-white print:text-black" id="printable-proforma">
                <Card className="bg-slate-900/50 border-white/10 backdrop-blur-xl print:border-none print:shadow-none print:bg-white overflow-hidden">
                    <CardContent className="p-8 md:p-12 print:p-4">
                        {/* Company Branding & Proforma Info */}
                        <div className="flex flex-col md:flex-row justify-between gap-8 mb-12 border-b border-white/10 print:border-slate-200 pb-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                                        <FileText className="text-white h-7 w-7" />
                                    </div>
                                    <h1 className="text-2xl font-bold text-white print:text-black tracking-tight">KOLABO POS</h1>
                                </div>
                                <div className="text-slate-400 print:text-slate-600 space-y-1 text-sm">
                                    <p>123 Ri Mirak, Pòtoprens</p>
                                    <p>Ayiti</p>
                                    <p>Telefòn: +509 1234-5678</p>
                                    <p>Email: contact@kolabopos.com</p>
                                </div>
                            </div>
                            <div className="text-right space-y-2">
                                <h1 className="text-4xl font-black text-blue-500 print:text-blue-600 uppercase tracking-tighter">DEVIS</h1>
                                <div className="space-y-1">
                                    <p className="text-white print:text-black font-bold"># {proforma.proformaNumber}</p>
                                    <p className="text-slate-400 print:text-slate-600 text-sm">
                                        {t('proforma.date') || 'Dat'}: {format(new Date(proforma.createdAt), 'dd MMMM yyyy')}
                                    </p>
                                    <p className="text-slate-400 print:text-slate-600 text-sm">
                                        {t('proforma.table_expiry') || 'Espirasyon'}: {format(new Date(proforma.expiresAt), 'dd MMMM yyyy')}
                                    </p>
                                    <Badge className="bg-blue-500/20 text-blue-500 border-none print:border print:border-blue-200">
                                        {t(`proforma.status_${proforma.status.toLowerCase()}`)}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Customer & POS Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12 text-left">
                            <div className="space-y-4 text-left">
                                <h3 className="text-slate-400 print:text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                    <User className="h-3 w-3" />
                                    {t('proforma.bill_to') || 'Bile nan'}
                                </h3>
                                <div className="space-y-1 text-left">
                                    <p className="text-xl font-bold text-white print:text-black">
                                        {proforma.customer ? `${proforma.customer.firstName} ${proforma.customer.lastName}` : t('proforma.direct_sale')}
                                    </p>
                                    {proforma.customer && (
                                        <>
                                            <p className="text-slate-400 print:text-slate-600">{proforma.customer.email || '-'}</p>
                                            <p className="text-slate-400 print:text-slate-600">{proforma.customer.phone || '-'}</p>
                                            <p className="text-slate-400 print:text-slate-600">{proforma.customer.address || '-'}</p>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-4 text-left md:text-right">
                                <h3 className="text-slate-400 print:text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center justify-start md:justify-end gap-2">
                                    <MapPin className="h-3 w-3" />
                                    {t('proforma.location') || 'Lokalizasyon'}
                                </h3>
                                <div className="space-y-1 text-left md:text-right">
                                    <p className="text-lg font-bold text-white print:text-black">{proforma.pos?.name || '-'}</p>
                                    <p className="text-slate-400 print:text-slate-600 text-sm">
                                        {proforma.pos?.address || t('common.no_address')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="mb-12">
                            <Table className="print:border">
                                <TableHeader className="bg-slate-800/50 print:bg-slate-100">
                                    <TableRow className="border-white/10 print:border-slate-200">
                                        <TableHead className="text-slate-300 print:text-black font-bold">{t('proforma.item_description') || 'Deskripsyon'}</TableHead>
                                        <TableHead className="text-center text-slate-300 print:text-black font-bold">{t('proforma.item_qty') || 'Kte'}</TableHead>
                                        <TableHead className="text-right text-slate-300 print:text-black font-bold">{t('proforma.item_price') || 'Pri'}</TableHead>
                                        <TableHead className="text-right text-slate-300 print:text-black font-bold">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {proforma.items.map((item: any, idx: number) => (
                                        <TableRow key={idx} className="border-white/10 print:border-slate-200">
                                            <TableCell className="text-white print:text-black font-medium">{item.name}</TableCell>
                                            <TableCell className="text-center text-slate-400 print:text-black">{item.qty}</TableCell>
                                            <TableCell className="text-right text-slate-400 print:text-black">{Number(item.price).toFixed(2)} HTG</TableCell>
                                            <TableCell className="text-right text-white print:text-black font-bold">{(item.price * item.qty).toFixed(2)} HTG</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Totals Summary */}
                        <div className="flex flex-col md:flex-row justify-between gap-12">
                            <div className="flex-1 space-y-4">
                                <div className="bg-slate-800/30 print:bg-slate-50 p-6 rounded-xl border border-white/5 print:border-slate-100 italic text-slate-400 print:text-slate-600 text-sm">
                                    <div className="flex items-center gap-2 mb-2 font-bold text-slate-300 print:text-black uppercase tracking-widest text-[10px]">
                                        <Info className="h-3 w-3 text-blue-400" />
                                        {t('proforma.notes') || 'Nòt'}
                                    </div>
                                    <p>Sa a se yon devis ki valab pou {format(new Date(proforma.expiresAt), 'dd/MM/yyyy')}. Pri yo ka chanje apre dat sa a. Mèsi pou konfyans ou.</p>
                                </div>
                            </div>
                            <div className="w-full md:w-80 space-y-3">
                                <div className="flex items-center justify-between text-slate-400 print:text-slate-600">
                                    <span>{t('proforma.subtotal') || 'Soutotal'}</span>
                                    <span>{subtotal.toFixed(2)} HTG</span>
                                </div>
                                <div className="flex items-center justify-between text-slate-400 print:text-slate-600">
                                    <span>Tax (10%)</span>
                                    <span>{tax.toFixed(2)} HTG</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex items-center justify-between text-rose-400 print:text-rose-600">
                                        <span>{t('proforma.discount')}</span>
                                        <span>-{discount.toFixed(2)} HTG</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between py-4 border-t border-white/10 print:border-slate-200">
                                    <span className="text-xl font-bold text-white print:text-black">{t('proforma.table_total') || 'Total'}</span>
                                    <span className="text-2xl font-black text-blue-500 print:text-blue-600">{total.toFixed(2)} HTG</span>
                                </div>
                            </div>
                        </div>

                        {/* Signatures */}
                        <div className="mt-20 grid grid-cols-2 gap-12 print:visible hidden print:grid">
                            <div className="text-center space-y-12">
                                <div className="border-t border-slate-300 pt-2 text-slate-600 text-sm">Responsab Vant</div>
                            </div>
                            <div className="text-center space-y-12">
                                <div className="border-t border-slate-300 pt-2 text-slate-600 text-sm">Akseptasyon Kliyan</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page {
                        size: letter;
                        margin: 0.5in;
                    }
                    /* Reset entire layout for clean print */
                    body, html {
                        background: white !important;
                        color: black !important;
                        height: auto !important;
                        overflow: visible !important;
                        width: 100% !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    /* Aggressively hide layout containers */
                    .layout-container, 
                    .sidebar-container, 
                    .topbar-container, 
                    .no-print, 
                    header, nav, footer, aside, button,
                    [role="navigation"], .print\\:hidden {
                        display: none !important;
                        visibility: hidden !important;
                        position: absolute !important;
                        top: -9999px !important;
                        left: -9999px !important;
                        height: 0 !important;
                        width: 0 !important;
                    }

                    /* Ensure printable area is top-level and full-width */
                    #printable-proforma {
                        display: block !important;
                        position: static !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                        border: none !important;
                        box-shadow: none !important;
                    }

                    /* Expand main container to bypass overflow-hidden */
                    main, div.flex-1 {
                        display: block !important;
                        overflow: visible !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        height: auto !important;
                        min-height: 100% !important;
                    }
                    
                    /* Reset dark background gradients common in the app */
                    .bg-gradient-to-br, .from-black, .via-gray-900, .to-slate-900 {
                        background: white !important;
                    }
                }
            ` }} />
        </div>
    );
};

export default ProformaDetails;
