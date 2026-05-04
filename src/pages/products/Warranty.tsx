import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
    Plus,
    Search,
    RotateCw,
    Edit,
    Trash2,
    ShieldCheck,
    Clock
} from 'lucide-react';
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useTranslation } from 'react-i18next';
import warrantyService, { Warranty } from '../../context/api/warrantyService';
import { toast } from 'sonner';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';

const WarrantyPage: React.FC = () => {
    const { t } = useTranslation();
    const [warranties, setWarranties] = useState<Warranty[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingWarranty, setEditingWarranty] = useState<Warranty | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<Warranty>>({
        name: '',
        duration: 0,
        durationUnit: 'months',
        type: 'service',
        description: ''
    });

    const fetchWarranties = async () => {
        try {
            setIsLoading(true);
            const data = await warrantyService.getAll();
            setWarranties(data);
        } catch (error) {
            toast.error('Erè pandan chajman garanti yo');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWarranties();
    }, [t]);

    const handleOpenAddDialog = () => {
        setEditingWarranty(null);
        setFormData({
            name: '',
            duration: 0,
            durationUnit: 'months',
            type: 'service',
            description: ''
        });
        setIsDialogOpen(true);
    };

    const handleEdit = (warranty: Warranty) => {
        setEditingWarranty(warranty);
        setFormData({
            name: warranty.name,
            duration: warranty.duration,
            durationUnit: warranty.durationUnit,
            type: warranty.type,
            description: warranty.description
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await warrantyService.delete(id);
            toast.success('Garanti efase avèk siksè');
            fetchWarranties();
        } catch (error) {
            toast.error('Erè pandan sipresyon garanti a');
        }
    };

    const handleSubmit = async () => {
        if (!formData.name) {
            toast.error('Tanpri mete yon non pou garanti a');
            return;
        }

        try {
            if (editingWarranty) {
                await warrantyService.update(editingWarranty.id, formData);
                toast.success('Garanti modifye avèk siksè');
            } else {
                await warrantyService.create(formData);
                toast.success('Garanti ajoute avèk siksè');
            }
            setIsDialogOpen(false);
            fetchWarranties();
        } catch (error) {
            toast.error('Erè pandan anrejistreman garanti a');
        }
    };

    const filteredWarranties = warranties.filter(w =>
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full gap-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">Gestion Garanties</h1>
                    <p className="text-sm text-muted-foreground">Jere plan garanti pou pwodwi ou yo</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-primary" title="Refresh" onClick={fetchWarranties}>
                        <RotateCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-primary' : ''}`} />
                    </Button>
                    <Button onClick={handleOpenAddDialog} className="bg-primary hover:bg-primary/90 text-white gap-2">
                        <Plus className="h-4 w-4" />
                        <span>Ajoute Garanti</span>
                    </Button>
                </div>
            </div>

            {/* Content Body */}
            <Card className="flex-1 bg-muted border border-border text-foreground overflow-hidden flex flex-col">
                <CardContent className="p-0 flex flex-col h-full">
                    {/* Search Bar */}
                    <div className="p-4 border-b border-border bg-background">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechèch garanti..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
                            />
                        </div>
                    </div>

                    {/* Table View */}
                    <div className="flex-1 overflow-auto rounded-lg m-4 border border-border bg-background">
                        <Table>
                            <TableHeader className="bg-background">
                                <TableRow className="hover:bg-transparent border-border">
                                    <TableHead className="text-foreground w-[250px]">Non Plan</TableHead>
                                    <TableHead className="text-foreground">Dire</TableHead>
                                    <TableHead className="text-foreground">Kalite</TableHead>
                                    <TableHead className="text-foreground">Deskripsyon</TableHead>
                                    <TableHead className="text-right text-foreground">Aksyon</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                            <div className="flex items-center justify-center gap-2">
                                                <RotateCw className="h-6 w-6 animate-spin text-primary" />
                                                <span>Chaje...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredWarranties.length > 0 ? (
                                    filteredWarranties.map((warranty) => (
                                        <TableRow key={warranty.id} className="hover:bg-muted transition-colors border-border group">
                                            <TableCell className="font-medium text-foreground">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                                                        <ShieldCheck className="h-4 w-4" />
                                                    </div>
                                                    {warranty.name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-foreground">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                                    {warranty.duration} {warranty.durationUnit}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${warranty.type === 'replacement'
                                                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                    }`}>
                                                    {warranty.type}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground max-w-[200px] truncate">
                                                {warranty.description || '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(warranty)} className="h-8 w-8 text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent className="bg-background border-border text-foreground">
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Konfime Sipresyon</AlertDialogTitle>
                                                                <AlertDialogDescription className="text-muted-foreground">
                                                                    Èske ou sèten ou vle efase plan garanti "{warranty.name}" sa a? Ou pap ka retounen dèyè.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel className="bg-transparent border-border text-foreground hover:bg-muted">Anile</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete(warranty.id)} className="bg-rose-500 hover:bg-rose-600 border-none">Efase</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground italic">
                                            Okenn plan garanti pa disponib
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-background border-border text-foreground sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingWarranty ? 'Modifye Garanti' : 'Ajoute yon Nouvo Garanti'}</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Mete detay pou plan garanti sa a. Plan sa yo ap parèt nan list le wap ajoute pwodwi.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Non Plan an <span className="text-rose-500">*</span></Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="bg-muted border-border focus-visible:ring-ring"
                                placeholder="Egz: Garanti Standard 1 An"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="duration">Dire</Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                                    className="bg-muted border-border focus-visible:ring-ring"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="unit">Inite</Label>
                                <Select
                                    value={formData.durationUnit}
                                    onValueChange={(val) => setFormData({ ...formData, durationUnit: val })}
                                >
                                    <SelectTrigger className="bg-muted border-border focus:ring-ring/50">
                                        <SelectValue placeholder="Mwa" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-background border-border text-foreground">
                                        <SelectItem value="days">Jou</SelectItem>
                                        <SelectItem value="months">Mwa</SelectItem>
                                        <SelectItem value="years">Ane</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="type">Kalite Garanti</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(val) => setFormData({ ...formData, type: val })}
                            >
                                <SelectTrigger className="bg-muted border-border focus:ring-ring/50">
                                    <SelectValue placeholder="Chwazi kalite..." />
                                </SelectTrigger>
                                <SelectContent className="bg-background border-border text-foreground">
                                    <SelectItem value="service">Service (Reparasyon)</SelectItem>
                                    <SelectItem value="replacement">Replacement (Echanj)</SelectItem>
                                    <SelectItem value="limited">Limited (Limite)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Deskripsyon (Optional)</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="bg-muted border-border focus-visible:ring-ring min-h-[80px]"
                                placeholder="Kisa garanti sa a kouvri..."
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-foreground hover:bg-muted">Anile</Button>
                        <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-white">
                            {editingWarranty ? 'Soumèt Mizajou' : 'Kreye Garanti'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default WarrantyPage;