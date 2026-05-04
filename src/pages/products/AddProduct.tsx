import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../components/ui/accordion';
import {
    ArrowLeft, RefreshCw, ChevronUp, Image as ImageIcon,
    Plus, Info, LifeBuoy, List,
    CirclePlus, X, Edit, Trash2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '../../components/ui/dialog';
import { Switch } from '../../components/ui/switch';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../components/ui/command';
import { Checkbox } from '../../components/ui/checkbox';
import { Label } from '../../components/ui/label';
import { Check, ChevronDown } from 'lucide-react';
import { DatePickerInput } from '../../components/custom/date-picker-input';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import productService from '../../context/api/productservice';
import categoryService from '../../context/api/categoryservice';
import brandService from '../../context/api/brandservice';
import posService from '../../context/api/posservice';
import warrantyService, { Warranty } from '../../context/api/warrantyService';
import { io } from 'socket.io-client';

const AddProduct: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    // Dynamic Data
    const [categories, setCategories] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);
    const [warranties, setWarranties] = useState<Warranty[]>([]);
    const [pointsOfSale, setPointsOfSale] = useState<any[]>([]);
    const [openPos, setOpenPos] = useState(false);
    const [openBrand, setOpenBrand] = useState(false);
    const [openSymbology, setOpenSymbology] = useState(false);
    const [variants, setVariants] = useState<any[]>([]);
    const [isVariantDialogOpen, setIsVariantDialogOpen] = useState(false);
    const [editingVariantIdx, setEditingVariantIdx] = useState<number | null>(null);

    // Add Category Dialog State
    const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
    const [newCategory, setNewCategory] = useState({
        name: '',
        slug: '',
        status: true
    });

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
        posStocks: [] as { posId: string, stock: number, minStock: number }[],
        primaryPosId: ''
    });

    const [description, setDescription] = useState('');
    const [manufacturedDate, setManufacturedDate] = useState<Date>();
    const [expiryDate, setExpiryDate] = useState<Date>();
    const [images, setImages] = useState<{ file: File, preview: string }[]>([]);
    const [variantFormData, setVariantFormData] = useState({
        sku: '',
        price: 0,
        wholesalePrice: 0,
        grandDealerPrice: 0,
        costPrice: 0,
        tempQty: 0, // Used for the primary location in the dialog
        posStocks: [] as { posId: string, stock: number }[],
        barcodeSymbology: 'code128',
        discountType: 'percentage',
        discountValue: 0,
        quantityAlert: 5,
        name: '' // e.g., "Red / XL"
    });

    // UI states for Custom Fields checkboxes
    const [showWarranties, setShowWarranties] = useState(false);
    const [showManufacturer, setShowManufacturer] = useState(false);
    const [showExpiry, setShowExpiry] = useState(false);

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        const socket = io(`${process.env.REACT_APP_BACKEND_API_URL}/scanner`);

        socket.on('connect', () => {
            console.log('Connected to scanner gateway');
        });

        socket.on('barcode-scanned', (data: { barcode: string }) => {
            toast.success(`Barcode scanned: ${data.barcode}`);
            setFormData(prev => ({ ...prev, barcode: data.barcode }));
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cats, brs, posResponse, warrantyList] = await Promise.all([
                    categoryService.getAll('product'),
                    brandService.getAll(),
                    posService.getAll(1, 100), // Fetch high limit for selection
                    warrantyService.getAll()
                ]);
                const poss = posResponse.data || [];
                setCategories(cats);
                setBrands(brs);
                setWarranties(warrantyList);
                setPointsOfSale(poss);

                // Initialize posStocks
                if (poss.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        posStocks: poss.map((pos: any) => ({ posId: pos.id, stock: 0, minStock: 5 }))
                    }));
                }
            } catch (error) {
                toast.error('Erè pandan chajman done yo');
            }
        };
        fetchData();
    }, []);

    const fetchCategories = async () => {
        try {
            const cats = await categoryService.getAll();
            setCategories(cats);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleAddCategory = async () => {
        if (!newCategory.name) {
            toast.error(t('products.error_name_required') || 'Non kategori a nesesè');
            return;
        }
        try {
            const created = await categoryService.create({
                name: newCategory.name,
                description: '',
                isActive: newCategory.status
            });
            toast.success(t('products.category_added') || 'Kategori ajoute avèk siksè');
            setIsAddCategoryOpen(false);
            setNewCategory({ name: '', slug: '', status: true });
            await fetchCategories();
            // Automatically select the newly created category
            if (created && created.id) {
                setFormData(prev => ({ ...prev, categoryId: created.id, subCategoryId: '' }));
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('common.error_saving'));
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newImages = Array.from(files).map(file => ({
                file,
                preview: URL.createObjectURL(file)
            }));
            setImages(prev => [...prev, ...newImages]);
        }
    };

    const removeImage = (index: number) => {
        const imageToRemove = images[index];
        if (imageToRemove.preview) {
            URL.revokeObjectURL(imageToRemove.preview);
        }
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
    };

    const handleSKUGenerate = () => {
        const sku = `PROD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        setFormData(prev => ({ ...prev, sku }));
    };

    const handleVariantSKUGenerate = () => {
        const sku = `VAR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        setVariantFormData(prev => ({ ...prev, sku }));
    };

    const handleOpenVariantDialog = (idx: number | null = null) => {
        if (!formData.primaryPosId) {
            toast.error(t('products.select_location_first') || 'Tanpri chwazi yon lokal prensipal pou pwodwi a anvan');
            return;
        }

        if (idx !== null) {
            const v = variants[idx];
            setVariantFormData({
                ...v,
                tempQty: v.posStocks.find((ps: any) => ps.posId === formData.primaryPosId)?.stock || 0
            });
            setEditingVariantIdx(idx);
        } else {
            setVariantFormData({
                sku: `VAR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                price: Number(formData.price),
                wholesalePrice: Number(formData.wholesalePrice),
                grandDealerPrice: Number(formData.grandDealerPrice),
                costPrice: Number(formData.costPrice),
                tempQty: 0,
                posStocks: pointsOfSale.map(pos => ({ posId: pos.id, stock: 0 })),
                barcodeSymbology: formData.barcodeSymbology,
                discountType: formData.discountType,
                discountValue: formData.discountValue,
                quantityAlert: 5,
                name: ''
            });
            setEditingVariantIdx(null);
        }
        setIsVariantDialogOpen(true);
    };

    const handleSaveVariant = () => {
        if (!variantFormData.sku || !variantFormData.name) {
            toast.error('Tanpri ranpli tout chan ki obligatwa yo pou variant lan');
            return;
        }

        // Update posStocks with the tempQty for the primary location
        const updatedPosStocks = variantFormData.posStocks.map(ps =>
            ps.posId === formData.primaryPosId ? { ...ps, stock: variantFormData.tempQty } : ps
        );

        const newVariant = { ...variantFormData, posStocks: updatedPosStocks };

        if (editingVariantIdx !== null) {
            const updated = [...variants];
            updated[editingVariantIdx] = newVariant;
            setVariants(updated);
        } else {
            setVariants(prev => [...prev, newVariant]);
        }
        setIsVariantDialogOpen(false);
    };

    const removeVariant = (idx: number) => {
        setVariants(prev => prev.filter((_, i) => i !== idx));
    };

    const genSlug = (name: string) => {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '') // Remove special chars
            .replace(/\s+/g, '-'); // Replace spaces with -
    };

    const handleSubmit = async () => {
        const isSingle = formData.productType === 'single';
        const isNameValid = !!formData.name;
        const isSkuValid = !isSingle || !!formData.sku;
        const isPriceValid = !isSingle || !!formData.price;
        const isCategoryValid = !!formData.categoryId;

        if (!isNameValid || !isSkuValid || !isPriceValid || !isCategoryValid) {
            toast.error(t('common.fill_required_fields') || 'Tanpri ranpli tout chan ki obligatwa yo');
            return;
        }

        try {
            setIsLoading(true);

            // Construct pricingStocks
            let pricingStocks = [];

            if (formData.productType === 'single') {
                pricingStocks = [{
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
                        stock: ps.stock
                    }))
                }];
            } else {
                // Variable Product
                if (variants.length === 0) {
                    toast.error('Tanpri ajoute omwen yon variant pou yon pwodwi variable');
                    setIsLoading(false);
                    return;
                }

                pricingStocks = variants.map(v => ({
                    sku: v.sku,
                    price: Number(v.price),
                    wholesalePrice: Number(v.wholesalePrice),
                    grandDealerPrice: Number(v.grandDealerPrice),
                    costPrice: Number(v.costPrice),
                    taxType: formData.taxType, // Inherit from main form for now
                    tax: Number(formData.tax),
                    discountType: v.discountType,
                    discountValue: Number(v.discountValue),
                    quantityAlert: Number(v.quantityAlert),
                    name: v.name,
                    barcodeSymbology: v.barcodeSymbology,
                    posStocks: v.posStocks.map((ps: any) => ({
                        posId: ps.posId,
                        stock: ps.stock
                    }))
                }));
            }

            const submissionData = {
                name: formData.name,
                barcode: formData.barcode,
                description,
                categoryId: formData.categoryId,
                brandId: formData.brandId || null,
                slug: formData.slug,
                sellingType: formData.sellingType,
                unit: formData.unit,
                barcodeSymbology: formData.barcodeSymbology,
                productType: formData.productType,
                manufacturer: formData.manufacturer,
                manufacturedDate,
                expiryDate,
                subCategoryId: formData.subCategoryId || null,
                warranties: formData.warranties,
                warrantyId: formData.warrantyId || null,
                isActive: formData.isActive,
                pricingStocks,
            };

            const multiPartFormData = new FormData();
            multiPartFormData.append('data', JSON.stringify(submissionData));
            images.forEach((img) => {
                multiPartFormData.append('images', img.file);
            });

            await productService.create(multiPartFormData);

            toast.success(t('products.create_success') || 'Pwodwi kreye avèk siksè');
            navigate('/products');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erè pandan kreyasyon pwodwi a');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">{t('products.add_product')}</h1>
                    <p className="text-sm text-muted-foreground">{t('products.create_product')}</p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-primary/10 hover:text-primary" title="Reset">
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-primary/10 hover:text-primary" title="Collapse">
                        <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Link to="/products">
                        <Button className="bg-background border border-border text-foreground hover:bg-primary/10 gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            {t('common.back')}
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="flex-1 overflow-auto space-y-4">
                <Accordion type="multiple" defaultValue={["item-1", "item-2", "item-3", "item-4"]} className="space-y-4">
                    {/* Product Information */}
                    <AccordionItem value="item-1" className="bg-background border border-border rounded-lg overflow-hidden data-[state=open]:pb-0">
                        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-primary/10 pb-4 border-b border-border">
                            <div className="flex items-center gap-2 text-foreground font-medium">
                                <Info className="h-4 w-4 text-primary" />
                                {t('products.product_info')}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6 pt-6 text-muted-foreground">
                            <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
                                {/* Primary Location */}
                                <div className="space-y-2">
                                    <Label className="text-foreground">{t('products.location_label')} <span className="text-red-500">*</span></Label>
                                    <Popover open={openPos} onOpenChange={setOpenPos}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={openPos}
                                                className="w-full justify-between bg-background border-border text-foreground hover:bg-primary/10 hover:text-primary"
                                            >
                                                {formData.primaryPosId
                                                    ? pointsOfSale.find((pos) => pos.id === formData.primaryPosId)?.name
                                                    : t('products.location_placeholder')}
                                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            name: e.target.value,
                                            slug: genSlug(e.target.value)
                                        }))}
                                        className="bg-background border-border text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground">{t('products.slug')} <span className="text-red-500">*</span></Label>
                                    <Input
                                        type="text"
                                        disabled
                                        value={formData.slug}
                                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                        className="bg-background border-border text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground">{t('products.selling_type')} <span className="text-red-500">*</span></Label>
                                    <Select value={formData.sellingType} onValueChange={(v) => setFormData(prev => ({ ...prev, sellingType: v }))}>
                                        <SelectTrigger className="w-full bg-background border-border text-foreground focus-visible:ring-ring">
                                            <SelectValue placeholder={t('products.selling_type')} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-background border-border text-foreground">
                                            <SelectItem value="retail" className="focus:bg-primary/10 focus:text-foreground">Retail</SelectItem>
                                            <SelectItem value="wholesale" className="focus:bg-primary/10 focus:text-foreground">Wholesale</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-foreground">{t('products.category')} <span className="text-red-500">*</span></Label>
                                        <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
                                            <DialogTrigger asChild>
                                                <span className="text-xs text-primary cursor-pointer hover:underline flex items-center gap-1">
                                                    <CirclePlus className="h-3 w-3" /> Add New
                                                </span>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-md bg-background border-border text-foreground">
                                                <DialogHeader>
                                                    <DialogTitle>{t('category.add_cat', 'Add Category')}</DialogTitle>
                                                    <DialogDescription>
                                                        {t('category.add_cat_desc', 'Create a new product category')}
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4 py-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="cat-name" className="text-foreground">{t('category.table_name', 'Name')} <span className="text-rose-500">*</span></Label>
                                                        <Input
                                                            id="cat-name"
                                                            value={newCategory.name}
                                                            onChange={(e) => {
                                                                const name = e.target.value;
                                                                setNewCategory({ ...newCategory, name, slug: genSlug(name) });
                                                            }}
                                                            className="bg-muted border-border text-foreground focus-visible:ring-ring"
                                                            placeholder={t('category.cat_name_placeholder', 'Enter category name')}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="cat-slug" className="text-foreground">{t('category.table_slug', 'Slug')} <span className="text-rose-500">*</span></Label>
                                                        <Input
                                                            id="cat-slug"
                                                            value={newCategory.slug}
                                                            readOnly
                                                            className="bg-muted border-border text-muted-foreground cursor-not-allowed focus-visible:ring-0"
                                                            placeholder={t('category.slug_placeholder', 'auto-generated-slug')}
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-between pt-2">
                                                        <Label htmlFor="cat-status" className="text-foreground">{t('category.table_status', 'Status')} <span className="text-rose-500">*</span></Label>
                                                        <Switch
                                                            id="cat-status"
                                                            checked={newCategory.status}
                                                            onCheckedChange={(checked) => setNewCategory({ ...newCategory, status: checked })}
                                                            className="bg-muted border border-border data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-muted"
                                                        />
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button variant="outline" className="bg-background border-border text-foreground hover:bg-primary/10 hover:text-primary" onClick={() => setIsAddCategoryOpen(false)}>{t('common.cancel')}</Button>
                                                    <Button className="bg-primary hover:bg-primary/90 text-foreground" onClick={handleAddCategory}>{t('common.save_button')}</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className={cn(
                                                    "w-full justify-between bg-background border-border text-foreground hover:bg-primary/10 hover:text-primary",
                                                    !formData.categoryId && "text-muted-foreground"
                                                )}
                                            >
                                                {formData.categoryId
                                                    ? categories.find(
                                                        (category) => category.id === formData.categoryId
                                                    )?.name
                                                    : t('products.category')}
                                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0 bg-background border-border text-foreground" align="start">
                                            <Command className="bg-transparent">
                                                <CommandInput placeholder={`${t('products.category')}...`} className="text-foreground" />
                                                <CommandList>
                                                    <CommandEmpty>{t('common.no_results') || 'Pa jwenn anyen'}</CommandEmpty>
                                                    <CommandGroup>
                                                        {categories.map((cat: any) => (
                                                            <CommandItem
                                                                key={cat.id}
                                                                value={cat.name}
                                                                onSelect={() => {
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        categoryId: cat.id,
                                                                        subCategoryId: ''
                                                                    }))
                                                                }}
                                                                className="text-foreground data-[selected='true']:bg-transparent data-[selected=true]:bg-transparent data-[selected='true']:text-foreground data-[selected=true]:text-foreground cursor-pointer"
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        formData.categoryId === cat.id ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                {cat.name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground">{t('products.sub_category')}</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                disabled={!formData.categoryId}
                                                className={cn(
                                                    "w-full justify-between bg-background border-border text-foreground hover:bg-primary/10 disabled:opacity-50",
                                                    !formData.subCategoryId && "text-muted-foreground"
                                                )}
                                            >
                                                {formData.subCategoryId
                                                    ? categories.find((c: any) => c.id === formData.categoryId)?.subCategories?.find(
                                                        (sub: any) => sub.id === formData.subCategoryId
                                                    )?.name
                                                    : t('products.sub_category')}
                                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0 bg-background border-border text-foreground" align="start">
                                            <Command className="bg-transparent">
                                                <CommandInput placeholder={`${t('products.sub_category')}...`} className="text-foreground" />
                                                <CommandList>
                                                    <CommandEmpty>{t('common.no_results') || 'Pa jwenn anyen'}</CommandEmpty>
                                                    <CommandGroup>
                                                        {categories.find((c: any) => c.id === formData.categoryId)?.subCategories?.map((sub: any) => (
                                                            <CommandItem
                                                                key={sub.id}
                                                                value={sub.name}
                                                                onSelect={() => {
                                                                    setFormData(prev => ({ ...prev, subCategoryId: sub.id }))
                                                                }}
                                                                className="text-foreground data-[selected='true']:bg-transparent data-[selected=true]:bg-transparent data-[selected='true']:text-foreground data-[selected=true]:text-foreground cursor-pointer"
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        formData.subCategoryId === sub.id ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                {sub.name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-foreground">{t('products.brand')} <span className="text-red-500">*</span></Label>
                                    <Popover open={openBrand} onOpenChange={setOpenBrand}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className={cn(
                                                    "w-full justify-between bg-background border-border text-foreground hover:bg-primary/10 hover:text-primary",
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
                                        <SelectTrigger className="w-full bg-background border-border text-foreground focus-visible:ring-ring">
                                            <SelectValue placeholder={t('products.unit')} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-background border-border text-foreground">
                                            <SelectItem value="pc" className="focus:bg-primary/10 focus:text-foreground">Piece</SelectItem>
                                            <SelectItem value="kg" className="focus:bg-primary/10 focus:text-foreground">Kilogram</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-foreground">{t('products.barcode_symbology')} <span className="text-red-500">*</span></Label>
                                    <Popover open={openSymbology} onOpenChange={setOpenSymbology}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className={cn(
                                                    "w-full justify-between bg-background border-border text-foreground hover:bg-primary/10 hover:text-primary",
                                                    !formData.barcodeSymbology && "text-muted-foreground"
                                                )}
                                            >
                                                {formData.barcodeSymbology
                                                    ? formData.barcodeSymbology === 'code128' ? 'Code 128' : 'EAN-13'
                                                    : t('products.barcode_symbology')}
                                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0 bg-background border-border text-foreground" align="start">
                                            <Command className="bg-transparent">
                                                <CommandInput placeholder={`${t('products.barcode_symbology')}...`} className="text-foreground" />
                                                <CommandList>
                                                    <CommandEmpty>{t('common.no_results') || 'Pa jwenn anyen'}</CommandEmpty>
                                                    <CommandGroup>
                                                        <CommandItem
                                                            value="code128"
                                                            onSelect={() => {
                                                                setFormData(prev => ({ ...prev, barcodeSymbology: 'code128' }));
                                                                setOpenSymbology(false);
                                                            }}
                                                            className="text-foreground data-[selected='true']:bg-transparent data-[selected=true]:bg-transparent data-[selected='true']:text-foreground data-[selected=true]:text-foreground cursor-pointer"
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    formData.barcodeSymbology === 'code128' ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            Code 128
                                                        </CommandItem>
                                                        <CommandItem
                                                            value="ean13"
                                                            onSelect={() => {
                                                                setFormData(prev => ({ ...prev, barcodeSymbology: 'ean13' }));
                                                                setOpenSymbology(false);
                                                            }}
                                                            className="text-foreground data-[selected='true']:bg-transparent data-[selected=true]:bg-transparent data-[selected='true']:text-foreground data-[selected=true]:text-foreground cursor-pointer"
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    formData.barcodeSymbology === 'ean13' ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            EAN-13
                                                        </CommandItem>
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                {formData.productType === 'single' && (
                                    <div className="space-y-2 animate-in fade-in duration-300">
                                        <Label className="text-foreground">{t('products.item_barcode')} <span className="text-red-500">*</span></Label>
                                        <div className="relative">
                                            <Input
                                                type="text"
                                                value={formData.barcode}
                                                onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                                                className="bg-background border-border text-foreground focus-visible:ring-2 focus-visible:ring-ring pr-24"
                                            />
                                            <Button
                                                onClick={() => {
                                                    if (formData.barcodeSymbology === 'ean13') {
                                                        // Generate 12 random digits
                                                        let base = '';
                                                        for (let i = 0; i < 12; i++) {
                                                            base += Math.floor(Math.random() * 10).toString();
                                                        }
                                                        // Calculate EAN-13 check digit
                                                        let sum = 0;
                                                        for (let i = 0; i < 12; i++) {
                                                            sum += parseInt(base[i]) * (i % 2 === 0 ? 1 : 3);
                                                        }
                                                        const checkDigit = (10 - (sum % 10)) % 10;
                                                        setFormData(prev => ({ ...prev, barcode: base + checkDigit }));
                                                    } else {
                                                        // Code 128 or other: 12 random digits
                                                        const randomCode = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
                                                        setFormData(prev => ({ ...prev, barcode: randomCode }));
                                                    }
                                                }}
                                            >
                                                {t('products.generate')}
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                <div className="col-span-1 md:col-span-2 space-y-2">
                                    <Label className="text-foreground">{t('products.product_description')}</Label>
                                    <div className="rounded-md border border-border bg-background overflow-hidden">
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
                        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-primary/10 pb-4 border-b border-border">
                            <div className="flex items-center gap-2 text-foreground font-medium">
                                <LifeBuoy className="h-4 w-4 text-primary" />
                                {t('products.pricing_stock')}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6 pt-6 text-muted-foreground">
                            <div className="space-y-6">
                                <div className="flex items-center gap-6 p-4 border border-border rounded-lg bg-muted">
                                    <RadioGroup
                                        value={formData.productType}
                                        onValueChange={(v: any) => setFormData(prev => ({ ...prev, productType: v }))}
                                        className="flex items-center space-x-6"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="single" id="single" className="border-border text-primary" />
                                            <Label htmlFor="single" className="text-muted-foreground cursor-pointer">{t('products.single_product')}</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="variable" id="variable" className="border-border text-primary" />
                                            <Label htmlFor="variable" className="text-muted-foreground cursor-pointer">{t('products.variable_product')}</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                {/* Basic Pricing Details (Only for Single Product) */}
                                {formData.productType === 'single' && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="space-y-2">
                                            <Label className="text-foreground">{t('products.quantity')} <span className="text-red-500">*</span></Label>
                                            <Input
                                                type="text"
                                                placeholder="0"
                                                value={formData.posStocks.find(ps => ps.posId === formData.primaryPosId)?.stock || 0}
                                                onChange={(e) => {
                                                    const val = Number(e.target.value);
                                                    if (!formData.primaryPosId) {
                                                        toast.error(t('products.select_location_first') || 'Tanpri chwazi yon lokal anvan');
                                                        return;
                                                    }
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        posStocks: prev.posStocks.map(ps =>
                                                            ps.posId === prev.primaryPosId ? { ...ps, stock: val } : ps
                                                        )
                                                    }));
                                                }}
                                                className="bg-background border-border text-foreground focus-visible:ring-ring"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-foreground">{t('products.price')} <span className="text-red-500">*</span></Label>
                                            <Input
                                                type="text"
                                                value={formData.price}
                                                onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                                                className="bg-background border-border text-foreground"
                                                placeholder="Détail"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-foreground">Prix en Gros</Label>
                                            <Input
                                                type="text"
                                                value={formData.wholesalePrice}
                                                onChange={(e) => setFormData(prev => ({ ...prev, wholesalePrice: Number(e.target.value) }))}
                                                className="bg-background border-border text-foreground"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-foreground">Prix Grand Dealer</Label>
                                            <Input
                                                type="text"
                                                value={formData.grandDealerPrice}
                                                onChange={(e) => setFormData(prev => ({ ...prev, grandDealerPrice: Number(e.target.value) }))}
                                                className="bg-background border-border text-foreground"
                                            />
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
                                    </div>
                                )}

                                {/* Common Pricing Settings (Tax & Defaults) */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-border pt-6">
                                    <div className="space-y-2">
                                        <Label className="text-foreground">{t('products.tax_type')} <span className="text-red-500">*</span></Label>
                                        <Select value={formData.taxType} onValueChange={(v) => setFormData(prev => ({ ...prev, taxType: v }))}>
                                            <SelectTrigger className="w-full bg-background border-border text-foreground">
                                                <SelectValue placeholder={t('products.tax_type')} />
                                            </SelectTrigger>
                                            <SelectContent className="bg-background border-border text-foreground">
                                                <SelectItem value="inclusive" className="focus:bg-primary/10 focus:text-foreground">Inclusive</SelectItem>
                                                <SelectItem value="exclusive" className="focus:bg-primary/10 focus:text-foreground">Exclusive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-foreground">{t('products.tax')} (%) <span className="text-red-500">*</span></Label>
                                        <Select value={formData.tax.toString()} onValueChange={(v) => setFormData(prev => ({ ...prev, tax: Number(v) }))}>
                                            <SelectTrigger className="w-full bg-background border-border text-foreground">
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-background border-border text-foreground">
                                                <SelectItem value="0" className="focus:bg-primary/10 focus:text-foreground">0%</SelectItem>
                                                <SelectItem value="10" className="focus:bg-primary/10 focus:text-foreground">10%</SelectItem>
                                                <SelectItem value="15" className="focus:bg-primary/10 focus:text-foreground">15%</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {formData.productType === 'single' && (
                                        <>
                                            <div className="space-y-2">
                                                <Label className="text-foreground">{t('products.discount_type')} <span className="text-red-500">*</span></Label>
                                                <Select value={formData.discountType} onValueChange={(v) => setFormData(prev => ({ ...prev, discountType: v }))}>
                                                    <SelectTrigger className="w-full bg-background border-border text-foreground">
                                                        <SelectValue placeholder={t('products.discount_type')} />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-background border-border text-foreground">
                                                        <SelectItem value="percentage" className="focus:bg-primary/10 focus:text-foreground">Percentage</SelectItem>
                                                        <SelectItem value="fixed" className="focus:bg-primary/10 focus:text-foreground">Fixed</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-foreground">{t('products.discount_value')} <span className="text-red-500">*</span></Label>
                                                <Input
                                                    type="text"
                                                    value={formData.discountValue}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, discountValue: Number(e.target.value) }))}
                                                    className="bg-background border-border text-foreground"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-foreground">{t('products.quantity_alert')} <span className="text-red-500">*</span></Label>
                                                <Input
                                                    type="text"
                                                    value={formData.quantityAlert}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, quantityAlert: Number(e.target.value) }))}
                                                    className="bg-background border-border text-foreground"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Variants Section (Only for Variable Product) */}
                                {formData.productType === 'variable' && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 border-t border-border pt-6">
                                        <div className="flex items-center justify-between px-2">
                                            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                                                <List className="h-4 w-4 text-primary" />
                                                {t('products.variants')}
                                            </h4>
                                            <Button
                                                type="button"
                                                onClick={() => handleOpenVariantDialog()}
                                                className="bg-primary hover:bg-primary/90 text-white gap-2 h-9"
                                            >
                                                <Plus className="h-4 w-4" />
                                                {t('products.add_variant')}
                                            </Button>
                                        </div>

                                        <div className="rounded-lg border border-border bg-muted overflow-hidden">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-muted text-foreground font-medium">
                                                    <tr className="border-b border-border">
                                                        <th className="px-4 py-3">Pwodwi / Atribi</th>
                                                        <th className="px-4 py-3">SKU</th>
                                                        <th className="px-4 py-3 text-center">Qty</th>
                                                        <th className="px-4 py-3 text-center">Pri</th>
                                                        <th className="px-4 py-3 text-right">Aksyon</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border text-muted-foreground">
                                                    {variants.length > 0 ? (
                                                        variants.map((v, idx) => (
                                                            <tr key={idx} className="hover:bg-primary/10 transition-colors group">
                                                                <td className="px-4 py-3 font-medium text-foreground">{v.name}</td>
                                                                <td className="px-4 py-3 font-mono text-xs">{v.sku}</td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px]">
                                                                        {v.posStocks.find((ps: any) => ps.posId === formData.primaryPosId)?.stock || 0}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-center text-emerald-400 font-medium">${v.price}</td>
                                                                <td className="px-4 py-3 text-right">
                                                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() => handleOpenVariantDialog(idx)}
                                                                            className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                                                        >
                                                                            <Edit className="h-3.5 w-3.5" />
                                                                        </Button>
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() => removeVariant(idx)}
                                                                            className="h-7 w-7 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                                                                        >
                                                                            <Trash2 className="h-3.5 w-3.5" />
                                                                        </Button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td className="px-4 py-12 text-center" colSpan={5}>
                                                                <div className="flex flex-col items-center opacity-30">
                                                                    <List className="h-8 w-8 mb-2" />
                                                                    <p className="italic text-xs">{t('products.no_variants') || 'Pa gen okenn varyasyon ki ajoute ankò'}</p>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Images */}
                    <AccordionItem value="item-3" className="bg-background border border-border rounded-lg overflow-hidden">
                        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-primary/10 pb-4 border-b border-border">
                            <div className="flex items-center gap-2 text-foreground font-medium">
                                <ImageIcon className="h-4 w-4 text-primary" />
                                {t('products.images')}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6 pt-6 text-muted-foreground">
                            <div className="flex flex-wrap gap-4">
                                <Input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                                <div onClick={() => fileInputRef.current?.click()} className="h-24 w-24 rounded-lg border border-dashed border-border hover:border-primary flex flex-col items-center justify-center cursor-pointer group">
                                    <CirclePlus className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                                    <span className="text-[10px] mt-2 group-hover:text-primary">{t('products.add_images')}</span>
                                </div>
                                {images.map((image, idx) => (
                                    <div key={idx} className="h-24 w-24 rounded-lg border border-border p-1 relative group">
                                        <img src={image.preview} alt={`Pwodu ${idx + 1}`} className="h-full w-full object-contain rounded-md" />
                                        <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-4 w-4 opacity-0 group-hover:opacity-100" onClick={() => removeImage(idx)}>
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Custom Fields */}
                    <AccordionItem value="item-4" className="bg-background border border-border rounded-lg overflow-hidden">
                        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-primary/10 pb-4 border-b border-border">
                            <div className="flex items-center gap-2 text-foreground font-medium">
                                <List className="h-4 w-4 text-primary" />
                                {t('products.custom_fields')}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6 pt-6 text-muted-foreground">
                            <div className="space-y-6">
                                {/* Checkboxes Row */}
                                <div className="flex items-center gap-6 p-4 border border-border rounded-lg bg-muted">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="isActive-check"
                                            checked={formData.isActive}
                                            onCheckedChange={(v) => setFormData(prev => ({ ...prev, isActive: !!v }))}
                                            className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                        />
                                        <Label htmlFor="isActive-check" className="text-muted-foreground cursor-pointer">{t('products.status_label')}</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="warranties-check"
                                            checked={showWarranties}
                                            onCheckedChange={(v) => setShowWarranties(!!v)}
                                            className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                        />
                                        <Label htmlFor="warranties-check" className="text-muted-foreground cursor-pointer">{t('products.warranties')}</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="manufacturer-check"
                                            checked={showManufacturer}
                                            onCheckedChange={(v) => setShowManufacturer(!!v)}
                                            className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                        />
                                        <Label htmlFor="manufacturer-check" className="text-muted-foreground cursor-pointer">{t('products.manufacturer')}</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="expiry-check"
                                            checked={showExpiry}
                                            onCheckedChange={(v) => setShowExpiry(!!v)}
                                            className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                        />
                                        <Label htmlFor="expiry-check" className="text-muted-foreground cursor-pointer">{t('products.expiry')}</Label>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {showWarranties && (
                                        <div className="space-y-2 animate-in fade-in duration-300">
                                            <Label className="text-foreground">{t('products.warranties')} <span className="text-red-500">*</span></Label>
                                            <Select value={formData.warrantyId} onValueChange={(v) => {
                                                const selected = warranties.find(w => w.id === v);
                                                setFormData(prev => ({
                                                    ...prev,
                                                    warrantyId: v,
                                                    warranties: selected?.name || ''
                                                }));
                                            }}>
                                                <SelectTrigger className="w-full bg-background border-border text-foreground focus-visible:ring-ring">
                                                    <SelectValue placeholder={t('products.select_warranty')} />
                                                </SelectTrigger>
                                                <SelectContent className="bg-background border-border text-foreground">
                                                    {warranties.map((w) => (
                                                        <SelectItem key={w.id} value={w.id} className="focus:bg-primary/10 focus:text-foreground">
                                                            {w.name} ({w.duration} {w.durationUnit})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                    {showManufacturer && (
                                        <div className="space-y-2 animate-in fade-in duration-300">
                                            <Label className="text-foreground">{t('products.manufacturer')} <span className="text-red-500">*</span></Label>
                                            <Input
                                                type="text"
                                                value={formData.manufacturer}
                                                onChange={(e) => setFormData(prev => ({ ...prev, manufacturer: e.target.value }))}
                                                className="bg-background border-border text-foreground"
                                            />
                                        </div>
                                    )}
                                    {showExpiry && (
                                        <>
                                            <div className="space-y-2 animate-in fade-in duration-300">
                                                <DatePickerInput
                                                    id="manufactured-date"
                                                    label={t('products.manufactured_date')}
                                                    date={manufacturedDate}
                                                    onDateChange={setManufacturedDate}
                                                />
                                            </div>
                                            <div className="space-y-2 animate-in fade-in duration-300">
                                                <DatePickerInput
                                                    id="expiry-on"
                                                    label={t('products.expiry_on')}
                                                    date={expiryDate}
                                                    onDateChange={setExpiryDate}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                {/* Variant Creation/Editing Dialog */}
                <Dialog open={isVariantDialogOpen} onOpenChange={setIsVariantDialogOpen}>
                    <DialogContent className="bg-background border-border text-foreground sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-foreground">
                                <Plus className="h-5 w-5 text-primary" />
                                {editingVariantIdx !== null ? 'Modifye Variant' : 'Ajoute yon Variant'}
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground">
                                Mete detay pou varyasyon pwodwi sa a (egz: Koulè, Gwosè, elatriye).
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-6 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="v-name" className="text-foreground">Non / Atribi <span className="text-rose-500">*</span></Label>
                                <Input
                                    id="v-name"
                                    value={variantFormData.name}
                                    onChange={(e) => setVariantFormData({ ...variantFormData, name: e.target.value })}
                                    className="bg-muted border-border text-foreground focus-visible:ring-ring"
                                    placeholder="Egz: Wouj / XL"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="v-sku" className="text-foreground">SKU <span className="text-rose-500">*</span></Label>
                                    <div className="relative">
                                        <Input
                                            id="v-sku"
                                            value={variantFormData.sku}
                                            onChange={(e) => setVariantFormData({ ...variantFormData, sku: e.target.value })}
                                            className="bg-muted border-border text-foreground focus-visible:ring-ring pr-10 text-xs font-mono"
                                        />
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="ghost"
                                            onClick={handleVariantSKUGenerate}
                                            className="absolute right-0 top-0 h-full px-2 text-muted-foreground hover:text-primary"
                                        >
                                            <RefreshCw className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="v-symbology" className="text-foreground">{t('products.barcode_symbology')}</Label>
                                    <Select
                                        value={variantFormData.barcodeSymbology}
                                        onValueChange={(val) => setVariantFormData({ ...variantFormData, barcodeSymbology: val })}
                                    >
                                        <SelectTrigger className="bg-muted border-border text-foreground">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-background border-border text-foreground">
                                            <SelectItem value="code128">Code 128</SelectItem>
                                            <SelectItem value="ean13">EAN-13</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="v-price" className="text-foreground">Pri Vann ($) (Détail) <span className="text-rose-500">*</span></Label>
                                    <Input
                                        id="v-price"
                                        type="number"
                                        value={variantFormData.price}
                                        onChange={(e) => setVariantFormData({ ...variantFormData, price: Number(e.target.value) })}
                                        className="bg-muted border-border text-emerald-400 font-medium focus-visible:ring-emerald-500/50"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="v-wholesale-price" className="text-foreground">Prix en Gros</Label>
                                    <Input
                                        id="v-wholesale-price"
                                        type="number"
                                        value={variantFormData.wholesalePrice}
                                        onChange={(e) => setVariantFormData({ ...variantFormData, wholesalePrice: Number(e.target.value) })}
                                        className="bg-muted border-border text-foreground focus-visible:ring-ring"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="v-grand-dealer-price" className="text-foreground">Prix Grand Dealer</Label>
                                    <Input
                                        id="v-grand-dealer-price"
                                        type="number"
                                        value={variantFormData.grandDealerPrice}
                                        onChange={(e) => setVariantFormData({ ...variantFormData, grandDealerPrice: Number(e.target.value) })}
                                        className="bg-muted border-border text-foreground focus-visible:ring-ring"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="v-cost" className="text-foreground">Pri Acha ($)</Label>
                                    <Input
                                        id="v-cost"
                                        type="number"
                                        value={variantFormData.costPrice}
                                        onChange={(e) => setVariantFormData({ ...variantFormData, costPrice: Number(e.target.value) })}
                                        className="bg-muted border-border text-foreground"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="v-qty" className="text-foreground">
                                        Kantite Stock ({pointsOfSale.find(p => p.id === formData.primaryPosId)?.name || 'Lokal Prensipal'}) <span className="text-rose-500">*</span>
                                    </Label>
                                    <Input
                                        id="v-qty"
                                        type="number"
                                        value={variantFormData.tempQty}
                                        onChange={(e) => setVariantFormData({ ...variantFormData, tempQty: Number(e.target.value) })}
                                        className="bg-muted border-border text-foreground focus-visible:ring-ring"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="v-alert" className="text-foreground">Alert Kantite</Label>
                                    <Input
                                        id="v-alert"
                                        type="number"
                                        value={variantFormData.quantityAlert}
                                        onChange={(e) => setVariantFormData({ ...variantFormData, quantityAlert: Number(e.target.value) })}
                                        className="bg-muted border-border text-foreground"
                                    />
                                </div>
                            </div>

                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button type="button" variant="ghost" onClick={() => setIsVariantDialogOpen(false)} className="text-foreground hover:bg-primary/10">Anile</Button>
                            <Button type="button" onClick={handleSaveVariant} className="bg-primary hover:bg-primary/90 text-white min-w-[120px]">
                                {editingVariantIdx !== null ? 'Mete ajou' : 'Ajoute Variant'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <div className="flex items-center justify-end gap-3 mt-8 pb-4">
                    <Button variant="outline" onClick={() => navigate('/products')} className="bg-background border-border text-foreground hover:bg-primary/10">
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
        </div >
    );
};

export default AddProduct;
