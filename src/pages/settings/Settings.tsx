import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "components/ui/select";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { Switch } from "components/ui/switch";
import {
    Settings as SettingsIcon,
    Store,
    ShieldCheck,
    Receipt,
    Save,
    AlertTriangle,
    Globe,
    RotateCw,
    CirclePlus,
    X,
    Edit,
    Database,
    History,
    Zap,
    ExternalLink
} from "lucide-react";
import { toast } from 'sonner';
import settingsService from 'context/api/settingsService';
import posService from 'context/api/posservice';
import { useTranslation } from 'react-i18next';
import { useSettings } from 'context/SettingsContext';
import { cn } from 'lib/utils';

const Settings: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isBackupLoading, setIsBackupLoading] = useState(false);
    const [isOptimizeLoading, setIsOptimizeLoading] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [settings, setSettings] = useState<any[]>([]);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { refreshSettings } = useSettings();

    // Form states
    const [businessName, setBusinessName] = useState("");
    const [taxPercent, setTaxPercent] = useState("");
    const [currency, setCurrency] = useState("");
    const [logoUrl, setLogoUrl] = useState("");
    const [footerMessage, setFooterMessage] = useState("");
    const [businessSlogan, setBusinessSlogan] = useState("");
    const [businessAddress, setBusinessAddress] = useState("");
    const [businessPhone, setBusinessPhone] = useState("");
    const [businessEmail, setBusinessEmail] = useState("");
    const [bankAccounts, setBankAccounts] = useState<any[]>([]);
    const [exchangeRate, setExchangeRate] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isEditingGeneral, setIsEditingGeneral] = useState(false);
    const [backupHistory, setBackupHistory] = useState<any[]>([]);

    // Template Receipt states
    const [terminals, setTerminals] = useState<any[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState("standard");
    const [selectedPos, setSelectedPos] = useState("");
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);

    const fetchTerminals = useCallback(async () => {
        try {
            const response = await posService.getAll(1, 100); // Fetch all POS
            const rawData = response?.data || response;
            const data = Array.isArray(rawData) ? rawData : (Array.isArray(rawData?.data) ? rawData.data : []);
            setTerminals(data);
            if (data.length > 0) {
                setSelectedPos(data[0].id);
            }
        } catch (error) {
            console.error("Failed to fetch terminals:", error);
        }
    }, []);

    const fetchSettings = useCallback(async () => {
        setIsLoading(true);
        try {
            const [settingsResponse, historyResponse] = await Promise.all([
                settingsService.getAll(),
                settingsService.getBackupHistory()
            ]);

            const rawData = settingsResponse?.data || settingsResponse;
            const data = Array.isArray(rawData) ? rawData : (Array.isArray(rawData?.data) ? rawData.data : []);
            setSettings(data);
            
            const rawHistory = historyResponse?.data || historyResponse;
            const historyData = Array.isArray(rawHistory) ? rawHistory : (Array.isArray(rawHistory?.data) ? rawHistory.data : []);
            setBackupHistory(historyData);

            // Extract values
            setMaintenanceMode(data.find((s: any) => s.key === 'MAINTENANCE_MODE')?.value === 'true');
            setBusinessName(data.find((s: any) => s.key === 'BUSINESS_NAME')?.value || "");
            setTaxPercent(data.find((s: any) => s.key === 'TAX_PERCENTAGE')?.value || "");
            setCurrency(data.find((s: any) => s.key === 'CURRENCY_CODE')?.value || "HTG");
            setLogoUrl(data.find((s: any) => s.key === 'BUSINESS_LOGO_URL')?.value || "");
            setFooterMessage(data.find((s: any) => s.key === 'RECEIPT_FOOTER_MESSAGE')?.value || "");
            setBusinessSlogan(data.find((s: any) => s.key === 'BUSINESS_SLOGAN')?.value || "");
            setBusinessAddress(data.find((s: any) => s.key === 'BUSINESS_ADDRESS')?.value || "");
            setBusinessPhone(data.find((s: any) => s.key === 'BUSINESS_PHONE')?.value || "");
            const email = data.find((s: any) => s.key === 'BUSINESS_EMAIL')?.value || "";
            setBusinessEmail(email);
            
            const bankInfoRaw = data.find((s: any) => s.key === 'BUSINESS_BANK_INFO')?.value || "[]";
            try {
                const parsed = JSON.parse(bankInfoRaw);
                setBankAccounts(Array.isArray(parsed) ? parsed : []);
            } catch {
                setBankAccounts([]);
            }
            
            setExchangeRate(data.find((s: any) => s.key === 'EXCHANGE_RATE')?.value || "1");

            // Auto-detect mode
            const hasData = (data.find((s: any) => s.key === 'BUSINESS_NAME')?.value || "").length > 0;
            setIsEditingGeneral(!hasData);
        } catch (error) {
            console.error("Failed to fetch settings:", error);
            toast.error("Impossible de charger les paramètres");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
        fetchTerminals();
    }, [fetchSettings, fetchTerminals]);

    const handleSaveGeneral = async () => {
        setIsLoading(true);
        try {
            const formData = new FormData();

            // Only business profile fields
            const profileData = {
                BUSINESS_NAME: businessName,
                BUSINESS_SLOGAN: businessSlogan,
                BUSINESS_ADDRESS: businessAddress,
                BUSINESS_PHONE: businessPhone,
                BUSINESS_EMAIL: businessEmail,
                BUSINESS_BANK_INFO: JSON.stringify(bankAccounts),
                CURRENCY_CODE: currency,
                EXCHANGE_RATE: exchangeRate
            };

            formData.append('data', JSON.stringify(profileData));

            if (selectedFile) {
                formData.append('file', selectedFile);
            }

            await settingsService.updateBusinessProfile(formData);

            toast.success(t('settings.business_profile_updated'));
            setIsEditingGeneral(false);
            refreshSettings();
            setIsEditingGeneral(false); // Switch back to view mode after save
        } catch (error) {
            console.error('Error updating general settings:', error);
            toast.error(t('settings.save_error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveBilling = async () => {
        setIsLoading(true);
        try {
            const formData = new FormData();

            // Only billing fields
            const billingData = {
                TAX_PERCENTAGE: taxPercent,
                RECEIPT_FOOTER_MESSAGE: footerMessage
            };

            formData.append('data', JSON.stringify(billingData));

            await settingsService.updateBusinessProfile(formData);

            toast.success(t('settings.save_success'));
        } catch (error) {
            console.error('Error updating billing settings:', error);
            toast.error(t('settings.save_error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);
        setLogoUrl(URL.createObjectURL(file));
    };

    const toggleMaintenance = async (checked: boolean) => {
        try {
            if (checked) {
                await settingsService.enableMaintenance();
                toast.warning(t('settings.maintenance_warning'));
            } else {
                await settingsService.disableMaintenance();
                toast.success(t('settings.maintenance_off'));
            }
            setMaintenanceMode(checked);
        } catch (error) {
            toast.error(t('settings.save_error'));
        }
    };

    const handleBackupData = async () => {
        setIsBackupLoading(true);
        try {
            await settingsService.backupData();
            toast.success(t('settings.backup_success') || "Sovgad fèt kòrèkteman");
            await fetchSettings(); // Refresh to show new date
        } catch (error) {
            toast.error(t('settings.save_error'));
        } finally {
            setIsBackupLoading(false);
        }
    };

    const handleAddBankAccount = () => {
        setBankAccounts([...bankAccounts, { bankName: '', accountNumber: '', accountName: '' }]);
    };

    const handleRemoveBankAccount = (index: number) => {
        setBankAccounts(bankAccounts.filter((_, i) => i !== index));
    };

    const handleUpdateBankAccount = (index: number, field: string, value: string) => {
        const updated = [...bankAccounts];
        updated[index] = { ...updated[index], [field]: value };
        setBankAccounts(updated);
    };

    const handleViewLogs = () => {
        navigate('/settings/audit-logs');
    };

    const handleOptimizeSystem = async () => {
        setIsOptimizeLoading(true);
        try {
            await settingsService.optimizeSystem();
            toast.success(t('settings.perf_success') || "Optimizasyon fini");
        } catch (error) {
            toast.error(t('settings.save_error'));
        } finally {
            setIsOptimizeLoading(false);
        }
    };

    const handlePreviewReceipt = () => {
        setIsPreviewOpen(true);
    };

    const handlePrintPreview = async () => {
        try {
            // Fetch PDF as Blob to avoid cross-origin iframe print restrictions
            const response = await fetch(`${process.env.REACT_APP_BACKEND_API_URL}/pdf/preview-receipt?template=${selectedTemplate}&posId=${selectedPos}`);
            if (!response.ok) throw new Error("Failed to fetch PDF for printing");

            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            // Open the PDF in a new printable window
            const printWindow = window.open(blobUrl, '_blank');
            if (printWindow) {
                printWindow.onload = () => {
                    printWindow.print();
                    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
                };
            } else {
                toast.error(t('settings.print_error') || "Ou dwe otorize 'pop-ups' pou w ka enprime");
            }
        } catch (error) {
            console.error("Failed to print preview:", error);
            toast.error(t('settings.print_error') || "Erè pandan enpresyon an");
        }
    };

    const handleAssignTemplate = async () => {
        if (!selectedPos || !selectedTemplate) {
            toast.error(t('settings.select_pos_template_error'));
            return;
        }

        setIsAssigning(true);
        try {
            await posService.update(selectedPos, { receiptTemplate: selectedTemplate });
            toast.success(t('settings.template_assigned_success'));
        } catch (error) {
            console.error('Error assigning template:', error);
            toast.error(t('settings.save_error'));
        } finally {
            setIsAssigning(false);
        }
    };

    if (isLoading && settings.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <RotateCw className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                    <SettingsIcon className="h-8 w-8 text-primary" />
                    {t('settings.title')}
                </h2>
                <p className="text-slate-500">{t('settings.description')}</p>
            </div>

            <Tabs defaultValue="general" className="space-y-4">
                <TabsList className="bg-slate-100 border border-slate-200 p-1">
                    <TabsTrigger value="general" className="data-[state=active]:bg-primary data-[state=active]:text-white gap-2 transition-all">
                        <Store className="h-4 w-4" /> {t('settings.tab_general')}
                    </TabsTrigger>
                    <TabsTrigger value="system" className="data-[state=active]:bg-primary data-[state=active]:text-white gap-2 transition-all">
                        <ShieldCheck className="h-4 w-4" /> {t('settings.tab_system')}
                    </TabsTrigger>
                    <TabsTrigger value="backups" className="data-[state=active]:bg-primary data-[state=active]:text-white gap-2 transition-all">
                        <Database className="h-4 w-4" /> {t('settings.tab_backups')}
                    </TabsTrigger>
                    <TabsTrigger value="template-receipt" className="data-[state=active]:bg-primary data-[state=active]:text-white gap-2 transition-all">
                        <Receipt className="h-4 w-4" /> {t('settings.tab_billing')}
                    </TabsTrigger>
                </TabsList>
                {/* General Settings */}
                <TabsContent value="general" className="space-y-4">
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7 border-b border-slate-50 mb-6">
                            <div className="space-y-1">
                                <CardTitle className="text-slate-900 font-bold">{t('settings.general_title')}</CardTitle>
                                <CardDescription className="text-slate-500">{t('settings.general_desc')}</CardDescription>
                            </div>
                            {!isEditingGeneral && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-primary/20 text-primary hover:bg-primary/10 gap-2 font-semibold"
                                    onClick={() => setIsEditingGeneral(true)}
                                >
                                    <Edit className="h-4 w-4" /> {t('common.edit')}
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {isEditingGeneral ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-slate-700 font-medium">{t('settings.business_name')}</Label>
                                            <Input
                                                className="bg-slate-50 border-slate-200 text-slate-900 focus:ring-primary"
                                                value={businessName}
                                                onChange={(e) => setBusinessName(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-slate-700 font-medium">{t('settings.business_slogan')}</Label>
                                            <Input
                                                className="bg-slate-50 border-slate-200 text-slate-900 focus:ring-primary"
                                                value={businessSlogan}
                                                onChange={(e) => setBusinessSlogan(e.target.value)}
                                                placeholder="Egz: Inovasyon nan sèvis ou"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-slate-700 font-medium">{t('settings.business_address')}</Label>
                                            <Input
                                                className="bg-slate-50 border-slate-200 text-slate-900 focus:ring-primary"
                                                value={businessAddress}
                                                onChange={(e) => setBusinessAddress(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-slate-700 font-medium">{t('settings.business_phone')}</Label>
                                            <Input
                                                className="bg-slate-50 border-slate-200 text-slate-900 focus:ring-primary"
                                                value={businessPhone}
                                                onChange={(e) => setBusinessPhone(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-slate-700 font-medium">{t('settings.business_email')}</Label>
                                            <Input
                                                className="bg-slate-50 border-slate-200 text-slate-900 focus:ring-primary"
                                                value={businessEmail}
                                                onChange={(e) => setBusinessEmail(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-slate-700 font-medium">{t('settings.currency')}</Label>
                                            <select
                                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-md h-10 px-3 outline-none focus:ring-2 focus:ring-primary transition-all"
                                                value={currency}
                                                onChange={(e) => setCurrency(e.target.value)}
                                            >
                                                <option value="HTG">HTG (Gourde)</option>
                                                <option value="$HT">$HT (Dollar Haïtien)</option>
                                                <option value="USD">USD (Dollar)</option>
                                                <option value="EUR">EUR (Euro)</option>
                                                <option value="CAD">CAD (Dollar Canadien)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-slate-300">Taux de Change (USD {'->'} HTG)</Label>
                                            <Input
                                                type="number"
                                                className="bg-slate-800 border-white/10 text-white"
                                                value={exchangeRate}
                                                onChange={(e) => setExchangeRate(e.target.value)}
                                                placeholder="Egz: 130.5"
                                            />
                                        </div>
                                        <div className="space-y-4 md:col-span-2">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-slate-300">Kont Bank (Bank Accounts)</Label>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10"
                                                    onClick={handleAddBankAccount}
                                                >
                                                    <CirclePlus className="h-3.5 w-3.5 mr-1" /> Ajoute yon kont
                                                </Button>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                {bankAccounts.map((account, index) => (
                                                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-slate-800/30 border border-white/5 rounded-lg relative group">
                                                        <div className="space-y-1">
                                                            <Label className="text-[10px] text-slate-500 uppercase">Non Bank</Label>
                                                            <Input
                                                                className="h-8 bg-slate-800 border-white/10 text-white text-xs"
                                                                value={account.bankName}
                                                                onChange={(e) => handleUpdateBankAccount(index, 'bankName', e.target.value)}
                                                                placeholder="Egz: BNC"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-[10px] text-slate-500 uppercase">Nimewo Kont</Label>
                                                            <Input
                                                                className="h-8 bg-slate-800 border-white/10 text-white text-xs"
                                                                value={account.accountNumber}
                                                                onChange={(e) => handleUpdateBankAccount(index, 'accountNumber', e.target.value)}
                                                                placeholder="123-456-789"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-[10px] text-slate-500 uppercase">Nom sou Kont lan</Label>
                                                            <div className="flex gap-2">
                                                                <Input
                                                                    className="h-8 bg-slate-800 border-white/10 text-white text-xs flex-1"
                                                                    value={account.accountName}
                                                                    onChange={(e) => handleUpdateBankAccount(index, 'accountName', e.target.value)}
                                                                    placeholder="Nom Biznis lan"
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10"
                                                                    onClick={() => handleRemoveBankAccount(index)}
                                                                >
                                                                    <X className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {bankAccounts.length === 0 && (
                                                    <div className="text-center py-6 border border-dashed border-white/10 rounded-lg">
                                                        <p className="text-xs text-slate-500 italic">Pa gen okenn kont bank anrejistre.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-slate-300">{t('settings.business_logo')}</Label>
                                        <div className="flex flex-wrap gap-4">
                                            <input
                                                type="file"
                                                id="logo-upload"
                                                className="hidden"
                                                accept="image/*"
                                                ref={fileInputRef}
                                                onChange={handleLogoUpload}
                                                disabled={isLoading}
                                            />

                                            {logoUrl ? (
                                                <div className="h-24 w-24 rounded-lg border border-white/10 p-1 relative group bg-white/5">
                                                    <img
                                                        src={logoUrl}
                                                        alt="Logo"
                                                        className="h-full w-full object-contain rounded-md"
                                                    />
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-md">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-white hover:bg-orange-500/20 hover:text-orange-500"
                                                            onClick={() => fileInputRef.current?.click()}
                                                            disabled={isLoading}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-white hover:bg-rose-500/20 hover:text-rose-500"
                                                            onClick={() => {
                                                                setLogoUrl('');
                                                                setSelectedFile(null);
                                                            }}
                                                            disabled={isLoading}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    {isLoading && selectedFile && (
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-md">
                                                            <RotateCw className="h-5 w-5 text-white animate-spin" />
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className={cn(
                                                        "h-24 w-24 rounded-lg border border-dashed border-white/20 hover:border-orange-500 flex flex-col items-center justify-center cursor-pointer group transition-colors",
                                                        isLoading && "opacity-50 cursor-not-allowed"
                                                    )}
                                                >
                                                    {isLoading && selectedFile ? (
                                                        <RotateCw className="h-5 w-5 text-slate-400 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <CirclePlus className="h-5 w-5 text-slate-400 group-hover:text-orange-500" />
                                                            <span className="text-[10px] mt-2 text-slate-500 group-hover:text-orange-500 font-medium">Logo</span>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-white/10 flex gap-3">
                                        <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2" onClick={handleSaveGeneral} disabled={isLoading}>
                                            <Save className="h-4 w-4" /> {isLoading ? t('settings.saving') : t('common.save_button')}
                                        </Button>
                                        <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => setIsEditingGeneral(false)} disabled={isLoading}>
                                            {t('common.cancel')}
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col md:flex-row gap-8 items-start">
                                    <div className="h-32 w-32 rounded-xl bg-white/5 border border-white/10 p-2 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {logoUrl ? (
                                            <img src={logoUrl} alt="Logo" className="h-full w-full object-contain" />
                                        ) : (
                                            <Store className="h-12 w-12 text-slate-700" />
                                        )}
                                    </div>
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12">
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{t('settings.business_name')}</p>
                                            <p className="text-xl font-bold text-white">{businessName || '---'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{t('settings.business_slogan')}</p>
                                            <p className="text-slate-300 italic">"{businessSlogan || '---'}"</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{t('settings.business_address')}</p>
                                            <p className="text-slate-300">{businessAddress || '---'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{t('settings.business_phone')}</p>
                                            <p className="text-slate-300">{businessPhone || '---'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{t('settings.business_email')}</p>
                                            <p className="text-slate-300">{businessEmail || '---'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{t('settings.currency')}</p>
                                            <p className="text-slate-300 font-mono">{currency}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Taux de Change</p>
                                            <p className="text-slate-300 font-mono">{exchangeRate} HTG = 1 USD</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* System Settings */}
                <TabsContent value="system" className="space-y-4">
                    <Card className="bg-slate-900/50 border-white/10 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-orange-500" />
                                {t('settings.tab_system')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Critical Actions / Maintenance Mode */}
                            <div className="flex items-center justify-between p-4 bg-rose-500/5 border border-rose-500/20 rounded-xl">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-rose-500" />
                                        <p className="font-semibold text-white uppercase tracking-wider text-xs">{t('settings.critical_actions')}</p>
                                    </div>
                                    <p className="text-lg font-bold text-white">{t('settings.maintenance_mode')}</p>
                                    <p className="text-sm text-slate-400">{t('settings.maintenance_desc')}</p>
                                </div>
                                <Switch
                                    checked={maintenanceMode}
                                    onCheckedChange={toggleMaintenance}
                                    className="data-[state=checked]:bg-rose-500"
                                />
                            </div>

                            {/* System Status Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Removed Backup Section from here */}

                                {/* Logs Section */}
                                <div className="p-4 bg-slate-950/40 border border-white/5 rounded-xl space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500/10 rounded-lg">
                                            <History className="h-5 w-5 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">{t('settings.logs_title')}</p>
                                            <p className="text-xs text-slate-500">{t('settings.logs_desc')}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="w-full border-white/10 bg-transparent hover:bg-white/5 text-xs h-9 text-slate-300"
                                        onClick={handleViewLogs}
                                    >
                                        {t('settings.logs_button')}
                                    </Button>
                                </div>

                                {/* Optimization Section */}
                                <div className="p-4 bg-slate-950/40 border border-white/5 rounded-xl space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                                            <Zap className="h-5 w-5 text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">{t('settings.perf_title')}</p>
                                            <p className="text-xs text-slate-500">{t('settings.perf_desc')}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="w-full border-white/10 bg-transparent hover:bg-white/5 text-xs h-9 text-slate-300"
                                        onClick={handleOptimizeSystem}
                                        disabled={isOptimizeLoading}
                                    >
                                        {isOptimizeLoading ? <RotateCw className="h-3 w-3 animate-spin mr-2" /> : null}
                                        {t('settings.perf_button')}
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                <Button variant="outline" className="justify-start border-white/10 bg-transparent text-white hover:bg-white/5 gap-3 h-12">
                                    <Globe className="h-4 w-4 text-orange-400" /> {t('audit.network_info')}
                                </Button>
                                <Button variant="outline" className="justify-start border-white/10 bg-transparent text-white hover:bg-white/5 gap-3 h-12">
                                    <ShieldCheck className="h-4 w-4 text-emerald-400" /> SSL & Security
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Backups Settings */}
                <TabsContent value="backups" className="space-y-4">
                    <Card className="bg-slate-900/50 border-white/10 backdrop-blur-xl">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-white">{t('settings.tab_backups')}</CardTitle>
                                <CardDescription className="text-slate-400">
                                    {t('settings.backups_history_desc')}
                                </CardDescription>
                            </div>
                            <Button
                                onClick={handleBackupData}
                                disabled={isBackupLoading}
                                className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
                            >
                                {isBackupLoading ? <RotateCw className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
                                {t('settings.backup_button')}
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border border-white/10 overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-white/5 hover:bg-white/5">
                                        <TableRow className="border-white/10 hover:bg-transparent">
                                            <TableHead className="text-slate-300 font-medium">{t('settings.backup_date')}</TableHead>
                                            <TableHead className="text-slate-300 font-medium">{t('settings.backup_file')}</TableHead>
                                            <TableHead className="text-slate-300 font-medium">{t('settings.backup_status')}</TableHead>
                                            <TableHead className="text-slate-300 font-medium text-right">{t('settings.backup_action')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {backupHistory.length === 0 ? (
                                            <TableRow className="hover:bg-white/5 border-white/10">
                                                <TableCell colSpan={4} className="h-24 text-center text-slate-400">
                                                    {t('settings.no_backups')}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            backupHistory.map((backup) => (
                                                <TableRow key={backup.id} className="hover:bg-white/5 border-white/10 group transition-colors">
                                                    <TableCell className="text-slate-300">
                                                        {new Date(backup.date).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell className="text-slate-300 font-medium">
                                                        {backup.fileName}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                            {backup.status}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {backup.url && (
                                                            <a
                                                                href={backup.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 w-full border-white/10 bg-transparent hover:bg-white/5 lg:w-auto text-orange-500 hover:text-orange-400 gap-2 border-orange-500/20"
                                                            >
                                                                <ExternalLink className="h-4 w-4" />
                                                                {t('settings.download')}
                                                            </a>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Template Receipt */}
                <TabsContent value="template-receipt" className="space-y-4">
                    <Card className="bg-slate-900/50 border-white/10 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-white">{t('settings.tab_billing')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Receipt Config Section */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-medium text-white border-b border-white/10 pb-2">{t('settings.receipt_config')}</h3>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-slate-300">{t('settings.footer_message')}</Label>
                                            <Input
                                                className="bg-slate-800 border-white/10 text-white"
                                                placeholder="Mèsi paske w te vizite nou!"
                                                value={footerMessage}
                                                onChange={(e) => setFooterMessage(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2" onClick={handleSaveBilling} disabled={isLoading}>
                                            <Save className="h-4 w-4" /> {isLoading ? t('settings.saving') : t('common.save_button')}
                                        </Button>
                                    </div>
                                </div>

                                {/* Template Assignment Section */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-medium text-white border-b border-white/10 pb-2">{t('settings.receipt_templates')}</h3>
                                    <div className="space-y-4 p-4 bg-slate-950/40 border border-white/5 rounded-xl">
                                        <div className="space-y-2">
                                            <Label className="text-slate-300">{t('settings.select_template')}</Label>
                                            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                                                <SelectTrigger className="bg-slate-800 border-white/10 text-white focus:ring-orange-500">
                                                    <SelectValue placeholder="Select template" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-800 border-white/10">
                                                    <SelectItem value="standard" className="text-white hover:bg-slate-700">{t('settings.template_standard')}</SelectItem>
                                                    <SelectItem value="minimal" className="text-white hover:bg-slate-700">{t('settings.template_minimal')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" className="w-full border-white/10 bg-transparent text-slate-300 hover:bg-white/5 gap-2" onClick={handlePreviewReceipt}>
                                                    <Globe className="h-4 w-4" /> {t('settings.preview_template')}
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="md:max-w-3xl bg-slate-900 border-white/10 text-white">
                                                <DialogHeader>
                                                    <DialogTitle>{t('settings.preview_title')}</DialogTitle>
                                                    <DialogDescription className="text-slate-400">
                                                        {t('settings.preview_desc')}
                                                    </DialogDescription>
                                                </DialogHeader>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                                    {/* Left: Preview Frame */}
                                                    <div className="w-full h-[500px] rounded-md border border-white/10 bg-white/5 p-2 flex items-center justify-center relative overflow-hidden">
                                                        {isPreviewOpen && (
                                                            <iframe
                                                                id="receipt-preview-iframe"
                                                                src={`${process.env.REACT_APP_BACKEND_API_URL}/pdf/preview-receipt?template=${selectedTemplate}&posId=${selectedPos}`}
                                                                className="w-full h-full rounded bg-white shadow-inner"
                                                                title="Receipt Preview"
                                                            />
                                                        )}
                                                    </div>

                                                    {/* Right: Actions */}
                                                    <div className="space-y-4 flex flex-col justify-end pb-2">
                                                        <div className="space-y-4 p-4 bg-slate-950/40 border border-white/5 rounded-xl">
                                                            <div className="space-y-2">
                                                                <Label className="text-slate-300">{t('settings.select_pos')}</Label>
                                                                <Select value={selectedPos} onValueChange={setSelectedPos}>
                                                                    <SelectTrigger className="bg-slate-800 border-white/10 text-white focus:ring-orange-500">
                                                                        <SelectValue placeholder="Select Point of Sale" />
                                                                    </SelectTrigger>
                                                                    <SelectContent className="bg-slate-800 border-white/10">
                                                                        {terminals.length === 0 ? (
                                                                            <SelectItem value="none" disabled className="text-slate-500">No Terminals Found</SelectItem>
                                                                        ) : (
                                                                            terminals.map(pos => (
                                                                                <SelectItem key={pos.id} value={pos.id} className="text-white hover:bg-slate-700">
                                                                                    {pos.name}
                                                                                </SelectItem>
                                                                            ))
                                                                        )}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <Button
                                                                className="w-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 hover:text-emerald-300 gap-2"
                                                                onClick={handleAssignTemplate}
                                                                disabled={isAssigning || terminals.length === 0}
                                                            >
                                                                <Zap className="h-4 w-4" />
                                                                {isAssigning ? t('settings.assigning') : t('settings.assign_template')}
                                                            </Button>
                                                        </div>
                                                        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                                                            <Button variant="outline" className="border-white/10 bg-transparent hover:bg-white/5 text-slate-300" onClick={() => setIsPreviewOpen(false)}>
                                                                {t('common.close')}
                                                            </Button>
                                                            <Button onClick={handlePrintPreview} className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
                                                                {t('settings.print_receipt')}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Settings;
