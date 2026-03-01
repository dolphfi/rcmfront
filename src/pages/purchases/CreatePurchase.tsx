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

const CreatePurchase: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
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
                <Button variant="ghost" size="icon" onClick={() => navigate('/purchases/list')} className="text-slate-400 hover:text-white hover:bg-white/10">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                        <Truck className="h-8 w-8 text-orange-500" />
                        Nouvo Acha (Restockage)
                    </h2>
                    <p className="text-slate-400">Ajoute pwodwi nan stock ou</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Product Selection */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="bg-slate-900/50 border-white/10 backdrop-blur-xl h-full">
                        <CardHeader>
                            <CardTitle className="text-white">Chache Pwodwi</CardTitle>
                            <div className="relative pt-2">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 mt-1" />
                                <Input
                                    placeholder="SKU, Non pwodwi..."
                                    className="pl-9 bg-slate-800/50 border-white/10 text-white"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="max-h-[500px] overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-white/10">
                            {filteredProducts.map(product => (
                                <div
                                    key={product.id}
                                    onClick={() => addToCart(product)}
                                    className="p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 cursor-pointer transition-all flex justify-between items-center group"
                                >
                                    <div>
                                        <p className="text-white font-medium group-hover:text-orange-400">{product.name}</p>
                                        <p className="text-xs text-slate-500">{product.sku}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-bold">{parseFloat(product.costPrice).toFixed(2)} HTG</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Purchase Details */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-slate-900/50 border-white/10 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5 text-orange-400" />
                                Atik pou Resevwa
                            </CardTitle>
                            <CardDescription className="text-slate-400">Pwodwi sa yo pral ajoute nan stock POS ou chwazi a</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* POS & Supplier Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-400 flex items-center gap-2">
                                        <Store className="h-4 w-4" /> Destinasyon (Point of Sale)
                                    </label>
                                    <Select value={selectedPosId} onValueChange={setSelectedPosId}>
                                        <SelectTrigger className="bg-slate-800 border-white/10 text-white">
                                            <SelectValue placeholder="Chwazi yon POS" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-white/10 text-white">
                                            {pointsOfSale.map(pos => (
                                                <SelectItem key={pos.id} value={pos.id}>{pos.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-400 flex items-center gap-2">
                                        <Truck className="h-4 w-4" /> Non Founisè (Optionnel)
                                    </label>
                                    <Input
                                        className="bg-slate-800 border-white/10 text-white"
                                        placeholder="Egz: SOGEBANK, GB Group..."
                                        value={supplierName}
                                        onChange={(e) => setSupplierName(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Items Table */}
                            <div className="rounded-md border border-white/10 overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-slate-800/50">
                                        <TableRow className="border-white/10">
                                            <TableHead className="text-slate-300">Pwodwi</TableHead>
                                            <TableHead className="text-slate-300 w-32">Prix Coût</TableHead>
                                            <TableHead className="text-slate-300 w-32">Kantite</TableHead>
                                            <TableHead className="text-slate-300">Total</TableHead>
                                            <TableHead className="text-right text-slate-300 w-16"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {cart.length === 0 ? (
                                            <TableRow className="border-white/10 hover:bg-transparent">
                                                <TableCell colSpan={5} className="h-32 text-center text-slate-500 italic">
                                                    Okenn pwodwi poko ajoute. Seleksyone pwodwi nan lis la.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            cart.map((item, index) => (
                                                <TableRow key={index} className="border-white/10 hover:bg-white/5 transition-colors">
                                                    <TableCell className="text-white font-medium">{item.name}</TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            className="h-8 bg-slate-800 border-white/10 text-white w-24"
                                                            value={item.costPrice}
                                                            onChange={(e) => updateItem(index, 'costPrice', parseFloat(e.target.value) || 0)}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            className="h-8 bg-slate-800 border-white/10 text-white w-24"
                                                            value={item.qty}
                                                            onChange={(e) => updateItem(index, 'qty', parseInt(e.target.value) || 0)}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-emerald-400 font-bold">
                                                        {(item.costPrice * item.qty).toFixed(2)}
                                                    </TableCell>
                                                    <TableCell className="text-right text-slate-300">
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
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4 border-t border-white/10">
                                <div className="text-center md:text-left">
                                    <p className="text-slate-500 text-sm uppercase tracking-widest">Total Acha</p>
                                    <p className="text-4xl font-black text-white">{total.toFixed(2)} HTG</p>
                                </div>
                                <Button
                                    className="w-full md:w-64 h-14 text-lg bg-orange-600 hover:bg-orange-700 text-white font-bold gap-2"
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
