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

        // Sanitize optional fields: convert empty strings to null to avoid unique constraint issues in DB
        const payload = {
            ...formData,
            email: formData.email.trim() || null,
            phone: formData.phone.trim() || null,
            address: formData.address.trim() || null
        };

        try {
            if (editingCustomer) {
                await customerService.update(editingCustomer.id, payload as any);
                toast.success(t('clients.msg_update_success'));
            } else {
                await customerService.create(payload as any);
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
        <div className="p-6 space-y-6 bg-background min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
                        <User className="h-6 w-6 text-primary" />
                        {t('clients.title')}
                    </h1>
                    <p className="text-muted-foreground mt-1">{t('clients.description')}</p>
                </div>
                <Button
                    onClick={() => handleOpenDialog()}
                    className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-orange-500/20"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    {t('clients.add_client')}
                </Button>
            </div>

            {/* Filters */}
            <Card className="bg-background border-border shadow-xl">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={t('clients.search_placeholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 bg-muted border-border text-foreground placeholder:text-muted-foreground focus:ring-ring focus:border-primary"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-[180px] bg-muted border-border text-foreground">
                                <SelectValue placeholder={t('common.status')} />
                            </SelectTrigger>
                            <SelectContent className="bg-background border-border text-foreground">
                                <SelectItem value="all">{t('common.all')}</SelectItem>
                                <SelectItem value="active">{t('pos.active')}</SelectItem>
                                <SelectItem value="inactive">{t('pos.inactive')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            onClick={fetchData}
                            className="bg-muted border-border text-foreground hover:bg-muted"
                        >
                            <RotateCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Client List */}
            <Card className="bg-background border-border shadow-xl overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted">
                        <TableRow className="border-border hover:bg-transparent">
                            <TableHead className="text-foreground font-semibold">{t('clients.lastName')}</TableHead>
                            <TableHead className="text-foreground font-semibold">{t('clients.firstName')}</TableHead>
                            <TableHead className="text-foreground font-semibold">{t('clients.contact') || 'Contact'}</TableHead>
                            <TableHead className="text-foreground font-semibold">{t('clients.loyalty_points')}</TableHead>
                            <TableHead className="text-foreground font-semibold">{t('clients.status')}</TableHead>
                            <TableHead className="text-right text-foreground font-semibold">{t('clients.action')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <RotateCw className="h-6 w-6 animate-spin mx-auto text-primary" />
                                </TableCell>
                            </TableRow>
                        ) : filteredCustomers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    {t('clients.no_clients_found')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCustomers.map((customer) => (
                                <TableRow key={customer.id} className="border-border hover:bg-muted transition-colors group">
                                    <TableCell className="font-medium text-foreground">{customer.lastName}</TableCell>
                                    <TableCell className="text-foreground">{customer.firstName}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            {customer.email && (
                                                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <Mail className="h-3 w-3 text-primary/70" />
                                                    {customer.email}
                                                </span>
                                            )}
                                            {customer.phone && (
                                                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <Phone className="h-3 w-3 text-emerald-500/70" />
                                                    {customer.phone}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                                                <Star className="h-3 w-3 text-primary fill-orange-400" />
                                                <span className="text-xs font-bold text-primary">{customer.loyaltyPoints}</span>
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
                                        <Badge variant="outline" className={customer.isActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 rounded-md" : "bg-slate-500/10 text-muted-foreground border-slate-500/20 rounded-md"}>
                                            {customer.isActive ? t('pos.active') : t('pos.inactive')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleOpenDialog(customer)}
                                                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="bg-background border-border text-foreground">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>{t('clients.delete_confirm_title')}</AlertDialogTitle>
                                                        <AlertDialogDescription className="text-muted-foreground">
                                                            {t('clients.delete_confirm_desc', { name: `${customer.firstName} ${customer.lastName}` })}
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel className="bg-muted border-border text-white hover:bg-primary/10">{t('common.cancel')}</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(customer.id)}
                                                            className="bg-rose-600 hover:bg-rose-700 text-foreground"
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
                <DialogContent className="bg-background border-border text-foreground max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">
                            {editingCustomer ? t('clients.edit_client') : t('clients.add_client')}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground text-sm">
                            {editingCustomer ? 'Modify customer details below.' : 'Add a new customer to your database.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-foreground text-sm">{t('clients.firstName')} <span className="text-rose-500">*</span></Label>
                                <Input
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="bg-muted border-border text-foreground focus:ring-ring"
                                    placeholder="e.g. Jean"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-foreground text-sm">{t('clients.lastName')} <span className="text-rose-500">*</span></Label>
                                <Input
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="bg-muted border-border text-foreground focus:ring-ring"
                                    placeholder="e.g. Dupont"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-foreground text-sm">{t('clients.email')}</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="pl-10 bg-muted border-border text-foreground focus:ring-ring"
                                        placeholder="jean.dupont@email.com"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-foreground text-sm">{t('clients.phone')}</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="pl-10 bg-muted border-border text-foreground focus:ring-ring"
                                        placeholder="+509 1234 5678"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-foreground text-sm">{t('clients.address')}</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <textarea
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full pl-10 pt-2 bg-muted border border-border rounded-md text-foreground text-sm focus:ring-2 focus:ring-ring focus:outline-none min-h-[80px]"
                                        placeholder="Pétion-Ville, Haiti"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-medium text-foreground">{t('clients.status')}</Label>
                                    <p className="text-xs text-muted-foreground">{formData.isActive ? 'Active customer' : 'Inactive customer'}</p>
                                </div>
                                <Switch
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                                    className="data-[state=checked]:bg-emerald-500"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="bg-background -mx-6 -mb-6 p-4 border-t border-border">
                        <Button
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                            className="bg-transparent border-border text-foreground hover:bg-muted"
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            onClick={handleSave}
                            className="bg-primary hover:bg-primary/90 text-foreground"
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