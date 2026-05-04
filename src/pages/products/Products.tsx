import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
    Plus,
    Download,
    FileText,
    FileSpreadsheet,
    Printer,
    Search,
    ChevronDown,
    Eye,
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
import { Link } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { useTranslation } from 'react-i18next';
import productService from '../../context/api/productservice';
import { Product } from '../../context/types/interface';
import { toast } from 'sonner';

const Products: React.FC = () => {
    const { t } = useTranslation();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedBrand, setSelectedBrand] = useState('All');

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            const data = await productService.getAll();
            setProducts(data);
        } catch (error) {
            toast.error('Erè pandan chajman pwodwi yo');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id: string) => {
        try {
            await productService.remove(id);
            toast.success('Pwodwi efase avèk siksè');
            fetchProducts();
        } catch (error) {
            toast.error('Erè pandan sipresyon pwodwi a');
        }
    };

    // Extract unique categories and brands
    const categories = ['All', ...Array.from(new Set(products.filter(p => p.category?.name).map(p => p.category!.name)))];
    const brands = ['All', ...Array.from(new Set(products.filter(p => p.brand?.name).map(p => p.brand!.name)))];

    // Filter products
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.pricingStocks?.[0]?.sku || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || product.category?.name === selectedCategory;
        const matchesBrand = selectedBrand === 'All' || product.brand?.name === selectedBrand;
        return matchesSearch && matchesCategory && matchesBrand;
    });

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategory, selectedBrand]);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProducts = filteredProducts.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="flex flex-col h-full gap-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">{t('products.title')}</h1>
                    <p className="text-sm text-muted-foreground">{t('products.description')}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Action Icons */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 mr-2 shadow-sm">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600 hover:bg-rose-50" title="PDF">
                            <FileText className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:bg-emerald-50" title="Excel">
                            <FileSpreadsheet className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-slate-100 hover:text-foreground" title="Print">
                            <Printer className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-slate-100 hover:text-foreground" title="Refresh" onClick={fetchProducts}>
                            <RotateCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-primary' : ''}`} />
                        </Button>
                    </div>

                    <Link to="/products/add">
                        <Button className="bg-primary hover:bg-primary/90 text-white gap-2 font-semibold shadow-sm">
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">{t('products.add_product')}</span>
                        </Button>
                    </Link>
                    <Button variant="outline" className="bg-white border-slate-200 text-foreground hover:bg-slate-50 gap-2 shadow-sm">
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">{t('products.import_product')}</span>
                    </Button>
                </div>
            </div>

            {/* Main Content Card */}
            <Card className="flex-1 bg-white border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <CardContent className="p-0 flex flex-col h-full">
                    {/* Toolbar / Filters */}
                    <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/50">
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={t('products.search_placeholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 bg-white border-slate-200 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary shadow-sm"
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
                                    {categories.map((category) => (
                                        <DropdownMenuItem
                                            key={category}
                                            onClick={() => setSelectedCategory(category)}
                                            className="focus:bg-primary/10 focus:text-foreground cursor-pointer"
                                        >
                                            {category}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="bg-muted border-border text-foreground hover:bg-primary/10 hover:text-primary w-full sm:w-32 justify-between">
                                        {selectedBrand === 'All' ? t('products.brand') : selectedBrand}
                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-background border-border text-foreground">
                                    {brands.map((brand) => (
                                        <DropdownMenuItem
                                            key={brand}
                                            onClick={() => setSelectedBrand(brand)}
                                            className="focus:bg-primary/10 focus:text-foreground cursor-pointer"
                                        >
                                            {brand}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="flex-1 overflow-auto bg-white">
                        <Table>
                            <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                                <TableRow className="hover:bg-transparent border-slate-200">
                                    <TableHead className="text-foreground font-bold">{t('products.sku')}</TableHead>
                                    <TableHead className="text-foreground font-bold">{t('products.name')}</TableHead>
                                    <TableHead className="text-foreground font-bold">{t('products.category')}</TableHead>
                                    <TableHead className="text-foreground font-bold">{t('products.brand')}</TableHead>
                                    <TableHead className="text-foreground font-bold">{t('products.price')}</TableHead>
                                    <TableHead className="text-foreground font-bold">{t('products.qty')}</TableHead>
                                    <TableHead className="text-right text-foreground font-bold">{t('products.action')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            <div className="flex items-center justify-center gap-2">
                                                <RotateCw className="h-5 w-5 animate-spin text-primary" />
                                                <span>{t('common.loading')}</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : currentProducts.length > 0 ? (
                                    currentProducts.map((product) => (
                                        <TableRow key={product.id} className="hover:bg-muted transition-colors border-border group">
                                            <TableCell className="font-medium text-foreground">{product.pricingStocks?.[0]?.sku || '-'}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-lg border border-border flex items-center justify-center p-1 shrink-0 overflow-hidden bg-muted">
                                                        {product.images && product.images.length > 0 ? (
                                                            <img src={product.images[0].url} alt={product.name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <Avatar className="h-full w-full">
                                                                <AvatarFallback>{product.name.charAt(0)}</AvatarFallback>
                                                            </Avatar>
                                                        )}
                                                    </div>
                                                    <span className="font-medium text-foreground group-hover:text-primary transition-colors">{product.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-foreground">{product.category?.name || '-'}</TableCell>
                                            <TableCell className="text-foreground">{product.brand?.name || '-'}</TableCell>
                                            <TableCell className="font-medium text-foreground">${product.pricingStocks?.[0]?.price || '0'}</TableCell>
                                            <TableCell className="text-foreground">
                                                {product.pricingStocks?.[0]?.posStocks?.reduce((acc, pos) => acc + pos.stock, 0) || 0}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link to={`/products/details/${product.id}`}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-blue-400 hover:bg-blue-500/10">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link to={`/products/edit/${product.id}`}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent className="bg-background border-border">
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle className="text-foreground">{t('products.delete_confirm_title')}</AlertDialogTitle>
                                                                <AlertDialogDescription className="text-muted-foreground">
                                                                    {t('products.delete_confirm_desc', { name: product.name })}
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel className="bg-transparent border-border text-foreground hover:bg-primary/10 hover:text-primary">{t('common.cancel')}</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDelete(product.id)}
                                                                    className="bg-rose-500 hover:bg-rose-600 text-white border-0"
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
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            {t('products.no_products_found')}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <span>Row Per Page</span>
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
                            <span>Entries</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span>
                                {filteredProducts.length > 0 ? Math.min(startIndex + 1, filteredProducts.length) : 0} - {Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length}
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
                                                className={currentPage === page ? "text-white bg-primary hover:bg-primary/90 border-none" : "text-muted-foreground hover:text-primary hover:bg-primary/10"}
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
        </div>
    );
};
export default Products;
