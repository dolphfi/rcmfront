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
import { Input } from "components/ui/input";
import { Badge } from "components/ui/badge";
import { Button } from "components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "components/ui/dialog";
import {
    Search,
    Activity,
    User as UserIcon,
    Globe,
    History,
    ShieldCheck,
    Info,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import auditLogService, { AuditLog } from '../../context/api/auditLogService';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

const AuditLogs: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const limit = 15;

    // Modal State
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            const response = await auditLogService.getLogs(page, limit);
            setLogs(response.data);
            setTotal(response.total);
        } catch (error) {
            toast.error(t('audit.error_loading'));
        } finally {
            setLoading(false);
        }
    }, [page, limit, t]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const getActionBadge = (action: string) => {
        switch (action) {
            case 'CREATE':
                return <Badge className="bg-emerald-500/10 rounded-md text-emerald-500 border-emerald-500/20">{t('audit.action_create')}</Badge>;
            case 'UPDATE':
                return <Badge className="bg-blue-500/10 rounded-md text-blue-500 border-blue-500/20">{t('audit.action_update')}</Badge>;
            case 'DELETE':
                return <Badge className="bg-red-500/10 rounded-md text-red-500 border-red-500/20">{t('audit.action_delete')}</Badge>;
            default:
                return <Badge className="bg-slate-500/10 rounded-md text-muted-foreground border-slate-500/20">{action}</Badge>;
        }
    };

    const totalPages = Math.ceil(total / limit) || 1;

    const openDetails = (log: AuditLog) => {
        setSelectedLog(log);
        setIsDetailsOpen(true);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">{t('audit.title')}</h1>
                    <p className="text-muted-foreground">{t('audit.description')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-background border-border">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Activity className="h-4 w-4 text-blue-500" />
                            {t('audit.total_actions')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{total}</div>
                    </CardContent>
                </Card>
                <Card className="bg-background border-border">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-emerald-500" />
                            {t('audit.secure_system')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground italic">{t('audit.auto_logged')}</div>
                    </CardContent>
                </Card>
                <Card className="bg-background border-border">
                    <div className="p-4 flex h-full items-center justify-center">
                        <Button variant="outline" className="border-border text-muted-foreground gap-2 bg-background hover:bg-primary/10 hover:text-foreground" onClick={fetchLogs}>
                            <History className="h-4 w-4" />
                            {t('audit.refresh_data')}
                        </Button>
                    </div>
                </Card>
            </div>

            <Card className="bg-background border-border">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={t('audit.search_placeholder')}
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
                                <TableHead className="text-muted-foreground">{t('audit.date_time')}</TableHead>
                                <TableHead className="text-muted-foreground">{t('audit.action')}</TableHead>
                                <TableHead className="text-muted-foreground">{t('audit.entity')}</TableHead>
                                <TableHead className="text-muted-foreground">{t('audit.user')}</TableHead>
                                <TableHead className="text-muted-foreground">{t('audit.network_info')}</TableHead>
                                <TableHead className="text-right text-muted-foreground">{t('audit.details')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                        {t('common.loading')}
                                    </TableCell>
                                </TableRow>
                            ) : logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                        {t('audit.no_logs_found')}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log) => (
                                    <TableRow
                                        key={log.id}
                                        className="border-border hover:bg-primary/5 transition-colors cursor-pointer"
                                        onClick={() => openDetails(log)}
                                    >
                                        <TableCell className="text-foreground text-sm">
                                            {format(new Date(log.createdAt), 'dd MMM yyyy, HH:mm:ss', {
                                                locale: i18n.language === 'fr' ? fr : enUS
                                            })}
                                        </TableCell>
                                        <TableCell>
                                            {getActionBadge(log.action)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-foreground font-medium">{log.entityName}</span>
                                                <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[100px]">{log.entityId}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center">
                                                    <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-foreground text-sm">
                                                        {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'Sistèm'}
                                                    </span>
                                                    {log.user && <span className="text-[10px] text-muted-foreground">{log.user.email}</span>}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Globe className="h-3 w-3" />
                                                    {log.ipAddress || 'N/A'}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground bg-background hover:bg-primary/10 hover:text-foreground rounded-md">
                                                <Info className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6">
                            <div className="text-sm text-muted-foreground">
                                {t('audit.showing_logs', { count: logs.length, total: total })}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-border text-muted-foreground hover:bg-primary/5"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <div className="flex items-center px-4 text-sm text-foreground bg-background rounded border border-border">
                                    {t('audit.page_of', { current: page, total: totalPages })}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-border text-muted-foreground hover:bg-primary/5"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modal de Détails */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="sm:max-w-[700px] bg-background border-border text-foreground max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <Info className="h-5 w-5 text-blue-500" />
                            {t('audit.details_title')}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            {t('audit.details_description')}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedLog && (
                        <div className="space-y-6 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">{t('audit.date_time')}</p>
                                    <p className="font-medium text-foreground">
                                        {format(new Date(selectedLog.createdAt), 'dd MMMM yyyy, HH:mm:ss', {
                                            locale: i18n.language === 'fr' ? fr : enUS
                                        })}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">{t('audit.action')}</p>
                                    <div>{getActionBadge(selectedLog.action)}</div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">{t('audit.user')}</p>
                                    <div className="flex items-center gap-2">
                                        <UserIcon className="h-4 w-4 text-emerald-500" />
                                        <p className="font-medium text-foreground">
                                            {selectedLog.user ? `${selectedLog.user.firstName} ${selectedLog.user.lastName}` : t('audit.system_user')}
                                        </p>
                                    </div>
                                    {selectedLog.user && <p className="text-xs text-muted-foreground">{selectedLog.user.email}</p>}
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">{t('audit.pos')}</p>
                                    <p className="font-medium text-foreground">
                                        {selectedLog.pointOfSale ? selectedLog.pointOfSale.name : t('audit.system_pos')}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">{t('audit.checked_entity')}</p>
                                    <p className="font-medium text-foreground">{selectedLog.entityName} <span className="text-xs text-muted-foreground">({selectedLog.entityId})</span></p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">{t('audit.ip_address')}</p>
                                    <div className="flex items-center gap-2">
                                        <Globe className="h-4 w-4 text-blue-400" />
                                        <p className="font-medium text-foreground">{selectedLog.ipAddress || t('audit.unknown')}</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{selectedLog.userAgent}</p>
                                </div>
                            </div>

                            {(selectedLog.oldValues || selectedLog.newValues) && (
                                <div className="space-y-4 pt-4 border-t border-border">
                                    <h3 className="text-lg font-medium text-foreground">{t('audit.changes_json')}</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-rose-400">{t('audit.old_value')}</p>
                                            <div className="bg-background p-4 rounded-md border border-border overflow-x-auto">
                                                <pre className="text-xs text-foreground font-mono">
                                                    {selectedLog.oldValues ? JSON.stringify(selectedLog.oldValues, null, 2) : t('audit.no_changes')}
                                                </pre>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-emerald-400">{t('audit.new_value')}</p>
                                            <div className="bg-background p-4 rounded-md border border-border overflow-x-auto">
                                                <pre className="text-xs text-foreground font-mono">
                                                    {selectedLog.newValues ? JSON.stringify(selectedLog.newValues, null, 2) : t('audit.no_changes')}
                                                </pre>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AuditLogs;
