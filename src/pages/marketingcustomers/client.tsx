import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    RotateCw,
    User,
    Mail,
    Phone,
    MapPin,
    Star,
    ShieldCheck
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import { useTranslation } from 'react-i18next';
import customerService from '../../context/api/customerService';
import { Customer } from '../../context/types/interface';
import { toast } from 'sonner';

const Client: React.FC = () => {
    const { t } = useTranslation();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        isActive: true
    });

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const data = await customerService.getAll();
            setCustomers(data);
        } catch (error) {
            toast.error(t('clients.msg_error_load'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenDialog = (customer?: Customer) => {
        if (customer) {
            setEditingCustomer(customer);
            setFormData({
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email || '',
                phone: customer.phone || '',
                address: customer.address || '',
                isActive: customer.isActive
            });
        } else {
            setEditingCustomer(null);
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                address: '',
                isActive: true
            });
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.firstName || !formData.lastName) {
            toast.error(t('common.fill_required_fields'));
            return;
        }

        try {
            if (editingCustomer) {
                await customerService.update(editingCustomer.id, formData);
                toast.success(t('clients.msg_update_success'));
            } else {
                await customerService.create(formData);
                toast.success(t('clients.msg_create_success'));
            }
            setIsDialogOpen(false);
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('clients.msg_error_save'));
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await customerService.delete(id);
            toast.success(t('clients.msg_delete_success'));
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('common.error_deleting'));
        }
    };

    const filteredCustomers = customers.filter(customer => {
        const matchesSearch =
            `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.phone?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'active' && customer.isActive) ||
            (statusFilter === 'inactive' && !customer.isActive);

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="p-6 space-y-6 bg-slate-950 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <User className="h-6 w-6 text-orange-500" />
                        {t('clients.title')}
                    </h1>
                    <p className="text-slate-400 mt-1">{t('clients.description')}</p>
                </div>
                <Button
                    onClick={() => handleOpenDialog()}
                    className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    {t('clients.add_client')}
                </Button>
            </div>

            {/* Filters */}
            <Card className="bg-slate-900 border-white/10 shadow-xl backdrop-blur-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <Input
                                placeholder={t('clients.search_placeholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-[180px] bg-white/5 border-white/10 text-white">
                                <SelectValue placeholder={t('common.status')} />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 text-white">
                                <SelectItem value="all">{t('common.all')}</SelectItem>
                                <SelectItem value="active">{t('pos.active')}</SelectItem>
                                <SelectItem value="inactive">{t('pos.inactive')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            onClick={fetchData}
                            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                        >
                            <RotateCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Client List */}
            <Card className="bg-slate-900 border-white/10 shadow-xl overflow-hidden">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/10 hover:bg-transparent">
                            <TableHead className="text-slate-300 font-semibold">{t('clients.lastName')}</TableHead>
                            <TableHead className="text-slate-300 font-semibold">{t('clients.firstName')}</TableHead>
                            <TableHead className="text-slate-300 font-semibold">{t('clients.contact') || 'Contact'}</TableHead>
                            <TableHead className="text-slate-300 font-semibold">{t('clients.loyalty_points')}</TableHead>
                            <TableHead className="text-slate-300 font-semibold">{t('clients.status')}</TableHead>
                            <TableHead className="text-right text-slate-300 font-semibold">{t('clients.action')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <RotateCw className="h-6 w-6 animate-spin mx-auto text-orange-500" />
                                </TableCell>
                            </TableRow>
                        ) : filteredCustomers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                    {t('clients.no_clients_found')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCustomers.map((customer) => (
                                <TableRow key={customer.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                                    <TableCell className="font-medium text-white">{customer.lastName}</TableCell>
                                    <TableCell className="text-slate-300">{customer.firstName}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            {customer.email && (
                                                <span className="flex items-center gap-1.5 text-xs text-slate-400">
                                                    <Mail className="h-3 w-3 text-orange-500/70" />
                                                    {customer.email}
                                                </span>
                                            )}
                                            {customer.phone && (
                                                <span className="flex items-center gap-1.5 text-xs text-slate-400">
                                                    <Phone className="h-3 w-3 text-emerald-500/70" />
                                                    {customer.phone}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
                                                <Star className="h-3 w-3 text-orange-400 fill-orange-400" />
                                                <span className="text-xs font-bold text-orange-400">{customer.loyaltyPoints}</span>
                                            </div>
                                            {customer.bonusPoints > 0 && (
                                                <div className="flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                                    <ShieldCheck className="h-3 w-3 text-emerald-400" />
                                                    <span className="text-xs font-bold text-emerald-400">+{customer.bonusPoints}</span>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={customer.isActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 rounded-md" : "bg-slate-500/10 text-slate-400 border-slate-500/20 rounded-md"}>
                                            {customer.isActive ? t('pos.active') : t('pos.inactive')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleOpenDialog(customer)}
                                                className="h-8 w-8 text-slate-400 hover:text-orange-400 hover:bg-orange-500/10"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="bg-slate-900 border-white/10 text-white">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>{t('clients.delete_confirm_title')}</AlertDialogTitle>
                                                        <AlertDialogDescription className="text-slate-400">
                                                            {t('clients.delete_confirm_desc', { name: `${customer.firstName} ${customer.lastName}` })}
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel className="bg-slate-800 border-white/10 text-white hover:bg-slate-700">{t('common.cancel')}</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(customer.id)}
                                                            className="bg-rose-600 hover:bg-rose-700 text-white"
                                                        >
                                                            {t('common.delete')}
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">
                            {editingCustomer ? t('clients.edit_client') : t('clients.add_client')}
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 text-sm">
                            {editingCustomer ? 'Modify customer details below.' : 'Add a new customer to your database.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-slate-300 text-sm">{t('clients.firstName')} <span className="text-rose-500">*</span></Label>
                                <Input
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white focus:ring-orange-500"
                                    placeholder="e.g. Jean"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300 text-sm">{t('clients.lastName')} <span className="text-rose-500">*</span></Label>
                                <Input
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white focus:ring-orange-500"
                                    placeholder="e.g. Dupont"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300 text-sm">{t('clients.email')}</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="pl-10 bg-white/5 border-white/10 text-white focus:ring-orange-500"
                                        placeholder="jean.dupont@email.com"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-slate-300 text-sm">{t('clients.phone')}</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                    <Input
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="pl-10 bg-white/5 border-white/10 text-white focus:ring-orange-500"
                                        placeholder="+509 1234 5678"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300 text-sm">{t('clients.address')}</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                    <textarea
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full pl-10 pt-2 bg-white/5 border border-white/10 rounded-md text-white text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none min-h-[80px]"
                                        placeholder="Pétion-Ville, Haiti"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-medium text-white">{t('clients.status')}</Label>
                                    <p className="text-xs text-slate-500">{formData.isActive ? 'Active customer' : 'Inactive customer'}</p>
                                </div>
                                <Switch
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                                    className="data-[state=checked]:bg-emerald-500"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="bg-slate-900/50 -mx-6 -mb-6 p-4 border-t border-white/10">
                        <Button
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                            className="bg-transparent border-white/10 text-white hover:bg-white/5"
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            onClick={handleSave}
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                        >
                            {t('common.save')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Client;