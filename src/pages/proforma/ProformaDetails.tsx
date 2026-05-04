import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import {
    Printer,
    ArrowLeft,
    Download,
    FileText,
    User,
    MapPin,
    Info,
    RotateCw,
    Store,
    Wrench,
    CreditCard
} from 'lucide-react';
import { Button } from 'components/ui/button';
import { Card, CardContent } from 'components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'components/ui/table';
import proformaService from 'context/api/proformaService';
import settingsService from 'context/api/settingsService';
import { toast } from 'sonner';
import { useSettings } from 'context/SettingsContext';
import jsPDF from 'jspdf';

interface BusinessSettings {
    businessName: string;
    businessAddress: string;
    businessPhone: string;
    businessEmail: string;
    businessLogo: string;
    businessSlogan: string;
    businessBankInfo: string;
}

const ProformaDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [proforma, setProforma] = useState<any | null>(null);
    const { currency } = useSettings();
    const [isLoading, setIsLoading] = useState(true);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [business, setBusiness] = useState<BusinessSettings>({
        businessName: 'KOLABO POS',
        businessAddress: '',
        businessPhone: '',
        businessEmail: '',
        businessLogo: '',
        businessSlogan: '',
        businessBankInfo: '',
    });

    const fetchBusinessSettings = useCallback(async () => {
        try {
            const data = await settingsService.getAll();
            // L'API retourne { data: [...] } (paginé)
            const settingsArray: any[] = Array.isArray(data) ? data : (data?.data ?? []);
            const get = (key: string) =>
                settingsArray.find((s: any) => s.key === key)?.value ?? '';
            setBusiness({
                businessName: get('BUSINESS_NAME') || 'KOLABO POS',
                businessAddress: get('BUSINESS_ADDRESS'),
                businessPhone: get('BUSINESS_PHONE'),
                businessEmail: get('BUSINESS_EMAIL'),
                businessLogo: get('BUSINESS_LOGO_URL'),
                businessSlogan: get('BUSINESS_SLOGAN'),
                businessBankInfo: get('BUSINESS_BANK_INFO'),
            });
        } catch (error) {
            // Silencieux — on garde les valeurs par défaut
            console.warn('Could not load business settings:', error);
        }
    }, []);

    const fetchProformaDetails = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await proformaService.findOne(id!);
            setProforma(data);
        } catch (error) {
            console.error('Error fetching proforma details:', error);
            toast.error(t('proforma.error_fetch_details'));
            navigate('/proforma/list');
        } finally {
            setIsLoading(false);
        }
    }, [id, navigate, t]);

    useEffect(() => {
        if (id) {
            fetchProformaDetails();
        }
        fetchBusinessSettings();
    }, [id, fetchProformaDetails, fetchBusinessSettings]);

    const handleDownloadPDF = () => {
        if (!proforma) return;
        setIsGeneratingPDF(true);

        const parsedBankAccounts = (() => {
            try {
                const parsed = JSON.parse(business.businessBankInfo);
                return Array.isArray(parsed) ? parsed : [];
            } catch {
                return [];
            }
        })();

        try {
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const PW = pdf.internal.pageSize.getWidth();   // 210mm
            const PH = pdf.internal.pageSize.getHeight();  // 297mm
            const margin = 14;
            const contentW = PW - margin * 2;
            let y = margin;

            // ─── Helpers ──────────────────────────────────────────────────
            const setFont = (style: 'normal'|'bold'|'italic', size: number, color = '#0f172a') => {
                pdf.setFont('helvetica', style);
                pdf.setFontSize(size);
                const r = parseInt(color.slice(1,3),16);
                const g = parseInt(color.slice(3,5),16);
                const b = parseInt(color.slice(5,7),16);
                pdf.setTextColor(r, g, b);
            };
            const line = (x1: number, y1: number, x2: number, y2: number, color = '#e2e8f0', lw = 0.2) => {
                pdf.setDrawColor(color);
                pdf.setLineWidth(lw);
                pdf.line(x1, y1, x2, y2);
            };
            const rect = (x: number, y: number, w: number, h: number, fillHex: string) => {
                const r = parseInt(fillHex.slice(1,3),16);
                const g = parseInt(fillHex.slice(3,5),16);
                const b = parseInt(fillHex.slice(5,7),16);
                pdf.setFillColor(r, g, b);
                pdf.rect(x, y, w, h, 'F');
            };
            const pill = (x: number, y: number, label: string, bg: string, fg: string) => {
                const w = pdf.getTextWidth(label) + 4;
                rect(x, y - 3, w, 4.5, bg);
                setFont('bold', 7, fg);
                pdf.text(label, x + 2, y);
                return w + 2;
            };

            // ─── LOGO + Business Name ─────────────────────────────────────
            let logoRight = margin;
            if (business.businessLogo) {
                try {
                    pdf.addImage(business.businessLogo, 'PNG', margin, y, 14, 14);
                    logoRight = margin + 16;
                } catch { /* ignore if logo fails */ }
            }
            setFont('bold', 16, '#0f172a');
            pdf.text(business.businessName, logoRight, y + 8);

            if (business.businessSlogan) {
                setFont('italic', 8, '#64748b');
                pdf.text(business.businessSlogan, logoRight, y + 13);
            }

            if (business.businessAddress) {
                setFont('normal', 8, '#64748b');
                pdf.text(business.businessAddress, logoRight, business.businessSlogan ? y + 18 : y + 14);
            }

            const contactParts = [
                business.businessPhone,
                business.businessEmail,
            ].filter(Boolean);
            if (contactParts.length) {
                setFont('normal', 8, '#64748b');
                pdf.text(contactParts.join('  |  '), logoRight, business.businessSlogan ? y + 23 : y + 19);
            }

            // ─── Title block (right-aligned) ──────────────────────────────
            setFont('bold', 20, '#2563eb');
            const titleText = t('proforma.title_details').toUpperCase();
            const titleW = pdf.getTextWidth(titleText);
            pdf.text(titleText, PW - margin - titleW, y + 8);

            setFont('bold', 9, '#0f172a');
            const numText = `# ${proforma.proformaNumber}`;
            pdf.text(numText, PW - margin - pdf.getTextWidth(numText), y + 14);

            setFont('normal', 8, '#64748b');
            const dateText = `${t('proforma.date')}: ${format(new Date(proforma.createdAt), 'dd MMM yyyy')}`;
            pdf.text(dateText, PW - margin - pdf.getTextWidth(dateText), y + 19);

            const expiryText = `${t('proforma.expiry_date')}: ${format(new Date(proforma.expiresAt), 'dd MMM yyyy')}`;
            pdf.text(expiryText, PW - margin - pdf.getTextWidth(expiryText), y + 24);

            // Status + SellType pills
            const statusColors: Record<string,{bg:string,fg:string}> = {
                PENDING:   { bg: '#fef3c7', fg: '#92400e' },
                ACCEPTED:  { bg: '#d1fae5', fg: '#065f46' },
                EXPIRED:   { bg: '#fee2e2', fg: '#991b1b' },
                CANCELLED: { bg: '#f1f5f9', fg: '#475569' },
            };
            const sc = statusColors[proforma.status] ?? statusColors.CANCELLED;
            const statusLabel = t(`proforma.status_${proforma.status.toLowerCase()}`);
            let pillX = PW - margin - pdf.getTextWidth(statusLabel) - 6;
            pill(pillX, y + 30, statusLabel, sc.bg, sc.fg);

            if (proforma.sellType) {
                const stLabel = proforma.sellType === 'SERVICE' ? t('sidebar.services') : t('sidebar.products');
                const stColor = proforma.sellType === 'SERVICE'
                    ? { bg: '#faf5ff', fg: '#7e22ce' }
                    : { bg: '#f0fdf4', fg: '#15803d' };
                pillX -= pdf.getTextWidth(stLabel) + 8;
                pill(pillX, y + 30, stLabel, stColor.bg, stColor.fg);
            }

            y += 36;
            line(margin, y, PW - margin, y, '#2563eb', 0.5);
            y += 6;

            // ─── Bill To / Location ───────────────────────────────────────
            setFont('bold', 7, '#94a3b8');
            pdf.text(t('proforma.bill_to').toUpperCase(), margin, y);
            pdf.text(t('proforma.location').toUpperCase(), PW / 2 + 4, y);
            y += 4;

            const customerName = proforma.customer
                ? `${proforma.customer.firstName} ${proforma.customer.lastName}`
                : t('proforma.walk_in');
            setFont('bold', 11, '#0f172a');
            pdf.text(customerName, margin, y);

            if (proforma.pos?.name) {
                setFont('bold', 11, '#0f172a');
                pdf.text(proforma.pos.name, PW / 2 + 4, y);
            }
            y += 5;

            if (proforma.customer?.phone) {
                setFont('normal', 8, '#64748b');
                pdf.text(proforma.customer.phone, margin, y);
            }

            const posY = y;
            if (proforma.pos?.address) {
                setFont('normal', 8, '#64748b');
                pdf.text(proforma.pos.address, PW / 2 + 4, posY);
            }
            if (proforma.pos?.phone) {
                setFont('normal', 8, '#64748b');
                pdf.text(proforma.pos.phone, PW / 2 + 4, posY + 4);
            }

            y += 10;
            line(margin, y, PW - margin, y);
            y += 5;

            // Bank Details (if available)
            if (parsedBankAccounts.length > 0) {
                setFont('bold', 7, '#94a3b8');
                pdf.text("ENFÒMASYON BANKÈ (BANK DETAILS)", margin, y);
                y += 5;
                
                parsedBankAccounts.forEach((acc: any) => {
                    setFont('bold', 8, '#0f172a');
                    pdf.text(acc.bankName || 'Bank', margin, y);
                    
                    setFont('normal', 8, '#64748b');
                    const accText = `${acc.accountNumber || ''} - ${acc.accountName || ''}`;
                    pdf.text(accText, margin + 25, y);
                    y += 4;
                });
                
                y += 2;
                line(margin, y, PW - margin, y);
                y += 5;
            }

            // ─── Table header ─────────────────────────────────────────────
            const isService = proforma.sellType === 'SERVICE';
            const colDesc  = margin;
            const colCat   = isService ? margin + 70 : 0;
            const colQty   = isService ? margin + 110 : margin + 110;
            const colPrice = isService ? margin + 130 : margin + 130;
            const colTotal = PW - margin;

            rect(margin, y - 3, contentW, 7, '#f1f5f9');
            setFont('bold', 8, '#374151');
            pdf.text(t('proforma.item_description'), colDesc, y);
            if (isService) pdf.text(t('common.category'), colCat, y);
            pdf.text(t('proforma.item_qty'), colQty, y, { align: 'center' });
            pdf.text(t('proforma.item_price'), colPrice, y, { align: 'right' });
            pdf.text(t('proforma.table_total'), colTotal, y, { align: 'right' });
            y += 5;
            line(margin, y, PW - margin, y, '#cbd5e1', 0.3);
            y += 4;

            // ─── Table rows ───────────────────────────────────────────────
            proforma.items.forEach((item: any, idx: number) => {
                if (idx % 2 === 0) rect(margin, y - 3, contentW, 7, '#f8fafc');

                setFont('bold', 9, '#0f172a');
                pdf.text(item.name, colDesc, y, { maxWidth: isService ? 62 : 100 });

                if (isService && item.service?.description) {
                    setFont('italic', 7, '#64748b');
                    const desc = item.service.description.substring(0, 55);
                    pdf.text(desc, colDesc, y + 4);
                    y += 3;
                }
                if (isService && item.service?.category?.name) {
                    const cat = item.service.category.name;
                    pill(colCat, y, cat, '#faf5ff', '#7e22ce');
                }

                setFont('normal', 9, '#374151');
                pdf.text(String(item.qty), colQty, y, { align: 'center' });

                const priceStr = Number(item.price).toLocaleString('en-US', { minimumFractionDigits: 2 }) + ` ${currency}`;
                const totalStr = parseFloat(item.total ?? item.price * item.qty).toLocaleString('en-US', { minimumFractionDigits: 2 }) + ` ${currency}`;
                pdf.text(priceStr, colPrice, y, { align: 'right' });
                setFont('bold', 9, '#0f172a');
                pdf.text(totalStr, colTotal, y, { align: 'right' });

                y += 8;
                line(margin, y - 2, PW - margin, y - 2, '#f1f5f9', 0.2);
            });

            y += 4;
            line(margin, y, PW - margin, y, '#2563eb', 0.3);
            y += 8;  // espas anvan seksyon total

            // ─── Totals block ─────────────────────────────────────────────
            const totalsX = PW / 2;
            const numX = PW - margin;

            const fmtAmt = (n: number) =>
                n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ` ${currency}`;

            const drawTotalLine = (label: string, value: string, bold = false, color = '#374151') => {
                setFont(bold ? 'bold' : 'normal', bold ? 10 : 9, color);
                pdf.text(label, totalsX, y);
                pdf.text(value, numX, y, { align: 'right' });
                y += 7;  // espas ant chak liy
            };

            drawTotalLine(t('proforma.subtotal'), fmtAmt(subtotal));
            if (tax > 0) drawTotalLine(`${t('proforma.tax')} (${taxRate}%)`, fmtAmt(tax));
            if (discount > 0) drawTotalLine(t('proforma.discount'), `-${fmtAmt(discount)}`, false, '#e11d48');

            y += 2;
            line(totalsX, y - 1, numX, y - 1, '#94a3b8', 0.3);
            y += 5;
            rect(totalsX - 3, y - 5, numX - totalsX + 5, 10, '#eff6ff');
            setFont('bold', 12, '#1d4ed8');
            pdf.text(t('proforma.table_total'), totalsX, y);
            pdf.text(fmtAmt(total), numX, y, { align: 'right' });
            y += 12;

            // ─── Notes ────────────────────────────────────────────────────
            if (y < PH - 50) {
                rect(margin, y, contentW, 18, '#f8fafc');
                setFont('bold', 7, '#94a3b8');
                pdf.text(t('proforma.notes').toUpperCase(), margin + 2, y + 5);
                setFont('normal', 8, '#64748b');
                const note = t('proforma.notes_text', {
                    date: format(new Date(proforma.expiresAt), 'dd/MM/yyyy')
                });
                const noteLines = pdf.splitTextToSize(note, contentW - 4);
                pdf.text(noteLines, margin + 2, y + 10);
                y += 22;
            }


            // ─── Footer ───────────────────────────────────────────────────
            setFont('normal', 7, '#94a3b8');
            const footer = `${business.businessName} — ${proforma.proformaNumber}`;
            pdf.text(footer, PW / 2 - pdf.getTextWidth(footer) / 2, PH - 8);

            pdf.save(`proforma-${proforma.proformaNumber}.pdf`);
            toast.success(t('proforma.pdf_download_success'));
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error(t('proforma.pdf_download_error'));
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

    // Valeurs calculées par le backend
    const subtotal = parseFloat(proforma.subtotal ?? 0);
    const tax = parseFloat(proforma.tax ?? 0);
    const discount = parseFloat(proforma.discount ?? 0);
    const total = parseFloat(proforma.total ?? 0);
    const taxRate = subtotal > 0 ? Math.round((tax / subtotal) * 100) : 0;

    const parsedBankAccounts = (() => {
        try {
            const parsed = JSON.parse(business.businessBankInfo);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    })();

    // Formater les montants avec espace insécable: 13,250.00 HTG
    const fmt = (n: number) =>
        n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ` ${currency}`;

    const expiryFormatted = format(new Date(proforma.expiresAt), 'dd/MM/yyyy');
    const notesText = t('proforma.notes_text', { date: expiryFormatted });

    return (
        <div className="space-y-6 print:space-y-0 pb-12 print:pb-0 print:m-0">
            {/* Header / Actions - Hidden on Print */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        className="text-muted-foreground hover:text-primary"
                        onClick={() => navigate('/proforma/list')}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        {t('common.back')}
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold text-foreground flex items-center gap-2">
                            <FileText className="h-8 w-8 text-blue-500" />
                            {t('proforma.title_details')}
                        </h2>
                        <p className="text-muted-foreground">{proforma.proformaNumber}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        className="bg-muted border-border text-foreground gap-2"
                        onClick={handleDownloadPDF}
                        disabled={isGeneratingPDF}
                    >
                        {isGeneratingPDF ? (
                            <RotateCw className="h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="h-4 w-4" />
                        )}
                        {isGeneratingPDF ? t('common.loading') : t('proforma.download')}
                    </Button>
                    <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                        <Printer className="h-4 w-4" />
                        {t('proforma.print_button')}
                    </Button>
                </div>
            </div>

            {/* Proforma View / Print Content */}
            <div className="print:m-0 print:p-0 print:bg-white print:text-black" id="printable-proforma">
                <Card className="bg-background border-border print:border-none print:shadow-none print:bg-white overflow-hidden print:m-0 print:p-0 print:rounded-none">
                    <CardContent className="p-8 md:p-12 print:p-0">
                        {/* Company Branding & Proforma Info */}
                        <div className="flex flex-col md:flex-row print:flex-row justify-between gap-8 mb-12 border-b border-border print:border-slate-200 pb-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-14 h-14 bg-muted print:bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden border border-border print:border-slate-200 flex-shrink-0">
                                        {business.businessLogo ? (
                                            <img
                                                src={business.businessLogo}
                                                alt={business.businessName}
                                                className="w-full h-full object-contain"
                                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                            />
                                        ) : (
                                            <Store className="text-blue-500 h-7 w-7" />
                                        )}
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-white print:text-black" style={{ letterSpacing: 'normal', wordSpacing: '0.1em' }}>
                                            {business.businessName}
                                        </h1>
                                        {business.businessSlogan && (
                                            <p className="text-xs text-blue-400 print:text-muted-foreground italic mt-0.5" style={{ wordSpacing: '0.05em' }}>
                                                {business.businessSlogan}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="text-muted-foreground print:text-muted-foreground space-y-1 text-sm" style={{ wordSpacing: '0.05em', letterSpacing: 'normal' }}>
                                    {business.businessAddress && <p>{business.businessAddress}</p>}
                                    {business.businessPhone && <p>{t('common.phone', 'Tél')}{' '}{business.businessPhone}</p>}
                                    {business.businessEmail && <p>Email{' '}{business.businessEmail}</p>}
                                </div>
                            </div>
                            <div className="text-right space-y-2">
                                <h1 className="text-4xl font-black text-blue-500 print:text-blue-600 uppercase tracking-wide">
                                    {t('proforma.title_details')}
                                </h1>
                                <div className="space-y-1.5">
                                    <p className="text-white print:text-black font-semibold tracking-normal"># {proforma.proformaNumber}</p>
                                    <p className="text-muted-foreground print:text-muted-foreground text-sm" style={{ wordSpacing: '0.05em' }}>
                                        {t('proforma.date')}:{' '}{format(new Date(proforma.createdAt), 'dd MMMM yyyy')}
                                    </p>
                                    <p className="text-muted-foreground print:text-muted-foreground text-sm" style={{ wordSpacing: '0.05em' }}>
                                        {t('proforma.expiry_date')}:{' '}{format(new Date(proforma.expiresAt), 'dd MMMM yyyy')}
                                    </p>
                                    {/* Badges statut + type — yon sèl liy */}
                                    <div className="flex items-center justify-end gap-1.5 pt-1">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                            proforma.status === 'PENDING'   ? 'bg-amber-500/20 text-amber-400' :
                                            proforma.status === 'ACCEPTED'  ? 'bg-emerald-500/20 text-emerald-400' :
                                            proforma.status === 'EXPIRED'   ? 'bg-red-500/20 text-red-400' :
                                                                               'bg-slate-500/20 text-muted-foreground'
                                        }`}>
                                            {t(`proforma.status_${proforma.status.toLowerCase()}`)}
                                        </span>
                                        {proforma.sellType && (
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                                proforma.sellType === 'SERVICE'
                                                    ? 'bg-purple-500/20 text-purple-400'
                                                    : 'bg-emerald-500/20 text-emerald-400'
                                            }`}>
                                                {proforma.sellType === 'SERVICE'
                                                    ? t('sidebar.services')
                                                    : t('sidebar.products')
                                                }
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Customer & POS Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-12 mb-10">
                            <div className="space-y-3">
                                <h3 className="text-muted-foreground print:text-muted-foreground text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                                    <User className="h-3 w-3" />
                                    {t('proforma.bill_to')}
                                </h3>
                                <div className="space-y-1">
                                    <p className="text-xl font-bold text-white print:text-black" style={{ letterSpacing: 'normal', wordSpacing: '0.08em' }}>
                                        {proforma.customer
                                            ? `${proforma.customer.firstName} ${proforma.customer.lastName}`
                                            : t('proforma.direct_sale')}
                                    </p>
                                    {proforma.customer && proforma.customer.phone && (
                                        <div className="text-muted-foreground print:text-muted-foreground text-sm space-y-0.5" style={{ wordSpacing: '0.05em' }}>
                                            <p>{proforma.customer.phone}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-3 md:text-right print:text-right">
                                <h3 className="text-muted-foreground print:text-muted-foreground text-[10px] font-bold uppercase tracking-widest flex items-center justify-start md:justify-end print:justify-end gap-2">
                                    <MapPin className="h-3 w-3" />
                                    {t('proforma.location')}
                                </h3>
                                <div className="space-y-1">
                                    <p className="text-lg font-bold text-white print:text-black" style={{ letterSpacing: 'normal', wordSpacing: '0.08em' }}>
                                        {proforma.pos?.name || '-'}
                                    </p>
                                    <div className="text-muted-foreground print:text-muted-foreground text-sm space-y-0.5" style={{ wordSpacing: '0.05em' }}>
                                        <p>{proforma.pos?.address || t('common.no_address')}</p>
                                        {proforma.pos?.phone && <p>{proforma.pos.phone}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="mb-10">
                            <Table>
                                <TableHeader className="bg-muted print:bg-slate-100">
                                    <TableRow className="border-border print:border-slate-200">
                                        <TableHead className="text-foreground print:text-black font-bold w-[40%]">
                                            {t('proforma.item_description')}
                                        </TableHead>
                                        {proforma.sellType === 'SERVICE' && (
                                            <TableHead className="text-foreground print:text-black font-bold whitespace-nowrap hidden md:table-cell print:table-cell">
                                                {t('common.category')}
                                            </TableHead>
                                        )}
                                        <TableHead className="text-center text-foreground print:text-black font-bold whitespace-nowrap w-16">
                                            {t('proforma.item_qty')}
                                        </TableHead>
                                        <TableHead className="text-right text-foreground print:text-black font-bold whitespace-nowrap">
                                            {t('proforma.item_price')}
                                        </TableHead>
                                        <TableHead className="text-right text-foreground print:text-black font-bold whitespace-nowrap">
                                            {t('proforma.table_total')}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {proforma.items.map((item: any, idx: number) => (
                                        <TableRow key={idx} className="border-border print:border-slate-200 hover:bg-muted transition-colors">
                                            <TableCell className="text-foreground print:text-black font-medium py-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        {proforma.sellType === 'SERVICE' && (
                                                            <Wrench className="h-3.5 w-3.5 text-purple-400 flex-shrink-0" />
                                                        )}
                                                        <span>{item.name}</span>
                                                    </div>
                                                    {proforma.sellType === 'SERVICE' && item.service?.description && (
                                                        <p className="text-xs text-muted-foreground print:text-muted-foreground italic pl-5 leading-relaxed">
                                                            {item.service.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            {proforma.sellType === 'SERVICE' && (
                                                <TableCell className="hidden md:table-cell print:table-cell py-4">
                                                    {item.service?.category?.name ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 whitespace-nowrap">
                                                            {item.service.category.name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs">—</span>
                                                    )}
                                                </TableCell>
                                            )}
                                            <TableCell className="text-center text-muted-foreground print:text-black py-4">{item.qty}</TableCell>
                                            <TableCell className="text-right text-muted-foreground print:text-black py-4 whitespace-nowrap">
                                                {fmt(Number(item.price))}
                                            </TableCell>
                                            <TableCell className="text-right text-foreground print:text-black font-bold py-4 whitespace-nowrap">
                                                {fmt(parseFloat(item.total ?? item.price * item.qty))}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Totals + Notes */}
                        <div className="flex flex-col md:flex-row justify-between gap-8 mt-4">
                            {/* Notes box */}
                            <div className="flex-1">
                                <div className="bg-muted/20 print:bg-slate-50 p-5 rounded-xl border border-border print:border-slate-200">
                                    <div className="flex items-center gap-2 mb-3 font-bold text-foreground print:text-muted-foreground uppercase tracking-widest text-[10px]">
                                        <Info className="h-3.5 w-3.5 text-blue-400" />
                                        {t('proforma.notes')}
                                    </div>
                                    <p className="text-sm text-muted-foreground print:text-muted-foreground leading-relaxed" style={{ wordSpacing: '0.08em', letterSpacing: 'normal' }}>
                                        {notesText}
                                    </p>
                                </div>
                                {parsedBankAccounts.length > 0 && (
                                    <div className="mt-4 bg-muted/20 print:bg-slate-50 p-5 rounded-xl border border-border print:border-slate-200">
                                        <div className="flex items-center gap-2 mb-3 font-bold text-foreground print:text-muted-foreground uppercase tracking-widest text-[10px]">
                                            <CreditCard className="h-3.5 w-3.5 text-blue-400" />
                                            Enfòmasyon Bankè (Bank Details)
                                        </div>
                                        <div className="space-y-3">
                                            {parsedBankAccounts.map((acc: any, i: number) => (
                                                <div key={i} className="flex flex-col border-b border-border print:border-slate-100 last:border-0 pb-2 last:pb-0">
                                                    <span className="text-xs font-bold text-white print:text-black">{acc.bankName}</span>
                                                    <div className="flex justify-between text-[11px] text-muted-foreground print:text-muted-foreground mt-0.5">
                                                        <span>{acc.accountNumber}</span>
                                                        <span className="italic">{acc.accountName}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Amounts */}
                            <div className="w-full md:w-64 space-y-1.5">
                                <div className="flex items-center justify-between text-sm text-muted-foreground print:text-muted-foreground py-1.5 border-b border-border print:border-slate-100">
                                    <span>{t('proforma.subtotal')}</span>
                                    <span className="font-medium text-white print:text-black tabular-nums">{fmt(subtotal)}</span>
                                </div>
                                {tax > 0 && (
                                    <div className="flex items-center justify-between text-sm text-muted-foreground print:text-muted-foreground py-1.5 border-b border-border print:border-slate-100">
                                        <span className="whitespace-nowrap">{t('proforma.tax')}{' '}({taxRate}%)</span>
                                        <span className="font-medium tabular-nums">{fmt(tax)}</span>
                                    </div>
                                )}
                                {discount > 0 && (
                                    <div className="flex items-center justify-between text-sm text-rose-400 print:text-rose-600 py-1.5 border-b border-border print:border-slate-100">
                                        <span>{t('proforma.discount')}</span>
                                        <span className="font-medium tabular-nums">-{fmt(discount)}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between pt-4">
                                    <span className="text-base font-bold text-white print:text-black">{t('proforma.table_total')}</span>
                                    <span className="text-xl font-black text-blue-500 print:text-blue-700 tabular-nums">{fmt(total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer (HTML Print View) */}
                        <div className="mt-16 pt-6 border-t border-border print:border-slate-200 text-center text-xs text-muted-foreground print:text-muted-foreground font-medium tracking-wider">
                            {business.businessName} — #{proforma.proformaNumber}
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
                    body, html {
                        background: white !important;
                        color: black !important;
                        height: auto !important;
                        overflow: visible !important;
                        width: 100% !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    .layout-container {
                        display: block !important;
                        height: auto !important;
                        overflow: visible !important;
                        position: static !important;
                    }
                    
                    .sidebar-container, 
                    .topbar-container, 
                    .no-print, 
                    header, nav, footer, aside, button,
                    [role="navigation"], .print\\:hidden {
                        display: none !important;
                        visibility: hidden !important;
                    }

                    #printable-proforma {
                        display: block !important;
                        position: static !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                        border: none !important;
                        box-shadow: none !important;
                    }

                    main, div.flex-1 {
                        display: block !important;
                        overflow: visible !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        height: auto !important;
                        min-height: 0 !important;
                    }
                    
                    .bg-gradient-to-br, .from-black, .via-gray-900, .to-slate-900 {
                        background: white !important;
                    }
                }
            ` }} />
        </div>
    );
};

export default ProformaDetails;
