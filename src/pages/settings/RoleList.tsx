import React, { useEffect, useState, useCallback } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { Button } from "components/ui/button";
import { Badge } from "components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "components/ui/dialog";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { Textarea } from "components/ui/textarea";
import { Checkbox } from "components/ui/checkbox";
import { Trash2, Lock, Edit, Plus, MoreVertical } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "components/ui/popover";
import rolesService from '../../context/api/rolesService';
import { Role } from '../../context/types/auth';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const RoleList: React.FC = () => {
    const { t } = useTranslation();
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);

    const availablePermissions = [
        { id: 'manage_users', label: t('roles.perm_users') },
        { id: 'manage_roles', label: t('roles.perm_roles') },
        { id: 'manage_sales', label: t('roles.perm_sales') },
        { id: 'view_reports', label: t('roles.perm_reports') },
        { id: 'manage_inventory', label: t('roles.perm_inventory') },
        { id: 'manage_settings', label: t('roles.perm_settings') }
    ];

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        name: '',
        label: '',
        description: '',
        permissions: [] as string[]
    });

    // Delete State
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

    const fetchRoles = useCallback(async () => {
        try {
            setLoading(true);
            const data = await rolesService.getRoles();
            setRoles(data);
        } catch (error) {
            toast.error(t('roles.error_load'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    const handleOpenAddModal = () => {
        setFormData({ name: '', label: '', description: '', permissions: [] });
        setModalMode('add');
        setSelectedRole(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (role: Role) => {
        setFormData({
            name: role.name,
            label: role.label,
            description: role.description || '',
            permissions: role.permissions || []
        });
        setModalMode('edit');
        setSelectedRole(role);
        setIsModalOpen(true);
    };

    const confirmDeleteRole = (role: Role) => {
        if (role.name === 'SUPER_ADMIN' || role.name === 'ADMIN') {
            toast.error(t('roles.error_system_delete'));
            return;
        }
        setRoleToDelete(role);
        setIsDeleteDialogOpen(true);
    };

    const handleSaveRole = async () => {
        try {
            if (!formData.name.trim() || !formData.label.trim()) {
                toast.error(t('roles.error_fill_fields'));
                return;
            }

            setIsSaving(true);
            if (modalMode === 'add') {
                await rolesService.createRole({
                    name: formData.name.toUpperCase().replace(/\s+/g, '_'),
                    label: formData.label,
                    description: formData.description,
                    permissions: formData.permissions
                });
                toast.success(t('roles.success_create'));
            } else {
                if (!selectedRole?.id) return;
                await rolesService.updateRole(selectedRole.id, {
                    name: formData.name.toUpperCase().replace(/\s+/g, '_'),
                    label: formData.label,
                    description: formData.description,
                    permissions: formData.permissions
                });
                toast.success(t('roles.success_update'));
            }
            setIsModalOpen(false);
            fetchRoles();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || t('roles.error_save'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteRole = async () => {
        if (!roleToDelete?.id) return;
        try {
            await rolesService.deleteRole(roleToDelete.id);
            toast.success(t('roles.success_delete'));
            setIsDeleteDialogOpen(false);
            fetchRoles();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || t('roles.error_delete'));
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">{t('roles.title')}</h1>
                    <p className="text-slate-400">{t('roles.description')}</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2" onClick={handleOpenAddModal}>
                    <Plus className="h-4 w-4" />
                    {t('roles.new_role')}
                </Button>
            </div>

            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Lock className="h-5 w-5 text-blue-500" />
                        {t('roles.list_title')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader className="hover:bg-transparent">
                            <TableRow className="border-slate-800">
                                <TableHead className="text-slate-400">{t('roles.table_name')}</TableHead>
                                <TableHead className="text-slate-400">{t('roles.table_label')}</TableHead>
                                <TableHead className="text-slate-400">{t('roles.table_description')}</TableHead>
                                <TableHead className="text-slate-400">{t('roles.table_permissions')}</TableHead>
                                <TableHead className="text-right text-slate-400">{t('roles.table_action')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-slate-500">
                                        {t('roles.loading')}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                roles.map((role) => (
                                    <TableRow key={role.id} className="border-slate-800 hover:bg-white/5 transition-colors">
                                        <TableCell>
                                            <code className="bg-slate-950 px-2 py-1 rounded text-blue-400">
                                                {role.name}
                                            </code>
                                        </TableCell>
                                        <TableCell className="text-white font-medium">
                                            {role.label}
                                        </TableCell>
                                        <TableCell className="text-slate-400 max-w-xs">
                                            {role.description || t('roles.no_description')}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {role.name === 'SUPER_ADMIN' || role.name === 'ADMIN' ? (
                                                    <Badge variant="outline" className="border-slate-700 text-emerald-400 bg-emerald-500/10 rounded-md">
                                                        {t('roles.full_access')}
                                                    </Badge>
                                                ) : role.permissions && role.permissions.length > 0 ? (
                                                    role.permissions.map(perm => (
                                                        <Badge key={perm} variant="outline" className="border-slate-700 text-slate-400 bg-slate-800/50 rounded-md">
                                                            {availablePermissions.find(p => p.id === perm)?.label || perm}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-slate-600 text-xs italic">{t('roles.no_permissions')}</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-white/10">
                                                        <MoreVertical className="h-4 w-4" />
                                                        <span className="sr-only">{t('roles.open_menu')}</span>
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent align="end" className="w-40 bg-slate-900 border-slate-800 p-1">
                                                    <div className="flex flex-col gap-1">
                                                        <Button variant="ghost" className="w-full justify-start h-8 gap-2 text-slate-300 hover:text-white hover:bg-white/10" onClick={() => handleOpenEditModal(role)}>
                                                            <Edit className="h-3.5 w-3.5" />
                                                            {t('roles.edit')}
                                                        </Button>
                                                        <Button variant="ghost" className="w-full justify-start h-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 gap-2" onClick={() => confirmDeleteRole(role)}>
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                            {t('roles.delete')}
                                                        </Button>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Modal Ajoutez/Modifiez Rôle */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-white">
                    <DialogHeader>
                        <DialogTitle>{modalMode === 'add' ? t('roles.add_title') : t('roles.edit_title')}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className='grid grid-cols-2 gap-3'>
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="text-slate-300">
                                    {t('roles.form_name')}
                                </Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                                    placeholder={t('roles.form_name_placeholder')}
                                    className="bg-slate-950 border-slate-800"
                                    disabled={modalMode === 'edit' && (formData.name === 'SUPER_ADMIN' || formData.name === 'ADMIN')}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="label" className="text-slate-300">
                                    {t('roles.form_label')}
                                </Label>
                                <Input
                                    id="label"
                                    value={formData.label}
                                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                    placeholder={t('roles.form_label_placeholder')}
                                    className="bg-slate-950 border-slate-800"
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description" className="text-slate-300">
                                {t('roles.form_description')}
                            </Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder={t('roles.form_description_placeholder')}
                                className="bg-slate-950 border-slate-800"
                            />
                        </div>

                        {/* Permissions Section */}
                        {formData.name !== 'SUPER_ADMIN' && formData.name !== 'ADMIN' && (
                            <div className="space-y-3 mt-2 border-t border-slate-800 pt-4">
                                <Label className="text-slate-300">{t('roles.system_permissions')}</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    {availablePermissions.map(permission => (
                                        <div key={permission.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`perm-${permission.id}`}
                                                className="border-slate-700 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                                                checked={formData.permissions.includes(permission.id)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            permissions: [...prev.permissions, permission.id]
                                                        }));
                                                    } else {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            permissions: prev.permissions.filter(p => p !== permission.id)
                                                        }));
                                                    }
                                                }}
                                            />
                                            <label
                                                htmlFor={`perm-${permission.id}`}
                                                className="text-sm font-medium leading-none text-slate-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                {permission.label}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)} className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800">
                            {t('roles.cancel')}
                        </Button>
                        <Button onClick={handleSaveRole} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
                            {isSaving ? t('roles.saving') : t('roles.save_role')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Supression Rôle */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('roles.delete_confirm_title')}</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                            {t('roles.delete_confirm_desc').split('<0>')[0]}
                            <span className="font-bold text-slate-200">{roleToDelete?.label}</span>
                            {t('roles.delete_confirm_desc').split('</0>')[1]}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white">{t('roles.cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteRole} className="bg-rose-600 text-white hover:bg-rose-700">
                            {t('roles.delete_sure')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default RoleList;
