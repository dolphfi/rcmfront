import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import productService from '../../context/api/productservice';
import { format } from 'date-fns';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
    FileText,
    FileSpreadsheet,
    RotateCw,
    Search,
    ChevronDown,
    Printer,
    Edit,
    Trash2
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { PaginationNext, PaginationPrevious } from '../../components/ui/pagination';
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
import { DatePickerInput } from '../../components/custom/date-picker-input';
import { Label } from '../../components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { cn } from '../../lib/utils';

const ExpiredProducts: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [products, setProducts] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [itemsPerPage, setItemsPerPage] = React.useState(10);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [selectedProduct, setSelectedProduct] = React.useState('All');
    const [sortOption, setSortOption] = React.useState('date-desc');

    // Edit Dialog State
    const [isEditOpen, setIsEditOpen] = React.useState(false);
    const [editingProduct, setEditingProduct] = React.useState<any>(null);
    const [manufacturedDate, setManufacturedDate] = React.useState<Date | undefined>();
    const [expiryDate, setExpiryDate] = React.useState<Date | undefined>();

    const fetchExpiredProducts = async () => {
        try {
            setIsLoading(true);
            const data = await productService.getExpired();
            setProducts(data);
        } catch (error) {
            toast.error(t('expired.fetch_error') || 'Erè pandan n ap chache pwodwi ki ekspire yo');
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchExpiredProducts();
    }, []);

    const handleEditClick = (product: any) => {
        setEditingProduct(product);
        setManufacturedDate(product.manufacturedDate ? new Date(product.manufacturedDate) : undefined);
        setExpiryDate(product.expiryDate ? new Date(product.expiryDate) : undefined);
        setIsEditOpen(true);
    };

    const handleSave = async () => {
        if (!editingProduct) return;
        try {
            await productService.update(editingProduct.id, {
                manufacturedDate,
                expiryDate
            });
            toast.success(t('expired.update_success') || 'Pwodwi mizajou avèk siksè');
            setIsEditOpen(false);
            fetchExpiredProducts();
        } catch (error) {
            toast.error(t('common.error_saving'));
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await productService.remove(id);
            toast.success(t('products.delete_success'));
            fetchExpiredProducts();
        } catch (error) {
            toast.error(t('common.error_saving'));
        }
    };

    const uniqueProductNames = Array.from(new Set(products.map(p => p.name)));

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.pricingStocks?.[0]?.sku || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesProduct = selectedProduct === 'All' || product.name === selectedProduct;
        return matchesSearch && matchesProduct;
    }).sort((a, b) => {
        if (sortOption === 'date-desc') return new Date(b.expiryDate).getTime() - new Date(a.expiryDate).getTime();
        if (sortOption === 'date-asc') return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
        if (sortOption === 'name-asc') return a.name.localeCompare(b.name);
        if (sortOption === 'name-desc') return b.name.localeCompare(a.name);
        return 0;
    });

    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedProduct, sortOption]);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProducts = filteredProducts.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const formatDateStr = (date: any) => {
        if (!date) return 'N/A';
        try {
            return format(new Date(date), 'dd MMM yyyy');
        } catch (e) {
            return 'N/A';
        }
    };

    return (
        <div className="flex flex-col h-full gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">{t('expired.title')}</h1>
                    <p className="text-sm text-slate-400">{t('expired.subtitle')}</p>
                </div>

                <div className="flex items-center gap-2">
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
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:bg-white/10 hover:text-white" title="Refresh" onClick={fetchExpiredProducts}>
                            <RotateCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:bg-white/10 hover:text-white" title="Toggle">
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <Card className="flex-1 bg-white/5 backdrop-blur-sm border border-white/10 text-white overflow-hidden flex flex-col">
                <CardContent className="p-0 flex flex-col h-full">
                    <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10">
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder={t('common.search')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-0 focus-visible:border-orange-500 focus-visible:ring-offset-0"
                            />
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white w-full sm:w-auto justify-between gap-2">
                                        {selectedProduct === 'All' ? t('expired.filter_product') : selectedProduct}
                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-slate-900 border-white/10 text-white max-h-60 overflow-y-auto">
                                    <DropdownMenuItem onClick={() => setSelectedProduct('All')} className="focus:bg-white/10 focus:text-white cursor-pointer">
                                        {t('common.all')}
                                    </DropdownMenuItem>
                                    {uniqueProductNames.map((name) => (
                                        <DropdownMenuItem key={name} onClick={() => setSelectedProduct(name)} className="focus:bg-white/10 focus:text-white cursor-pointer">
                                            {name}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white w-full sm:w-auto justify-between gap-2">
                                        {t('common.sort_by')}: {sortOption === 'date-desc' ? t('common.newest') : sortOption === 'date-asc' ? t('common.oldest') : sortOption === 'name-asc' ? 'A-Z' : 'Z-A'}
                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-slate-900 border-white/10 text-white">
                                    <DropdownMenuItem onClick={() => setSortOption('date-desc')} className="focus:bg-white/10 focus:text-white cursor-pointer">{t('common.newest')}</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSortOption('date-asc')} className="focus:bg-white/10 focus:text-white cursor-pointer">{t('common.oldest')}</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSortOption('name-asc')} className="focus:bg-white/10 focus:text-white cursor-pointer">A-Z</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSortOption('name-desc')} className="focus:bg-white/10 focus:text-white cursor-pointer">Z-A</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto rounded-lg border border-white/10 bg-slate-900/50">
                        <Table>
                            <TableHeader className="bg-slate-900 border-b border-white/10">
                                <TableRow className="hover:bg-transparent border-white/10">
                                    <TableHead className="text-white">{t('products.sku')}</TableHead>
                                    <TableHead className="text-white">{t('products.name')}</TableHead>
                                    <TableHead className="text-white">{t('products.manufactured_date')}</TableHead>
                                    <TableHead className="text-white">{t('products.expiry_on')}</TableHead>
                                    <TableHead className="text-right text-white">{t('common.actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-12">
                                            <RotateCw className="h-8 w-8 animate-spin text-orange-500 mx-auto" />
                                        </TableCell>
                                    </TableRow>
                                ) : currentProducts.length > 0 ? (
                                    currentProducts.map((product) => (
                                        <TableRow key={product.id} className="hover:bg-white/5 transition-colors border-white/5 group">
                                            <TableCell className="font-medium text-slate-300">{product.pricingStocks?.[0]?.sku || 'N/A'}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-lg border border-white/10 flex items-center justify-center p-1 shrink-0 overflow-hidden bg-white">
                                                        {product.images?.[0] ? (
                                                            <img src={product.images[0].url} alt={product.name} className="h-full w-full object-contain" />
                                                        ) : (
                                                            <span className="text-[10px] text-slate-400">N/A</span>
                                                        )}
                                                    </div>
                                                    <span className="font-medium text-white group-hover:text-orange-400 transition-colors">{product.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-300">{formatDateStr(product.manufacturedDate)}</TableCell>
                                            <TableCell className="text-rose-400 font-medium">{formatDateStr(product.expiryDate)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                                                        onClick={() => handleEditClick(product)}
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
                                                                <AlertDialogTitle className="text-white">{t('common.are_you_sure')}</AlertDialogTitle>
                                                                <AlertDialogDescription className="text-slate-400">
                                                                    {t('expired.delete_warning', { name: product.name })}
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/10 hover:text-white">{t('common.cancel')}</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    className="bg-rose-500 hover:bg-rose-600 text-white border-0"
                                                                    onClick={() => handleDelete(product.id)}
                                                                >
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
                                        <TableCell colSpan={5} className="text-center py-12 text-slate-400">
                                            {t('expired.no_products_found')}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="p-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                            <span>{t('common.rows_per_page')}</span>
                            <Select value={itemsPerPage.toString()} onValueChange={(value) => { setItemsPerPage(Number(value)); setCurrentPage(1); }}>
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
                        </div>

                        <div className="flex items-center gap-4">
                            <span>
                                {filteredProducts.length > 0 ? startIndex + 1 : 0} - {Math.min(endIndex, filteredProducts.length)} {t('common.of')} {filteredProducts.length}
                            </span>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-50"
                                >
                                    <PaginationPrevious className="h-4 w-4" />
                                </Button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <Button
                                            key={page}
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handlePageChange(page)}
                                            className={cn(
                                                "h-8 w-8 p-0",
                                                currentPage === page
                                                    ? "bg-orange-500 text-white hover:bg-orange-600"
                                                    : "text-slate-400 hover:text-white hover:bg-white/10"
                                            )}
                                        >
                                            {page}
                                        </Button>
                                    ))}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-50"
                                >
                                    <PaginationNext className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{t('expired.edit_title')}</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            {t('expired.edit_subtitle')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col gap-2">
                            <Label className="text-white">{t('products.name')}</Label>
                            <Input
                                value={editingProduct?.name || ''}
                                readOnly
                                className="bg-slate-800 border-white/10 text-slate-400 cursor-not-allowed"
                            />
                        </div>
                        <DatePickerInput
                            id="manufactured-date"
                            label={t('products.manufactured_date')}
                            date={manufacturedDate}
                            onDateChange={setManufacturedDate}
                        />
                        <DatePickerInput
                            id="expiry-date"
                            label={t('products.expiry_on')}
                            date={expiryDate}
                            onDateChange={setExpiryDate}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)} className="bg-transparent border-white/10 text-white hover:bg-white/10 hover:text-white">
                            {t('common.cancel')}
                        </Button>
                        <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600 text-white">
                            {t('common.save_changes')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ExpiredProducts;
