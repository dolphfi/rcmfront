import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { ArrowLeft, ChevronUp, Printer, RefreshCw, RotateCw, Edit } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "../../components/ui/carousel";
import { useTranslation } from 'react-i18next';
import productService from '../../context/api/productservice';
import { Product, PricingStock } from '../../context/types/interface';
import { toast } from 'sonner';

const ProductDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [selectedVariant, setSelectedVariant] = useState<PricingStock | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            try {
                setIsLoading(true);
                const data = await productService.getById(id);
                setProduct(data);
                if (data.pricingStocks && data.pricingStocks.length > 0) {
                    setSelectedVariant(data.pricingStocks[0]);
                }
            } catch (error) {
                toast.error('Erè pandan chajman detay pwodwi a');
                navigate('/products');
            } finally {
                setIsLoading(false);
            }
        };
        fetchProduct();
    }, [id, navigate]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <RotateCw className="h-8 w-8 animate-spin text-orange-500" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex items-center justify-center h-full text-white">
                <p>{t('products.no_products_found')}</p>
            </div>
        );
    }

    const productImages = product.images?.map(img => img.url) || [];

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="flex flex-col h-full gap-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">{t('products.details')}</h1>
                    <p className="text-sm text-slate-400">{product.name}</p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:bg-white/10 hover:text-white" title="Reset">
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:bg-white/10 hover:text-white" title="Collapse">
                        <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Link to={`/products/edit/${product.id}`}>
                        <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
                            <Edit className="h-4 w-4" />
                            {t('common.edit')}
                        </Button>
                    </Link>
                    <Link to="/products">
                        <Button className="bg-slate-900 border border-white/10 text-white hover:bg-slate-800 gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            {t('common.back')}
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-auto">
                {/* Left Column: Info */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Barcode Section */}
                    <Card className="bg-white/5 backdrop-blur-md border border-white/10 shadow-xl overflow-hidden">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="flex flex-col gap-2">
                                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-md w-fit flex flex-col items-center gap-2">
                                    {/* Mock Barcode */}
                                    <div className="h-12 w-48 bg-white/10 flex items-center justify-center rounded border border-white/5">
                                        <div className="flex items-end h-6 gap-[2px]">
                                            {[...Array(20)].map((_, i) => (
                                                <div key={i} className={`bg-white/60 w-[2px]`} style={{ height: `${Math.random() * 100}%` }}></div>
                                            ))}
                                        </div>
                                    </div>
                                    <span className="text-white text-xs font-mono tracking-widest">{product.barcode || selectedVariant?.sku || '-'}</span>
                                </div>
                            </div>
                            <Button variant="outline" size="icon" className="h-10 w-10 border-white/10 hover:bg-white/10 text-slate-400 hover:text-orange-500">
                                <Printer className="h-4 w-4" />
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Details Sections */}
                    <div className="space-y-6">
                        {/* Information Générale */}
                        <div className="space-y-3">
                            <h3 className="text-white font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
                                <div className="h-1 w-4 bg-orange-500 rounded-full"></div>
                                {t('products.product_info')}
                            </h3>
                            <Card className="bg-white/5 backdrop-blur-md border border-white/10 shadow-xl overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="divide-y divide-white/5 text-sm">
                                        <DetailRow label={t('products.name')} value={product.name} />
                                        <DetailRow label={t('products.slug')} value={product.slug} />
                                        <DetailRow label={t('products.sku')} value={selectedVariant?.sku} />
                                        <DetailRow label={t('products.category')} value={product.category?.name} />
                                        <DetailRow label={t('products.sub_category')} value={product.subCategoryId} />
                                        <DetailRow label={t('products.brand')} value={product.brand?.name} />
                                        <DetailRow label={t('products.selling_type')} value={product.sellingType} />
                                        <DetailRow label={t('products.unit')} value={product.unit} />
                                        <DetailRow label={t('products.product_type')} value={product.productType} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Variant Selector (Single vs Variable) */}
                        {product.pricingStocks && product.pricingStocks.length > 1 && (
                            <div className="space-y-3">
                                <h3 className="text-white font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
                                    <div className="h-1 w-4 bg-orange-500 rounded-full"></div>
                                    {t('products.variants')}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {product.pricingStocks.map((variant) => (
                                        <Button
                                            key={variant.id}
                                            variant="outline"
                                            className={`h-auto py-2 px-4 flex flex-col items-start gap-1 border-white/10 transition-all ${selectedVariant?.id === variant.id
                                                ? 'bg-orange-500/10 border-orange-500/50 ring-1 ring-orange-500/20'
                                                : 'bg-white/5 hover:bg-white/10'
                                                }`}
                                            onClick={() => setSelectedVariant(variant)}
                                        >
                                            <span className={`text-xs font-bold ${selectedVariant?.id === variant.id ? 'text-orange-500' : 'text-white'}`}>
                                                {variant.variantName || t('products.default_variant')}
                                            </span>
                                            <span className="text-[10px] text-slate-500 font-mono italic">
                                                {variant.sku}
                                            </span>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Prix et Taxes */}
                        <div className="space-y-3">
                            <h3 className="text-white font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
                                <div className="h-1 w-4 bg-orange-500 rounded-full"></div>
                                {t('products.pricing_stock')}
                            </h3>
                            <Card className="bg-white/5 backdrop-blur-md border border-white/10 shadow-xl overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="divide-y divide-white/5 text-sm">
                                        <DetailRow label={t('products.price')} value={`$${selectedVariant?.price || '0'}`} highlight />
                                        <DetailRow label="Prix de revient" value={`$${selectedVariant?.costPrice || '0'}`} />
                                        <DetailRow label={t('products.tax_type')} value={selectedVariant?.taxType} />
                                        <DetailRow label={t('products.tax')} value={`${selectedVariant?.tax || '0'}%`} />
                                        <DetailRow label={t('products.discount_type')} value={selectedVariant?.discountType} />
                                        <DetailRow label={t('products.discount_value')} value={selectedVariant?.discountValue} />
                                        <DetailRow label={t('products.quantity_alert')} value={selectedVariant?.quantityAlert} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Stock par POS */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-white font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
                                    <div className="h-1 w-4 bg-orange-500 rounded-full"></div>
                                    {t('products.store')} / {t('products.warehouse')}
                                </h3>
                                {selectedVariant?.posStocks?.some(ps => ps.stock > 0) ? (
                                    <div className="px-2 py-1 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                                        {t('products.available') || 'Disponib'}
                                    </div>
                                ) : (
                                    <div className="px-2 py-1 rounded bg-rose-500/20 border border-rose-500/30 text-rose-400 text-[10px] font-bold uppercase tracking-wider">
                                        {t('products.out_of_stock') || 'Pa Disponib'}
                                    </div>
                                )}
                            </div>
                            <Card className="bg-white/5 backdrop-blur-md border border-white/10 shadow-xl overflow-hidden">
                                <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {selectedVariant?.posStocks?.map((pos) => {
                                        const hasStock = pos.stock > 0;
                                        return (
                                            <div
                                                key={pos.id}
                                                className={`p-3 rounded-lg border transition-all ${hasStock
                                                    ? 'bg-emerald-500/5 border-emerald-500/20 ring-1 ring-emerald-500/10'
                                                    : 'bg-white/5 border-white/10 opacity-60'
                                                    } flex flex-col gap-1`}
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className={`text-xs truncate font-medium ${hasStock ? 'text-emerald-400' : 'text-slate-400'}`}>
                                                        {pos.pointOfSale?.name || 'POS'}
                                                    </span>
                                                    {hasStock && <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className={`text-lg font-bold ${hasStock ? 'text-white' : 'text-slate-500'}`}>
                                                        {pos.stock}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 uppercase font-mono">
                                                        Alert: {pos.minStock || 0}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Champs Additionnels */}
                        <div className="space-y-3">
                            <h3 className="text-white font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
                                <div className="h-1 w-4 bg-orange-500 rounded-full"></div>
                                {t('products.custom_fields')}
                            </h3>
                            <Card className="bg-white/5 backdrop-blur-md border border-white/10 shadow-xl overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="divide-y divide-white/5 text-sm">
                                        <DetailRow label={t('products.manufacturer')} value={product.manufacturer} />
                                        <DetailRow label={t('products.warranties')} value={product.warranties} />
                                        <DetailRow label={t('products.manufactured_date')} value={formatDate(product.manufacturedDate)} />
                                        <DetailRow label={t('products.expiry_on')} value={formatDate(product.expiryDate)} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Description */}
                        <div className="space-y-3">
                            <h3 className="text-white font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
                                <div className="h-1 w-4 bg-orange-500 rounded-full"></div>
                                {t('products.product_description')}
                            </h3>
                            <Card className="bg-white/5 backdrop-blur-md border border-white/10 shadow-xl overflow-hidden">
                                <CardContent className="p-4 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                                    {product.description || '-'}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Right Column: Carousel */}
                <div className="lg:col-span-1">
                    <Card className="bg-white/5 backdrop-blur-md border border-white/10 shadow-xl overflow-hidden relative h-fit sticky top-2">
                        <CardContent className="p-6">
                            {productImages.length > 0 ? (
                                <Carousel className="w-full">
                                    <CarouselContent>
                                        {productImages.map((image, index) => (
                                            <CarouselItem key={index}>
                                                <div className="p-1">
                                                    <div className="flex items-center justify-center aspect-square bg-slate-900/50 rounded-lg p-6 border border-white/5">
                                                        <img
                                                            src={image}
                                                            alt={`${product.name} ${index + 1}`}
                                                            className="h-full w-full object-contain"
                                                        />
                                                    </div>
                                                </div>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    {productImages.length > 1 && (
                                        <div className="flex items-center justify-between mt-4 px-2">
                                            <CarouselPrevious className="static translate-y-0 h-8 w-8 border-white/10 hover:bg-white/10 text-slate-400 hover:text-white" />
                                            <CarouselNext className="static translate-y-0 h-8 w-8 border-white/10 hover:bg-white/10 text-slate-400 hover:text-white" />
                                        </div>
                                    )}
                                </Carousel>
                            ) : (
                                <div className="flex items-center justify-center aspect-square bg-slate-900/50 rounded-lg p-6 border border-white/5">
                                    <div className="text-slate-500 text-sm">{t('products.no_images')}</div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

const DetailRow = ({ label, value, highlight = false }: { label: string, value: any, highlight?: boolean }) => (
    <div className="grid grid-cols-1 sm:grid-cols-4 p-4 hover:bg-white/5 transition-colors group">
        <div className="text-slate-400 font-medium group-hover:text-slate-300">{label}</div>
        <div className={`sm:col-span-3 font-medium ${highlight ? 'text-orange-500 text-lg' : 'text-white'}`}>
            {value || '-'}
        </div>
    </div>
);

export default ProductDetails;
