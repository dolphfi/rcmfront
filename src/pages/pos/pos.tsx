import React, { useEffect, useState, useCallback } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "../../components/ui/table";
import { useTranslation, Trans } from 'react-i18next';
import {
    Card,
    CardContent,
    CardHeader
} from "../../components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "../../components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "../../components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Label } from "../../components/ui/label";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "../../components/ui/pagination";
import {
    MoreHorizontal, Plus, Search, Trash2, Edit, Store, Warehouse, Eye, MapPin, Phone, Calendar, Hash, Info, Activity, Power, CheckCircle2
} from 'lucide-react';
import posService from '../../context/api/posservice';
import { toast } from 'sonner';

const PosAdmin: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [posData, setPosData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentPOS, setCurrentPOS] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [viewPOS, setViewPOS] = useState<any>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [posToDelete, setPosToDelete] = useState<any | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        type: 'store',
        isActive: true
    });

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await posService.getAll(currentPage, itemsPerPage, searchTerm);
            // Handle both legacy and paginated response
            if (response.data) {
                setPosData(response.data);
                setTotalItems(response.total);
            } else {
                setPosData(response);
                setTotalItems(response.length);
            }
        } catch (error) {
            toast.error(t('pos.msg_load_error'));
        } finally {
            setLoading(false);
        }
    }, [t, currentPage, itemsPerPage, searchTerm]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAddClick = () => {
        setCurrentPOS(null);
        setFormData({
            name: '',
            address: '',
            phone: '',
            type: 'store',
            isActive: true
        });
        setIsDialogOpen(true);
    };

    const handleEditClick = (pos: any) => {
        setCurrentPOS(pos);
        setFormData({
            name: pos.name,
            address: pos.address || '',
            phone: pos.phone || '',
            type: pos.type || 'store',
            isActive: pos.isActive
        });
        setIsDialogOpen(true);
    };

    const handleViewClick = (pos: any) => {
        setViewPOS(pos);
        setIsViewDialogOpen(true);
    };

    const handleEditFromView = () => {
        if (!viewPOS) return;
        setIsViewDialogOpen(false);
        handleEditClick(viewPOS);
    };

    const handleToggleStatus = async (pos: any) => {
        try {
            await posService.update(pos.id, { isActive: !pos.isActive });
            toast.success(t(!pos.isActive ? 'pos.msg_status_activated' : 'pos.msg_status_deactivated'));
            fetchData();
        } catch (error) {
            toast.error(t('pos.msg_status_error'));
        }
    };

    const handleDeleteClick = (pos: any) => {
        setPosToDelete(pos);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!posToDelete) return;
        try {
            await posService.delete(posToDelete.id);
            toast.success(t('pos.msg_delete_success'));
            fetchData();
        } catch (error) {
            toast.error(t('pos.msg_delete_error'));
        } finally {
            setIsDeleteDialogOpen(false);
            setPosToDelete(null);
        }
    };

    const handleSave = async () => {
        if (!formData.name) {
            toast.error(t('pos.msg_name_required'));
            return;
        }
        try {
            setIsSaving(true);
            if (currentPOS) {
                await posService.update(currentPOS.id, formData);
                toast.success(t('pos.msg_update_success'));
            } else {
                await posService.create(formData);
                toast.success(t('pos.msg_add_success'));
            }
            setIsDialogOpen(false);
            fetchData();
        } catch (error: any) {
            toast.error(t('pos.msg_save_error'));
        } finally {
            setIsSaving(false);
        }
    };

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page on search
    };

    const renderPaginationItems = () => {
        const items: React.ReactNode[] = [];
        const siblingCount = 1;

        // Helper to add a page item
        const addPage = (page: number) => {
            items.push(
                <PaginationItem key={page}>
                    <PaginationLink
                        href="#"
                        isActive={currentPage === page}
                        onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(page);
                        }}
                        className="cursor-pointer"
                    >
                        {page}
                    </PaginationLink>
                </PaginationItem>
            );
        };

        // Always show first page
        addPage(1);

        if (totalPages <= 1) return items;

        const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
        const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

        // Show dots if there is a gap between 1 and leftSiblingIndex
        if (leftSiblingIndex > 2) {
            items.push(
                <PaginationItem key="ellipsis-start">
                    <PaginationEllipsis />
                </PaginationItem>
            );
        }

        // Show range around current page
        for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
            if (i !== 1 && i !== totalPages) {
                addPage(i);
            }
        }

        // Show dots if there is a gap between rightSiblingIndex and last page
        if (rightSiblingIndex < totalPages - 1) {
            items.push(
                <PaginationItem key="ellipsis-end">
                    <PaginationEllipsis />
                </PaginationItem>
            );
        }

        // Always show last page
        addPage(totalPages);

        return items;
    };

    return (
        <div className="p-6 space-y-6 bg-slate-950 min-h-full">
            <div className="flex justify-between items-center text-white">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('pos.title')}</h1>
                    <p className="text-slate-400">{t('pos.subtitle')}</p>
                </div>
                <Button onClick={handleAddClick} className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
                    <Plus className="h-4 w-4" />
                    {t('pos.add_pos')}
                </Button>
            </div>

            <Card className="bg-slate-900 border-white/10 text-white overflow-hidden">
                <CardHeader className="border-b border-white/10">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <Input
                                placeholder={t('pos.search_placeholder')}
                                className="pl-10 bg-slate-950 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-orange-500/50"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/10 hover:bg-transparent">
                                <TableHead className="text-slate-400">{t('pos.table_head_pos')}</TableHead>
                                <TableHead className="text-slate-400">{t('pos.table_head_type')}</TableHead>
                                <TableHead className="text-slate-400">{t('pos.table_head_contact')}</TableHead>
                                <TableHead className="text-slate-400 text-center">{t('pos.table_head_status')}</TableHead>
                                <TableHead className="text-right text-slate-400">{t('pos.table_head_actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-20 text-slate-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="h-6 w-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                                            {t('pos.loading')}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : posData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-20 text-slate-500">
                                        {t('pos.no_data')}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                posData.map((pos: any) => (
                                    <TableRow key={pos.id} className="border-white/10 hover:bg-white/5 transition-colors">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${pos.type === 'warehouse' ? 'bg-blue-500/10 text-blue-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                                    {pos.type === 'warehouse' ? <Warehouse className="h-5 w-5" /> : <Store className="h-5 w-5" />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-white font-medium">{pos.name}</span>
                                                    <span className="text-xs text-slate-500">ID: {pos.id.substring(0, 8)}...</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`capitalize ${pos.type === 'warehouse' ? 'border-blue-500/20 text-blue-400 bg-blue-400/10 rounded-md' : 'border-orange-500/20 text-orange-400 bg-orange-400/10 rounded-md'}`}>
                                                {pos.type || 'store'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-sm">
                                                <span className="text-slate-300">{pos.address || t('pos.no_address')}</span>
                                                <span className="text-slate-500">{pos.phone || t('pos.no_phone')}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge className={pos.isActive ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 rounded-md" : "bg-red-500/10 text-red-500 border-red-500/20 rounded-md"}>
                                                {pos.isActive ? t('pos.active') : t('pos.inactive')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-white/10">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-slate-900 border-white/10 text-slate-300">
                                                    <DropdownMenuLabel>{t('common.actions')}</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleViewClick(pos)} className="hover:bg-white/10 cursor-pointer focus:bg-white/10 focus:text-white">
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        {t('pos.view_details')}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-white/10" />
                                                    <DropdownMenuItem onClick={() => handleToggleStatus(pos)} className="hover:bg-white/10 cursor-pointer focus:bg-white/10 focus:text-white">
                                                        {pos.isActive ? <Power className="mr-2 h-4 w-4 text-red-400" /> : <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-400" />}
                                                        {pos.isActive ? t('pos.inactive') : t('pos.active')}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-white/10" />
                                                    <DropdownMenuItem onClick={() => handleDeleteClick(pos)} className="text-red-400 hover:bg-red-400/10 cursor-pointer focus:bg-red-400/10 focus:text-red-400">
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        {t('common.delete')}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                {totalPages > 1 && (
                    <div className="p-4 border-t border-white/10 flex items-center justify-between">
                        <div className="text-sm text-slate-500">
                            {t('common.showing')} {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} {t('common.of')} {totalItems}
                        </div>
                        <Pagination className="mx-0 w-auto">
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (currentPage > 1) setCurrentPage(currentPage - 1);
                                        }}
                                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>
                                {renderPaginationItems()}
                                <PaginationItem>
                                    <PaginationNext
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                                        }}
                                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-slate-900 border-white/10 text-white max-w-md">
                    <DialogHeader>
                        <DialogTitle>{currentPOS ? t('pos.modify_title') : t('pos.add_title')}</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            {t('pos.form_description', { action: currentPOS ? t('common.edit').toLowerCase() : t('common.add').toLowerCase() })}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-white">{t('pos.form_name')} <span className="text-red-500">*</span></Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Ex: Boutik Prensipal"
                                className="bg-slate-950 border-white/10 text-white focus-visible:ring-orange-500/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-white">{t('pos.form_type')} <span className="text-red-500">*</span></Label>
                            <Select value={formData.type} onValueChange={(v) => setFormData(prev => ({ ...prev, type: v }))}>
                                <SelectTrigger className="bg-slate-950 border-white/10 text-white">
                                    <SelectValue placeholder={t('pos.select_type_placeholder')} />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/10 text-white">
                                    <SelectItem value="store" className="focus:bg-white/10 focus:text-white">{t('pos.type_store')}</SelectItem>
                                    <SelectItem value="warehouse" className="focus:bg-white/10 focus:text-white">{t('pos.type_warehouse')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-white">{t('pos.form_address')}</Label>
                            <Input
                                value={formData.address}
                                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                placeholder="Ex: 123 Rue de la Paix"
                                className="bg-slate-950 border-white/10 text-white focus-visible:ring-orange-500/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-white">{t('pos.form_phone')}</Label>
                            <Input
                                value={formData.phone}
                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                placeholder="Ex: +509 3333 4444"
                                className="bg-slate-950 border-white/10 text-white focus-visible:ring-orange-500/50"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-slate-400 hover:bg-white/10 hover:text-white">{t('common.cancel')}</Button>
                        <Button onClick={handleSave} disabled={isSaving} className="bg-orange-500 hover:bg-orange-600 text-white min-w-[100px]">
                            {isSaving ? (
                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            ) : null}
                            {currentPOS ? t('common.update_button') : t('common.save_button')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Details Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            {viewPOS?.type === 'warehouse' ? <Warehouse className="h-6 w-6 text-blue-500" /> : <Store className="h-6 w-6 text-orange-500" />}
                            {t('pos.view_title')}
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            {t('pos.view_description')}
                        </DialogDescription>
                    </DialogHeader>
                    {viewPOS && (
                        <div className="space-y-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-4">
                                    <div className="flex items-start gap-3">
                                        <Hash className="h-4 w-4 text-slate-500 mt-1" />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{t('pos.detail_id')}</span>
                                            <span className="text-sm font-mono text-slate-300 break-all">{viewPOS.id}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Info className="h-4 w-4 text-slate-500 mt-1" />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{t('pos.detail_name')}</span>
                                            <span className="text-sm text-slate-300 font-medium">{viewPOS.name}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        {viewPOS.type === 'warehouse' ? <Warehouse className="h-4 w-4 text-slate-500 mt-1" /> : <Store className="h-4 w-4 text-slate-500 mt-1 rounded-md" />}
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{t('pos.form_type')}</span>
                                            <Badge variant="outline" className={`w-fit mt-1 capitalize font-normal ${viewPOS.type === 'warehouse' ? 'border-blue-500/20 text-blue-400 bg-blue-400/10 rounded-md' : 'border-orange-500/20 text-orange-400 bg-orange-400/10 rounded-md'}`}>
                                                {viewPOS.type === 'warehouse' ? t('pos.type_warehouse') : t('pos.type_store')}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-4">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-4 w-4 text-slate-500 mt-1" />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{t('pos.form_address')}</span>
                                            <span className="text-sm text-slate-300 leading-relaxed">{viewPOS.address || t('pos.no_address')}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Phone className="h-4 w-4 text-slate-500 mt-1" />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{t('pos.form_phone')}</span>
                                            <span className="text-sm text-slate-300">{viewPOS.phone || t('pos.no_phone')}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Activity className="h-4 w-4 text-slate-500 mt-1" />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{t('pos.table_head_status')}</span>
                                            <Badge className={`w-fit mt-1 font-normal ${viewPOS.isActive ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 rounded-md" : "bg-red-500/10 text-red-500 border-red-500/20 rounded-md"}`}>
                                                {viewPOS.isActive ? t('pos.status_operational') : t('pos.status_deactivated')}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-2 p-4 rounded-lg bg-orange-500/5 border border-orange-500/10 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-4 w-4 text-orange-500" />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{t('pos.detail_created_at')}</span>
                                            <span className="text-sm text-slate-300">{new Date(viewPOS.createdAt).toLocaleString(i18n.language === 'ht' ? 'ht-HT' : i18n.language, { dateStyle: 'full', timeStyle: 'short' })}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="ghost" onClick={() => setIsViewDialogOpen(false)} className="text-slate-400 hover:bg-white/10 hover:text-white">
                            {t('common.cancel')}
                        </Button>
                        <Button onClick={handleEditFromView} className="bg-orange-500 hover:bg-orange-600 text-white gap-2 flex-1 sm:flex-none">
                            <Edit className="h-4 w-4" />
                            {t('pos.edit_from_view')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="bg-slate-900 border-white/10 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">{t('pos.delete_title')}</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400 ">
                            <Trans
                                i18nKey="pos.delete_description"
                                values={{ name: posToDelete?.name }}
                                components={[<span className="font-bold uppercase text-white" />]}
                            />
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-slate-800 border-white/10 text-slate-300 hover:bg-slate-700 hover:text-white">{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600 text-white">
                            {t('pos.delete_confirm')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default PosAdmin;