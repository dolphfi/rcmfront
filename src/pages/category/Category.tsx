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
    Edit
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
import { Badge } from '../../components/ui/badge';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import categoryService from '../../context/api/categoryservice';

const Category: React.FC = () => {
    const { t } = useTranslation();
    const [categoriesList, setCategoriesList] = React.useState<any[]>([]);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [itemsPerPage, setItemsPerPage] = React.useState(10);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [selectedStatus, setSelectedStatus] = React.useState('All');
    const [selectedType, setSelectedType] = React.useState('All');
    const [searchTermSub, setSearchTermSub] = React.useState('');
    const [selectedStatusSub, setSelectedStatusSub] = React.useState('All');
    const [selectedCategory, setSelectedCategory] = React.useState('All');
    const [currentPageSub, setCurrentPageSub] = React.useState(1);
    const [itemsPerPageSub, setItemsPerPageSub] = React.useState(10);
    const fetchCategories = React.useCallback(async () => {
        try {
            // setIsLoading(true);
            const data = await categoryService.getAll();
            setCategoriesList(data);
        } catch (error) {
            toast.error(t('common.error_fetching_data'));
            console.error(error);
        } finally {
            // setIsLoading(false);
        }
    }, [t]);

    React.useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const categoryData = categoriesList;
    const subCategoryData = categoriesList.flatMap((cat: any) =>
        (cat.subCategories || []).map((sub: any) => ({ ...sub, parent: cat }))
    );

    const uniqueStatuses = ['All', ...Array.from(new Set(categoryData.map(p => p.isActive ? 'Active' : 'Inactive')))];
    const uniqueSubStatuses = ['All', ...Array.from(new Set(subCategoryData.map(p => p.isActive ? 'Active' : 'Inactive')))];

    // Filter Category
    const filteredCategory = categoryData.filter(cat => {
        const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cat.slug.toLowerCase().includes(searchTerm.toLowerCase());
        const statusStr = cat.isActive ? 'Active' : 'Inactive';
        const matchesStatus = selectedStatus === 'All' || statusStr === selectedStatus;
        const matchesType = selectedType === 'All' || cat.type === selectedType.toLowerCase();
        return matchesSearch && matchesStatus && matchesType;
    });

    // Filter SubCategory
    const filteredSubCategory = subCategoryData.filter(sub => {
        const matchesSearch = sub.name.toLowerCase().includes(searchTermSub.toLowerCase()) ||
            (sub.description && sub.description.toLowerCase().includes(searchTermSub.toLowerCase()));
        const parentName = sub.parent?.name || '';
        const matchesCategory = selectedCategory === 'All' || parentName === selectedCategory;
        const statusStr = sub.isActive ? 'Active' : 'Inactive';
        const matchesStatusSub = selectedStatusSub === 'All' || statusStr === selectedStatusSub;
        return matchesSearch && matchesCategory && matchesStatusSub;
    });

    const [newCategory, setNewCategory] = React.useState({
        name: '',
        slug: '',
        status: true, // default active
        type: 'product' as 'product' | 'service'
    });

    const [newSubCategory, setNewSubCategory] = React.useState({
        name: '',
        category_id: '',
        description: '',
        status: true // default active
    });

    const genSlug = (name: string) => {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '') // Remove special chars
            .replace(/\s+/g, '-'); // Replace spaces with -
    }

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setNewCategory({
            ...newCategory,
            name,
            slug: genSlug(name)
        });
    }

    const handleAddCategory = async () => {
        if (!newCategory.name) {
            toast.error(t('products.error_name_required'));
            return;
        }
        try {
            await categoryService.create({
                name: newCategory.name,
                description: '',
                isActive: newCategory.status,
                type: newCategory.type
            });
            toast.success(t('products.category_added'));
            setIsAddOpen(false);
            setNewCategory({ name: '', slug: '', status: true, type: 'product' });
            fetchCategories();
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('common.error_saving'));
        }
    };

    const handleUpdateCategory = async () => {
        if (!editingCategory || !editingCategory.name) return;
        try {
            await categoryService.update(editingCategory.id, {
                name: editingCategory.name,
                isActive: editingCategory.status,
                type: editingCategory.type
            });
            toast.success(t('products.category_updated'));
            setEditingCategory(null);
            fetchCategories();
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('common.error_saving'));
        }
    };

    const handleAddSubCategory = async () => {
        if (!newSubCategory.name || !newSubCategory.category_id) {
            toast.error(t('common.fill_required_fields'));
            return;
        }
        try {
            await categoryService.create({
                name: newSubCategory.name,
                description: newSubCategory.description,
                isActive: newSubCategory.status,
                parentId: newSubCategory.category_id
            });
            toast.success(t('products.subcategory_added'));
            setIsAddSubOpen(false);
            setNewSubCategory({ name: '', category_id: '', description: '', status: true });
            fetchCategories();
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('common.error_saving'));
        }
    };

    const handleUpdateSubCategory = async () => {
        if (!editingSubCategory || !editingSubCategory.name) return;
        try {
            await categoryService.update(editingSubCategory.id, {
                name: editingSubCategory.name,
                description: editingSubCategory.description,
                isActive: editingSubCategory.status,
                parentId: editingSubCategory.category_id
            });
            toast.success(t('products.subcategory_updated'));
            setIsEditSubOpen(false);
            setEditingSubCategory(null);
            fetchCategories();
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('common.error_saving'));
        }
    };

    // Reset page when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedStatus]);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentCategory = filteredCategory.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredCategory.length / itemsPerPage);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    }

    React.useEffect(() => {
        setCurrentPageSub(1);
    }, [searchTermSub, selectedStatusSub]);

    const startIndexSub = (currentPageSub - 1) * itemsPerPageSub;
    const endIndexSub = startIndexSub + itemsPerPageSub;
    const currentSubCategory = filteredSubCategory.slice(startIndexSub, endIndexSub);
    const totalPagesSub = Math.ceil(filteredSubCategory.length / itemsPerPageSub);

    const handlePageChangeSub = (page: number) => {
        if (page >= 1 && page <= totalPagesSub) {
            setCurrentPageSub(page);
        }
    };

    const [editingCategory, setEditingCategory] = React.useState<{ id: string, name: string, slug: string, status: boolean, type: 'product' | 'service' } | null>(null);
    const [editingSubCategory, setEditingSubCategory] = React.useState<{ id: string, name: string, status: boolean, category_id: string, description: string } | null>(null);
    const [isAddOpen, setIsAddOpen] = React.useState(false);
    const [isAddSubOpen, setIsAddSubOpen] = React.useState(false);
    const [isEditSubOpen, setIsEditSubOpen] = React.useState(false);

    const handleEditClick = (cat: any) => {
        setEditingCategory({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            status: cat.isActive,
            type: cat.type || 'product'
        });
    }

    const handleEditNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setEditingCategory(prev => prev ? {
            ...prev,
            name,
            slug: genSlug(name)
        } : null);
    }

    const handleEditSubClick = (sub: any) => {
        setEditingSubCategory({
            id: sub.id,
            name: sub.name,
            status: sub.isActive,
            category_id: sub.parent?.id,
            description: sub.description
        });
        setIsEditSubOpen(true);
    };

    return (
        <div className="flex flex-col h-full gap-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">{t('category.title')}</h1>
                    <p className="text-sm text-muted-foreground">{t('category.subtitle_cat')}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Action Icons */}
                    <div className="flex items-center gap-1 bg-muted p-1 rounded-lg border border-border mr-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:bg-primary/10 hover:text-rose-400" title="PDF">
                            <FileText className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-500 hover:bg-primary/10 hover:text-emerald-400" title="Excel">
                            <FileSpreadsheet className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-primary/10 hover:text-primary" title="Print">
                            <Printer className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-primary/10 hover:text-primary" title="Refresh">
                            <RotateCw className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-primary/10 hover:text-primary" title="Toggle">
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </div>
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline">{t('category.add_cat')}</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-background border-border text-foreground sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>{t('category.add_cat')}</DialogTitle>
                                <DialogDescription className="text-muted-foreground">
                                    {t('category.add_cat_desc')}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category" className="text-foreground">{t('products.category')} <span className="text-rose-500">*</span></Label>
                                    <Input
                                        id="category"
                                        value={newCategory.name}
                                        onChange={handleNameChange}
                                        className="bg-muted border-border text-foreground focus-visible:ring-ring"
                                        placeholder={t('category.cat_name_placeholder')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="slug" className="text-foreground">{t('category.table_slug')} <span className="text-rose-500">*</span></Label>
                                    <Input
                                        id="slug"
                                        value={newCategory.slug}
                                        readOnly
                                        className="bg-muted border-border text-muted-foreground cursor-not-allowed focus-visible:ring-0"
                                        placeholder={t('category.slug_placeholder')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground">{t('category.table_type')} <span className="text-rose-500">*</span></Label>
                                    <Select
                                        value={newCategory.type}
                                        onValueChange={(value) => setNewCategory({ ...newCategory, type: value as 'product' | 'service' })}
                                    >
                                        <SelectTrigger className="bg-muted border border-border text-foreground focus-visible:ring-ring">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-background border-border text-foreground">
                                            <SelectItem value="product">Product</SelectItem>
                                            <SelectItem value="service">Service</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center justify-between pt-2">
                                    <Label htmlFor="status" className="text-foreground">{t('category.table_status')} <span className="text-rose-500">*</span></Label>
                                    <Switch
                                        id="status"
                                        checked={newCategory.status}
                                        onCheckedChange={(checked) => setNewCategory({ ...newCategory, status: checked })}
                                        className="bg-muted border border-border data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-muted"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" className="bg-background border-border text-foreground hover:bg-primary/10 hover:text-primary" onClick={() => setIsAddOpen(false)}>{t('common.cancel')}</Button>
                                <Button className="bg-primary hover:bg-primary/90 text-white" onClick={handleAddCategory}>{t('common.save_button')}</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Dialog open={isAddSubOpen} onOpenChange={setIsAddSubOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline">{t('category.add_sub')}</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl bg-background border-border text-foreground">
                            <DialogHeader>
                                <DialogTitle>{t('category.add_sub')}</DialogTitle>
                                <DialogDescription>
                                    {t('category.add_sub_desc')}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="p-4">
                                <div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="category" className="text-foreground">{t('products.category')} <span className="text-rose-500">*</span></Label>
                                            <Select
                                                value={newSubCategory.category_id}
                                                onValueChange={(value) => setNewSubCategory({ ...newSubCategory, category_id: value })}
                                            >
                                                <SelectTrigger className="bg-muted border border-border text-foreground focus-visible:ring-ring mt-2">
                                                    <SelectValue placeholder={t('category.select_cat')} />
                                                </SelectTrigger>
                                                <SelectContent className="bg-background border-border text-foreground">
                                                    {categoryData.map((cat) => (
                                                        <SelectItem key={cat.id} value={cat.id} className="focus:bg-primary/10 focus:text-foreground cursor-pointer">
                                                            {cat.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="name" className="text-foreground">{t('category.table_name')} <span className="text-rose-500">*</span></Label>
                                            <Input
                                                id="name"
                                                value={newSubCategory.name}
                                                onChange={(e) => setNewSubCategory({ ...newSubCategory, name: e.target.value })}
                                                className="bg-muted border border-border text-foreground focus-visible:ring-ring mt-2"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="description" className="text-foreground">{t('category.table_description')}</Label>
                                            <Input
                                                id="description"
                                                value={newSubCategory.description}
                                                onChange={(e) => setNewSubCategory({ ...newSubCategory, description: e.target.value })}
                                                className="bg-muted border border-border text-foreground focus-visible:ring-ring mt-2"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between pt-2">
                                            <Label htmlFor="sub-status" className="text-foreground">{t('category.table_status')}</Label>
                                            <Switch
                                                id="sub-status"
                                                checked={newSubCategory.status}
                                                onCheckedChange={(checked) => setNewSubCategory({ ...newSubCategory, status: checked })}
                                                className="bg-muted border border-border data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-muted"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" className="bg-background border-border text-foreground hover:bg-primary/10 hover:text-primary" onClick={() => setIsAddSubOpen(false)}>{t('common.cancel')}</Button>
                                <Button className="bg-primary hover:bg-primary/90 text-white" onClick={handleAddSubCategory}>{t('common.save_button')}</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Main Category card */}
                <Card className="flex-1 bg-muted border border-border text-foreground overflow-hidden flex flex-col">
                    <CardContent className="p-0 flex flex-col h-full">
                        {/* Toolbar / Filters */}
                        <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border">
                            <div className="relative w-full sm:w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-ring focus-visible:border-primary"
                                />
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="bg-muted border-border text-foreground hover:bg-primary/10 hover:text-primary w-full sm:w-32 justify-between">
                                            {selectedType === 'All' ? t('category.table_type') : selectedType}
                                            <ChevronDown className="h-4 w-4 opacity-50" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="bg-background border-border text-foreground">
                                        <DropdownMenuItem onClick={() => setSelectedType('All')}>All</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setSelectedType('Product')}>Product</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setSelectedType('Service')}>Service</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="bg-muted border-border text-foreground hover:bg-primary/10 hover:text-primary w-full sm:w-32 justify-between">
                                            {selectedStatus === 'All' ? t('common.status') : selectedStatus}
                                            <ChevronDown className="h-4 w-4 opacity-50" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="bg-background border-border text-foreground">
                                        {uniqueStatuses.map((status) => (
                                            <DropdownMenuItem
                                                key={status}
                                                onClick={() => setSelectedStatus(status)}
                                                className="focus:bg-primary/10 focus:text-foreground cursor-pointer"
                                            >
                                                {status}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                        {/* Table */}
                        <div className="flex-1 overflow-auto rounded-lg border border-border bg-background">
                            <Table>
                                <TableHeader className="bg-background border-b border-border">
                                    <TableRow className="hover:bg-transparent border-border">
                                        <TableHead className="text-foreground">{t('category.table_name')}</TableHead>
                                        <TableHead className="text-foreground">{t('category.table_type')}</TableHead>
                                        <TableHead className="text-foreground">{t('category.table_status')}</TableHead>
                                        <TableHead className="text-right text-foreground">{t('category.table_actions')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentCategory.length > 0 ? (
                                        currentCategory.map((category) => (
                                            <TableRow key={category.id} className="hover:bg-muted transition-colors border-border group">
                                                <TableCell className='font-medium text-foreground'>{category.name}</TableCell>
                                                <TableCell className='font-medium text-foreground'>
                                                    <Badge className={category.type === 'service' ? "rounded-md bg-orange-500/20 text-orange-400 border-orange-500/30" : "rounded-md bg-blue-500/20 text-blue-400 border-blue-500/30"}>
                                                        {category.type === 'service' ? 'Service' : 'Product'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className='font-medium text-foreground'>
                                                    <span className={`px-2 py-1 rounded-md text-xs font-medium border ${category.isActive
                                                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 rounded-md'
                                                        : 'bg-orange-500/10 text-orange-500 border-orange-500/20 rounded-md'
                                                        }`}>
                                                        {category.isActive ? t('category.active') : t('category.inactive')}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10" onClick={() => handleEditClick(category)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent className="bg-background border-border">
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle className="text-foreground">Are you absolutely sure?</AlertDialogTitle>
                                                                    <AlertDialogDescription className="text-muted-foreground">
                                                                        This action cannot be undone. This will permanently delete the category
                                                                        <span className="font-medium text-foreground"> "{category.name}" </span>
                                                                        and remove it from our servers.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel className="bg-transparent border-border text-foreground hover:bg-primary/10 hover:text-primary">Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction className="bg-rose-500 hover:bg-rose-600 text-white border-0">Delete</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))

                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                                                {t('category.no_cat')}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        <div className="p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <span>{t('category.row_per_page')}</span>
                                <Select defaultValue="10" onValueChange={(value) => { setItemsPerPage(Number(value)); setCurrentPage(1); }}>
                                    <SelectTrigger className="w-[70px] h-8 bg-muted border-border text-foreground focus-visible:ring-ring">
                                        <SelectValue placeholder="10" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-background border-border text-foreground">
                                        <SelectItem value="5" className="focus:bg-primary/10 focus:text-foreground">5</SelectItem>
                                        <SelectItem value="10" className="focus:bg-primary/10 focus:text-foreground">10</SelectItem>
                                        <SelectItem value="25" className="focus:bg-primary/10 focus:text-foreground">25</SelectItem>
                                        <SelectItem value="50" className="focus:bg-primary/10 focus:text-foreground">50</SelectItem>
                                    </SelectContent>
                                </Select>
                                <span>{t('category.entries')}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <span>
                                    {filteredCategory.length > 0 ? Math.min(startIndex + 1, filteredCategory.length) : 0} - {Math.min(endIndex, filteredCategory.length)} of {filteredCategory.length}
                                </span>
                                <Pagination className="w-auto">
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                href="#"
                                                onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
                                                className={`text-muted-foreground hover:text-primary hover:bg-primary/10 ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}`}
                                            />
                                        </PaginationItem>

                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <PaginationItem key={page}>
                                                <PaginationLink
                                                    href="#"
                                                    isActive={currentPage === page}
                                                    onClick={(e) => { e.preventDefault(); handlePageChange(page); }}
                                                    className={currentPage === page ? "text-white bg-primary rounded-md hover:bg-primary/90 border-none" : "text-muted-foreground rounded-md hover:text-primary hover:bg-primary/10"}
                                                >
                                                    {page}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ))}

                                        <PaginationItem>
                                            <PaginationNext
                                                href="#"
                                                onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}
                                                className={`text-muted-foreground hover:text-primary hover:bg-primary/10 ${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}`}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Edit Category Dialog */}
                <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
                    <DialogContent className="bg-background border-border text-foreground sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{t('category.edit_cat')}</DialogTitle>
                            <DialogDescription className="text-muted-foreground">
                                Make changes to your category here.
                            </DialogDescription>
                        </DialogHeader>
                        {editingCategory && (
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-category" className="text-foreground">{t('products.category')} <span className="text-rose-500">*</span></Label>
                                    <Input
                                        id="edit-category"
                                        value={editingCategory.name}
                                        onChange={handleEditNameChange}
                                        className="bg-muted border-border text-foreground focus-visible:ring-ring"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-slug" className="text-foreground">Slug <span className="text-rose-500">*</span></Label>
                                    <Input
                                        id="edit-slug"
                                        value={editingCategory.slug}
                                        readOnly
                                        className="bg-muted border-border text-muted-foreground cursor-not-allowed focus-visible:ring-0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground">{t('category.table_type')} <span className="text-rose-500">*</span></Label>
                                    <Select
                                        value={editingCategory.type}
                                        onValueChange={(value) => setEditingCategory(prev => prev ? { ...prev, type: value as 'product' | 'service' } : null)}
                                    >
                                        <SelectTrigger className="bg-muted border border-border text-foreground focus-visible:ring-ring">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-background border-border text-foreground">
                                            <SelectItem value="product">Product</SelectItem>
                                            <SelectItem value="service">Service</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center justify-between pt-2">
                                    <Label htmlFor="edit-status" className="text-foreground">Status <span className="text-rose-500">*</span></Label>
                                    <Switch
                                        id="edit-status"
                                        checked={editingCategory.status}
                                        onCheckedChange={(checked) => setEditingCategory(prev => prev ? { ...prev, status: checked } : null)}
                                        className="bg-muted border border-border data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-muted"
                                    />
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" className="bg-background border-border text-foreground hover:bg-primary/10 hover:text-primary" onClick={() => setEditingCategory(null)}>{t('common.cancel')}</Button>
                            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={handleUpdateCategory}>{t('common.save_button')}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Main Sub-Category card */}
                <Card className="flex-1 bg-muted border border-border text-foreground overflow-hidden flex flex-col">
                    <CardContent className="p-0 flex flex-col h-full">
                        {/* Toolbar / Filters */}
                        <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border">
                            <div className="relative w-full sm:w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search..."
                                    value={searchTermSub}
                                    onChange={(e) => setSearchTermSub(e.target.value)}
                                    className="pl-9 bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-ring focus-visible:border-primary"
                                />
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="bg-muted border-border text-foreground hover:bg-primary/10 hover:text-primary w-full sm:w-32 justify-between">
                                            {selectedCategory === 'All' ? t('products.category') : selectedCategory}
                                            <ChevronDown className="h-4 w-4 opacity-50" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="bg-background border-border text-foreground">
                                        <DropdownMenuItem onClick={() => setSelectedCategory('All')} className="focus:bg-primary/10 focus:text-foreground cursor-pointer">All</DropdownMenuItem>
                                        {categoryData.map((cat) => (
                                            <DropdownMenuItem
                                                key={cat.id}
                                                onClick={() => setSelectedCategory(cat.name)}
                                                className="focus:bg-primary/10 focus:text-foreground cursor-pointer"
                                            >
                                                {cat.name}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="bg-muted border-border text-foreground hover:bg-primary/10 hover:text-primary w-full sm:w-32 justify-between">
                                            {selectedStatusSub === 'All' ? t('common.status') : selectedStatusSub}
                                            <ChevronDown className="h-4 w-4 opacity-50" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="bg-background border-border text-foreground">
                                        {uniqueSubStatuses.map((status) => (
                                            <DropdownMenuItem
                                                key={status}
                                                onClick={() => setSelectedStatusSub(status)}
                                                className="focus:bg-primary/10 focus:text-foreground cursor-pointer"
                                            >
                                                {status}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="flex-1 overflow-auto rounded-lg border border-border bg-background">
                            <Table>
                                <TableHeader className="bg-background border-b border-border">
                                    <TableRow className="hover:bg-transparent border-border">
                                        <TableHead className="text-foreground">{t('category.table_name')}</TableHead>
                                        <TableHead className="text-foreground">{t('products.category')}</TableHead>
                                        <TableHead className="text-foreground">{t('category.table_status')}</TableHead>
                                        <TableHead className="text-right text-foreground">{t('category.table_actions')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentSubCategory.length > 0 ? (
                                        currentSubCategory.map((sub) => (
                                            <TableRow key={sub.id} className="hover:bg-muted transition-colors border-border group">
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-foreground">{sub.name}</span>
                                                        <span className="text-xs text-muted-foreground">{sub.description}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-foreground">
                                                    {sub.parent?.name || 'Unknown'}
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded-md text-xs font-medium border ${sub.isActive
                                                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                        : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                                                        }`}>
                                                        {sub.isActive ? t('category.active') : t('category.inactive')}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10" onClick={() => handleEditSubClick(sub)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent className="bg-background border-border">
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle className="text-foreground">Are you absolutely sure?</AlertDialogTitle>
                                                                    <AlertDialogDescription className="text-muted-foreground">
                                                                        This action cannot be undone. This will permanently delete the sub category
                                                                        <span className="font-medium text-foreground"> "{sub.name}" </span>
                                                                        and remove it from our servers.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel className="bg-transparent border-border text-foreground hover:bg-primary/10 hover:text-primary">Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction className="bg-rose-500 hover:bg-rose-600 text-white border-0">Delete</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                {t('category.no_sub')}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination sub*/}
                        <div className="p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <span>{t('category.row_per_page')}</span>
                                <Select defaultValue="10" onValueChange={(value) => { setItemsPerPageSub(Number(value)); setCurrentPageSub(1); }}>
                                    <SelectTrigger className="w-[70px] h-8 bg-muted border-border text-foreground focus-visible:ring-ring">
                                        <SelectValue placeholder="10" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-background border-border text-foreground">
                                        <SelectItem value="5" className="focus:bg-primary/10 focus:text-foreground">5</SelectItem>
                                        <SelectItem value="10" className="focus:bg-primary/10 focus:text-foreground">10</SelectItem>
                                        <SelectItem value="25" className="focus:bg-primary/10 focus:text-foreground">25</SelectItem>
                                        <SelectItem value="50" className="focus:bg-primary/10 focus:text-foreground">50</SelectItem>
                                    </SelectContent>
                                </Select>
                                <span>{t('category.entries')}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <span>
                                    {filteredSubCategory.length > 0 ? Math.min(startIndexSub + 1, filteredSubCategory.length) : 0} - {Math.min(endIndexSub, filteredSubCategory.length)} of {filteredSubCategory.length}
                                </span>
                                <Pagination className="w-auto">
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                href="#"
                                                onClick={(e) => { e.preventDefault(); handlePageChangeSub(currentPageSub - 1); }}
                                                className={`text-muted-foreground hover:text-primary hover:bg-primary/10 ${currentPageSub === 1 ? 'pointer-events-none opacity-50' : ''}`}
                                            />
                                        </PaginationItem>

                                        {Array.from({ length: totalPagesSub }, (_, i) => i + 1).map((page) => (
                                            <PaginationItem key={page}>
                                                <PaginationLink
                                                    href="#"
                                                    isActive={currentPageSub === page}
                                                    onClick={(e) => { e.preventDefault(); handlePageChangeSub(page); }}
                                                    className={currentPageSub === page ? "text-white bg-primary hover:bg-primary/90 border-none" : "text-muted-foreground hover:text-primary hover:bg-primary/10"}
                                                >
                                                    {page}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ))}

                                        <PaginationItem>
                                            <PaginationNext
                                                href="#"
                                                onClick={(e) => { e.preventDefault(); handlePageChangeSub(currentPageSub + 1); }}
                                                className={`text-muted-foreground hover:text-primary hover:bg-primary/10 ${currentPageSub === totalPagesSub ? 'pointer-events-none opacity-50' : ''}`}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Edit Sub Category Dialog */}
                <Dialog open={isEditSubOpen} onOpenChange={setIsEditSubOpen}>
                    <DialogContent className="max-w-2xl bg-background border-border text-foreground">
                        <DialogHeader>
                            <DialogTitle>{t('category.edit_sub')}</DialogTitle>
                            <DialogDescription>
                                Update sub category details
                            </DialogDescription>
                        </DialogHeader>
                        <div className="p-4">
                            {editingSubCategory && (
                                <div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="edit-category" className="text-foreground">{t('products.category')} <span className="text-rose-500">*</span></Label>
                                            <Select
                                                value={editingSubCategory.category_id}
                                                onValueChange={(value) => setEditingSubCategory({ ...editingSubCategory, category_id: value })}
                                            >
                                                <SelectTrigger className="bg-muted border border-border text-foreground focus-visible:ring-ring mt-2">
                                                    <SelectValue placeholder="Select Category" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-background border-border text-foreground">
                                                    {categoryData.map((cat) => (
                                                        <SelectItem key={cat.id} value={cat.id} className="focus:bg-primary/10 focus:text-foreground cursor-pointer">
                                                            {cat.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="edit-name" className="text-foreground">Name <span className="text-rose-500">*</span></Label>
                                            <Input
                                                id="edit-name"
                                                value={editingSubCategory.name}
                                                onChange={(e) => setEditingSubCategory({ ...editingSubCategory, name: e.target.value })}
                                                className="bg-muted border border-border text-foreground focus-visible:ring-ring mt-2"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="edit-description" className="text-foreground">{t('category.table_description')}</Label>
                                            <Input
                                                id="edit-description"
                                                value={editingSubCategory.description}
                                                onChange={(e) => setEditingSubCategory({ ...editingSubCategory, description: e.target.value })}
                                                className="bg-muted border border-border text-foreground focus-visible:ring-ring mt-2"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between pt-2">
                                            <Label htmlFor="edit-status" className="text-foreground">Status</Label>
                                            <Switch
                                                id="edit-status"
                                                checked={editingSubCategory.status}
                                                onCheckedChange={(checked) => setEditingSubCategory({ ...editingSubCategory, status: checked })}
                                                className="bg-muted border border-border data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-muted"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" className="bg-background border-border text-foreground hover:bg-primary/10 hover:text-primary" onClick={() => setIsEditSubOpen(false)}>{t('common.cancel')}</Button>
                            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={handleUpdateSubCategory}>{t('common.save_button')}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </div>
        </div>
    );
};
export default Category;
