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
                    <h1 className="text-2xl font-bold text-white tracking-tight">{t('products.title')}</h1>
                    <p className="text-sm text-slate-400">{t('products.description')}</p>
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
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:bg-white/10 hover:text-white" title="Refresh" onClick={fetchProducts}>
                            <RotateCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-orange-500' : ''}`} />
                        </Button>
                    </div>

                    <Link to="/products/add">
                        <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">{t('products.add_product')}</span>
                        </Button>
                    </Link>
                    <Button variant="outline" className="bg-slate-900 border-white/10 text-white hover:bg-slate-800 gap-2">
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">{t('products.import_product')}</span>
                    </Button>
                </div>
            </div>

            {/* Main Content Card */}
            <Card className="flex-1 bg-white/5 backdrop-blur-sm border border-white/10 text-white overflow-hidden flex flex-col">
                <CardContent className="p-0 flex flex-col h-full">
                    {/* Toolbar / Filters */}
                    <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10">
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder={t('products.search_placeholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-orange-500/50 focus-visible:border-orange-500"
                            />
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white w-full sm:w-32 justify-between">
                                        {selectedCategory === 'All' ? t('products.category') : selectedCategory}
                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-slate-900 border-white/10 text-white">
                                    {categories.map((category) => (
                                        <DropdownMenuItem
                                            key={category}
                                            onClick={() => setSelectedCategory(category)}
                                            className="focus:bg-white/10 focus:text-white cursor-pointer"
                                        >
                                            {category}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white w-full sm:w-32 justify-between">
                                        {selectedBrand === 'All' ? t('products.brand') : selectedBrand}
                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-slate-900 border-white/10 text-white">
                                    {brands.map((brand) => (
                                        <DropdownMenuItem
                                            key={brand}
                                            onClick={() => setSelectedBrand(brand)}
                                            className="focus:bg-white/10 focus:text-white cursor-pointer"
                                        >
                                            {brand}
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
                                    <TableHead className="text-white">{t('products.sku')}</TableHead>
                                    <TableHead className="text-white">{t('products.name')}</TableHead>
                                    <TableHead className="text-white">{t('products.category')}</TableHead>
                                    <TableHead className="text-white">{t('products.brand')}</TableHead>
                                    <TableHead className="text-white">{t('products.price')}</TableHead>
                                    <TableHead className="text-white">{t('products.qty')}</TableHead>
                                    <TableHead className="text-right text-white">{t('products.action')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                                            <div className="flex items-center justify-center gap-2">
                                                <RotateCw className="h-5 w-5 animate-spin text-orange-500" />
                                                <span>{t('common.loading')}</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : currentProducts.length > 0 ? (
                                    currentProducts.map((product) => (
                                        <TableRow key={product.id} className="hover:bg-white/5 transition-colors border-white/5 group">
                                            <TableCell className="font-medium text-slate-300">{product.pricingStocks?.[0]?.sku || '-'}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-lg border border-white/10 flex items-center justify-center p-1 shrink-0 overflow-hidden bg-white/5">
                                                        {product.images && product.images.length > 0 ? (
                                                            <img src={product.images[0].url} alt={product.name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <Avatar className="h-full w-full">
                                                                <AvatarFallback>{product.name.charAt(0)}</AvatarFallback>
                                                            </Avatar>
                                                        )}
                                                    </div>
                                                    <span className="font-medium text-white group-hover:text-orange-400 transition-colors">{product.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-300">{product.category?.name || '-'}</TableCell>
                                            <TableCell className="text-slate-300">{product.brand?.name || '-'}</TableCell>
                                            <TableCell className="font-medium text-white">${product.pricingStocks?.[0]?.price || '0'}</TableCell>
                                            <TableCell className="text-slate-300">
                                                {product.pricingStocks?.[0]?.posStocks?.reduce((acc, pos) => acc + pos.stock, 0) || 0}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link to={`/products/details/${product.id}`}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link to={`/products/edit/${product.id}`}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent className="bg-slate-900 border-white/10">
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle className="text-white">{t('products.delete_confirm_title')}</AlertDialogTitle>
                                                                <AlertDialogDescription className="text-slate-400">
                                                                    {t('products.delete_confirm_desc', { name: product.name })}
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/10 hover:text-white">{t('common.cancel')}</AlertDialogCancel>
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
                                        <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                                            {t('products.no_products_found')}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="p-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                            <span>Row Per Page</span>
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
export default Products;