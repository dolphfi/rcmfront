import React, { useState, useEffect, useRef } from 'react'
import { useProducts } from 'hooks/useProducts';
import { useCategories } from 'hooks/useCategories';
import { useServices } from 'hooks/useServices';
import { Button } from 'components/ui/button';
import { useOutletContext, useLocation } from 'react-router-dom';
import { Plus, Scan, Check, ChevronDown, X, Trash, Minus, Wallet, CreditCard, Split, Pause, SquarePercent, TicketCheck, Loader2, Receipt } from 'lucide-react';
import { useAuth } from 'context/AuthContext';
import salesService, { CreateSaleData } from 'context/api/salesService';
import posService from 'context/api/posservice';
import { ScrollArea } from 'components/ui/scroll-area';
import { Input } from 'components/ui/input';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "components/ui/select"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "components/ui/dialog"
import { Label } from "components/ui/label"
import { cn } from "lib/utils"
import { toast } from "sonner"
import QRCode from 'qrcode'
import customerService from 'context/api/customerService';
import { Customer } from 'context/types/interface';



const customersStatic = [
    { label: "Walk-in Customer", value: "walk-in", bonusPoints: 0, loyaltyPoints: 0 },
]

// Define Cart Item Interface
interface CartItem {
    id: string | number;
    name: string;
    price: number;
    qty: number;
}

// Split Payment Row Interface
interface PaymentRow {
    id: number;
    method: string;
    amount: string;
}

// QR Code View Component
interface QRCodeViewProps {
    paymentMethod: string;
    amount: number;
    onBack: () => void;
}

const QRCodeView: React.FC<QRCodeViewProps> = ({ paymentMethod, amount, onBack }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current) {
            // Generate QR code with payment info
            const paymentData = `${paymentMethod}:${amount}:${Date.now()}`;
            QRCode.toCanvas(canvasRef.current, paymentData, {
                width: 256,
                margin: 2,
                color: {
                    dark: '#10b981', // emerald-500
                    light: '#0f172a' // slate-900
                }
            });
        }
    }, [paymentMethod, amount]);

    return (
        <>
            <DialogHeader>
                <DialogTitle className="text-white text-xl flex items-center gap-2">
                    <button onClick={onBack} className="hover:text-emerald-400 transition-colors">
                        ←
                    </button>
                    {paymentMethod} Payment
                </DialogTitle>
                <DialogDescription className="text-slate-300">
                    Scan the QR code to complete the payment
                </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center gap-4 mt-4">
                <div className="bg-slate-800/50 p-4 rounded-lg border border-white/10">
                    <canvas ref={canvasRef} className="rounded" />
                </div>

                <div className="w-full space-y-2 text-center">
                    <div className="flex justify-between items-center px-4 py-2 bg-slate-800/30 rounded-lg">
                        <span className="text-slate-400 text-sm">Amount:</span>
                        <span className="text-white font-bold text-lg">${amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-2 bg-slate-800/30 rounded-lg">
                        <span className="text-slate-400 text-sm">Method:</span>
                        <span className="text-emerald-400 font-medium">{paymentMethod}</span>
                    </div>
                </div>

                <p className="text-slate-400 text-xs text-center">
                    Waiting for payment confirmation...
                </p>
            </div>
        </>
    );
};

const CashierPOS: React.FC = () => {
    const { sellType } = useOutletContext<{ sellType: string }>();
    const location = useLocation();
    const { user } = useAuth();
    const [open, setOpen] = useState(false)
    const [isFinalizing, setIsFinalizing] = useState(false);
    const [value, setValue] = useState(() => {
        return localStorage.getItem('pos_selectedCustomer') || "walk-in";
    })

    const [cartReference, setCartReference] = useState(() => {
        return localStorage.getItem('pos_cartReference') || Math.floor(1000000000 + Math.random() * 9000000000).toString();
    });

    useEffect(() => {
        localStorage.setItem('pos_cartReference', cartReference);
    }, [cartReference]);

    const [realCustomers, setRealCustomers] = useState<Customer[]>([]);
    const [clearCartDialogOpen, setClearCartDialogOpen] = useState(false);
    const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
    const [isScanCustomerDialogOpen, setIsScanCustomerDialogOpen] = useState(false);
    const [scanCustomerQuery, setScanCustomerQuery] = useState('');
    const [customerFormData, setCustomerFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        isActive: true
    });

    // Data Hooks
    const { products, isLoading: isLoadingProducts } = useProducts(user?.posId);
    const { categories: allCategories, isLoading: isLoadingCategories } = useCategories();
    const { services, isLoading: isLoadingServices } = useServices(user?.posId);

    // Filter categories by type
    const productCategories = allCategories.filter(c => c.type === 'product');
    const serviceCategories = allCategories.filter(c => c.type === 'service');

    const handleSaveCustomer = async () => {
        if (!customerFormData.firstName || !customerFormData.lastName) {
            toast.error('O non ak siyati an obligatwa');
            return;
        }

        try {
            const newCustomer = await customerService.create(customerFormData);
            toast.success('Kliyan an anrejistre avèk siksè');
            setIsCustomerDialogOpen(false);
            await fetchRealCustomers();
            if (newCustomer && newCustomer.id) {
                setValue(newCustomer.id);
            }
            setCustomerFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                address: '',
                isActive: true
            });
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erè pandan kreyasyon kliyan an');
        }
    };

    const handleScanCustomerSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const query = scanCustomerQuery.trim();
        if (!query) return;

        const customer = realCustomers.find(c =>
            c.phone?.includes(query) ||
            c.email?.toLowerCase() === query.toLowerCase() ||
            c.id === query ||
            c.firstName.toLowerCase() === query.toLowerCase() ||
            c.lastName.toLowerCase() === query.toLowerCase()
        );

        if (customer) {
            setValue(customer.id);
            toast.success(`Kliyan jwenn: ${customer.firstName} ${customer.lastName}`);
            setIsScanCustomerDialogOpen(false);
            setScanCustomerQuery('');
            setOpen(false);
        } else {
            toast.error('Pa gen okenn kliyan ki gen referans sa a');
            setScanCustomerQuery('');
        }
    };

    const fetchRealCustomers = async () => {
        try {
            const data = await customerService.getAll();
            setRealCustomers(data);
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
        }
    };

    useEffect(() => {
        fetchRealCustomers();
    }, []);

    // Handle Proforma conversion
    useEffect(() => {
        if (location.state?.proforma) {
            const { proforma } = location.state;

            // Set customer
            if (proforma.customerId) {
                setValue(proforma.customerId);
            } else {
                setValue("walk-in");
            }

            // Map and set cart
            const mappedItems = proforma.items.map((item: any) => ({
                id: item.productId || item.serviceId,
                name: item.name,
                price: parseFloat(item.price),
                qty: item.qty
            }));

            setCart(mappedItems);

            // Clear location state to prevent re-populating on accidental refresh/back
            window.history.replaceState({}, document.title);

            toast.success(`Devis ${proforma.proformaNumber} chaje avèk siksè !`);
        }
    }, [location.state, realCustomers]);

    // Helper to get selected customer details
    const selectedCustomer = value === 'walk-in'
        ? customersStatic[0]
        : realCustomers.find(c => c.id === value);
    const [selectedCategory, setSelectedCategory] = useState<string>(() => {
        return localStorage.getItem('pos_selectedCategory') || 'all';
    });
    const [selectedCategoryServices, setSelectedCategoryServices] = useState<string>(() => {
        return localStorage.getItem('pos_selectedCategoryServices') || 'all';
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState<CartItem[]>(() => {
        const savedCart = localStorage.getItem('pos_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
    const [amountTendered, setAmountTendered] = useState<number | ''>('');
    const [cashDialogOpen, setCashDialogOpen] = useState(false);
    const [scanDialogOpen, setScanDialogOpen] = useState(false);
    const [selectedDigitalPayment, setSelectedDigitalPayment] = useState<string | null>(null);
    const [splitDialogOpen, setSplitDialogOpen] = useState(false);

    // Receipt Printing states
    const [printPromptOpen, setPrintPromptOpen] = useState(false);
    const [completedSaleId, setCompletedSaleId] = useState<string | null>(null);
    const [posData, setPosData] = useState<any>(null);

    // Fetch POS dat on mount to verify template
    useEffect(() => {
        if (user?.posId) {
            posService.getById(user.posId).then(setPosData).catch(console.error);
        }
    }, [user?.posId]);
    const [paymentRows, setPaymentRows] = useState<PaymentRow[]>([
        { id: 1, method: 'cash', amount: '' },
        { id: 2, method: 'cash', amount: '' },
    ]);

    useEffect(() => {
        localStorage.setItem('pos_selectedCategory', selectedCategory);
    }, [selectedCategory]);

    useEffect(() => {
        localStorage.setItem('pos_selectedCategoryServices', selectedCategoryServices);
    }, [selectedCategoryServices]);

    useEffect(() => {
        localStorage.setItem('pos_cart', JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        localStorage.setItem('pos_selectedCustomer', value);
    }, [value]);

    // Clear payment method when cart becomes empty
    useEffect(() => {
        if (cart.length === 0) {
            setSelectedPaymentMethod('');
        }
    }, [cart.length]);

    const currentCategories = sellType === 'Service' ? serviceCategories : productCategories;
    const currentSelected = sellType === 'Service' ? selectedCategoryServices : selectedCategory;
    const setCurrentSelected = sellType === 'Service' ? setSelectedCategoryServices : setSelectedCategory;

    // Filter items based on sellType and selected category
    const getDisplayedItems = () => {
        let items = [];
        if (sellType === 'Service') {
            items = services.map(s => ({
                ...s,
                price: s.price || 0,
                imageUrl: '' // Services don't have images in the current schema
            }));
            if (selectedCategoryServices !== 'all') {
                items = items.filter(item => item.categoryId === selectedCategoryServices || item.category?.id === selectedCategoryServices);
            }
        } else {
            const now = new Date();
            items = products
                .filter(p => !p.expiryDate || new Date(p.expiryDate) > now)
                .map(p => ({
                    ...p,
                    price: p.pricingStocks?.[0]?.price || 0,
                    sku: p.pricingStocks?.[0]?.sku || 'N/A',
                    imageUrl: p.images?.find((img: any) => img.isPrimary)?.url || p.images?.[0]?.url || ''
                }));
            if (selectedCategory !== 'all') {
                items = items.filter(item => item.categoryId === selectedCategory || item.category?.id === selectedCategory);
            }
        }

        if (searchTerm) {
            items = items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        return items;
    };

    const getItemCategoryName = (categoryId: string) => {
        const cat = allCategories.find(c => c.id === categoryId);
        return cat?.name || 'Unknown';
    };

    const addToCart = (item: any) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
            if (existingItem) {
                return prevCart.map(cartItem =>
                    cartItem.id === item.id
                        ? { ...cartItem, qty: cartItem.qty + 1 }
                        : cartItem
                );
            } else {
                return [...prevCart, {
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    qty: 1,
                }];
            }
        });
    };

    const removeFromCart = (itemId: string | number) => {
        setCart(prevCart => prevCart.filter(item => item.id !== itemId));
    };

    const updateQty = (itemId: string | number, delta: number) => {
        setCart(prevCart => prevCart.map(item => {
            if (item.id === itemId) {
                const newQty = item.qty + delta;
                return newQty > 0 ? { ...item, qty: newQty } : item;
            }
            return item;
        }));
    };

    const clearCart = () => {
        if (cart.length === 0) {
            toast.info("Cart is already empty");
            return;
        }
        setClearCartDialogOpen(true);
    };

    const confirmClearCart = () => {
        setCart([]);
        setClearCartDialogOpen(false);
        toast.success("Cart cleared successfully");
    };

    const handleFinalizeSale = async () => {
        if (cart.length === 0) {
            toast.error("Panyen an vid. Ajoute atik anvan ou finalize.");
            return;
        }

        if (!selectedPaymentMethod) {
            toast.error("Tanpri chwazi yon fason pou peye.");
            return;
        }

        if (!user?.posId) {
            toast.error("Erreur: Ou pa asosye ak okenn POS. Kontakte admin.");
            return;
        }

        if (selectedPaymentMethod === 'cash') {
            const tendered = typeof amountTendered === 'number' ? amountTendered : 0;
            if (tendered < total) {
                toast.error(`Kòb la pa ase. Li manke ${(total - tendered).toLocaleString()} HTG.`);
                return;
            }
        }

        setIsFinalizing(true);

        const saleData: CreateSaleData = {
            posId: user.posId,
            customerId: value !== 'walk-in' ? value : undefined,
            sellType: sellType.toUpperCase() as any, // 'PRODUCT' or 'SERVICE'
            paymentMethod: selectedPaymentMethod.toUpperCase() as any,
            items: cart.map(item => ({
                productId: sellType === 'Product' ? item.id as string : undefined,
                serviceId: sellType === 'Service' ? item.id as string : undefined,
                name: item.name,
                price: item.price,
                qty: item.qty
            })),
            discount: discount
        };

        try {
            const newSale = await salesService.create(saleData);
            toast.success("Lavant lan fini ak siksè!");

            // Open print prompt instead of immediately clearing the cart
            setCompletedSaleId(newSale.id);
            setPrintPromptOpen(true);
            setCashDialogOpen(false);
        } catch (error: any) {
            console.error('Error finalizing sale:', error);
            const message = error.response?.data?.message || "Lavant lan echwe. Eseye ankò.";
            toast.error(typeof message === 'string' ? message : message[0]);
        } finally {
            setIsFinalizing(false);
        }
    };

    const handleNewSale = () => {
        setCart([]);
        localStorage.removeItem('pos_cart');
        setSelectedPaymentMethod('');
        setAmountTendered('');
        setCompletedSaleId(null);
        setPrintPromptOpen(false);
        setCartReference(Math.floor(1000000000 + Math.random() * 9000000000).toString());
    };

    const handlePrintReceipt = async () => {
        if (!completedSaleId) return;

        // Verify if POS has a receipt template linked
        if (!posData?.receiptTemplate) {
            toast.error("Point de vente sa pa gen okenn modèl resi ki konfigire. Enpresyon anile.");
            handleNewSale();
            return;
        }

        const receiptUrl = `${process.env.REACT_APP_BACKEND_API_URL}/pdf/receipt/${completedSaleId}`;

        try {
            toast.info("Ap chaje resi a...");
            const response = await fetch(receiptUrl, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
            });

            if (!response.ok) {
                throw new Error("Echwe pou rale resi a soti nan sèvè a.");
            }

            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const printIframe = document.createElement('iframe');
            printIframe.style.display = 'none';
            printIframe.src = blobUrl;

            document.body.appendChild(printIframe);

            printIframe.onload = () => {
                try {
                    if (printIframe.contentWindow) {
                        printIframe.contentWindow.focus();
                        printIframe.contentWindow.print();
                    }
                } catch (error) {
                    console.error("Print error:", error);
                    // Fallback to strict download if print object URL fails
                    toast.info("Enpresyon otomatik bloke, ap telechaje pito...");
                    const link = document.createElement('a');
                    link.href = blobUrl;
                    link.download = `Resi_${completedSaleId}.pdf`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }

                // Clean up after some time
                setTimeout(() => {
                    try { document.body.removeChild(printIframe); } catch (e) { }
                    URL.revokeObjectURL(blobUrl);
                }, 10000);
            };
        } catch (error) {
            console.error("Error preparing receipt:", error);
            toast.error("Echwe pou prepare resi PDF la.");
        }

        handleNewSale();
    };

    const displayedItems = getDisplayedItems();
    const cartItemCount = cart.reduce((acc, item) => acc + item.qty, 0);

    // Payment calculations
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const tax = subtotal * 0.10; // 10% tax
    // const discount = 0; // Can be updated based on loyalty/promotions
    // fake discount
    const discount = subtotal / 10;
    const total = subtotal + tax - discount;

    return (
        <div className="flex h-full overflow-hidden">
            {/* Left Column - Category */}
            <div className="w-32 lg:w-40 border-r border-white/10 flex-shrink-0 flex flex-col overflow-hidden">
                <ScrollArea className="flex-1">
                    <div className="space-y-2 p-4 flex flex-col items-center">
                        {/* All Categories Button */}
                        <Button
                            onClick={() => setCurrentSelected('all')}
                            className={`h-24 w-24 rounded-lg border border-white/10 p-1 relative group ${currentSelected === 'all'
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
                                }`}
                        >
                            All
                        </Button>

                        {/* Category Buttons */}
                        {isLoadingCategories ? (
                            <div className="flex flex-col gap-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-24 w-24 rounded-lg bg-slate-800 animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            currentCategories.map((item) => (
                                <Button
                                    key={item.id}
                                    onClick={() => setCurrentSelected(item.id)}
                                    className={`h-24 w-24 rounded-lg border border-white/10 p-1 relative group flex-col gap-2 ${currentSelected === item.id
                                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
                                        }`}
                                >
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.name} className="h-10 w-10 object-contain" />
                                    ) : (
                                        <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-xs">
                                            {item.name.substring(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="text-xs font-medium text-center line-clamp-2 leading-tight">
                                        {item.name}
                                    </span>
                                </Button>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Middle Column - Products or Services */}
            <div className="flex-1 backdrop-blur-sm border-r border-white/10 flex flex-col overflow-hidden">
                <div className="p-2 sm:p-4 pb-0 pt-1">
                    <Input
                        type="text"
                        placeholder={`Search ${sellType === 'Service' ? 'services' : 'products'}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500"
                    />
                </div>
                <ScrollArea className="flex-1">
                    <div className="p-2 sm:p-4">
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
                            {isLoadingProducts || isLoadingServices ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="h-56 sm:h-64 rounded-xl bg-slate-800 animate-pulse" />
                                ))
                            ) : displayedItems.length === 0 ? (
                                <div className="col-span-full py-20 text-center text-slate-500">
                                    Pak gen okenn atik yo jwenn
                                </div>
                            ) : (
                                displayedItems.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => addToCart(item)}
                                        className="h-56 sm:h-64 w-full rounded-xl border border-emerald-500/50 bg-slate-900/50 transition-all cursor-pointer group flex flex-col overflow-hidden relative hover:border-emerald-500 active:scale-95"
                                    >

                                        {/* Image Area */}
                                        <div className="h-24 sm:h-32 w-full bg-white/5 p-1 flex items-center justify-center relative">
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.name} className="h-full p-1 w-full rounded-lg object-cover" />
                                            ) : (
                                                <div className="h-full p-1 w-full rounded-lg flex items-center justify-center text-slate-500 text-xs ">
                                                    Okenn Imaj
                                                </div>
                                            )}
                                        </div>

                                        {/* Content Area */}
                                        <div className="flex-1 p-2 sm:p-3 flex flex-col gap-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-slate-400 text-[10px] sm:text-xs font-medium truncate">
                                                    {getItemCategoryName(item.categoryId || item.category?.id)}
                                                </span>
                                                {sellType === 'Product' && (
                                                    <span className="text-slate-400 font-medium text-[10px] sm:text-xs whitespace-nowrap shrink-0">
                                                        Sku: {item.sku}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-white text-xs sm:text-sm font-medium leading-tight line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem]">
                                                {item.name}
                                            </h3>

                                            {/* Dotted Separator */}
                                            <div className="h-px w-full border-t border-dashed border-white/10" />

                                            {/* Price and Actions */}
                                            <div className="flex items-center justify-between mt-auto">
                                                <span className="text-white font-bold text-sm sm:text-base">
                                                    ${item.price}
                                                </span>

                                                {/* Add to Cart Button */}
                                                <Button
                                                    className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white p-0 flex items-center justify-center transition-colors"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        addToCart(item);
                                                    }}
                                                >
                                                    <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </ScrollArea>
            </div>

            {/* Right Column - Customer Info */}
            <div className="w-full md:w-64 lg:w-80 backdrop-blur-sm flex-shrink-0 flex flex-col overflow-hidden">
                <div className="p-4 pb-0 pt-1 flex items-center gap-2">
                    {/* Customer info will go here */}
                    <div className="flex-1 min-w-0">
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    role="combobox"
                                    aria-expanded={open}
                                    className="w-full h-10 justify-between bg-slate-900/50 border border-white/10 text-white hover:bg-slate-900/70 hover:text-white"
                                >
                                    <span className="truncate flex-1 text-left text-xs sm:text-sm">
                                        {value === 'walk-in'
                                            ? "Walk-in Customer"
                                            : realCustomers.find((c) => c.id === value)?.firstName + ' ' + realCustomers.find((c) => c.id === value)?.lastName || "Select customer..."}
                                    </span>
                                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] lg:w-[240px] p-0 bg-slate-900/95 backdrop-blur-xl border-white/10 text-white">
                                <Command className="bg-transparent border-none text-white">
                                    <CommandInput placeholder="Search customer..." className="text-white placeholder:text-slate-500" />
                                    <CommandList>
                                        <CommandEmpty>No customer found.</CommandEmpty>
                                        <CommandGroup>
                                            <CommandItem
                                                value="walk-in"
                                                onSelect={() => {
                                                    setValue("walk-in")
                                                    setOpen(false)
                                                }}
                                                className="text-white hover:bg-emerald-600 aria-selected:bg-emerald-600 aria-selected:text-white cursor-pointer"
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        value === "walk-in" ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                Walk-in Customer
                                            </CommandItem>
                                            {realCustomers.map((customer) => (
                                                <CommandItem
                                                    key={customer.id}
                                                    value={customer.id}
                                                    keywords={[customer.firstName, customer.lastName, customer.phone || '']}
                                                    onSelect={(currentValue) => {
                                                        setValue(currentValue)
                                                        setOpen(false)
                                                    }}
                                                    className="text-white hover:bg-emerald-600 aria-selected:bg-emerald-600 aria-selected:text-white cursor-pointer"
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            value === customer.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {customer.firstName} {customer.lastName}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <Button
                        onClick={() => setIsCustomerDialogOpen(true)}
                        className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-600 hover:bg-emerald-700 text-white p-0 shrink-0"
                    >
                        <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                    <Button
                        onClick={() => setIsScanCustomerDialogOpen(true)}
                        className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-600 hover:bg-emerald-700 text-white p-0 shrink-0"
                    >
                        <Scan className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                </div>
                <div className="p-4 pb-1 pt-1">
                    {selectedCustomer && (
                        <div className="relative p-2 rounded-lg border border-orange-500/30 bg-orange-500/5 mt-2">
                            {value !== 'walk-in' && (
                                <Button
                                    onClick={() => setValue('walk-in')}
                                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-orange-600 hover:bg-orange-700 text-white p-0 flex items-center justify-center"
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            )}

                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-white font-medium text-sm mb-1 leading-none">
                                        {value === 'walk-in' ? "Walk-in Customer" : `${(selectedCustomer as Customer).firstName} ${(selectedCustomer as Customer).lastName}`}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="text-slate-400">Bonus :</span>
                                        <span className="bg-cyan-500 text-white px-1.5 py-0.5 rounded-md font-bold text-[10px]">
                                            {value === 'walk-in' ? 0 : (selectedCustomer as Customer).bonusPoints}
                                        </span>
                                        <span className="text-slate-300">|</span>
                                        <span className="text-slate-400">Loyalty :</span>
                                        <span className="bg-emerald-500 text-white px-1.5 py-0.5 rounded-md font-bold text-[10px]">
                                            {value === 'walk-in' ? 0 : (selectedCustomer as Customer).loyaltyPoints}
                                        </span>
                                    </div>
                                </div>
                                {value !== 'walk-in' && (
                                    <Button className="h-6 text-xs bg-orange-600 hover:bg-orange-700 text-white px-3">
                                        Apply
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                {/* Separator */}
                <div className="h-px w-full border-t border border-white/10" />
                <ScrollArea className="flex-1">
                    {/* cart items will go here */}
                    <div className="p-4">
                        <div className='border border-white/10 p-2 rounded-md'>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <h4 className="text-white font-medium text-sm">Items in cart</h4>
                                    <span className="bg-emerald-500/20 text-emerald-500 text-[10px] px-2 py-0.5 rounded-md font-bold border border-emerald-500/20">
                                        {cartItemCount} Items
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800/50 px-2 py-1 rounded border border-white/5">
                                        #{cartReference}
                                    </span>
                                    <Button
                                        title='Clear cart'
                                        onClick={clearCart}
                                        className="h-6 w-6 text-red-500 hover:text-red-400 hover:bg-red-500/10 p-0 rounded-md transition-colors bg-transparent border border-white/5 hover:border-red-500/20"
                                    >
                                        <Trash className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                            {/* Dotted Separator */}
                            <div className="h-px w-full border-t border-dashed border-white/10" />
                            {/* Cart Header */}
                            <div className="grid grid-cols-12 gap-2 mb-2 px-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-2">
                                <div className="col-span-6">Item</div>
                                <div className="col-span-3 text-center">QTY</div>
                                <div className="col-span-3 text-right">Cost</div>
                            </div>
                            {/* Cart Items List */}
                            <div className="space-y-1 ">
                                {cart.length === 0 ? (
                                    <div className="text-slate-500 text-center text-sm py-4 italic">
                                        Cart is empty
                                    </div>
                                ) : (
                                    cart.map((item) => (
                                        <div key={item.id} className="group grid grid-cols-12 gap-2 items-center p-2 rounded-lg hover:bg-white/5 transition-colors">
                                            {/* Item Name & Delete */}
                                            <div className="col-span-6 flex items-center gap-2 overflow-hidden">
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-slate-500 hover:text-red-500 transition-colors shrink-0"
                                                >
                                                    <Trash className="h-3.5 w-3.5" />
                                                </button>
                                                <div className="truncate">
                                                    <span className="text-sm font-medium text-slate-200 group-hover:text-orange-400 transition-colors">
                                                        {item.name}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="col-span-3 flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => updateQty(item.id, -1)}
                                                    className="h-5 w-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="text-white text-xs font-semibold w-4 text-center">{item.qty}</span>
                                                <button
                                                    onClick={() => updateQty(item.id, 1)}
                                                    className="h-5 w-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>

                                            {/* Price */}
                                            <div className="col-span-3 text-right">
                                                <span className="text-white font-bold text-sm">
                                                    ${(item.price * item.qty).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            {/* Dotted Separator */}
                            <div className="h-px w-full border-t border-dashed border-white/10" />
                            {/* Payment Summary */}
                            <div className="space-y-2 mt-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 text-sm">Subtotal</span>
                                    <span className="text-white font-medium text-sm">${subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 text-sm">Tax (10%)</span>
                                    <span className="text-white font-medium text-sm">${tax.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 text-sm">Discount</span>
                                    <span className="text-white font-medium text-sm">-${discount.toLocaleString()}</span>
                                </div>
                                {/* Separator */}
                                <div className="h-px w-full border-t border-dashed border-white/10 my-2" />
                                {/* Total */}
                                <div className="flex items-center justify-between pt-1">
                                    <span className="text-white font-bold text-base">Total Payable</span>
                                    <span className="text-emerald-400 font-bold text-lg">${total.toLocaleString()}</span>
                                </div>
                            </div>

                        </div>
                    </div>
                    {/* payment method and Action button */}
                    <div className='p-4'>
                        <div className='border border-white/10 rounded-md overflow-hidden'>
                            {/* 2-column grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2">
                                {/* Left Column - Payment Methods */}
                                <div className="border-r border-dashed border-white/10">
                                    <div className="p-2 border-b border-white/10">
                                        <h4 className="text-white font-medium text-sm underline underline-offset-4">Payment Method</h4>
                                    </div>
                                    <div className="flex flex-col gap-1 p-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                if (cart.length === 0) {
                                                    toast.error("Cart is empty. Please add items before selecting a payment method.");
                                                    return;
                                                }
                                                setSelectedPaymentMethod('cash');
                                            }}
                                            className={`w-full justify-start gap-2 h-9 text-white hover:bg-emerald-600/20 hover:text-white ${selectedPaymentMethod === 'cash'
                                                ? 'bg-emerald-600/10 border-emerald-500/30'
                                                : 'bg-slate-800/50 border-white/10 hover:bg-slate-700/50'
                                                }`}
                                        >
                                            <Wallet className={`h-4 w-4 ${selectedPaymentMethod === 'cash' ? 'text-emerald-500' : 'text-slate-400'}`} />
                                            <span className="text-sm">Cash</span>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                if (cart.length === 0) {
                                                    toast.error("Cart is empty. Please add items before selecting a payment method.");
                                                    return;
                                                }
                                                toast.error("Peman pa kat poko disponib.");
                                            }}
                                            className={`w-full justify-start gap-2 h-9 text-white hover:bg-emerald-600/20 hover:text-white ${selectedPaymentMethod === 'card'
                                                ? 'bg-emerald-600/10 border-emerald-500/30'
                                                : 'bg-slate-800/50 border-white/10 hover:bg-slate-700/50'
                                                }`}
                                        >
                                            <CreditCard className={`h-4 w-4 ${selectedPaymentMethod === 'card' ? 'text-emerald-500' : 'text-orange-400'}`} />
                                            <span className="text-sm">Card</span>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                if (cart.length === 0) {
                                                    toast.error("Cart is empty. Please add items before selecting a payment method.");
                                                    return;
                                                }
                                                toast.error("Peman par scan poko disponib.");
                                            }}
                                            className={`w-full justify-start gap-2 h-9 text-white hover:bg-emerald-600/20 hover:text-white ${selectedPaymentMethod === 'scan'
                                                ? 'bg-emerald-600/10 border-emerald-500/30'
                                                : 'bg-slate-800/50 border-white/10 hover:bg-slate-700/50'
                                                }`}
                                        >
                                            <Scan className={`h-4 w-4 ${selectedPaymentMethod === 'scan' ? 'text-emerald-500' : 'text-blue-400'}`} />
                                            <span className="text-sm">Scan</span>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                if (cart.length === 0) {
                                                    toast.error("Cart is empty. Please add items before selecting a payment method.");
                                                    return;
                                                }
                                                toast.error("Peman pataje (Split Bill) poko disponib.");
                                            }}
                                            className={`w-full justify-start gap-2 h-9 text-white hover:bg-emerald-600/20 hover:text-white ${selectedPaymentMethod === 'split'
                                                ? 'bg-emerald-600/10 border-emerald-500/30'
                                                : 'bg-slate-800/50 border-white/10 hover:bg-slate-700/50'
                                                }`}
                                        >
                                            <Split className={`h-4 w-4 ${selectedPaymentMethod === 'split' ? 'text-emerald-500' : 'text-purple-400'}`} />
                                            <span className="text-sm">Split Bill</span>
                                        </Button>
                                    </div>
                                </div>

                                {/* Right Column - Actions */}
                                <div>
                                    <div className="p-2 border-b border-white/10">
                                        <h4 className="text-white font-medium text-sm underline underline-offset-4">Action</h4>
                                    </div>
                                    <div className="flex flex-col gap-1 p-2">
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start gap-2 h-9 bg-emerald-600/10 border-emerald-500/30 text-white hover:bg-emerald-600/20 hover:text-white"
                                        >
                                            <Pause className="h-4 w-4 text-emerald-500" />
                                            <span className="text-sm">En Pause</span>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start gap-2 h-9 bg-slate-800/50 border-white/10 text-white hover:bg-slate-700/50 hover:text-white"
                                        >
                                            <SquarePercent className="h-4 w-4 text-orange-400" />
                                            <span className="text-sm">Rabais</span>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            disabled={isFinalizing || cart.length === 0 || !selectedPaymentMethod}
                                            onClick={() => {
                                                if (selectedPaymentMethod === 'cash') {
                                                    setCashDialogOpen(true);
                                                } else {
                                                    handleFinalizeSale();
                                                }
                                            }}
                                            className="w-full justify-start gap-2 h-9 bg-slate-800/50 border-white/10 text-white hover:bg-blue-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isFinalizing ? (
                                                <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                                            ) : (
                                                <TicketCheck className="h-4 w-4 text-blue-400" />
                                            )}
                                            <span className="text-sm">{isFinalizing ? 'Ap voye...' : 'Finaliser'}</span>
                                        </Button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                </ScrollArea>
            </div>

            {/* Cash Payment Dialog */}
            <Dialog open={cashDialogOpen} onOpenChange={(open) => {
                setCashDialogOpen(open);
                if (!open && !isFinalizing) setAmountTendered('');
            }}>
                <DialogContent className="bg-slate-900/95 backdrop-blur-xl border-white/20 text-white max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-white text-xl flex items-center gap-2">
                            <Wallet className="h-5 w-5 text-emerald-500" />
                            Pèman Lajan Kach
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Antre kantite kòb kliyan an bay la pou finalize vant lan.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-lg border border-white/10">
                            <span className="text-slate-400">Total a Peye:</span>
                            <span className="text-xl font-bold text-emerald-400">{total.toLocaleString()} HTG</span>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Montant Reçu (HTG)</label>
                            <Input
                                type="number"
                                value={amountTendered}
                                onChange={(e) => setAmountTendered(e.target.value ? Number(e.target.value) : '')}
                                placeholder={`Min: ${total.toLocaleString()}`}
                                className="bg-slate-800/50 border-white/20 text-white text-lg h-12"
                                min={total}
                                autoFocus
                            />
                        </div>

                        <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-lg border border-white/10">
                            <span className="text-slate-400">Monnaie (Rès kòb):</span>
                            <span className={`text-lg font-bold ${(typeof amountTendered === 'number' && amountTendered >= total) ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {typeof amountTendered === 'number' && amountTendered >= total
                                    ? (amountTendered - total).toLocaleString()
                                    : '0'} HTG
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-2">
                        <Button
                            variant="outline"
                            onClick={() => setCashDialogOpen(false)}
                            className="bg-slate-800 border-white/10 text-white hover:bg-slate-700 w-full sm:w-auto"
                        >
                            <X className="h-4 w-4 mr-2" />
                            Anile
                        </Button>
                        <Button
                            onClick={handleFinalizeSale}
                            disabled={isFinalizing || typeof amountTendered !== 'number' || amountTendered < total}
                            className="bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-700 w-full sm:w-auto"
                        >
                            {isFinalizing ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Check className="h-4 w-4 mr-2" />
                            )}
                            {isFinalizing ? 'Ap trete...' : 'Valide Vant lan'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Post-Sale Print Dialog */}
            <Dialog open={printPromptOpen} onOpenChange={(open) => {
                if (!open) handleNewSale();
            }}>
                <DialogContent className="bg-slate-900 border-white/10 text-white max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center justify-center gap-2 text-emerald-400">
                            <Check className="h-6 w-6" />
                            Vant lan Reyisi!
                        </DialogTitle>
                        <DialogDescription className="text-center text-slate-400 pt-2">
                            Pèman ou an anrejistre kòrèkteman. Èske ou vle enprime resi a pou kliyan an?
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-3 mt-4">
                        <Button
                            onClick={handlePrintReceipt}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 h-12 text-lg"
                        >
                            <Receipt className="h-5 w-5" />
                            Enprime Resi
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleNewSale}
                            className="w-full bg-slate-800 border-white/10 text-white hover:bg-slate-700 h-10"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Nouvo Vant
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Digital Payment Options Dialog */}
            <Dialog open={scanDialogOpen} onOpenChange={(open) => {
                setScanDialogOpen(open);
                if (!open) setSelectedDigitalPayment(null);
            }}>
                <DialogContent className="bg-slate-900/95 backdrop-blur-xl border-white/20 text-white max-w-md">
                    {!selectedDigitalPayment ? (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-white text-xl">Select Digital Payment Method</DialogTitle>
                                <DialogDescription className="text-slate-300">
                                    Choose a digital payment option to proceed with the transaction
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <Button
                                    variant="outline"
                                    className="h-20 flex flex-col items-center justify-center gap-2 bg-slate-800/50 border-white/10 text-white hover:bg-emerald-600/20 hover:border-emerald-500/30"
                                    onClick={() => setSelectedDigitalPayment('Natcash')}
                                >
                                    <Wallet className="h-6 w-6 text-cyan-400" />
                                    <span className="text-sm font-medium">Natcash</span>
                                </Button>

                                <Button
                                    variant="outline"
                                    className="h-20 flex flex-col items-center justify-center gap-2 bg-slate-800/50 border-white/10 text-white hover:bg-emerald-600/20 hover:border-emerald-500/30"
                                    onClick={() => setSelectedDigitalPayment('Moncash')}
                                >
                                    <CreditCard className="h-6 w-6 text-red-400" />
                                    <span className="text-sm font-medium">Moncash</span>
                                </Button>

                                <Button
                                    variant="outline"
                                    className="h-20 flex flex-col items-center justify-center gap-2 bg-slate-800/50 border-white/10 text-white hover:bg-emerald-600/20 hover:border-emerald-500/30"
                                    onClick={() => setSelectedDigitalPayment('Paypal')}
                                >
                                    <Wallet className="h-6 w-6 text-blue-400" />
                                    <span className="text-sm font-medium">Paypal</span>
                                </Button>

                                <Button
                                    variant="outline"
                                    className="h-20 flex flex-col items-center justify-center gap-2 bg-slate-800/50 border-white/10 text-white hover:bg-emerald-600/20 hover:border-emerald-500/30"
                                    onClick={() => setSelectedDigitalPayment('Bousanm')}
                                >
                                    <Scan className="h-6 w-6 text-emerald-400" />
                                    <span className="text-sm font-medium">Bousanm</span>
                                </Button>

                                <Button
                                    variant="outline"
                                    className="h-20 flex flex-col items-center justify-center gap-2 bg-slate-800/50 border-white/10 text-white hover:bg-emerald-600/20 hover:border-emerald-500/30 col-span-2"
                                    onClick={() => setSelectedDigitalPayment('Zelle')}
                                >
                                    <CreditCard className="h-6 w-6 text-purple-400" />
                                    <span className="text-sm font-medium">Zelle</span>
                                </Button>
                            </div>
                        </>
                    ) : (
                        <QRCodeView
                            paymentMethod={selectedDigitalPayment}
                            amount={total}
                            onBack={() => setSelectedDigitalPayment(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Clear Cart Confirmation Dialog */}
            <AlertDialog open={clearCartDialogOpen} onOpenChange={setClearCartDialogOpen}>
                <AlertDialogContent className="bg-slate-900/95 backdrop-blur-xl border-white/20 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Are you sure you want to clear the cart?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-300">
                            This action will remove all items from your cart. This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-slate-800 text-white hover:bg-slate-700 border-white/10">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmClearCart}
                            className="bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                            OK
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Split Payment Dialog */}
            <Dialog open={splitDialogOpen} onOpenChange={setSplitDialogOpen}>

                <DialogContent className="bg-slate-900/95 backdrop-blur-xl border-white/20 text-white max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-white text-xl">Split Payment</DialogTitle>
                        <DialogDescription className="text-slate-300">
                            Divide the payment across multiple methods
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 mt-4">
                        {paymentRows.map((row, index) => (
                            <div key={row.id} className="flex items-center gap-2">
                                <span className="text-slate-400 text-sm w-20">Payment {index + 1}</span>

                                <Select
                                    value={row.method}
                                    onValueChange={(value) => {
                                        const newRows = [...paymentRows];
                                        newRows[index].method = value;
                                        setPaymentRows(newRows);
                                    }}
                                >
                                    <SelectTrigger className="w-40 bg-slate-800/50 border-white/10 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-white/20">
                                        <SelectItem value="cash" className="text-white hover:bg-slate-800">Cash</SelectItem>
                                        <SelectItem value="card" className="text-white hover:bg-slate-800">Card</SelectItem>
                                        <SelectItem value="moncash" className="text-white hover:bg-slate-800">Moncash</SelectItem>
                                        <SelectItem value="natcash" className="text-white hover:bg-slate-800">Natcash</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Input
                                    type="number"
                                    placeholder="Enter Amount"
                                    value={row.amount}
                                    onChange={(e) => {
                                        const newRows = [...paymentRows];
                                        newRows[index].amount = e.target.value;
                                        setPaymentRows(newRows);
                                    }}
                                    className="flex-1 bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500"
                                />

                                <Button
                                    className="bg-slate-800 text-white hover:bg-slate-700 px-6"
                                >
                                    Charge
                                </Button>

                                {paymentRows.length > 2 && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            setPaymentRows(paymentRows.filter(r => r.id !== row.id));
                                        }}
                                        className="text-slate-400 hover:text-red-400 hover:bg-red-400/10"
                                    >
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))}

                        <div className="flex justify-end">
                            <Button
                                onClick={() => {
                                    const newId = Math.max(...paymentRows.map(r => r.id)) + 1;
                                    setPaymentRows([...paymentRows, { id: newId, method: 'cash', amount: '' }]);
                                }}
                                disabled={paymentRows.length >= 5}
                                className="bg-slate-500/20 border border-slate-500 text-white hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add More {paymentRows.length >= 5 && '(Max 5)'}
                            </Button>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button
                            onClick={() => setSplitDialogOpen(false)}
                            className="bg-slate-500/20 border border-slate-500 text-white hover:bg-slate-500"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                toast.success("Sale completed successfully!");
                                setSplitDialogOpen(false);
                            }}
                            className="bg-slate-500/20 border border-slate-500 text-white hover:bg-emerald-500"
                        >
                            Complete Sale
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Add Customer Dialog */}
            <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
                <DialogContent className="bg-slate-900 border-white/10 text-white max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Ajoute yon kliyan</DialogTitle>
                        <DialogDescription className="text-slate-400 text-sm">
                            Antre enfòmasyon kliyan an anba la a.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-slate-300 text-sm">Siyati ak non <span className="text-rose-500">*</span></Label>
                            <div className="flex gap-2">
                                <Input
                                    value={customerFormData.lastName}
                                    onChange={(e) => setCustomerFormData({ ...customerFormData, lastName: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white focus:ring-emerald-500"
                                    placeholder="egzanp. Dupont (Siyati)"
                                />
                                <Input
                                    value={customerFormData.firstName}
                                    onChange={(e) => setCustomerFormData({ ...customerFormData, firstName: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white focus:ring-emerald-500"
                                    placeholder="egzanp. Jean (Non)"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-300 text-sm">Telefòn</Label>
                            <Input
                                value={customerFormData.phone}
                                onChange={(e) => setCustomerFormData({ ...customerFormData, phone: e.target.value })}
                                className="bg-white/5 border-white/10 text-white focus:ring-emerald-500"
                                placeholder="+509 1234 5678"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-300 text-sm">Imèl (Email)</Label>
                            <Input
                                type="email"
                                value={customerFormData.email}
                                onChange={(e) => setCustomerFormData({ ...customerFormData, email: e.target.value })}
                                className="bg-white/5 border-white/10 text-white focus:ring-emerald-500"
                                placeholder="jean.dupont@email.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-300 text-sm">Adrès</Label>
                            <Input
                                value={customerFormData.address}
                                onChange={(e) => setCustomerFormData({ ...customerFormData, address: e.target.value })}
                                className="bg-white/5 border-white/10 text-white focus:ring-emerald-500"
                                placeholder="Pétion-Ville, Haiti"
                            />
                        </div>
                    </div>

                    <DialogFooter className="bg-slate-900/50 -mx-6 -mb-6 p-4 border-t border-white/10">
                        <Button
                            variant="outline"
                            onClick={() => setIsCustomerDialogOpen(false)}
                            className="bg-transparent border-white/10 text-white hover:bg-white/5"
                        >
                            Anile
                        </Button>
                        <Button
                            onClick={handleSaveCustomer}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            Anrejistre
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Scan Customer Dialog */}
            <Dialog open={isScanCustomerDialogOpen} onOpenChange={setIsScanCustomerDialogOpen}>
                <DialogContent className="bg-slate-900 border-white/10 text-white max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Scan className="h-5 w-5 text-emerald-500" />
                            Skane Kat Kliyan an
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 text-sm">
                            Pase eskanè a sou kòd la oswa tape telefòn/imèl li.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleScanCustomerSubmit} className="py-4 flex flex-col gap-4">
                        <Input
                            autoFocus
                            value={scanCustomerQuery}
                            onChange={(e) => setScanCustomerQuery(e.target.value)}
                            placeholder="Tann eskanè a..."
                            className="bg-white/5 border-emerald-500/30 focus:border-emerald-500 text-white text-center text-lg h-12"
                        />
                        <Button
                            type="submit"
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            Chèche Kliyan an
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
export default CashierPOS;