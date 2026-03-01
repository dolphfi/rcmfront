import React from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
    Plus,
    FileText,
    FileSpreadsheet,
    Printer,
    Search,
    ChevronDown,
    Trash2,
    RotateCw,
    Edit,
    CirclePlus,
    X
} from 'lucide-react';
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import brandService from '../../context/api/brandservice';

const Brand = () => {
    const { t } = useTranslation();
    const [brands, setBrands] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [itemsPerPage, setItemsPerPage] = React.useState(10);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [selectedStatus, setSelectedStatus] = React.useState('All');
    const [isAddOpen, setIsAddOpen] = React.useState(false);
    const [images, setImages] = React.useState<string[]>([]);
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

    const fetchBrands = async () => {
        try {
            setIsLoading(true);
            const data = await brandService.getAll();
            setBrands(data);
        } catch (error) {
            console.error('Failed to fetch brands:', error);
            toast.error(t('brands.error_fetch', 'Failed to load brands'));
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchBrands();
    }, []);

    // Extract unique status
    const brandStatus = ['All', 'Active', 'Inactive'];

    // Filter Brand
    const filteredBrand = brands.filter((brand: any) => {
        const matchesSearch = brand.name.toLowerCase().includes(searchTerm.toLowerCase());
        const mappedStatus = brand.isActive ? 'Active' : 'Inactive';
        const matchesBrand = selectedStatus === 'All' || mappedStatus === selectedStatus;
        return matchesSearch && matchesBrand;
    });

    // Reset page when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedStatus]);


    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentBrand = filteredBrand.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredBrand.length / itemsPerPage);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    }

    const [newBrand, setNewBrand] = React.useState({
        logoUrl: '',
        name: '',
        description: '',
        isActive: true // default active
    });
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            setSelectedFile(file);
            // Take only the first image for now since brand only has 1 logoUrl
            const imageUrl = URL.createObjectURL(file);
            setImages([imageUrl]);
            // Stop setting blob URL in data object!
        }
    };

    const [isEditOpen, setIsEditOpen] = React.useState(false);
    const [editingBrand, setEditingBrand] = React.useState<any>(null);

    const handleEditClick = (brand: any) => {
        setEditingBrand({
            id: brand.id,
            name: brand.name,
            description: brand.description || '',
            isActive: brand.isActive,
            logoUrl: brand.logoUrl || ''
        });
        setImages(brand.logoUrl ? [brand.logoUrl] : []);
        setIsEditOpen(true);
    };

    const handleAddBrand = async () => {
        try {
            if (!newBrand.name) {
                toast.error(t('brands.error_name_required', 'Brand name is required'));
                return;
            }
            await brandService.create(newBrand, selectedFile || undefined);
            toast.success(t('brands.success_create', 'Brand created successfully'));
            setIsAddOpen(false);
            setNewBrand({ logoUrl: '', name: '', description: '', isActive: true });
            setImages([]);
            setSelectedFile(null);
            fetchBrands();
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('brands.error_create', 'Failed to create brand'));
        }
    };

    const handleUpdateBrand = async () => {
        try {
            if (!editingBrand.name) {
                toast.error(t('brands.error_name_required', 'Brand name is required'));
                return;
            }
            await brandService.update(editingBrand.id, editingBrand, selectedFile || undefined);
            toast.success(t('brands.success_update', 'Brand updated successfully'));
            setIsEditOpen(false);
            setSelectedFile(null);
            fetchBrands();
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('brands.error_update', 'Failed to update brand'));
        }
    };

    const handleDeleteBrand = async (id: string) => {
        try {
            await brandService.delete(id);
            toast.success(t('brands.success_delete', 'Brand deleted successfully'));
            fetchBrands();
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('brands.error_delete', 'Failed to delete brand'));
        }
    };
    return (
        <div className="flex flex-col h-full gap-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">{t('brands.title', 'Brand List')}</h1>
                    <p className="text-sm text-slate-400">{t('brands.subtitle', 'Manage your brands')}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Action Icons */}
                    <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10 mr-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:bg-white/10 hover:text-rose-400" title="PDF">
                            <FileText className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-500 hover:bg-white/10 hover:text-emerald-400" title="Excel">
                            <FileSpreadsheet className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:bg-white/10 hover:text-white" title="Print">
                            <Printer className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:bg-white/10 hover:text-white" title="Refresh">
                            <RotateCw className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:bg-white/10 hover:text-white" title="Toggle">
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </div>
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline">{t('brands.add_brand', 'Add Brand')}</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>{t('brands.add_brand', 'Add Brand')}</DialogTitle>
                                <DialogDescription>
                                    {t('brands.add_desc', 'Add a new brand')}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="p-4">
                                <div>
                                    <div className="flex flex-wrap gap-4 mb-6">
                                        <Input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            className="hidden"
                                            ref={fileInputRef}
                                            onChange={handleImageUpload}
                                        />
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="h-24 w-24 rounded-lg border border-dashed border-white/20 hover:border-orange-500/50 hover:bg-white/5 flex flex-col items-center justify-center cursor-pointer transition-all group"
                                        >
                                            <CirclePlus className="h-4 w-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
                                            <span className="text-[10px] font-semibold text-slate-500 group-hover:text-orange-500 mt-2">{t('brands.add_images', 'Add Images')}</span>
                                        </div>
                                        {images.map((image, index) => (
                                            <div key={index} className="h-24 w-24 rounded-lg border border-white/10 p-1 relative group">
                                                <img src={image} alt={`Brand ${index + 1}`} className="h-full w-full object-contain rounded-md" />
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-1 right-1 h-4 w-4 rounded shadow-lg opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all"
                                                    onClick={() => {
                                                        const newImages = [...images];
                                                        newImages.splice(index, 1);
                                                        setImages(newImages);
                                                        setSelectedFile(null);
                                                    }}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="grid gap-4">
                                        <div>
                                            <Label htmlFor="name" className="text-white">Name <span className="text-rose-500">*</span></Label>
                                            <Input
                                                id="name"
                                                value={newBrand.name}
                                                onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                                                className="bg-white/5 border border-white/10 backdrop-blur-sm text-white focus:ring-orange-500 mt-2"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="description" className="text-white">Description</Label>
                                            <Input
                                                id="description"
                                                value={newBrand.description}
                                                onChange={(e) => setNewBrand({ ...newBrand, description: e.target.value })}
                                                className="bg-white/5 border border-white/10 backdrop-blur-sm text-white focus:ring-orange-500 mt-2"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between pt-2">
                                            <Label htmlFor="sub-status" className="text-white">Status</Label>
                                            <Label htmlFor="sub-status" className="text-white">Status</Label>
                                            <Switch
                                                id="sub-status"
                                                checked={newBrand.isActive}
                                                onCheckedChange={(checked) => setNewBrand({ ...newBrand, isActive: checked })}
                                                className="bg-white/5 border border-white/10 backdrop-blur-sm data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-white/5"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" className="bg-slate-800 border-white/10 text-white hover:bg-slate-700 hover:text-white" onClick={() => setIsAddOpen(false)}>
                                    {t('common.cancel', 'Cancel')}
                                </Button>
                                <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={handleAddBrand}>
                                    {t('brands.add_brand', 'Add Brand')}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Edit Brand Dialog */}
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{t('brands.edit_brand', 'Edit Brand')}</DialogTitle>
                            <DialogDescription>
                                {t('brands.update_brand', 'Update brand details')}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="p-4">
                            {editingBrand && (
                                <div>
                                    <div className="flex flex-wrap gap-4 mb-6">
                                        <Input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            className="hidden"
                                            ref={fileInputRef}
                                            onChange={handleImageUpload}
                                        />
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="h-24 w-24 rounded-lg border border-dashed border-white/20 hover:border-orange-500/50 hover:bg-white/5 flex flex-col items-center justify-center cursor-pointer transition-all group"
                                        >
                                            <CirclePlus className="h-4 w-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
                                            <span className="text-[10px] font-semibold text-slate-500 group-hover:text-orange-500 mt-2">{t('brands.change_image', 'Change Image')}</span>
                                        </div>
                                        {images.length > 0 && images.map((image, index) => (
                                            <div key={index} className="h-24 w-24 rounded-lg border border-white/10 p-1 relative group bg-white/5 flex items-center justify-center">
                                                <img src={image} alt={`Brand ${index + 1}`} className="h-full w-full object-contain rounded-md" />
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-1 right-1 h-4 w-4 rounded shadow-lg opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all"
                                                    onClick={() => {
                                                        setImages([]);
                                                        setEditingBrand({ ...editingBrand, logoUrl: '' });
                                                    }}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="grid gap-4">
                                        <div>
                                            <Label htmlFor="edit-name" className="text-white">{t('brands.name', 'Name')} <span className="text-rose-500">*</span></Label>
                                            <Input
                                                id="edit-name"
                                                value={editingBrand.name}
                                                onChange={(e) => setEditingBrand({ ...editingBrand, name: e.target.value })}
                                                className="bg-white/5 border border-white/10 backdrop-blur-sm text-white focus:ring-orange-500 mt-2"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="edit-description" className="text-white">{t('brands.description', 'Description')}</Label>
                                            <Input
                                                id="edit-description"
                                                value={editingBrand.description}
                                                onChange={(e) => setEditingBrand({ ...editingBrand, description: e.target.value })}
                                                className="bg-white/5 border border-white/10 backdrop-blur-sm text-white focus:ring-orange-500 mt-2"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between pt-2">
                                            <Label htmlFor="edit-status" className="text-white">{t('brands.status', 'Status')}</Label>
                                            <Switch
                                                id="edit-status"
                                                checked={editingBrand.isActive}
                                                onCheckedChange={(checked) => setEditingBrand({ ...editingBrand, isActive: checked })}
                                                className="bg-white/5 border border-white/10 backdrop-blur-sm data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-white/5"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" className="bg-slate-800 border-white/10 text-white hover:bg-slate-700 hover:text-white" onClick={() => setIsEditOpen(false)}>
                                {t('common.cancel', 'Cancel')}
                            </Button>
                            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={handleUpdateBrand}>
                                {t('common.save_button', 'Save Changes')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/*Main conten Card  */}
            <Card className="flex-1 bg-white/5 backdrop-blur-sm border border-white/10 text-white overflow-hidden flex flex-col">
                <CardContent className="p-0 flex flex-col h-full">
                    {/* Toolbar / Filters */}
                    <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10">
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder={t('common.search', 'Search...')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-orange-500/50 focus-visible:border-orange-500"
                            />
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white w-full sm:w-32 justify-between">
                                        {selectedStatus === 'All' ? t('common.status', 'Status') : (selectedStatus === 'Active' ? t('category.active', 'Active') : t('category.inactive', 'Inactive'))}
                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-slate-900 border-white/10 text-white">
                                    {brandStatus.map((status) => (
                                        <DropdownMenuItem
                                            key={status}
                                            onClick={() => setSelectedStatus(status)}
                                            className="focus:bg-white/10 focus:text-white cursor-pointer"
                                        >
                                            {status === 'All' ? 'All' : (status === 'Active' ? t('category.active', 'Active') : t('category.inactive', 'Inactive'))}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                    {/* Table */}
                    <div className="flex-1 overflow-auto rounded-lg border border-white/10 bg-slate-900/50">
                        <Table>
                            <TableHeader className="bg-slate-900 border-b border-white/10">
                                <TableRow className="hover:bg-transparent border-white/10">
                                    <TableHead className="text-white">{t('brands.table_brand', 'Brand')}</TableHead>
                                    <TableHead className="text-white">{t('brands.table_created', 'Created Date')}</TableHead>
                                    <TableHead className="text-white">{t('brands.table_status', 'Status')}</TableHead>
                                    <TableHead className="text-right text-white">{t('brands.table_action', 'Action')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-slate-400">Loading...</TableCell>
                                    </TableRow>
                                ) : currentBrand.length > 0 ? (
                                    currentBrand.map((brand: any) => (
                                        <TableRow key={brand.id} className="hover:bg-white/10 border-white/10">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg overflow-hidden border border-white/10 flex items-center justify-center bg-white/5">
                                                        {brand.logoUrl ? (
                                                            <img src={brand.logoUrl} alt={brand.name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <span className="text-slate-400 font-bold">{brand.name.charAt(0).toUpperCase()}</span>
                                                        )}
                                                    </div>
                                                    <span className="font-medium text-white group-hover:text-orange-400 transition-colors">{brand.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-white">
                                                {brand.createdAt ? new Date(brand.createdAt).toLocaleDateString() : '-'}
                                            </TableCell>
                                            <TableCell className='font-medium text-slate-300'>
                                                <span className={`px-2 py-1 rounded-md text-xs font-medium border ${brand.isActive
                                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                    : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                                                    }`}>
                                                    {brand.isActive ? t('category.active', 'Active') : t('category.inactive', 'Inactive')}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10" onClick={() => handleEditClick(brand)}>
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
                                                                <AlertDialogTitle className="text-white">{t('brands.delete_confirm_title', 'Are you absolutely sure?')}</AlertDialogTitle>
                                                                <AlertDialogDescription className="text-slate-400 whitespace-pre-line">
                                                                    {t('brands.delete_confirm_desc', 'This action cannot be undone. This will permanently delete the brand "{{name}}" and remove it from our servers.', { name: brand.name })}
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/10 hover:text-white">
                                                                    {t('common.cancel', 'Cancel')}
                                                                </AlertDialogCancel>
                                                                <AlertDialogAction className="bg-rose-500 hover:bg-rose-600 text-white border-0" onClick={() => handleDeleteBrand(brand.id)}>
                                                                    {t('common.delete', 'Delete')}
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
                                        <TableCell colSpan={10} className="text-center py-8 text-slate-400">
                                            {t('brands.no_brands_found', 'No brand found matching your filters.')}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    {/* Pagination */}
                    <div className="p-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                            <span>{t('category.row_per_page', 'Row Per Page')}</span>
                            <Select defaultValue="10" onValueChange={(value) => { setItemsPerPage(Number(value)); setCurrentPage(1); }}>
                                <SelectTrigger className="w-[70px] h-8 bg-white/5 border-white/10 text-white focus:ring-orange-500/50">
                                    <SelectValue placeholder="10" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/10 text-white">
                                    <SelectItem value="5" className="focus:bg-white/10 focus:text-white">5</SelectItem>
                                    <SelectItem value="10" className="focus:bg-white/10 focus:text-white">10</SelectItem>
                                    <SelectItem value="25" className="focus:bg-white/10 focus:text-white">25</SelectItem>
                                    <SelectItem value="50" className="focus:bg-white/10 focus:text-white">50</SelectItem>
                                </SelectContent>
                            </Select>
                            <span>{t('category.entries', 'Entries')}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span>
                                {filteredBrand.length > 0 ? Math.min(startIndex + 1, filteredBrand.length) : 0} - {Math.min(endIndex, filteredBrand.length)} of {filteredBrand.length}
                            </span>
                            <Pagination className="w-auto">
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href="#"
                                            onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
                                            className={`text-slate-400 hover:text-white hover:bg-white/10 ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}`}
                                        />
                                    </PaginationItem>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <PaginationItem key={page}>
                                            <PaginationLink
                                                href="#"
                                                isActive={currentPage === page}
                                                onClick={(e) => { e.preventDefault(); handlePageChange(page); }}
                                                className={currentPage === page ? "text-white bg-orange-500 hover:bg-orange-600 border-none" : "text-slate-400 hover:text-white hover:bg-white/10"}
                                            >
                                                {page}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}

                                    <PaginationItem>
                                        <PaginationNext
                                            href="#"
                                            onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}
                                            className={`text-slate-400 hover:text-white hover:bg-white/10 ${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}`}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Brand;
