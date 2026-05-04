import React, { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "components/ui/table";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "components/ui/card";
import { Badge } from "components/ui/badge";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Search, Eye, Filter, Plus, Truck } from "lucide-react";
import purchaseService from 'context/api/purchaseService';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { useSettings } from 'context/SettingsContext';

const PurchaseList: React.FC = () => {
    const [purchases, setPurchases] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { currency } = useSettings();
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchPurchases();
    }, []);

    const fetchPurchases = async () => {
        setIsLoading(true);
        try {
            const data = await purchaseService.findAll();
            setPurchases(data);
        } catch (error) {
            console.error('Error fetching purchases:', error);
            toast.error("Impossible de charger les achats");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredPurchases = purchases.filter(p =>
        p.purchaseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.supplierName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'RECEIVED': return 'bg-emerald-500/20 text-emerald-500';
            case 'PENDING': return 'bg-amber-500/20 text-amber-500';
            case 'CANCELLED': return 'bg-rose-500/20 text-rose-500';
            default: return 'bg-slate-500/20 text-muted-foreground';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Truck className="h-8 w-8 text-primary" />
                        Jesyon Acha (Restockage)
                    </h2>
                    <p className="text-muted-foreground">
                        Swiv ak jere tout ekipman ou resevwa nan stock ou
                    </p>
                </div>
                <Button className="bg-primary hover:bg-primary/90 text-foreground" asChild>
                    <Link to="/purchases/new">
                        <Plus className="mr-2 h-4 w-4" /> Nouvo Acha
                    </Link>
                </Button>
            </div>

            <Card className="bg-background border-border">
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <CardTitle className="text-foreground text-lg font-medium">Lavant Resan</CardTitle>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Chache acha #, founisè..."
                                    className="pl-9 bg-muted border-border text-foreground"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" size="icon" className="bg-background border-border text-foreground">
                                <Filter className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-border overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted">
                                <TableRow className="border-border hover:bg-transparent">
                                    <TableHead className="text-foreground">Acha #</TableHead>
                                    <TableHead className="text-foreground">Dat</TableHead>
                                    <TableHead className="text-foreground">Founisè</TableHead>
                                    <TableHead className="text-foreground">Point of Sale</TableHead>
                                    <TableHead className="text-foreground">Status</TableHead>
                                    <TableHead className="text-right text-foreground">Total</TableHead>
                                    <TableHead className="text-right text-foreground">Aksyon</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow className="border-border">
                                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                            Ap chaje...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredPurchases.length === 0 ? (
                                    <TableRow className="border-border">
                                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                            Okenn acha pa jwenn.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredPurchases.map((p) => (
                                        <TableRow key={p.id} className="border-border hover:bg-primary/10 transition-colors">
                                            <TableCell className="font-medium text-foreground">
                                                {p.purchaseNumber}
                                            </TableCell>
                                            <TableCell className="text-foreground">
                                                {format(new Date(p.createdAt), 'dd/MM/yyyy')}
                                            </TableCell>
                                            <TableCell className="text-foreground">
                                                {p.supplierName || 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-foreground">
                                                {p.pos?.name || 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`${getStatusVariant(p.status)} border-0`}>
                                                    {p.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right text-emerald-400 font-bold">
                                                {Number(p.total).toFixed(2)} {currency}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-primary/10">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PurchaseList;
