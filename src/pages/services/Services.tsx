import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    RotateCw,
    Briefcase,
    Globe
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import { useTranslation } from 'react-i18next';
import serviceService from '../../context/api/serviceService';
import categoryService from '../../context/api/categoryservice';
import posService from '../../context/api/posservice';
import { Service, Category, PointOfSale } from '../../context/types/interface';
import { toast } from 'sonner';

const Services: React.FC = () => {
    const { t } = useTranslation();
    const [services, setServices] = useState<Service[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [pointsOfSale, setPointsOfSale] = useState<PointOfSale[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        categoryId: '',
        isActive: true,
        posIds: [] as string[]
    });
    const [posSearchTerm, setPosSearchTerm] = useState('');

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [servicesData, categoriesData, posData] = await Promise.all([
                serviceService.getAll(),
                categoryService.getAll('service'),
                posService.getAll(1, 100) // Fetch up to 100 locations for selection
            ]);
            setServices(servicesData);
            setCategories(categoriesData);
            setPointsOfSale(posData.data || []);
        } catch (error) {
            toast.error(t('services.msg_error_load'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenDialog = (service?: Service) => {
        if (service) {
            setEditingService(service);
            setFormData({
                name: service.name,
                description: service.description || '',
                price: Number(service.price),
                categoryId: service.categoryId || '',
                isActive: service.isActive,
                posIds: service.pointOfSales?.map(p => p.id) || []
            });
        } else {
            setEditingService(null);
            setFormData({
                name: '',
                description: '',
                price: 0,
                categoryId: '',
                isActive: true,
                posIds: []
            });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.name || formData.price < 0) {
            toast.error(t('common.fill_required_fields'));
            return;
        }

        try {
            if (editingService) {
                await serviceService.update(editingService.id, formData);
                toast.success(t('services.msg_update_success'));
            } else {
                await serviceService.create(formData);
                toast.success(t('services.msg_create_success'));
            }
            setIsDialogOpen(false);
            fetchData();
        } catch (error) {
            toast.error(t('services.msg_error_save'));
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await serviceService.remove(id);
            toast.success(t('services.msg_delete_success'));
            fetchData();
        } catch (error) {
            toast.error(t('common.error_saving'));
        }
    };

    const filteredServices = services.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredPOS = Array.isArray(pointsOfSale) ? pointsOfSale.filter(pos =>
        pos.name.toLowerCase().includes(posSearchTerm.toLowerCase())
    ) : [];

    const handleToggleAllPOS = () => {
        if (!Array.isArray(pointsOfSale)) return;
        if (formData.posIds.length > 0) {
            setFormData({ ...formData, posIds: [] });
        } else {
            setFormData({ ...formData, posIds: pointsOfSale.map(p => p.id) });
        }
    };

    return (
        <div className="flex flex-col h-full gap-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">{t('services.title')}</h1>
                    <p className="text-sm text-slate-400">{t('services.description')}</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:bg-white/10 hover:text-white" onClick={fetchData}>
                        <RotateCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-orange-500' : ''}`} />
                    </Button>
                    <Button
                        onClick={() => handleOpenDialog()}
                        className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        {t('services.add_service')}
                    </Button>
                </div>
            </div>

            {/* Main Content Card */}
            <Card className="flex-1 bg-white/5 backdrop-blur-sm border border-white/10 text-white overflow-hidden flex flex-col">
                <CardContent className="p-0 flex flex-col h-full">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-white/10">
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder={t('services.search_placeholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-orange-500/50"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="flex-1 overflow-auto">
                        <Table>
                            <TableHeader className="bg-slate-900 sticky top-0 z-10 border-b border-white/10">
                                <TableRow className="hover:bg-transparent border-white/10">
                                    <TableHead className="text-white">{t('services.name')}</TableHead>
                                    <TableHead className="text-white">{t('services.category')}</TableHead>
                                    <TableHead className="text-white">{t('services.price')}</TableHead>
                                    <TableHead className="text-white">Lokal</TableHead>
                                    <TableHead className="text-white">{t('services.status')}</TableHead>
                                    <TableHead className="text-right text-white">{t('services.action')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                                            <div className="flex items-center justify-center gap-2">
                                                <RotateCw className="h-5 w-5 animate-spin text-orange-500" />
                                                <span>{t('common.loading')}</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredServices.length > 0 ? (
                                    filteredServices.map((service) => (
                                        <TableRow key={service.id} className="hover:bg-white/5 transition-colors border-white/5 group">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                                                        <Briefcase className="h-5 w-5" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-white">{service.name}</span>
                                                        <span className="text-[10px] text-slate-500 line-clamp-1">{service.description || '-'}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-white/5 border-white/10 text-slate-300 font-normal rounded-md">
                                                    {service.category?.name || '-'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-medium text-emerald-400">${service.price}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {service.pointOfSales && service.pointOfSales.length > 0 ? (
                                                        service.pointOfSales.map(pos => (
                                                            <Badge key={pos.id} variant="outline" className=" bg-white/5 border-white/10 text-slate-300 font-normal rounded-md">
                                                                {pos.name}
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <span className="text-[10px] text-slate-500 italic">Tout lokal</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={service.isActive ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 rounded-md" : "rounded-md bg-slate-500/20 text-slate-400 border-slate-500/30"}>
                                                    {service.isActive ? t('pos.active') : t('pos.inactive')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleOpenDialog(service)}
                                                        className="h-8 w-8 text-slate-400 hover:text-orange-500 hover:bg-orange-500/10"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent className="bg-slate-900 border-white/10">
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle className="text-white">{t('services.delete_confirm_title')}</AlertDialogTitle>
                                                                <AlertDialogDescription className="text-slate-400">
                                                                    {t('services.delete_confirm_desc', { name: service.name })}
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/10">{t('common.cancel')}</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete(service.id)} className="bg-rose-500 hover:bg-rose-600">
                                                                    {t('common.delete')}
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-slate-400 italic text-sm">
                                            {t('services.no_services_found')}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-orange-500" />
                            {editingService ? t('services.edit_service') : t('services.add_service')}
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            {t('services.form_info')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">{t('services.name')} <span className="text-red-500">*</span></Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white focus-visible:ring-orange-500/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price">{t('services.price')} ($) <span className="text-red-500">*</span></Label>
                                <Input
                                    id="price"
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                    className="bg-white/5 border-white/10 text-white focus-visible:ring-orange-500/50"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{t('services.category')}</Label>
                                <Select
                                    value={formData.categoryId}
                                    onValueChange={(v) => setFormData({ ...formData, categoryId: v })}
                                >
                                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                        <SelectValue placeholder={t('category.select_cat')} />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-white/10 text-white">
                                        {Array.isArray(categories) && categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5 mt-6">
                                <Label htmlFor="isActive" className="cursor-pointer">{t('services.status')}</Label>
                                <Switch
                                    id="isActive"
                                    checked={formData.isActive}
                                    onCheckedChange={(v) => setFormData({ ...formData, isActive: v })}
                                    className="data-[state=checked]:bg-orange-500"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Deskripsyon</Label>
                            <Input
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="bg-white/5 border-white/10 text-white focus-visible:ring-orange-500/50"
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-sm font-semibold flex items-center gap-2">
                                        <Globe className="h-4 w-4 text-orange-500" />
                                        {t('services.form_locations')}
                                    </Label>
                                    <p className="text-[10px] text-slate-500">{t('services.form_locations_desc')}</p>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleToggleAllPOS}
                                    className="h-7 text-[10px] text-orange-500 hover:text-orange-400 hover:bg-orange-500/10"
                                >
                                    {formData.posIds.length > 0 ? t('common.all') : t('common.add')}
                                </Button>
                            </div>

                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-slate-500" />
                                <Input
                                    placeholder="Chache lokal..."
                                    value={posSearchTerm}
                                    onChange={(e) => setPosSearchTerm(e.target.value)}
                                    className="pl-8 h-8 text-xs bg-white/5 border-white/10 text-white focus-visible:ring-orange-500/50 mb-2"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-lg border border-white/10 bg-white/5 max-h-[180px] overflow-y-auto custom-scrollbar">
                                {Array.isArray(filteredPOS) && filteredPOS.map((pos) => (
                                    <div key={pos.id} className="flex items-center space-x-2 bg-slate-900/50 p-2 rounded border border-white/5 hover:border-orange-500/30 transition-colors">
                                        <Checkbox
                                            id={`pos-${pos.id}`}
                                            checked={formData.posIds.includes(pos.id)}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setFormData({ ...formData, posIds: [...formData.posIds, pos.id] });
                                                } else {
                                                    setFormData({ ...formData, posIds: formData.posIds.filter(id => id !== pos.id) });
                                                }
                                            }}
                                            className="border-white/20 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                                        />
                                        <Label
                                            htmlFor={`pos-${pos.id}`}
                                            className="text-xs text-slate-300 cursor-pointer flex-1 truncate"
                                            title={pos.name}
                                        >
                                            {pos.name}
                                        </Label>
                                    </div>
                                ))}
                                {filteredPOS.length === 0 && (
                                    <p className="text-xs text-slate-500 col-span-2 italic py-4 text-center">{t('pos.no_data')}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-white hover:bg-white/10">
                            {t('common.cancel')}
                        </Button>
                        <Button onClick={handleSubmit} className="bg-orange-500 hover:bg-orange-600 text-white min-w-[100px]">
                            {editingService ? t('common.save') : t('common.add')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Services;