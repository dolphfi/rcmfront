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
import { Badge } from "components/ui/badge";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import {
    Search,
    Eye,
    Filter,
    Plus,
    FileText,
    Calendar
} from "lucide-react";
import proformaService from 'context/api/proformaService';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSettings } from 'context/SettingsContext';


const ProformaList: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [proformas, setProformas] = useState<any[]>([]);
    const { currency } = useSettings();
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchProformas = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await proformaService.findAll();
            setProformas(Array.isArray(data) ? data : (data?.data ?? []));
        } catch (error) {
            console.error('Error fetching proformas:', error);
            toast.error(t("proforma.error_fetch"));
        } finally {
            setIsLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchProformas();
    }, [fetchProformas]);

    const filteredProformas = proformas.filter(p => {
        const searchTarget = searchTerm.toLowerCase();
        const numMatch = p.proformaNumber.toLowerCase().includes(searchTarget);
        const customerMatch = p.customer
            ? `${p.customer.firstName} ${p.customer.lastName}`.toLowerCase().includes(searchTarget)
            : t('proforma.walk_in').toLowerCase().includes(searchTarget);
        
        return numMatch || customerMatch;
    });

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-blue-500/20 text-blue-500';
            case 'ACCEPTED': return 'bg-emerald-500/20 text-emerald-500';
            case 'EXPIRED': return 'bg-red-500/20 text-red-500';
            case 'CANCELLED': return 'bg-slate-500/20 text-slate-500';
            default: return 'bg-slate-500/20 text-slate-500';
        }
    };

    const handleConvertToSale = (proforma: any) => {
        // Rediriger vers le POS avec les données du proforma
        navigate('/pos', {
            state: {
                proforma: {
                    items: proforma.items,
                    customerId: proforma.customerId,
                    discount: parseFloat(proforma.discount),
                    sellType: proforma.sellType,
                    proformaId: proforma.id,
                    proformaNumber: proforma.proformaNumber
                }
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                        <FileText className="h-8 w-8 text-blue-500" />
                        {t('proforma.title_list')}
                    </h2>
                    <p className="text-slate-400">
                        {t('proforma.subtitle_list')}
                    </p>
                </div>
                <Link to="/proforma/new">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                        <Plus className="h-4 w-4" />
                        {t('proforma.add_proforma')}
                    </Button>
                </Link>
            </div>

            <Card className="bg-slate-900/50 border-white/10 backdrop-blur-xl">
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <CardTitle className="text-white text-lg font-medium">{t('proforma.all_proformas')}</CardTitle>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder={t('proforma.search_placeholder')}
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
                                    <TableHead className="text-slate-300">{t('proforma.table_number')}</TableHead>
                                    <TableHead className="text-slate-300">{t('proforma.table_customer')}</TableHead>
                                    <TableHead className="text-slate-300">{t('proforma.table_total')}</TableHead>
                                    <TableHead className="text-slate-300">{t('proforma.table_status')}</TableHead>
                                    <TableHead className="text-slate-300">{t('proforma.table_expiry')}</TableHead>
                                    <TableHead className="text-right text-slate-300">{t('common.actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow className="border-white/10">
                                        <TableCell colSpan={6} className="h-24 text-center text-slate-400">
                                            {t('common.loading')}
                                        </TableCell>
                                    </TableRow>
                                ) : filteredProformas.length === 0 ? (
                                    <TableRow className="border-white/10">
                                        <TableCell colSpan={6} className="h-24 text-center text-slate-400">
                                            {t('proforma.no_proformas_found')}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredProformas.map((p) => (
                                        <TableRow key={p.id} className="border-white/10 hover:bg-white/5 transition-colors">
                                            <TableCell className="font-medium text-white">
                                                {p.proformaNumber}
                                            </TableCell>
                                            <TableCell className="text-slate-300">
                                                {p.customer
                                                    ? `${p.customer.firstName} ${p.customer.lastName}`
                                                    : t('proforma.walk_in')}
                                            </TableCell>
                                            <TableCell className="text-emerald-400 font-bold">
                                                {Number(p.total).toFixed(2)} {currency}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`${getStatusVariant(p.status)} border-0`}>
                                                    {t(`proforma.status_${p.status.toLowerCase()}`)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-slate-300">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {format(new Date(p.expiresAt), 'dd/MM/yyyy')}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-slate-400 hover:text-white hover:bg-white/10"
                                                        title={t('proforma.view_proforma')}
                                                        asChild
                                                    >
                                                        <Link to={`/proforma/details/${p.id}`}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="text-emerald-400 hover:text-white hover:bg-white/10"
                                                        onClick={() => handleConvertToSale(p)}
                                                        title={t('proforma.convert_to_sale')}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ProformaList;
