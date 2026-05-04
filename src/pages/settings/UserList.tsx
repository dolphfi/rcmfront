import React, { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "components/ui/table";
import {
    Card,
    CardContent,
    CardHeader,
} from "components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "components/ui/dialog";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Badge } from "components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "components/ui/select";
import { MoreHorizontal, UserPlus, Search, UserCheck, UserX, Unlock, Trash2, Edit } from "lucide-react";
import userService from '../../context/api/userService';
import rolesService from '../../context/api/rolesService';
import posService from '../../context/api/posservice';
import { User, Role } from '../../context/types/auth';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr, enUS, ht } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

const UserList: React.FC = () => {
    const { t, i18n } = useTranslation();

    const getDateLocale = () => {
        switch (i18n.language) {
            case 'fr': return fr;
            case 'ht': return ht; // Fallback to fr or define ht if available
            default: return enUS;
        }
    };

    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [pointsOfSale, setPointsOfSale] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editRole, setEditRole] = useState('');
    const [editPOS, setEditPOS] = useState('');
    const [editFirstName, setEditFirstName] = useState('');
    const [editLastName, setEditLastName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // States for "Add User" Modal
    const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newUserState, setNewUserState] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        roleId: '',
        posId: 'none'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersData, rolesData, posResponse] = await Promise.all([
                userService.getAllUsers(1, 100),
                rolesService.getRoles(),
                posService.getAll(1, 100)
            ]);
            setUsers(usersData.data);
            setRoles(rolesData);
            setPointsOfSale(posResponse.data || []);
        } catch (error) {
            toast.error('Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (user: User) => {
        setSelectedUser(user);
        setEditFirstName(user.firstName);
        setEditLastName(user.lastName);
        setEditPhone(user.phone || '');
        setEditRole(user.role.id);
        setEditPOS(user.posId || 'none');
        setIsEditDialogOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!selectedUser) return;
        try {
            setIsSaving(true);
            await userService.updateUser(selectedUser.id, {
                firstName: editFirstName,
                lastName: editLastName,
                phone: editPhone,
                roleId: editRole,
                posId: editPOS === 'none' ? undefined : editPOS
            });
            toast.success(t('users.success_update'));
            setIsEditDialogOpen(false);
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('users.err_update'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreateUser = async () => {
        try {
            setIsCreating(true);
            await userService.createUser({
                firstName: newUserState.firstName,
                lastName: newUserState.lastName,
                email: newUserState.email,
                phone: newUserState.phone,
                roleId: newUserState.roleId,
                posId: newUserState.posId === 'none' ? undefined : newUserState.posId
            });
            toast.success(t('users.success_create'));
            setIsAddUserDialogOpen(false);

            // Re-initialize state
            setNewUserState({
                firstName: '', lastName: '', email: '', phone: '',
                roleId: '', posId: 'none'
            });
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('users.err_create'));
        } finally {
            setIsCreating(false);
        }
    };

    const handleToggleStatus = async (user: User) => {
        try {
            await userService.updateUser(user.id, { isActive: !user.isActive });
            toast.success(`Itilizatè a ${user.isActive ? 'dezaktive' : 'aktive'} avèk siksè`);
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erreur lors du changement de statut');
        }
    };

    const handleUnlock = async (user: User) => {
        try {
            await userService.unlockUser(user.id);
            toast.success('Kont la debloke avèk siksè');
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erreur lors du déblocage');
        }
    };

    const filteredUsers = users.filter(user =>
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">{t('users.title')}</h1>
                    <p className="text-muted-foreground">{t('users.description')}</p>
                </div>
                <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                    onClick={() => setIsAddUserDialogOpen(true)}
                >
                    <UserPlus className="h-4 w-4" />
                    {t('users.add_user')}
                </Button>
            </div>

            <Card className="bg-background border-border">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={t('users.search_placeholder')}
                                className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader className="hover:bg-transparent">
                            <TableRow className="border-border">
                                <TableHead className="text-muted-foreground">{t('users.table_user')}</TableHead>
                                <TableHead className="text-muted-foreground">{t('users.table_role')}</TableHead>
                                <TableHead className="text-muted-foreground">{t('users.table_pos')}</TableHead>
                                <TableHead className="text-muted-foreground">{t('users.table_status')}</TableHead>
                                <TableHead className="text-muted-foreground">{t('users.table_last_login')}</TableHead>
                                <TableHead className="text-right text-muted-foreground">{t('users.table_actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                        {t('users.loading')}
                                    </TableCell>
                                </TableRow>
                            ) : filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                        {t('users.no_users')}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUsers.map((user) => (
                                    <TableRow key={user.id} className="border-border hover:bg-primary/5 transition-colors">
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-foreground font-medium">{user.firstName} {user.lastName}</span>
                                                <span className="text-xs text-muted-foreground">{user.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="border-border text-blue-400 bg-blue-400/10 rounded-md">
                                                {user.role.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-foreground">
                                            {pointsOfSale.find(pos => pos.id === user.posId)?.name || t('users.all_systems')}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={user.isActive ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 rounded-md" : "bg-red-500/10 text-red-500 border-red-500/20 rounded-md"}>
                                                {user.isActive ? t('users.active') : t('users.inactive')}
                                            </Badge>
                                            {(user.loginAttempts ?? 0) >= 5 && (
                                                <Badge className="ml-2 bg-primary/10 text-primary border-primary/20 rounded-md">
                                                    {t('users.blocked')}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {user.lastLoginAt ? format(new Date(user.lastLoginAt), 'dd MMM yyyy, HH:mm', { locale: getDateLocale() }) : t('users.never')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-background border-border text-foreground">
                                                    <DropdownMenuLabel>{t('users.table_actions')}</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleEditClick(user)} className="hover:bg-primary/10 cursor-pointer">
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        {t('users.action_edit')}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleToggleStatus(user)} className="hover:bg-primary/10 cursor-pointer">
                                                        {user.isActive ? <UserX className="mr-2 h-4 w-4" /> : <UserCheck className="mr-2 h-4 w-4" />}
                                                        {user.isActive ? t('users.action_deactivate') : t('users.action_activate')}
                                                    </DropdownMenuItem>
                                                    {(user.loginAttempts ?? 0) >= 3 && (
                                                        <DropdownMenuItem onClick={() => handleUnlock(user)} className="hover:bg-primary/10 cursor-pointer text-primary">
                                                            <Unlock className="mr-2 h-4 w-4" />
                                                            {t('users.action_unlock')}
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator className="bg-muted" />
                                                    <DropdownMenuItem className="text-red-400 hover:bg-red-400/10 cursor-pointer focus:bg-red-400/10">
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        {t('users.action_delete')}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="bg-background border-border text-foreground">
                    <DialogHeader>
                        <DialogTitle>{t('users.edit_title')}</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            {t('users.edit_description')} {selectedUser?.firstName} {selectedUser?.lastName}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('users.form_first_name')}</label>
                            <Input
                                className="bg-background border-border text-foreground"
                                value={editFirstName}
                                onChange={e => setEditFirstName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('users.form_last_name')}</label>
                            <Input
                                className="bg-background border-border text-foreground"
                                value={editLastName}
                                onChange={e => setEditLastName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2 col-span-2">
                            <label className="text-sm font-medium">{t('users.form_phone')}</label>
                            <Input
                                type="tel"
                                className="bg-background border-border text-foreground"
                                value={editPhone}
                                onChange={e => setEditPhone(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('users.form_role')}</label>
                            <Select value={editRole} onValueChange={setEditRole}>
                                <SelectTrigger className="bg-background border-border">
                                    <SelectValue placeholder={t('users.select_role')} />
                                </SelectTrigger>
                                <SelectContent className="bg-background border-border text-foreground">
                                    {roles.map(role => (
                                        <SelectItem key={role.id} value={role.id}>{role.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('users.form_pos')}</label>
                            <Select value={editPOS} onValueChange={setEditPOS}>
                                <SelectTrigger className="bg-background border-border">
                                    <SelectValue placeholder={t('users.select_pos')} />
                                </SelectTrigger>
                                <SelectContent className="bg-background border-border text-foreground">
                                    <SelectItem value="none">{t('users.all_systems_global')}</SelectItem>
                                    {pointsOfSale.map(pos => (
                                        <SelectItem key={pos.id} value={pos.id}>{pos.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="text-muted-foreground hover:text-foreground">{t('users.cancel')}</Button>
                        <Button onClick={handleSaveEdit} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                            {isSaving ? t('users.saving') : t('users.save_changes')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add User Dialog */}
            <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
                <DialogContent className="bg-background border-border text-foreground max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{t('users.create_title')}</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            {t('users.create_description')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('users.form_first_name')}</label>
                            <Input
                                className="bg-background border-border text-foreground"
                                value={newUserState.firstName}
                                onChange={e => setNewUserState({ ...newUserState, firstName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('users.form_last_name')}</label>
                            <Input
                                className="bg-background border-border text-foreground"
                                value={newUserState.lastName}
                                onChange={e => setNewUserState({ ...newUserState, lastName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('users.form_email')}</label>
                            <Input
                                type="email"
                                className="bg-background border-border text-foreground"
                                value={newUserState.email}
                                onChange={e => setNewUserState({ ...newUserState, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('users.form_phone')}</label>
                            <Input
                                type="tel"
                                className="bg-background border-border text-foreground"
                                value={newUserState.phone}
                                onChange={e => setNewUserState({ ...newUserState, phone: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2 col-span-1">
                            <label className="text-sm font-medium">{t('users.form_role')}</label>
                            <Select value={newUserState.roleId} onValueChange={v => setNewUserState({ ...newUserState, roleId: v })}>
                                <SelectTrigger className="bg-background border-border">
                                    <SelectValue placeholder={t('users.select_role')} />
                                </SelectTrigger>
                                <SelectContent className="bg-background border-border text-foreground">
                                    {roles.map(role => (
                                        <SelectItem key={role.id} value={role.id}>{role.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 col-span-1">
                            <label className="text-sm font-medium">{t('users.form_pos')}</label>
                            <Select value={newUserState.posId} onValueChange={v => setNewUserState({ ...newUserState, posId: v })}>
                                <SelectTrigger className="bg-background border-border">
                                    <SelectValue placeholder={t('users.select_pos')} />
                                </SelectTrigger>
                                <SelectContent className="bg-background border-border text-foreground">
                                    <SelectItem value="none">{t('users.all_systems_global')}</SelectItem>
                                    {pointsOfSale.map(pos => (
                                        <SelectItem key={pos.id} value={pos.id}>{pos.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsAddUserDialogOpen(false)} className="text-muted-foreground hover:text-foreground">
                            {t('users.cancel')}
                        </Button>
                        <Button onClick={handleCreateUser} disabled={isCreating} className="bg-blue-600 hover:bg-blue-700">
                            {isCreating ? t('users.creating') : t('users.create_btn')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default UserList;
