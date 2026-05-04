import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Ticket,
    Tag,
    Timer,
    CheckCircle2,
    MoreHorizontal
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from 'components/ui/card';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { Badge } from 'components/ui/badge';
import { ScrollArea } from 'components/ui/scroll-area';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from 'components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from 'components/ui/select';
import { Label } from 'components/ui/label';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from 'components/ui/dropdown-menu';
import { toast } from 'sonner';
import promotionService, { Promotion, PromotionType } from '../../context/api/promotionService';
import { format } from 'date-fns';

const PromotionPage: React.FC = () => {
    const { t } = useTranslation();
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        type: PromotionType.PERCENTAGE,
        value: 0,
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        isActive: true
    });

    const fetchPromotions = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await promotionService.getAll();
            setPromotions(data);
        } catch (error) {
            toast.error(t('products.load_error'));
        } finally {
            setIsLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchPromotions();
    }, [fetchPromotions]);

    const handleOpenDialog = (promo?: Promotion) => {
        if (promo) {
            setEditingPromo(promo);
            setFormData({
                name: promo.name,
                code: promo.code,
                type: promo.type,
                value: promo.value,
                startDate: format(new Date(promo.startDate), 'yyyy-MM-dd'),
                endDate: format(new Date(promo.endDate), 'yyyy-MM-dd'),
                isActive: promo.isActive
            });
        } else {
            setEditingPromo(null);
            setFormData({
                name: '',
                code: '',
                type: PromotionType.PERCENTAGE,
                value: 0,
                startDate: format(new Date(), 'yyyy-MM-dd'),
                endDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
                isActive: true
            });
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        try {
            if (editingPromo) {
                await promotionService.update(editingPromo.id, formData);
                toast.success(t('promotions.msg_update_success'));
            } else {
                await promotionService.create(formData);
                toast.success(t('promotions.msg_create_success'));
            }
            setIsDialogOpen(false);
            fetchPromotions();
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('products.error_saving'));
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm(t('promotions.delete_confirm'))) return;
        try {
            await promotionService.remove(id);
            toast.success(t('promotions.msg_delete_success'));
            fetchPromotions();
        } catch (error) {
            toast.error(t('products.error_saving'));
        }
    };

    const filteredPromos = promotions.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeCount = promotions.filter(p => p.isActive).length;
    const expiringSoonCount = promotions.filter(p => {
        const diff = new Date(p.endDate).getTime() - Date.now();
        return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000;
    }).length;

    return (
        <div className="p-6 space-y-6 bg-background min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight flex items-center gap-2">
                        <Tag className="h-8 w-8 text-emerald-500" />
                        {t('promotions.title')}
                    </h1>
                    <p className="text-muted-foreground mt-1">{t('promotions.subtitle')}</p>
                </div>
                <Button
                    onClick={() => handleOpenDialog()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    {t('promotions.add_promo')}
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-background border-border">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{t('promotions.active_promos')}</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{activeCount}</div>
                    </CardContent>
                </Card>
                <Card className="bg-background border-border">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{t('promotions.expiring_soon')}</CardTitle>
                        <Timer className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{expiringSoonCount}</div>
                    </CardContent>
                </Card>
                <Card className="bg-background border-border">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Campaigns</CardTitle>
                        <Ticket className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{promotions.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Card className="bg-background border-border overflow-hidden">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="relative w-full sm:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={t('products.search_placeholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 bg-background/50 border-border text-foreground focus-visible:ring-emerald-500"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 sm:p-6 pt-0 sm:pt-0">
                    <ScrollArea className="h-[500px] w-full border border-border rounded-lg">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead className="sticky top-0 bg-background z-10 border-b border-border">
                                <tr>
                                    <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('promotions.campaign_name')}</th>
                                    <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('promotions.code')}</th>
                                    <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('promotions.value')}</th>
                                    <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('promotions.startDate')}</th>
                                    <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('promotions.endDate')}</th>
                                    <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('promotions.status')}</th>
                                    <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">{t('promotions.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={7} className="p-4 h-16 bg-white/[0.02]" />
                                        </tr>
                                    ))
                                ) : filteredPromos.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-10 text-center text-muted-foreground">{t('common.no_data')}</td>
                                    </tr>
                                ) : (
                                    filteredPromos.map((promo) => (
                                        <tr key={promo.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="p-4">
                                                <div className="font-medium text-foreground">{promo.name}</div>
                                            </td>
                                            <td className="p-4">
                                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-mono">
                                                    {promo.code}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-1 font-bold text-foreground">
                                                    {promo.type === PromotionType.PERCENTAGE ? `${promo.value}%` : `$${promo.value}`}
                                                </div>
                                            </td>
                                            <td className="p-4 text-muted-foreground text-sm">
                                                {format(new Date(promo.startDate), 'dd/MM/yyyy')}
                                            </td>
                                            <td className="p-4 text-muted-foreground text-sm">
                                                {format(new Date(promo.endDate), 'dd/MM/yyyy')}
                                            </td>
                                            <td className="p-4">
                                                {promo.isActive ? (
                                                    <Badge className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30">
                                                        {t('pos.active')}
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-muted text-muted-foreground hover:bg-primary/10">
                                                        {t('pos.inactive')}
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="p-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-primary">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-background border-border text-foreground">
                                                        <DropdownMenuItem onClick={() => handleOpenDialog(promo)}>
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            {t('common.edit')}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDelete(promo.id)} className="text-rose-500 focus:text-rose-500">
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            {t('common.delete')}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Management Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-background border-border text-foreground sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingPromo ? t('promotions.editPromo') : t('promotions.addPromo')}</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            {t('promotions.subtitle')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">{t('promotions.campaign_name')}</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder={t('promotions.placeholder_name')}
                                className="col-span-3 bg-background border-border"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="code" className="text-right">{t('promotions.code')}</Label>
                            <Input
                                id="code"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                placeholder={t('promotions.placeholder_code')}
                                className="col-span-3 bg-background border-border font-mono"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">{t('promotions.type')}</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(val: PromotionType) => setFormData({ ...formData, type: val })}
                            >
                                <SelectTrigger className="col-span-3 bg-background border-border">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-background border-border text-foreground">
                                    <SelectItem value={PromotionType.PERCENTAGE}>{t('promotions.percentage')}</SelectItem>
                                    <SelectItem value={PromotionType.FIXED}>{t('promotions.fixed')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="value" className="text-right">{t('promotions.value')}</Label>
                            <Input
                                id="value"
                                type="number"
                                value={formData.value}
                                onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                                className="col-span-3 bg-background border-border"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="startDate" className="text-right">{t('promotions.startDate')}</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="col-span-3 bg-background border-border"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="endDate" className="text-right">{t('promotions.endDate')}</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                className="col-span-3 bg-background border-border"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">{t('promotions.status')}</Label>
                            <div className="col-span-3 flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant={formData.isActive ? "default" : "outline"}
                                    onClick={() => setFormData({ ...formData, isActive: true })}
                                    className={formData.isActive ? "bg-emerald-600 hover:bg-emerald-700" : "border-border"}
                                >
                                    {t('pos.active')}
                                </Button>
                                <Button
                                    type="button"
                                    variant={!formData.isActive ? "default" : "outline"}
                                    onClick={() => setFormData({ ...formData, isActive: false })}
                                    className={!formData.isActive ? "bg-rose-600 hover:bg-rose-700" : "border-border"}
                                >
                                    {t('pos.inactive')}
                                </Button>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-border text-muted-foreground hover:text-primary">
                            {t('common.cancel')}
                        </Button>
                        <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            {t('common.save')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PromotionPage;