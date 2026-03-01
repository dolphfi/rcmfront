import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
    Gift,
    Search,
    Star,
    ShieldCheck,
    ArrowUpCircle,
    ArrowDownCircle,
    RotateCw,
    TrendingUp,
    Users,
    History as HistoryIcon,
    Settings
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { useTranslation } from 'react-i18next';
import customerService from '../../context/api/customerService';
import { Customer } from '../../context/types/interface';
import { toast } from 'sonner';

const Loyalty: React.FC = () => {
    const { t } = useTranslation();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Action Dialog state
    const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
    const [actionType, setActionType] = useState<'award' | 'redeem'>('award');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [pointAmount, setPointAmount] = useState<number>(0);
    const [reason, setReason] = useState('');

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const data = await customerService.getAll();
            setCustomers(data);
        } catch (error) {
            toast.error(t('loyalty.msg_error_load'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenAction = (customer: Customer, type: 'award' | 'redeem') => {
        setSelectedCustomer(customer);
        setActionType(type);
        setPointAmount(0);
        setReason('');
        setIsActionDialogOpen(true);
    };

    const handleProcessAction = async () => {
        if (!selectedCustomer || pointAmount <= 0) {
            toast.error(t('common.invalid_amount') || 'Amount must be greater than 0');
            return;
        }

        try {
            const newPoints = actionType === 'award'
                ? Number(selectedCustomer.loyaltyPoints) + Number(pointAmount)
                : Math.max(0, Number(selectedCustomer.loyaltyPoints) - Number(pointAmount));

            await customerService.update(selectedCustomer.id, {
                loyaltyPoints: newPoints
            });

            toast.success(actionType === 'award' ? t('loyalty.msg_award_success') : t('loyalty.msg_redeem_success'));
            setIsActionDialogOpen(false);
            fetchData();
        } catch (error: any) {
            toast.error(t('loyalty.msg_error_save'));
        }
    };

    const filteredCustomers = customers.filter(customer =>
        `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm)
    ).sort((a, b) => b.loyaltyPoints - a.loyaltyPoints);

    const totalPoints = customers.reduce((acc, c) => acc + Number(c.loyaltyPoints || 0), 0);
    const topCustomer = filteredCustomers.length > 0 ? filteredCustomers[0] : null;

    return (
        <div className="p-6 space-y-6 bg-slate-950 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Gift className="h-6 w-6 text-orange-500" />
                        {t('loyalty.title')}
                    </h1>
                    <p className="text-slate-400 mt-1">{t('loyalty.description')}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                        <HistoryIcon className="mr-2 h-4 w-4" />
                        {t('loyalty.history')}
                    </Button>
                    <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                        <Settings className="mr-2 h-4 w-4" />
                        {t('loyalty.rules')}
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-slate-900 border-white/10 shadow-xl overflow-hidden group">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">{t('loyalty.total_points')}</p>
                                <h3 className="text-3xl font-bold text-white mt-1 group-hover:text-orange-500 transition-colors">
                                    {totalPoints.toLocaleString()}
                                </h3>
                                <div className="flex items-center gap-1 text-emerald-400 text-xs mt-2">
                                    <TrendingUp className="h-3 w-3" />
                                    <span>+12% this month</span>
                                </div>
                            </div>
                            <div className="h-12 w-12 bg-orange-500/10 rounded-xl flex items-center justify-center border border-orange-500/20">
                                <Star className="h-6 w-6 text-orange-500 fill-orange-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-white/10 shadow-xl overflow-hidden group">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">{t('loyalty.active_customers')}</p>
                                <h3 className="text-3xl font-bold text-white mt-1 group-hover:text-emerald-500 transition-colors">
                                    {customers.filter(c => c.isActive).length}
                                </h3>
                                <p className="text-xs text-slate-500 mt-2">Out of {customers.length} total clients</p>
                            </div>
                            <div className="h-12 w-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                                <Users className="h-6 w-6 text-emerald-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-white/10 shadow-xl overflow-hidden group">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">{t('loyalty.points_redeemed')}</p>
                                <h3 className="text-3xl font-bold text-white mt-1 group-hover:text-amber-500 transition-colors">
                                    450
                                </h3>
                                <p className="text-xs text-slate-500 mt-2">Points used for rewards today</p>
                            </div>
                            <div className="h-12 w-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                                <ShieldCheck className="h-6 w-6 text-amber-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Ranking / List */}
                <Card className="lg:col-span-2 bg-slate-900 border-white/10 shadow-xl">
                    <CardHeader className="border-b border-white/10 pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg text-white font-semibold">Ranking & Points</CardTitle>
                            <div className="relative w-full max-w-[250px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                <Input
                                    placeholder={t('clients.search_placeholder')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 h-9 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-white/10 hover:bg-transparent">
                                        <TableHead className="text-slate-400">{t('clients.lastName')}</TableHead>
                                        <TableHead className="text-slate-400">{t('clients.firstName')}</TableHead>
                                        <TableHead className="text-slate-400">{t('loyalty.total_points')}</TableHead>
                                        <TableHead className="text-right text-slate-400">{t('clients.action')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center">
                                                <RotateCw className="h-6 w-6 animate-spin mx-auto text-orange-500" />
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredCustomers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                                                {t('clients.no_clients_found')}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredCustomers.map((customer, index) => (
                                            <TableRow key={customer.id} className="border-white/5 hover:bg-white/5 group">
                                                <TableCell className="font-medium text-white">
                                                    <div className="flex items-center gap-3">
                                                        {index === 0 && <span className="text-amber-400">👑</span>}
                                                        {customer.lastName}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-slate-300">{customer.firstName}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20 transition-colors rounded-md">
                                                        <Star className="h-3 w-3 mr-1 fill-orange-400" />
                                                        {customer.loyaltyPoints}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 text-emerald-400 hover:bg-emerald-500/10 rounded-md"
                                                            onClick={() => handleOpenAction(customer, 'award')}
                                                        >
                                                            <ArrowUpCircle className="h-4 w-4 mr-1" />
                                                            {t('loyalty.award_points')}
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 text-amber-400 hover:bg-amber-500/10 rounded-md"
                                                            onClick={() => handleOpenAction(customer, 'redeem')}
                                                            disabled={customer.loyaltyPoints <= 0}
                                                        >
                                                            <ArrowDownCircle className="h-4 w-4 mr-1" />
                                                            {t('loyalty.redeem_points')}
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Top Customer Card */}
                    {topCustomer && topCustomer.loyaltyPoints > 0 && (
                        <Card className="bg-gradient-to-br from-orange-500/20 to-amber-500/10 border-orange-500/20 shadow-lg">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold text-orange-400 uppercase tracking-widest flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4" />
                                    Top Loyal Client
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-2">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-full bg-orange-500 flex items-center justify-center text-white text-xl font-bold border-4 border-slate-950">
                                        {topCustomer.firstName.charAt(0)}{topCustomer.lastName.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-lg">{topCustomer.firstName} {topCustomer.lastName}</h4>
                                        <div className="flex items-center gap-1 text-orange-400 font-bold">
                                            <Star className="h-4 w-4 fill-orange-400" />
                                            {topCustomer.loyaltyPoints} Points
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Rules Summary */}
                    <Card className="bg-slate-900 border-white/10 shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-lg text-white font-semibold flex items-center gap-2">
                                <Settings className="h-5 w-5 text-slate-400" />
                                {t('loyalty.rules')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-3 bg-white/5 rounded-lg border border-white/5 space-y-1">
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-tighter">Default Earn Rule</p>
                                <div className="flex justify-between items-center text-white font-medium">
                                    <span>{t('loyalty.points_per_dollar')}</span>
                                    <span className="text-emerald-400 font-bold text-right">1 pt / $1</span>
                                </div>
                            </div>
                            <div className="p-3 bg-white/5 rounded-lg border border-white/5 space-y-1">
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-tighter">Redemption Rule</p>
                                <div className="flex justify-between items-center text-white font-medium">
                                    <span>{t('loyalty.min_redemption')}</span>
                                    <span className="text-amber-400 font-bold text-right">100 pts</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Action Dialog */}
            <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
                <DialogContent className="bg-slate-900 border-white/10 text-white max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            {actionType === 'award' ? <ArrowUpCircle className="h-6 w-6 text-emerald-500" /> : <ArrowDownCircle className="h-6 w-6 text-amber-500" />}
                            {actionType === 'award' ? t('loyalty.award_points') : t('loyalty.redeem_points')}
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            {selectedCustomer?.firstName} {selectedCustomer?.lastName}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-slate-300">{t('loyalty.amount')}</Label>
                            <Input
                                type="number"
                                value={pointAmount}
                                onChange={(e) => setPointAmount(Number(e.target.value))}
                                className="bg-white/5 border-white/10 text-white focus:ring-orange-500"
                                placeholder="Enter points amount..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-300">{t('loyalty.reason')}</Label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-white text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none min-h-[80px]"
                                placeholder="e.g. Purchase bonus, Refund, Correction..."
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsActionDialogOpen(false)}
                            className="bg-transparent border-white/10 text-white hover:bg-white/5"
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            onClick={handleProcessAction}
                            className={actionType === 'award' ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-amber-600 hover:bg-amber-700 text-white"}
                        >
                            {actionType === 'award' ? t('loyalty.award_points') : t('loyalty.redeem_points')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Loyalty;