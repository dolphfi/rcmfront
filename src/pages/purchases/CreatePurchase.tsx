import React, { useState, useEffect } from 'react';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "components/ui/select";
import {
    Search,
    Trash2,
    Save,
    ArrowLeft,
    Truck,
    ShoppingCart,
    Store
} from "lucide-react";
import { toast } from 'sonner';
import purchaseService, { CreatePurchaseData, CreatePurchaseItemData } from 'context/api/purchaseService';
import productService from 'context/api/productservice';
import posService from 'context/api/posservice';
import { useSettings } from 'context/SettingsContext';

const CreatePurchase: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const { currency } = useSettings();
    const [products, setProducts] = useState<any[]>([]);
    const [pointsOfSale, setPointsOfSale] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [cart, setCart] = useState<CreatePurchaseItemData[]>([]);
    const [supplierName, setSupplierName] = useState("");
    const [selectedPosId, setSelectedPosId] = useState("");

    useEffect(() => {
        fetchProducts();
        fetchPOS();
    }, []);

    const fetchProducts = async () => {
        try {
            const data = await productService.getAll();
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchPOS = async () => {
        try {
            const response = await posService.getAll(1, 100);
            const data = response.data || [];
            setPointsOfSale(data);
            if (data.length > 0) {
                setSelectedPosId(data[0].id);
            }
        } catch (error) {
            console.error('Error fetching POS:', error);
        }
    };

    const addToCart = (product: any) => {
        const existingItem = cart.find(item => item.productId === product.id);
        if (existingItem) {
            setCart(cart.map(item =>
                item.productId === product.id
                    ? { ...item, qty: item.qty + 1 }
                    : item
            ));
        } else {
            setCart([...cart, {
                productId: product.id,
                name: product.name,
                costPrice: parseFloat(product.costPrice) || 0,
                qty: 1
            }]);
        }
    };

    const removeFromCart = (index: number) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
    };

    const updateItem = (index: number, field: keyof CreatePurchaseItemData, value: number) => {
        const newCart = [...cart];
        (newCart[index] as any)[field] = value;
        setCart(newCart);
    };

    const total = cart.reduce((acc, item) => acc + (item.costPrice * item.qty), 0);

    const handleSave = async () => {
        if (!selectedPosId) {
            toast.error("Veuillez sélectionner un Point de Vente");
            return;
        }
        if (cart.length === 0) {
            toast.error("Veuillez ajouter au moins un produit");
            return;
        }

        setIsLoading(true);
        const purchaseData: CreatePurchaseData = {
            posId: selectedPosId,
            supplierName,
            items: cart
        };

        try {
            await purchaseService.create(purchaseData);
            toast.success("Acha a sove ak siksè!");
            navigate('/purchases/list');
        } catch (error: any) {
            console.error('Error creating purchase:', error);
            toast.error(error.response?.data?.message || "Erreur lors de la création");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/purchases/list')} className="text-muted-foreground hover:text-primary hover:bg-primary/10">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Truck className="h-8 w-8 text-primary" />
                        Nouvo Acha (Restockage)
                    </h2>
                    <p className="text-muted-foreground">Ajoute pwodwi nan stock ou</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Product Selection */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="bg-background border-border h-full">
                        <CardHeader>
                            <CardTitle className="text-foreground">Chache Pwodwi</CardTitle>
                            <div className="relative pt-2">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground mt-1" />
                                <Input
                                    placeholder="SKU, Non pwodwi..."
                                    className="pl-9 bg-muted border-border text-foreground"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="max-h-[500px] overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-border">
                            {filteredProducts.map(product => (
                                <div
                                    key={product.id}
                                    onClick={() => addToCart(product)}
                                    className="p-3 bg-muted border border-border rounded-lg hover:bg-primary/10 cursor-pointer transition-all flex justify-between items-center group"
                                >
                                    <div>
                                        <p className="text-foreground font-medium group-hover:text-primary">{product.name}</p>
                                        <p className="text-xs text-muted-foreground">{product.sku}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-foreground font-bold">{parseFloat(product.costPrice).toFixed(2)} {currency}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Purchase Details */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-background border-border">
                        <CardHeader>
                            <CardTitle className="text-foreground flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5 text-primary" />
                                Atik pou Resevwa
                            </CardTitle>
                            <CardDescription className="text-muted-foreground">Pwodwi sa yo pral ajoute nan stock POS ou chwazi a</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* POS & Supplier Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted border border-border rounded-xl">
                                <div className="space-y-2">
                                    <label className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Store className="h-4 w-4" /> Destinasyon (Point of Sale)
                                    </label>
                                    <Select value={selectedPosId} onValueChange={setSelectedPosId}>
                                        <SelectTrigger className="bg-background border-border text-foreground">
                                            <SelectValue placeholder="Chwazi yon POS" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-background border-border text-foreground">
                                            {pointsOfSale.map(pos => (
                                                <SelectItem key={pos.id} value={pos.id}>{pos.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Truck className="h-4 w-4" /> Non Founisè (Optionnel)
                                    </label>
                                    <Input
                                        className="bg-background border-border text-foreground"
                                        placeholder="Egz: SOGEBANK, GB Group..."
                                        value={supplierName}
                                        onChange={(e) => setSupplierName(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Items Table */}
                            <div className="rounded-md border border-border overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-muted">
                                        <TableRow className="border-border">
                                            <TableHead className="text-foreground">Pwodwi</TableHead>
                                            <TableHead className="text-foreground w-32">Prix Coût</TableHead>
                                            <TableHead className="text-foreground w-32">Kantite</TableHead>
                                            <TableHead className="text-foreground">Total</TableHead>
                                            <TableHead className="text-right text-foreground w-16"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {cart.length === 0 ? (
                                            <TableRow className="border-border hover:bg-transparent">
                                                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">
                                                    Okenn pwodwi poko ajoute. Seleksyone pwodwi nan lis la.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            cart.map((item, index) => (
                                                <TableRow key={index} className="border-border hover:bg-primary/10 transition-colors">
                                                    <TableCell className="text-foreground font-medium">{item.name}</TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            className="h-8 bg-background border-border text-foreground w-24"
                                                            value={item.costPrice}
                                                            onChange={(e) => updateItem(index, 'costPrice', parseFloat(e.target.value) || 0)}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            className="h-8 bg-background border-border text-foreground w-24"
                                                            value={item.qty}
                                                            onChange={(e) => updateItem(index, 'qty', parseInt(e.target.value) || 0)}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-emerald-400 font-bold">
                                                        {(item.costPrice * item.qty).toFixed(2)}
                                                    </TableCell>
                                                    <TableCell className="text-right text-foreground">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-rose-500 hover:bg-rose-500/10"
                                                            onClick={() => removeFromCart(index)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Summary & Save */}
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4 border-t border-border">
                                <div className="text-center md:text-left">
                                    <p className="text-muted-foreground text-sm uppercase tracking-widest">Total Acha</p>
                                    <p className="text-4xl font-black text-foreground">{total.toFixed(2)} {currency}</p>
                                </div>
                                <Button
                                    className="w-full md:w-64 h-14 text-lg bg-primary hover:bg-primary/90 text-foreground font-bold gap-2"
                                    onClick={handleSave}
                                    disabled={isLoading || cart.length === 0}
                                >
                                    {isLoading ? "Ap sove..." : "Konfime Resepsyon Stock"}
                                    {!isLoading && <Save className="h-5 w-5" />}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CreatePurchase;
