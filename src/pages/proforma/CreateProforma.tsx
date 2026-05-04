import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "components/ui/card";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "components/ui/table";
import {
    Search,
    Plus,
    Trash,
    Minus,
    ShoppingCart,
    Calendar,
    ArrowRight,
    User
} from "lucide-react";
import { toast } from 'sonner';
import proformaService, { CreateProformaData, ProformaItemData } from 'context/api/proformaService';
import productService from 'context/api/productservice';
import serviceService from 'context/api/serviceService';
import customerService from 'context/api/customerService';
import posService from 'context/api/posservice';
import { Customer, PointOfSale } from 'context/types/interface';
import { useAuth } from 'context/AuthContext';
import { UserRoleName } from 'context/types/auth';
import { Badge } from 'components/ui/badge';
import { MapPin } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "components/ui/select";
import { useTranslation } from 'react-i18next';
import { useSettings } from 'context/SettingsContext';

const CreateProforma: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { currency } = useSettings();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [products, setProducts] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [posLocations, setPosLocations] = useState<PointOfSale[]>([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>(() => {
        return localStorage.getItem('proforma_selectedCustomerId') || undefined;
    });
    const [selectedPosId, setSelectedPosId] = useState<string | undefined>(() => {
        return localStorage.getItem('proforma_selectedPosId') || user?.posId;
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [cart, setCart] = useState<ProformaItemData[]>(() => {
        const savedCart = localStorage.getItem('proforma_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });
    const [discount, setDiscount] = useState(() => {
        return parseFloat(localStorage.getItem('proforma_discount') || '0') || 0;
    });
    const [expiresInDays, setExpiresInDays] = useState(() => {
        return parseInt(localStorage.getItem('proforma_expiresInDays') || '7');
    });
    const [sellType, setSellType] = useState<'product' | 'service'>(() => {
        return (localStorage.getItem('proforma_sellType') as 'product' | 'service') || 'product';
    });

    // Persistence Effects
    useEffect(() => {
        if (selectedCustomerId) localStorage.setItem('proforma_selectedCustomerId', selectedCustomerId);
        else localStorage.removeItem('proforma_selectedCustomerId');
    }, [selectedCustomerId]);

    useEffect(() => {
        if (selectedPosId) localStorage.setItem('proforma_selectedPosId', selectedPosId);
        else localStorage.removeItem('proforma_selectedPosId');
    }, [selectedPosId]);

    useEffect(() => {
        localStorage.setItem('proforma_cart', JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        localStorage.setItem('proforma_discount', discount.toString());
    }, [discount]);

    useEffect(() => {
        localStorage.setItem('proforma_expiresInDays', expiresInDays.toString());
    }, [expiresInDays]);

    useEffect(() => {
        localStorage.setItem('proforma_sellType', sellType);
    }, [sellType]);

    const fetchInitialData = useCallback(async () => {
        try {
            const isAdmin = user?.role?.name === UserRoleName.SUPER_ADMIN || user?.role?.name === UserRoleName.ADMIN;

            const [productsData, servicesData, customersData, posData] = await Promise.all([
                productService.getAll(),
                serviceService.getAll(),
                customerService.getAll(),
                isAdmin ? posService.getAll(1, 100) : Promise.resolve({ data: [] })
            ]);

            // Normalize products to have a top-level price
            const normalizedProducts = productsData.map((p: any) => ({
                ...p,
                price: p.pricingStocks?.[0]?.price || 0
            }));

            setProducts(normalizedProducts);
            setServices(servicesData);
            setCustomers(customersData);
            if (isAdmin) setPosLocations(Array.isArray(posData) ? posData : (posData as any).data || []);
        } catch (error) {
            console.error('Error fetching proforma initial data:', error);
            toast.error("Impossible de charger les données");
        }
    }, [user?.role?.name]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const addToCart = (item: any) => {
        const idKey = sellType === 'product' ? 'productId' : 'serviceId';
        const existingItem = cart.find(cartItem => cartItem[idKey] === item.id);

        if (existingItem) {
            setCart(cart.map(cartItem =>
                cartItem[idKey] === item.id
                    ? { ...cartItem, qty: cartItem.qty + 1 }
                    : cartItem
            ));
        } else {
            setCart([...cart, {
                [idKey]: item.id,
                name: item.name,
                price: Number(item.price) || 0,
                qty: 1
            } as ProformaItemData]);
        }
        toast.success(t("proforma.item_added_to_cart", { itemName: item.name }));
    };

    const removeFromCart = (index: number) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
    };

    const updateQty = (index: number, newQty: number) => {
        if (newQty < 1) return;
        const newCart = [...cart];
        newCart[index].qty = newQty;
        setCart(newCart);
    };

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const tax = subtotal * 0.10;
    const safeDiscount = isNaN(discount) || discount < 0 ? 0 : discount;
    const total = subtotal + tax - safeDiscount;

    const handleSave = async () => {
        if (cart.length === 0) {
            toast.error(t("proforma.add_at_least_one_item"));
            return;
        }

        setIsLoading(true);
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + expiresInDays);

        if (!selectedPosId) {
            toast.error("Tanpri chwazi yon Lokalizasyon (POS).");
            setIsLoading(false);
            return;
        }

        const proformaData: CreateProformaData = {
            posId: selectedPosId,
            customerId: selectedCustomerId === "walk-in" ? undefined : selectedCustomerId,
            sellType: sellType.toUpperCase() as any,
            items: cart,
            discount: safeDiscount,
            expiresAt: expirationDate.toISOString()
        };

        try {
            await proformaService.create(proformaData);
            toast.success(t("proforma.proforma_created_success"));

            // Clear persistence on success
            localStorage.removeItem('proforma_cart');
            localStorage.removeItem('proforma_selectedCustomerId');
            localStorage.removeItem('proforma_selectedPosId');
            localStorage.removeItem('proforma_discount');
            localStorage.removeItem('proforma_expiresInDays');
            localStorage.removeItem('proforma_sellType');

            navigate('/proforma/list');
        } catch (error: any) {
            console.error('Error creating proforma:', error);
            toast.error(error.response?.data?.message || t("proforma.error_creating_proforma"));
        } finally {
            setIsLoading(false);
        }
    };

    const currentItems = sellType === 'product' ? products : services;
    const filteredItems = currentItems.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <Button
                    variant="ghost"
                    className="text-muted-foreground hover:text-primary"
                    onClick={() => navigate('/proforma/list')}
                >
                    <ArrowRight className="h-4 w-4 rotate-180 mr-2" />
                    {t('common.back')}
                </Button>
                <h1 className="text-3xl font-bold text-foreground">{t('proforma.title_create')}</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Product Selection */}
                <div className="lg:col-span-1 space-y-6">
                    {/* POS Selection for Admins */}
                    {(user?.role?.name === UserRoleName.SUPER_ADMIN || user?.role?.name === UserRoleName.ADMIN) && (
                        <Card className="bg-background border-border shrink-0">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-foreground text-lg flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-emerald-400" />
                                    {t('proforma.select_pos')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Select onValueChange={setSelectedPosId} value={selectedPosId}>
                                    <SelectTrigger className="bg-muted border-border text-foreground">
                                        <SelectValue placeholder={t('proforma.placeholder_pos')} />
                                    </SelectTrigger>
                                    <SelectContent className="bg-background border-border text-foreground">
                                        {posLocations.map(pos => (
                                            <SelectItem key={pos.id} value={pos.id}>
                                                {pos.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </CardContent>
                        </Card>
                    )}

                    <Card className="bg-background border-border">
                        <CardHeader>
                            <CardTitle className="text-foreground">{t('proforma.select_customer')}</CardTitle>
                            <div className="pt-2">
                                <Select onValueChange={setSelectedCustomerId} value={selectedCustomerId}>
                                    <SelectTrigger className="bg-muted border-border text-foreground">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <SelectValue placeholder={t('proforma.placeholder_customer')} />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="bg-background border-border text-foreground">
                                        <SelectItem value="walk-in">{t('proforma.walk_in')}</SelectItem>
                                        {customers.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                    </Card>

                    <Card className="bg-background border-border h-full">
                        <CardHeader>
                            <CardTitle className="text-foreground">{t('proforma.search_items', { type: sellType === 'product' ? t('sidebar.products') : t('sidebar.services') })}</CardTitle>
                            <div className="relative pt-2">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground mt-1" />
                                <Input
                                    placeholder={sellType === 'product' ? t('products.search_placeholder') : t('services.search_placeholder')}
                                    className="pl-9 bg-muted border-border text-foreground"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="max-h-[500px] overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-border">
                            {filteredItems.length === 0 ? (
                                <p className="text-center text-muted-foreground italic py-8 text-sm">
                                    {t('common.no_data')}
                                </p>
                            ) : filteredItems.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => addToCart(item)}
                                    className="p-3 bg-muted border border-border rounded-lg hover:bg-primary/10 cursor-pointer transition-all group"
                                >
                                    <div className="flex justify-between items-start gap-3">
                                        {/* Left — name + description/SKU */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-foreground font-medium group-hover:text-blue-400 truncate">
                                                {item.name}
                                            </p>
                                            {sellType === 'service' && item.description && (
                                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                                                    {item.description}
                                                </p>
                                            )}
                                            {sellType === 'product' && item.sku && (
                                                <p className="text-xs text-muted-foreground mt-0.5">{item.sku}</p>
                                            )}
                                        </div>
                                        {/* Right — price + category/stock */}
                                        <div className="text-right flex-shrink-0 space-y-1">
                                            <p className="text-foreground font-bold text-sm">
                                                {Number(item.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}{currency}
                                            </p>
                                            {sellType === 'service' && item.category?.name && (
                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                                    {item.category.name}
                                                </span>
                                            )}
                                            {sellType === 'product' && (
                                                <Badge variant="outline" className="text-[10px] py-0 border-border text-muted-foreground">
                                                    {t('common.stock')}: {item.qty || 0}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Cart / Items List */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-background border-border">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-foreground flex items-center gap-2">
                                    <ShoppingCart className="h-5 w-5 text-blue-400" />
                                    {t('proforma.item_list')}
                                </CardTitle>
                                <CardDescription className="text-muted-foreground">{t('proforma.items_to_appear_in_proforma')}</CardDescription>
                            </div>
                            <div className="flex bg-muted rounded-lg p-1 border border-border">
                                <Button
                                    size="sm"
                                    variant={sellType === 'product' ? 'secondary' : 'ghost'}
                                    className={sellType === 'product' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-muted-foreground'}
                                    onClick={() => {
                                        setSellType('product');
                                        setCart([]);
                                    }}
                                >
                                    {t('sidebar.products')}
                                </Button>
                                <Button
                                    size="sm"
                                    variant={sellType === 'service' ? 'secondary' : 'ghost'}
                                    className={sellType === 'service' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-muted-foreground'}
                                    onClick={() => {
                                        setSellType('service');
                                        setCart([]);
                                    }}
                                >
                                    {t('sidebar.services')}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border border-border overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-muted">
                                        <TableRow className="border-border">
                                            <TableHead className="text-foreground">{t('common.item')}</TableHead>
                                            <TableHead className="text-foreground w-24">{t('common.price')}</TableHead>
                                            <TableHead className="text-foreground w-32">{t('common.quantity')}</TableHead>
                                            <TableHead className="text-foreground">{t('common.total')}</TableHead>
                                            <TableHead className="text-right text-foreground w-16"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {cart.length === 0 ? (
                                            <TableRow className="border-border hover:bg-transparent">
                                                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">
                                                    {t('proforma.no_items_added')}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            cart.map((item, index) => (
                                                <TableRow key={index} className="border-border hover:bg-primary/10 transition-colors">
                                                    <TableCell className="text-foreground font-medium">{item.name}</TableCell>
                                                    <TableCell className="text-foreground">{item.price}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-7 w-7 bg-background border-border text-foreground"
                                                                onClick={() => updateQty(index, item.qty - 1)}
                                                            >
                                                                <Minus className="h-4 w-4" />
                                                            </Button>
                                                            <span className="w-8 text-center text-foreground">{item.qty}</span>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-7 w-7 bg-background border-border text-foreground"
                                                                onClick={() => updateQty(index, item.qty + 1)}
                                                            >
                                                                +
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-emerald-400 font-bold">
                                                        {(item.price * item.qty).toFixed(2)}
                                                    </TableCell>
                                                    <TableCell className="text-right text-foreground">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-500/10"
                                                            onClick={() => removeFromCart(index)}
                                                        >
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Summary & Config */}
                            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="p-4 bg-muted border border-border rounded-xl space-y-4">
                                        <h4 className="text-foreground font-medium text-sm uppercase tracking-wider opacity-50">Paramèt Devis</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Search className="h-3 w-3" /> {t('proforma.discount')} ({currency})
                                                </label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    className="bg-background border-border text-foreground"
                                                    value={discount === 0 ? '' : discount}
                                                    placeholder="0.00"
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        const parsed = parseFloat(val);
                                                        setDiscount(isNaN(parsed) || parsed < 0 ? 0 : parsed);
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" /> Ekspire (Jou)
                                                </label>
                                                <Input
                                                    type="number"
                                                    className="bg-background border-border text-foreground"
                                                    value={expiresInDays}
                                                    onChange={(e) => setExpiresInDays(parseInt(e.target.value) || 7)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-muted-foreground items-center">
                                        <span>{t('proforma.subtotal')}</span>
                                        <span className="text-foreground font-medium">{subtotal.toFixed(2)} {currency}</span>
                                    </div>
                                    {tax > 0 && (
                                        <div className="flex justify-between text-muted-foreground items-center">
                                            <span>{t('proforma.tax')} (10%)</span>
                                            <span className="text-foreground font-medium">{tax.toFixed(2)} {currency}</span>
                                        </div>
                                    )}
                                    {safeDiscount > 0 && (
                                        <div className="flex justify-between text-muted-foreground items-center">
                                            <span>{t('proforma.discount')}</span>
                                            <span className="text-rose-400 font-medium">-{safeDiscount.toFixed(2)} {currency}</span>
                                        </div>
                                    )}
                                    <div className="h-px bg-border my-2" />
                                    <div className="flex justify-between items-center bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                                        <span className="text-blue-400 font-bold uppercase tracking-widest text-lg">Total</span>
                                        <span className="text-2xl font-black text-foreground">{total.toFixed(2)} {currency}</span>
                                    </div>
                                    <Button
                                        className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 text-foreground font-bold"
                                        onClick={handleSave}
                                        disabled={isLoading || cart.length === 0}
                                    >
                                        {isLoading ? t('common.loading') : t('proforma.finalize_and_save')}
                                        {!isLoading && <Plus className="ml-2 h-5 w-5" />}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CreateProforma;
