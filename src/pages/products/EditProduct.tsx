import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../components/ui/accordion';
import {
    ArrowLeft, RefreshCw, ChevronUp, Info, List, Bold, Italic, Underline,
    Link as LinkIcon, ListOrdered, Type, ChevronsUpDown,
    CirclePlus,
    RotateCw, Check, ChevronDown, LifeBuoy, Box, SquarePercent
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../components/ui/command';
import { Label } from '../../components/ui/label';
import { cn } from '../../lib/utils';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import productService from '../../context/api/productservice';
import categoryService from '../../context/api/categoryservice';
import brandService from '../../context/api/brandservice';
import posService from '../../context/api/posservice';

const EditProduct: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    // Dynamic Data
    const [categories, setCategories] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);
    const [pointsOfSale, setPointsOfSale] = useState<any[]>([]);
    const [openPos, setOpenPos] = useState(false);
    const [openBrand, setOpenBrand] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        sku: '',
        barcode: '',
        sellingType: 'retail',
        categoryId: '',
        brandId: '',
        barcodeSymbology: 'code128',
        unit: 'pc',
        description: '',
        productType: 'single',
        price: 0,
        wholesalePrice: 0,
        grandDealerPrice: 0,
        costPrice: 0,
        taxType: 'inclusive',
        tax: 0,
        discountType: 'percentage',
        discountValue: 0,
        quantityAlert: 0,
        manufacturer: '',
        subCategoryId: '',
        warranties: '',
        warrantyId: '',
        isActive: true,
        primaryPosId: '',
        posStocks: [] as { posId: string, stock: number, minStock: number }[],
    });

    const [description, setDescription] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                setIsFetching(true);
                const [product, cats, brs, posResponse] = await Promise.all([
                    productService.getById(id),
                    categoryService.getAll('product'),
                    brandService.getAll(),
                    posService.getAll(1, 100)
                ]);

                const poss = posResponse.data || [];
                setCategories(cats);
                setBrands(brs);
                setPointsOfSale(poss);

                // Populate form
                const productPosList = product.pricingStocks?.[0]?.posStocks || [];
                const firstPos = productPosList[0];

                setFormData(prev => ({
                    ...prev,
                    name: product.name,
                    slug: product.slug || '',
                    sku: product.pricingStocks?.[0]?.sku || '',
                    barcode: product.barcode || '',
                    sellingType: product.sellingType || 'retail',
                    categoryId: product.categoryId || '',
                    brandId: product.brandId || '',
                    price: Number(product.pricingStocks?.[0]?.price || 0),
                    wholesalePrice: Number(product.pricingStocks?.[0]?.wholesalePrice || 0),
                    grandDealerPrice: Number(product.pricingStocks?.[0]?.grandDealerPrice || 0),
                    costPrice: Number(product.pricingStocks?.[0]?.costPrice || 0),
                    isActive: product.isActive,
                    primaryPosId: firstPos?.posId || '',
                    posStocks: poss.map((pos: any) => {
                        const existing = productPosList.find((pp: any) => pp.posId === pos.id);
                        return {
                            posId: pos.id,
                            stock: existing?.stock || 0,
                            minStock: existing?.minStock || 5
                        };
                    }),
                }));
                setDescription(product.description || '');

            } catch (error) {
                toast.error(t('products.load_error') || 'Erè pandan chajman done yo');
                navigate('/products');
            } finally {
                setIsFetching(false);
            }
        };
        fetchData();
    }, [id, navigate]);


    const handleSKUGenerate = () => {
        const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
        setFormData(prev => ({ ...prev, sku: `PROD-${randomStr}` }));
    };

    const handleSlugGenerate = () => {
        const slug = formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
        setFormData(prev => ({ ...prev, slug }));
    };

    const handleSubmit = async () => {
        if (!id) return;
        if (!formData.name || !formData.sku || !formData.price) {
            toast.error('Tanpri ranpli tout chan ki obligatwa yo');
            return;
        }

        try {
            setIsLoading(true);

            const updatePayload = {
                name: formData.name,
                slug: formData.slug,
                barcode: formData.barcode,
                sellingType: formData.sellingType,
                categoryId: formData.categoryId,
                brandId: formData.brandId,
                barcodeSymbology: formData.barcodeSymbology,
                unit: formData.unit,
                productType: formData.productType,
                description: description,
                manufacturer: formData.manufacturer,
                subCategoryId: formData.subCategoryId,
                isActive: formData.isActive,
                warrantyId: formData.warrantyId && formData.warrantyId.trim() !== '' ? formData.warrantyId : null,
                pricingStocks: [
                    {
                        sku: formData.sku,
                        price: Number(formData.price),
                        wholesalePrice: Number(formData.wholesalePrice),
                        grandDealerPrice: Number(formData.grandDealerPrice),
                        costPrice: Number(formData.costPrice),
                        taxType: formData.taxType,
                        tax: Number(formData.tax),
                        discountType: formData.discountType,
                        discountValue: Number(formData.discountValue),
                        quantityAlert: Number(formData.quantityAlert),
                        posStocks: formData.posStocks.map(ps => ({
                            posId: ps.posId,
                            stock: Number(ps.stock)
                        }))
                    }
                ]
            };

            await productService.update(id, updatePayload);
            toast.success(t('products.update_success') || 'Pwodwi modifye avèk siksè');
            navigate('/products');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erè pandan modifikasyon pwodwi a');
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className="flex items-center justify-center h-full">
                <RotateCw className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">{t('products.edit_product')}</h1>
                    <p className="text-sm text-muted-foreground">{formData.name}</p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-primary" title="Reset">
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-primary" title="Collapse">
                        <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button className="bg-background border border-border text-foreground hover:bg-muted gap-2" onClick={() => navigate('/products')}>
                        <ArrowLeft className="h-4 w-4" />
                        {t('common.back')}
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-auto space-y-4">
                <Accordion type="single" defaultValue="item-1" className="space-y-4">
                    {/* Product Information */}
                    <AccordionItem value="item-1" className="bg-background border border-border rounded-lg overflow-hidden data-[state=open]:pb-0">
                        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted pb-4 border-b border-border">
                            <div className="flex items-center gap-2 text-foreground font-medium">
                                <Info className="h-4 w-4 text-primary" />
                                {t('products.product_info')}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6 pt-6 text-muted-foreground">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Primary Location */}
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="text-foreground">{t('products.location_label')} <span className="text-red-500">*</span></Label>
                                    <Popover open={openPos} onOpenChange={setOpenPos}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={openPos}
                                                className="w-full justify-between bg-background border-border text-foreground hover:bg-muted hover:text-primary"
                                            >
                                                {formData.primaryPosId
                                                    ? pointsOfSale.find((pos) => formData.primaryPosId === pos.id)?.name || t('products.location_placeholder')
                                                    : t('products.location_placeholder')}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0 bg-background border-border" align="start">
                                            <Command className="bg-background text-foreground">
                                                <CommandInput placeholder={t('products.search_location')} className="text-foreground border-none focus:ring-0" />
                                                <CommandList>
                                                    <CommandEmpty>{t('products.no_locations_found')}</CommandEmpty>
                                                    <CommandGroup heading={<span className="text-primary">{t('products.stores_group')}</span>}>
                                                        {pointsOfSale.filter(pos => pos.type === 'store').map((store) => (
                                                            <CommandItem
                                                                key={store.id}
                                                                value={store.name}
                                                                onSelect={() => {
                                                                    setFormData(prev => ({ ...prev, primaryPosId: store.id }));
                                                                    setOpenPos(false);
                                                                }}
                                                                className="text-foreground data-[selected='true']:bg-transparent data-[selected=true]:bg-transparent data-[selected='true']:text-foreground data-[selected=true]:text-foreground cursor-pointer"
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        formData.primaryPosId === store.id ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                {store.name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                    <CommandGroup heading={<span className="text-blue-500">{t('products.warehouses_group')}</span>}>
                                                        {pointsOfSale.filter(pos => pos.type === 'warehouse').map((wh) => (
                                                            <CommandItem
                                                                key={wh.id}
                                                                value={wh.name}
                                                                onSelect={() => {
                                                                    setFormData(prev => ({ ...prev, primaryPosId: wh.id }));
                                                                    setOpenPos(false);
                                                                }}
                                                                className="text-foreground data-[selected='true']:bg-transparent data-[selected=true]:bg-transparent data-[selected='true']:text-foreground data-[selected=true]:text-foreground cursor-pointer"
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        formData.primaryPosId === wh.id ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                {wh.name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-foreground">{t('products.name')} <span className="text-red-500">*</span></Label>
                                    <Input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="bg-background border-border text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground">{t('products.slug')} <span className="text-red-500">*</span></Label>
                                    <div className="relative">
                                        <Input
                                            type="text"
                                            value={formData.slug}
                                            onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                            className="bg-background border-border text-foreground focus-visible:ring-2 focus-visible:ring-ring pr-24"
                                        />
                                        <Button
                                            onClick={handleSlugGenerate}
                                            className="absolute right-1 top-1 h-8 px-3 bg-primary hover:bg-primary/90 text-white text-xs font-medium rounded transition-colors"
                                        >
                                            {t('products.generate')}
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-foreground">{t('products.sku')} <span className="text-red-500">*</span></Label>
                                    <div className="relative">
                                        <Input
                                            type="text"
                                            value={formData.sku}
                                            onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                                            className="bg-background border-border text-foreground focus-visible:ring-2 focus-visible:ring-ring pr-24"
                                        />
                                        <Button
                                            onClick={handleSKUGenerate}
                                            className="absolute right-1 top-1 h-8 px-3 bg-primary hover:bg-primary/90 text-white text-xs font-medium rounded transition-colors"
                                        >
                                            {t('products.generate')}
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground">{t('products.selling_type')} <span className="text-red-500">*</span></Label>
                                    <Select value={formData.sellingType} onValueChange={(v) => setFormData(prev => ({ ...prev, sellingType: v }))}>
                                        <SelectTrigger className="w-full bg-background border-border text-foreground focus:ring-2 focus:ring-ring/50">
                                            <SelectValue placeholder={t('products.selling_type')} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-background border-border text-foreground">
                                            <SelectItem value="retail" className="focus:bg-muted focus:text-foreground">Retail</SelectItem>
                                            <SelectItem value="wholesale" className="focus:bg-muted focus:text-foreground">Wholesale</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-foreground">{t('products.category')} <span className="text-red-500">*</span></Label>
                                        <span className="text-xs text-primary cursor-pointer hover:underline flex items-center gap-1">
                                            <CirclePlus className="h-3 w-3" /> Add New
                                        </span>
                                    </div>
                                    <Select value={formData.categoryId} onValueChange={(v) => setFormData(prev => ({ ...prev, categoryId: v }))}>
                                        <SelectTrigger className="w-full bg-background border-border text-foreground focus:ring-2 focus:ring-ring/50">
                                            <SelectValue placeholder={t('products.category')} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-background border-border text-foreground">
                                            {categories.map((cat: any) => (
                                                <SelectItem key={cat.id} value={cat.id} className="focus:bg-muted focus:text-foreground">{cat.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground">{t('products.sub_category')}</Label>
                                    <Select value={formData.subCategoryId} onValueChange={(v) => setFormData(prev => ({ ...prev, subCategoryId: v }))}>
                                        <SelectTrigger className="w-full bg-background border-border text-foreground focus:ring-2 focus:ring-ring/50">
                                            <SelectValue placeholder={t('products.sub_category')} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-background border-border text-foreground">
                                            {categories.find((c: any) => c.id === formData.categoryId)?.subCategories?.map((sub: any) => (
                                                <SelectItem key={sub.id} value={sub.id} className="focus:bg-muted focus:text-foreground">{sub.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-foreground">{t('products.brand')} <span className="text-red-500">*</span></Label>
                                    <Popover open={openBrand} onOpenChange={setOpenBrand}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className={cn(
                                                    "w-full justify-between bg-background border-border text-foreground hover:bg-muted hover:text-primary",
                                                    !formData.brandId && "text-muted-foreground"
                                                )}
                                            >
                                                {formData.brandId
                                                    ? brands.find((brand) => brand.id === formData.brandId)?.name
                                                    : t('products.brand')}
                                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0 bg-background border-border text-foreground" align="start">
                                            <Command className="bg-transparent">
                                                <CommandInput placeholder={`${t('products.brand')}...`} className="text-foreground" />
                                                <CommandList>
                                                    <CommandEmpty>{t('common.no_results') || 'Pa jwenn anyen'}</CommandEmpty>
                                                    <CommandGroup>
                                                        {brands.map((brand: any) => (
                                                            <CommandItem
                                                                key={brand.id}
                                                                value={brand.name}
                                                                onSelect={() => {
                                                                    setFormData(prev => ({ ...prev, brandId: brand.id }));
                                                                    setOpenBrand(false);
                                                                }}
                                                                className="text-foreground data-[selected='true']:bg-transparent data-[selected=true]:bg-transparent data-[selected='true']:text-foreground data-[selected=true]:text-foreground cursor-pointer"
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        formData.brandId === brand.id ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                {brand.name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground">{t('products.unit')} <span className="text-red-500">*</span></Label>
                                    <Select value={formData.unit} onValueChange={(v) => setFormData(prev => ({ ...prev, unit: v }))}>
                                        <SelectTrigger className="w-full bg-background border-border text-foreground focus:ring-2 focus:ring-ring/50">
                                            <SelectValue placeholder={t('products.unit')} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-background border-border text-foreground">
                                            <SelectItem value="pc" className="focus:bg-muted focus:text-foreground">Piece</SelectItem>
                                            <SelectItem value="kg" className="focus:bg-muted focus:text-foreground">Kilogram</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-foreground">{t('products.barcode_symbology')} <span className="text-red-500">*</span></Label>
                                    <Select value={formData.barcodeSymbology} onValueChange={(v) => setFormData(prev => ({ ...prev, barcodeSymbology: v }))}>
                                        <SelectTrigger className="w-full bg-background border-border text-foreground focus:ring-2 focus:ring-ring/50">
                                            <SelectValue placeholder={t('products.barcode_symbology')} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-background border-border text-foreground">
                                            <SelectItem value="code128" className="focus:bg-muted focus:text-foreground">Code 128</SelectItem>
                                            <SelectItem value="ean13" className="focus:bg-muted focus:text-foreground">EAN-13</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground">{t('products.item_barcode')} <span className="text-red-500">*</span></Label>
                                    <div className="relative">
                                        <Input
                                            type="text"
                                            value={formData.barcode}
                                            onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                                            className="bg-background border-border text-foreground focus-visible:ring-2 focus-visible:ring-ring pr-24"
                                        />
                                        <Button
                                            onClick={() => setFormData(prev => ({ ...prev, barcode: Math.floor(Math.random() * 1000000000000).toString() }))}
                                            className="absolute right-1 top-1 h-8 px-3 bg-primary hover:bg-primary/90 text-white text-xs font-medium rounded transition-colors"
                                        >
                                            {t('products.generate')}
                                        </Button>
                                    </div>
                                </div>

                                <div className="col-span-1 md:col-span-2 space-y-2">
                                    <Label className="text-foreground">{t('products.product_description')}</Label>
                                    <div className="rounded-md border border-border bg-background overflow-hidden">
                                        {/* Toolbar Mockup */}
                                        <div className="flex items-center gap-1 p-2 border-b border-border bg-muted flex-wrap">
                                            <Button variant="ghost" size="sm" className="flex items-center gap-2 h-7 px-2 text-xs font-medium text-foreground hover:text-primary hover:bg-muted rounded">
                                                Normal
                                                <ChevronsUpDown className="h-3 w-3 opacity-50" />
                                            </Button>
                                            <div className="w-px h-4 bg-muted mx-1"></div>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-muted text-muted-foreground hover:text-primary" title="Bold">
                                                <Bold className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-muted text-muted-foreground hover:text-primary" title="Italic">
                                                <Italic className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-muted text-muted-foreground hover:text-primary" title="Underline">
                                                <Underline className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-muted text-muted-foreground hover:text-primary" title="Link">
                                                <LinkIcon className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-muted text-muted-foreground hover:text-primary" title="Unordered List">
                                                <List className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-muted text-muted-foreground hover:text-primary" title="Ordered List">
                                                <ListOrdered className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-muted text-muted-foreground hover:text-primary" title="Clear Formatting">
                                                <Type className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <Textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value.substring(0, 100))}
                                            className="flex min-h-[120px] w-full bg-background px-3 py-2 text-sm text-foreground border-none focus-visible:ring-0"
                                            placeholder={t('products.product_description')}
                                        />
                                        <div className={`px-3 py-1 text-xs border-t border-border text-right ${description.length >= 100 ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                                            {description.length} / 100 {t('products.characters')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    {/* Pricing & Stocks */}
                    <AccordionItem value="item-2" className="bg-background border border-border rounded-lg overflow-hidden">
                        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted pb-4 border-b border-border">
                            <div className="flex items-center gap-2 text-foreground font-medium">
                                <LifeBuoy className="h-4 w-4 text-primary" />
                                {t('products.pricing_stock')}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6 pt-6 text-muted-foreground">
                            <div className="space-y-6">
                                {/* Pricing Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="space-y-2">
                                        <Label className="text-foreground">{t('products.price')} (Détail) <span className="text-red-500">*</span></Label>
                                        <Input
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                                            className="bg-background border-border text-emerald-400 font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-foreground">Prix en Gros</Label>
                                        <Input
                                            type="number"
                                            value={formData.wholesalePrice}
                                            onChange={(e) => setFormData(prev => ({ ...prev, wholesalePrice: Number(e.target.value) }))}
                                            className="bg-background border-border text-foreground"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-foreground">Prix Grand Dealer</Label>
                                        <Input
                                            type="number"
                                            value={formData.grandDealerPrice}
                                            onChange={(e) => setFormData(prev => ({ ...prev, grandDealerPrice: Number(e.target.value) }))}
                                            className="bg-background border-border text-foreground"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-foreground">Pri Acha ($)</Label>
                                        <Input
                                            type="number"
                                            value={formData.costPrice}
                                            onChange={(e) => setFormData(prev => ({ ...prev, costPrice: Number(e.target.value) }))}
                                            className="bg-background border-border text-foreground"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-foreground">Alert Kantite</Label>
                                        <Input
                                            type="number"
                                            value={formData.quantityAlert}
                                            onChange={(e) => setFormData(prev => ({ ...prev, quantityAlert: Number(e.target.value) }))}
                                            className="bg-background border-border text-foreground"
                                        />
                                    </div>
                                </div>

                                {/* Stock per Location */}
                                <div className="pt-6 border-t border-border">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Box className="h-4 w-4 text-primary" />
                                        <h3 className="text-foreground font-medium">{t('products.stock_per_location')}</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {formData.posStocks.map((ps, idx) => {
                                            const posName = pointsOfSale.find(p => p.id === ps.posId)?.name || 'Unknown';
                                            return (
                                                <div key={ps.posId} className="flex items-center justify-between p-3 rounded-lg bg-muted border border-border">
                                                    <span className="text-foreground text-sm">{posName}</span>
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            type="number"
                                                            value={ps.stock}
                                                            onChange={(e) => {
                                                                const val = Number(e.target.value);
                                                                const newStocks = [...formData.posStocks];
                                                                newStocks[idx].stock = val;
                                                                setFormData(prev => ({ ...prev, posStocks: newStocks }));
                                                            }}
                                                            className="w-24 h-8 bg-background border-border text-foreground text-right"
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                <div className="flex items-center justify-end gap-3 mt-8 pb-4">
                    <Button variant="outline" onClick={() => navigate('/products')} className="bg-background border-border text-foreground hover:bg-muted">
                        {t('common.cancel')}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="bg-primary hover:bg-primary/90 text-white gap-2"
                    >
                        {isLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
                        {t('common.save')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default EditProduct;
