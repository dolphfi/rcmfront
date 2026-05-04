import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Search, Plus, Minus, Package, Info, ChevronRight,
    Store, Warehouse,
    Loader2, Save, RefreshCw, Check,
    LayoutGrid, List
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../components/ui/dialog";
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import productService from '../../context/api/productservice';
import posService from '../../context/api/posservice';
import { Product, PricingStock, PointOfSale } from '../../context/types/interface';

const Stock: React.FC = () => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pointsOfSale, setPointsOfSale] = useState<PointOfSale[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedVariant, setSelectedVariant] = useState<PricingStock | null>(null);
    const [isRefillOpen, setIsRefillOpen] = useState(false);
    const [isAddVariantOpen, setIsAddVariantOpen] = useState(false);
    const [refillPos, setRefillPos] = useState<PointOfSale | null>(null);
    const [refillQuantity, setRefillQuantity] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(
        (localStorage.getItem('stockViewMode') as 'grid' | 'list') || 'list'
    );

    useEffect(() => {
        localStorage.setItem('stockViewMode', viewMode);
    }, [viewMode]);

    // New Variant State
    const [newVariant, setNewVariant] = useState({
        variantName: '',
        sku: '',
        price: 0,
        costPrice: 0,
        initialStocks: {} as Record<string, number>
    });

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [productData, posData] = await Promise.all([
                productService.getAll(),
                posService.getAll(1, 100)
            ]);
            setProducts(productData || []);
            setFilteredProducts(productData || []);
            setPointsOfSale(posData.data || []);
        } catch (error) {
            toast.error(t('products.load_error'));
        } finally {
            setIsLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        const filtered = products.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.pricingStocks?.some(ps => ps.sku.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredProducts(filtered);
    }, [searchTerm, products]);

    const handleRefill = async () => {
        if (!selectedVariant || !refillPos || refillQuantity <= 0) return;

        setIsSubmitting(true);
        try {
            await productService.refillStock({
                pricingStockId: selectedVariant.id,
                posId: refillPos.id,
                quantity: refillQuantity
            });
            toast.success(t('stock.refill_success'));
            setIsRefillOpen(false);
            setRefillQuantity(0);
            fetchData(); // Refresh data
        } catch (error) {
            toast.error(t('stock.refill_error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddVariant = async () => {
        if (!selectedProduct || !newVariant.sku || !newVariant.variantName) return;

        setIsSubmitting(true);
        try {
            // Fetch full product details to ensure we have current pricingStocks
            const fullProduct = await productService.getById(selectedProduct.id);

            const newPricingStock = {
                sku: newVariant.sku,
                variantName: newVariant.variantName,
                price: Number(newVariant.price),
                costPrice: Number(newVariant.costPrice),
                posStocks: pointsOfSale.map(pos => ({
                    posId: pos.id,
                    stock: newVariant.initialStocks[pos.id] || 0
                }))
            };

            // Clean existing pricingStocks to remove internal fields (id, timestamps, etc.)
            const cleanedPricingStocks = (fullProduct.pricingStocks || []).map((ps: any) => ({
                sku: ps.sku,
                price: Number(ps.price),
                costPrice: Number(ps.costPrice),
                taxType: ps.taxType,
                tax: Number(ps.tax),
                discountType: ps.discountType,
                discountValue: Number(ps.discountValue),
                quantityAlert: Number(ps.quantityAlert),
                variantName: ps.variantName,
                posStocks: (ps.posStocks || []).map((posStock: any) => ({
                    posId: posStock.pointOfSale?.id || posStock.posId,
                    stock: posStock.stock
                }))
            }));

            const updatedPricingStocks = [
                ...cleanedPricingStocks,
                newPricingStock
            ];

            await productService.update(selectedProduct.id, {
                productType: 'variable',
                pricingStocks: updatedPricingStocks
            });

            toast.success(t('stock.refill_success'));
            setIsAddVariantOpen(false);
            setNewVariant({
                variantName: '',
                sku: '',
                price: 0,
                costPrice: 0,
                initialStocks: {}
            });
            fetchData();
        } catch (error) {
            toast.error(t('stock.refill_error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSKUGenerate = () => {
        const sku = `VAR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        setNewVariant(prev => ({ ...prev, sku }));
    };

    const openRefillDialog = (variant: PricingStock, pos: PointOfSale) => {
        setSelectedVariant(variant);
        setRefillPos(pos);
        setIsRefillOpen(true);
    };

    const getTotalStock = (product: Product) => {
        return product.pricingStocks?.reduce((acc, ps) =>
            acc + (ps.posStocks?.reduce((sum, s) => sum + s.stock, 0) || 0), 0
        ) || 0;
    };

    const isProductLowStock = (product: Product) => {
        return product.pricingStocks?.some(ps => {
            const totalVariantStock = ps.posStocks?.reduce((sum, s) => sum + s.stock, 0) || 0;
            const alertThreshold = ps.quantityAlert || 10; // Default to 10 if not set
            return totalVariantStock > 0 && totalVariantStock <= alertThreshold;
        });
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">{t('stock.title')}</h1>
                    <p className="text-muted-foreground mt-1">{t('sidebar.inventory')} / {t('sidebar.stock_refill')}</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-muted p-1 rounded-xl border border-border">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setViewMode('grid')}
                            className={`h-8 w-8 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:text-primary'}`}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setViewMode('list')}
                            className={`h-8 w-8 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:text-primary'}`}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button
                        variant="outline"
                        onClick={fetchData}
                        className="bg-muted border-border text-foreground hover:bg-muted h-10"
                        disabled={isLoading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        {t('common.refresh_button') || 'Rafrechi'}
                    </Button>
                </div>
            </div>

            {/* Search Bar */}
            <Card className="bg-background border-border shadow-2xl overflow-hidden group">
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder={t('stock.search_product')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-11 bg-background border-border text-foreground h-12 text-lg focus-visible:ring-ring transition-all placeholder:text-muted-foreground"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Content Area */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                    <p className="text-muted-foreground animate-pulse">{t('common.loading')}</p>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-muted rounded-2xl border border-dashed border-border">
                    <Package className="h-16 w-16 text-foreground" />
                    <div className="space-y-1">
                        <p className="text-xl font-medium text-foreground">{t('common.no_data')}</p>
                        <p className="text-muted-foreground max-w-xs">{t('products.no_products_found')}</p>
                    </div>
                </div>
            ) : (
                <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "grid grid-cols-1 gap-4"}>
                    {filteredProducts.map((product) => {
                        const totalStock = getTotalStock(product);
                        const isOutOfStock = totalStock === 0;
                        const isLowStock = isProductLowStock(product);

                        return viewMode === 'list' ? (
                            <Card
                                key={product.id}
                                className={`bg-background border-border hover:border-primary/30 transition-all duration-300 overflow-hidden ${selectedProduct?.id === product.id ? 'ring-1 ring-orange-500/50' : ''} ${isOutOfStock ? 'border-red-500/30' : ''}`}
                            >
                                <div
                                    className="p-4 flex items-center justify-between cursor-pointer"
                                    onClick={() => setSelectedProduct(selectedProduct?.id === product.id ? null : product)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`h-12 w-12 rounded-xl border flex items-center justify-center shadow-inner transition-colors ${isOutOfStock ? 'bg-red-500/10 border-red-500/20' : 'bg-primary/10 border-primary/20'}`}>
                                            <Package className={`h-6 w-6 ${isOutOfStock ? 'text-red-500' : 'text-primary'}`} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-lg font-semibold text-white leading-tight">{product.name}</h3>
                                                {isOutOfStock && (
                                                    <Badge className="bg-red-500 text-white border-none text-[10px] h-5 px-1.5 uppercase font-black">
                                                        {t('stock.rupture')}
                                                    </Badge>
                                                )}
                                                {isLowStock && (
                                                    <Badge className="bg-primary/10 text-primary border-primary/30 text-[10px] h-5 px-1.5 uppercase font-black">
                                                        {t('stock.low_stock')}
                                                    </Badge>
                                                )}
                                                <Badge variant="outline" className={`px-2 py-0 h-5 text-[10px] font-bold uppercase tracking-wider ${product.productType === 'variable'
                                                    ? 'bg-primary/10 text-primary border-primary/20'
                                                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                    }`}>
                                                    {product.productType === 'variable' ? t('products.variable_product') : t('products.single_product')}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="bg-muted text-muted-foreground border-border font-normal">
                                                    {product.category?.name}
                                                </Badge>
                                                <span className="text-muted-foreground text-xs">•</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {product.pricingStocks?.length || 0} {
                                                        product.pricingStocks?.length === 1
                                                            ? t('products.variation')
                                                            : t('products.variants')
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">{t('products.qty')}</p>
                                            <p className={`text-xl font-black ${isOutOfStock ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                                                {totalStock}
                                            </p>
                                        </div>
                                        <ChevronRight className={`h-6 w-6 text-muted-foreground transition-transform duration-300 ${selectedProduct?.id === product.id ? 'rotate-90 text-primary' : ''}`} />
                                    </div>
                                </div>

                                {/* Expanded Variants Area (List View) */}
                                {selectedProduct?.id === product.id && (
                                    <div className="border-t border-border bg-white/[0.02] p-4 animate-in slide-in-from-top-2 duration-300">
                                        <div className="flex items-center justify-between mb-6">
                                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                                <Info className="h-4 w-4 text-primary" />
                                                {product.name} - {t('products.variants')}
                                            </h4>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 border-primary/50 text-primary hover:bg-primary/10 gap-1"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedProduct(product);
                                                    setIsAddVariantOpen(true);
                                                }}
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                                {t('stock.add_variant')}
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-1 gap-6">
                                            {product.pricingStocks?.map((variant) => (
                                                <div key={variant.id} className="space-y-4">
                                                    <div className="flex items-center justify-between pb-2 border-b border-border">
                                                        <div className="flex items-center gap-3">
                                                            <div className="px-3 py-1 bg-muted border border-border rounded-full text-xs font-mono text-primary">
                                                                {variant.sku}
                                                            </div>
                                                            <span className="text-foreground font-medium">
                                                                {variant.variantName
                                                                    ? variant.variantName
                                                                    : (product.pricingStocks && product.pricingStocks.length > 1
                                                                        ? t('products.default_variant')
                                                                        : t('products.single_product'))
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="text-primary font-bold">${Number(variant.price).toLocaleString()}</div>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                                                        {pointsOfSale.map((pos) => {
                                                            const currentStock = variant.posStocks?.find(s => s.posId === pos.id)?.stock || 0;
                                                            const isOutOfStock = currentStock === 0;

                                                            return (
                                                                <div
                                                                    key={pos.id}
                                                                    className={`p-3 rounded-xl border transition-all group/pos ${!isOutOfStock
                                                                        ? 'bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/30'
                                                                        : 'bg-background border-border opacity-80 hover:opacity-100 hover:border-border'
                                                                        }`}
                                                                >
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <div className="flex items-center gap-2">
                                                                            {pos.type === 'store' ? (
                                                                                <Store className={`h-3.5 w-3.5 ${!isOutOfStock ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                                                                            ) : (
                                                                                <Warehouse className={`h-3.5 w-3.5 ${!isOutOfStock ? 'text-blue-500' : 'text-muted-foreground'}`} />
                                                                            )}
                                                                            <span className="text-[11px] font-semibold text-foreground truncate max-w-[100px]">
                                                                                {pos.name}
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center justify-between gap-2">
                                                                        <div>
                                                                            <p className={`text-xl font-black leading-none ${!isOutOfStock ? 'text-white' : 'text-muted-foreground'}`}>
                                                                                {currentStock}
                                                                            </p>
                                                                        </div>
                                                                        <Button
                                                                            size="sm"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                openRefillDialog(variant, pos);
                                                                            }}
                                                                            className="rounded-lg bg-primary hover:bg-primary/90 shadow-lg shadow-orange-500/20 active:scale-95 transition-all h-7 px-2 text-[10px]"
                                                                        >
                                                                            <Plus className="h-3 w-3 mr-1 stroke-[3px]" />
                                                                            {t('stock.refill_action')}
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </Card>
                        ) : (
                            <Card
                                key={product.id}
                                className={`bg-background border-border hover:border-primary/30 transition-all duration-300 overflow-hidden group/grid ${selectedProduct?.id === product.id ? 'ring-2 ring-orange-500' : ''} ${isOutOfStock ? 'border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : ''}`}
                                onClick={() => setSelectedProduct(selectedProduct?.id === product.id ? null : product)}
                            >
                                <CardContent className="p-4 flex flex-col items-center text-center space-y-3 cursor-pointer">
                                    <div className="relative">
                                        <div className={`h-16 w-16 rounded-2xl border flex items-center justify-center shadow-inner group-hover/grid:scale-110 transition-transform duration-500 ${isOutOfStock ? 'bg-red-500/20 border-red-500/30' : 'bg-gradient-to-br from-orange-500/20 to-orange-600/5 border-primary/20'}`}>
                                            <Package className={`h-8 w-8 ${isOutOfStock ? 'text-red-500' : 'text-primary'}`} />
                                        </div>
                                        {isOutOfStock ? (
                                            <Badge className="absolute -top-2 -right-2 bg-red-500 border-none text-[8px] h-5 px-1 flex items-center justify-center rounded-lg font-black shadow-lg uppercase">
                                                {t('stock.rupture')}
                                            </Badge>
                                        ) : isLowStock ? (
                                            <Badge className="absolute -top-2 -right-2 bg-primary border-none text-[8px] h-5 px-1 flex items-center justify-center rounded-lg font-black shadow-lg uppercase">
                                                {t('stock.low_stock')}
                                            </Badge>
                                        ) : (
                                            <Badge className="absolute -top-2 -right-2 bg-primary border-none text-[10px] h-5 w-5 flex items-center justify-center p-0 rounded-full font-bold shadow-lg">
                                                {product.pricingStocks?.length || 0}
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        <h3 className={`text-sm font-bold line-clamp-1 group-hover/grid:text-primary transition-colors uppercase tracking-tight ${isOutOfStock ? 'text-red-400' : 'text-white'}`}>{product.name}</h3>
                                        <p className="text-[10px] text-muted-foreground font-medium">{product.category?.name || t('common.no_category')}</p>
                                    </div>

                                    <div className="w-full pt-2 border-t border-border flex items-center justify-between">
                                        <div>
                                            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">{t('products.qty')}</p>
                                            <p className={`text-lg font-black leading-none ${isOutOfStock ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                                                {totalStock}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={`h-8 w-8 rounded-full transition-all ${isOutOfStock ? 'bg-red-500/10 text-red-500 group-hover/grid:bg-red-500 group-hover/grid:text-white' : 'bg-muted text-muted-foreground group-hover/grid:bg-primary group-hover/grid:text-white'}`}
                                        >
                                            <ChevronRight className={`h-4 w-4 transition-transform ${selectedProduct?.id === product.id ? 'rotate-90' : ''}`} />
                                        </Button>
                                    </div>
                                </CardContent>
                                {selectedProduct?.id === product.id && (
                                    <div className="p-3 bg-white/[0.03] border-t border-border space-y-3">
                                        {product.pricingStocks?.slice(0, 2).map(variant => (
                                            <div key={variant.id} className="flex items-center justify-between text-[11px]">
                                                <span className="text-muted-foreground truncate max-w-[80px]">{variant.variantName || 'Default'}</span>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-bold text-white">
                                                        {variant.posStocks?.reduce((sum, s) => sum + s.stock, 0) || 0}
                                                    </span>
                                                    <Button
                                                        size="icon"
                                                        className="h-5 w-5 rounded-md bg-primary p-0"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            // For grid, we just open the list view for detailed management if needed
                                                            // or open the first POS available for refill
                                                            if (variant.posStocks?.[0]) {
                                                                const posRef = pointsOfSale.find(p => p.id === variant.posStocks?.[0].posId);
                                                                if (posRef) openRefillDialog(variant, posRef);
                                                            }
                                                        }}
                                                    >
                                                        <Plus className="h-3 w-3 text-foreground" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                        {product.pricingStocks && product.pricingStocks.length > 2 && (
                                            <Button
                                                variant="link"
                                                className="w-full h-auto p-0 text-[10px] text-primary"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setViewMode('list');
                                                }}
                                            >
                                                +{product.pricingStocks.length - 2} {t('products.variants')} ({t('stock.list_view')})
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </Card>
                        )
                    })}
                </div>
            )}

            {/* Refill Dialog */}
            <Dialog open={isRefillOpen} onOpenChange={setIsRefillOpen}>
                <DialogContent className="bg-background border-border text-foreground max-w-sm rounded-3xl overflow-hidden shadow-2xl p-0">
                    <div className="bg-primary p-6 flex flex-col items-center text-center">
                        <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center mb-4 shadow-xl border border-white/30">
                            <Plus className="h-8 w-8 text-white stroke-[3px]" />
                        </div>
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight">{t('stock.refill_title')}</DialogTitle>
                        <DialogDescription className="text-orange-100 mt-1 opacity-90">
                            {refillPos?.name} • {selectedVariant?.sku}
                        </DialogDescription>
                    </div>

                    <div className="p-6 space-y-6 bg-background">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <Label className="text-xs uppercase font-bold text-muted-foreground tracking-widest">{t('stock.add_amount')}</Label>
                                <span className="text-xs font-mono text-primary">{t('stock.current')}: {
                                    selectedVariant?.posStocks?.find(s => s.posId === refillPos?.id)?.stock || 0
                                }</span>
                            </div>

                            <div className="flex items-center gap-4">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setRefillQuantity(Math.max(0, refillQuantity - 1))}
                                    className="h-12 w-12 rounded-2xl bg-muted border-border hover:bg-muted text-foreground shrink-0"
                                >
                                    <Minus className="h-5 w-5" />
                                </Button>

                                <Input
                                    type="number"
                                    value={refillQuantity}
                                    onChange={(e) => setRefillQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                                    className="h-16 bg-muted border-border text-center text-3xl font-black text-foreground focus-visible:ring-ring rounded-2xl"
                                />

                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setRefillQuantity(refillQuantity + 1)}
                                    className="h-12 w-12 rounded-2xl bg-muted border-border hover:bg-muted text-foreground shrink-0"
                                >
                                    <Plus className="h-5 w-5" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-3 gap-2 pt-2">
                                {[10, 50, 100].map(val => (
                                    <Button
                                        key={val}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setRefillQuantity(val)}
                                        className="rounded-xl bg-muted border-border hover:bg-primary/10 hover:text-primary text-muted-foreground font-bold"
                                    >
                                        +{val}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <DialogFooter className="pt-2 sm:justify-center">
                            <Button
                                onClick={handleRefill}
                                disabled={isSubmitting || refillQuantity <= 0}
                                className="w-full h-14 bg-primary hover:bg-primary/90 text-foreground font-black text-lg rounded-2xl shadow-xl shadow-orange-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                ) : (
                                    <>
                                        <Check className="h-6 w-6 mr-2 stroke-[3px]" />
                                        {t('stock.refill_action')}
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
            {/* Add Variant Dialog */}
            <Dialog open={isAddVariantOpen} onOpenChange={setIsAddVariantOpen}>
                <DialogContent className="bg-background border-border text-foreground max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5 text-primary" />
                            {t('stock.add_variant')}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            {t('stock.add_variant_desc')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-6 py-4">
                        <div className="space-y-2 col-span-2">
                            <Label className="text-foreground text-sm font-medium">{t('stock.variant_name')}</Label>
                            <Input
                                placeholder="eg. Red / Large"
                                value={newVariant.variantName}
                                onChange={(e) => setNewVariant(prev => ({ ...prev, variantName: e.target.value }))}
                                className="bg-muted border-border focus:ring-ring/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-foreground text-sm font-medium">{t('stock.sku')}</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={newVariant.sku}
                                    onChange={(e) => setNewVariant(prev => ({ ...prev, sku: e.target.value }))}
                                    className="bg-muted border-border focus:ring-ring/50"
                                />
                                <Button size="icon" variant="outline" onClick={handleSKUGenerate} className="border-border hover:bg-muted">
                                    <RefreshCw className="h-4 w-4 text-primary" />
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-foreground text-sm font-medium">{t('stock.price')}</Label>
                                <Input
                                    type="number"
                                    value={newVariant.price}
                                    onChange={(e) => setNewVariant(prev => ({ ...prev, price: Number(e.target.value) }))}
                                    className="bg-muted border-border focus:ring-ring/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-foreground text-sm font-medium">{t('stock.cost')}</Label>
                                <Input
                                    type="number"
                                    value={newVariant.costPrice}
                                    onChange={(e) => setNewVariant(prev => ({ ...prev, costPrice: Number(e.target.value) }))}
                                    className="bg-muted border-border focus:ring-ring/50"
                                />
                            </div>
                        </div>

                        {/* Initial Stocks Table */}
                        <div className="col-span-2 space-y-4">
                            <h4 className="text-sm font-semibold text-foreground border-b border-border pb-2">
                                {t('products.stock_management')}
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                {pointsOfSale.map(pos => (
                                    <div key={pos.id} className="flex items-center justify-between p-3 rounded-md bg-muted border border-border">
                                        <span className="text-xs text-muted-foreground font-medium truncate pr-2">{pos.name}</span>
                                        <Input
                                            type="number"
                                            value={newVariant.initialStocks[pos.id] || 0}
                                            onChange={(e) => setNewVariant(prev => ({
                                                ...prev,
                                                initialStocks: { ...prev.initialStocks, [pos.id]: Number(e.target.value) }
                                            }))}
                                            className="h-8 w-20 bg-background border-border text-xs"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setIsAddVariantOpen(false)}
                            className="text-muted-foreground hover:text-primary hover:bg-muted"
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            className="bg-primary hover:bg-primary/90 text-foreground"
                            onClick={handleAddVariant}
                            disabled={isSubmitting || !newVariant.sku || !newVariant.variantName}
                        >
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            {t('stock.save_variant')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Stock;