import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Search, Plus, Minus, Package, Info, ChevronRight,
    Store, Warehouse,
    Loader2, Save, RefreshCw, Check
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

    // New Variant State
    const [newVariant, setNewVariant] = useState({
        variantName: '',
        sku: '',
        price: 0,
        costPrice: 0,
        initialStocks: {} as Record<string, number>
    });

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const filtered = products.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.pricingStocks?.some(ps => ps.sku.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredProducts(filtered);
    }, [searchTerm, products]);

    const fetchData = async () => {
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
    };

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

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">{t('stock.title')}</h1>
                    <p className="text-slate-400 mt-1">{t('sidebar.inventory')} / {t('sidebar.stock_refill')}</p>
                </div>
                <Button
                    variant="outline"
                    onClick={fetchData}
                    className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                    disabled={isLoading}
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    {t('common.refresh_button') || 'Rafrechi'}
                </Button>
            </div>

            {/* Search Bar */}
            <Card className="bg-slate-900/50 backdrop-blur-xl border-white/10 shadow-2xl overflow-hidden group">
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-orange-500 transition-colors" />
                        <Input
                            placeholder={t('stock.search_product')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-11 bg-slate-900 border-white/10 text-white h-12 text-lg focus-visible:ring-orange-500/50 transition-all placeholder:text-slate-600"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Content Area */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <Loader2 className="h-12 w-12 text-orange-500 animate-spin" />
                    <p className="text-slate-400 animate-pulse">{t('common.loading')}</p>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white/5 rounded-2xl border border-dashed border-white/10">
                    <Package className="h-16 w-16 text-slate-700" />
                    <div className="space-y-1">
                        <p className="text-xl font-medium text-slate-300">{t('common.no_data')}</p>
                        <p className="text-slate-500 max-w-xs">{t('products.no_products_found')}</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredProducts.map((product) => (
                        <Card
                            key={product.id}
                            className={`bg-slate-900/40 border-white/10 hover:border-orange-500/30 transition-all duration-300 overflow-hidden ${selectedProduct?.id === product.id ? 'ring-1 ring-orange-500/50' : ''}`}
                        >
                            <div
                                className="p-4 flex items-center justify-between cursor-pointer"
                                onClick={() => setSelectedProduct(selectedProduct?.id === product.id ? null : product)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shadow-inner">
                                        <Package className="h-6 w-6 text-orange-500" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-lg font-semibold text-white leading-tight">{product.name}</h3>
                                            <Badge variant="outline" className={`px-2 py-0 h-5 text-[10px] font-bold uppercase tracking-wider ${product.productType === 'variable'
                                                ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                }`}>
                                                {product.productType === 'variable' ? t('products.variable_product') : t('products.single_product')}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="bg-white/5 text-slate-400 border-white/10 font-normal">
                                                {product.category?.name}
                                            </Badge>
                                            <span className="text-slate-600 text-xs">•</span>
                                            <span className="text-xs text-slate-500">
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
                                        <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">{t('products.qty')}</p>
                                        <p className="text-xl font-black text-white">
                                            {product.pricingStocks?.reduce((acc, ps) =>
                                                acc + (ps.posStocks?.reduce((sum, s) => sum + s.stock, 0) || 0), 0
                                            )}
                                        </p>
                                    </div>
                                    <ChevronRight className={`h-6 w-6 text-slate-600 transition-transform duration-300 ${selectedProduct?.id === product.id ? 'rotate-90 text-orange-500' : ''}`} />
                                </div>
                            </div>

                            {/* Expanded Variants Area */}
                            {selectedProduct?.id === product.id && (
                                <div className="border-t border-white/5 bg-white/[0.02] p-4 animate-in slide-in-from-top-2 duration-300">
                                    <div className="flex items-center justify-between mb-6">
                                        <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                                            <Info className="h-4 w-4 text-orange-500" />
                                            {product.name} - {t('products.variants')}
                                        </h4>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 border-orange-500/50 text-orange-500 hover:bg-orange-500/10 gap-1"
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
                                                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono text-orange-400">
                                                            {variant.sku}
                                                        </div>
                                                        <span className="text-white font-medium">
                                                            {variant.variantName
                                                                ? variant.variantName
                                                                : (product.pricingStocks && product.pricingStocks.length > 1
                                                                    ? t('products.default_variant')
                                                                    : t('products.single_product'))
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="text-orange-500 font-bold">${Number(variant.price).toLocaleString()}</div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {pointsOfSale.map((pos) => {
                                                        const currentStock = variant.posStocks?.find(s => s.posId === pos.id)?.stock || 0;
                                                        const isOutOfStock = currentStock === 0;

                                                        return (
                                                            <div
                                                                key={pos.id}
                                                                className={`p-4 rounded-2xl border transition-all group/pos ${!isOutOfStock
                                                                    ? 'bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/30'
                                                                    : 'bg-slate-900 border-white/5 opacity-80 hover:opacity-100 hover:border-white/20'
                                                                    }`}
                                                            >
                                                                <div className="flex items-center justify-between mb-3">
                                                                    <div className="flex items-center gap-2">
                                                                        {pos.type === 'store' ? (
                                                                            <Store className={`h-4 w-4 ${!isOutOfStock ? 'text-emerald-500' : 'text-slate-500'}`} />
                                                                        ) : (
                                                                            <Warehouse className={`h-4 w-4 ${!isOutOfStock ? 'text-blue-500' : 'text-slate-500'}`} />
                                                                        )}
                                                                        <span className="text-sm font-semibold text-slate-300 truncate max-w-[120px]">
                                                                            {pos.name}
                                                                        </span>
                                                                    </div>
                                                                    {!isOutOfStock && (
                                                                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                                    )}
                                                                </div>

                                                                <div className="flex items-end justify-between gap-2">
                                                                    <div>
                                                                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter mb-0.5">{t('stock.current')}</p>
                                                                        <p className={`text-2xl font-black leading-none ${!isOutOfStock ? 'text-white' : 'text-slate-600'}`}>
                                                                            {currentStock}
                                                                        </p>
                                                                    </div>
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            openRefillDialog(variant, pos);
                                                                        }}
                                                                        className="rounded-xl bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20 active:scale-95 transition-all h-9 px-4"
                                                                    >
                                                                        <Plus className="h-4 w-4 mr-1 stroke-[3px]" />
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
                    ))}
                </div>
            )}

            {/* Refill Dialog */}
            <Dialog open={isRefillOpen} onOpenChange={setIsRefillOpen}>
                <DialogContent className="bg-slate-900 border-white/10 text-white max-w-sm rounded-3xl overflow-hidden shadow-2xl p-0">
                    <div className="bg-orange-500 p-6 flex flex-col items-center text-center">
                        <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 shadow-xl border border-white/30">
                            <Plus className="h-8 w-8 text-white stroke-[3px]" />
                        </div>
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight">{t('stock.refill_title')}</DialogTitle>
                        <DialogDescription className="text-orange-100 mt-1 opacity-90">
                            {refillPos?.name} • {selectedVariant?.sku}
                        </DialogDescription>
                    </div>

                    <div className="p-6 space-y-6 bg-slate-900">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <Label className="text-xs uppercase font-bold text-slate-500 tracking-widest">{t('stock.add_amount')}</Label>
                                <span className="text-xs font-mono text-orange-500">{t('stock.current')}: {
                                    selectedVariant?.posStocks?.find(s => s.posId === refillPos?.id)?.stock || 0
                                }</span>
                            </div>

                            <div className="flex items-center gap-4">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setRefillQuantity(Math.max(0, refillQuantity - 1))}
                                    className="h-12 w-12 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 text-white shrink-0"
                                >
                                    <Minus className="h-5 w-5" />
                                </Button>

                                <Input
                                    type="number"
                                    value={refillQuantity}
                                    onChange={(e) => setRefillQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                                    className="h-16 bg-white/5 border-white/10 text-center text-3xl font-black text-white focus-visible:ring-orange-500 rounded-2xl"
                                />

                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setRefillQuantity(refillQuantity + 1)}
                                    className="h-12 w-12 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 text-white shrink-0"
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
                                        className="rounded-xl bg-white/5 border-white/10 hover:bg-orange-500/20 hover:text-orange-500 text-slate-400 font-bold"
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
                                className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-orange-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
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
                <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5 text-orange-500" />
                            {t('stock.add_variant')}
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            {t('stock.add_variant_desc')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-6 py-4">
                        <div className="space-y-2 col-span-2">
                            <Label className="text-white text-sm font-medium">{t('stock.variant_name')}</Label>
                            <Input
                                placeholder="eg. Red / Large"
                                value={newVariant.variantName}
                                onChange={(e) => setNewVariant(prev => ({ ...prev, variantName: e.target.value }))}
                                className="bg-slate-800 border-white/10 focus:ring-orange-500/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-white text-sm font-medium">{t('stock.sku')}</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={newVariant.sku}
                                    onChange={(e) => setNewVariant(prev => ({ ...prev, sku: e.target.value }))}
                                    className="bg-slate-800 border-white/10 focus:ring-orange-500/50"
                                />
                                <Button size="icon" variant="outline" onClick={handleSKUGenerate} className="border-white/10 hover:bg-white/5">
                                    <RefreshCw className="h-4 w-4 text-orange-500" />
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-white text-sm font-medium">{t('stock.price')}</Label>
                                <Input
                                    type="number"
                                    value={newVariant.price}
                                    onChange={(e) => setNewVariant(prev => ({ ...prev, price: Number(e.target.value) }))}
                                    className="bg-slate-800 border-white/10 focus:ring-orange-500/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-white text-sm font-medium">{t('stock.cost')}</Label>
                                <Input
                                    type="number"
                                    value={newVariant.costPrice}
                                    onChange={(e) => setNewVariant(prev => ({ ...prev, costPrice: Number(e.target.value) }))}
                                    className="bg-slate-800 border-white/10 focus:ring-orange-500/50"
                                />
                            </div>
                        </div>

                        {/* Initial Stocks Table */}
                        <div className="col-span-2 space-y-4">
                            <h4 className="text-sm font-semibold text-slate-300 border-b border-white/5 pb-2">
                                {t('products.stock_management')}
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                {pointsOfSale.map(pos => (
                                    <div key={pos.id} className="flex items-center justify-between p-3 rounded-md bg-white/5 border border-white/5">
                                        <span className="text-xs text-slate-400 font-medium truncate pr-2">{pos.name}</span>
                                        <Input
                                            type="number"
                                            value={newVariant.initialStocks[pos.id] || 0}
                                            onChange={(e) => setNewVariant(prev => ({
                                                ...prev,
                                                initialStocks: { ...prev.initialStocks, [pos.id]: Number(e.target.value) }
                                            }))}
                                            className="h-8 w-20 bg-slate-900 border-white/10 text-xs"
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
                            className="text-slate-400 hover:text-white hover:bg-white/5"
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            className="bg-orange-500 hover:bg-orange-600 text-white"
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