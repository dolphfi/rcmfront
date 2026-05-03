import React, { useEffect, useState, useCallback } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "components/ui/card";
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
import { 
    Plus, 
    Search, 
    Calendar as CalendarIcon, 
    Trash2, 
    Receipt, 
    Wallet,
    RotateCw,
    Building2,
    DollarSign,
    Tag,
    FileText,
    Loader2
} from "lucide-react";
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { toast } from 'sonner';
import expenseService, { CreateExpenseData } from 'context/api/expenseService';
import posService from 'context/api/posservice';
import { useSettings } from 'context/SettingsContext';
import { useAuth } from 'context/AuthContext';
import { UserRoleName } from 'context/types/auth';
import { Badge } from 'components/ui/badge';

const Expenses: React.FC = () => {
    const { user } = useAuth();
    const { currency } = useSettings();
    const [expenses, setExpenses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [posList, setPosList] = useState<any[]>([]);
    
    // Filter states
    const [selectedPos, setSelectedPos] = useState<string>(user?.posId || "all");
    const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

    // Form states
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newExpense, setNewExpense] = useState<Partial<CreateExpenseData>>({
        description: "",
        amount: 0,
        date: format(new Date(), 'yyyy-MM-dd'),
        category: "General",
        posId: user?.posId || ""
    });

    const isAdmin = user?.role?.name === UserRoleName.SUPER_ADMIN || user?.role?.name === UserRoleName.ADMIN;

    const fetchExpenses = useCallback(async () => {
        setIsLoading(true);
        try {
            const posIdParam = selectedPos === "all" ? undefined : selectedPos;
            const data = await expenseService.findAll(posIdParam, startDate, endDate);
            setExpenses(data);
        } catch (error) {
            console.error('Error fetching expenses:', error);
            toast.error("Erè pandan n ap chaje depans yo");
        } finally {
            setIsLoading(false);
        }
    }, [selectedPos, startDate, endDate]);

    const fetchPosList = useCallback(async () => {
        if (!isAdmin) return;
        try {
            const data = await posService.getAll(1, 100);
            setPosList(Array.isArray(data) ? data : (data as any).data || []);
        } catch (error) {
            console.error('Error fetching POS list:', error);
        }
    }, [isAdmin]);

    useEffect(() => {
        fetchExpenses();
        fetchPosList();
    }, [fetchExpenses, fetchPosList]);

    const handleCreateExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newExpense.description || !newExpense.amount || !newExpense.posId) {
            toast.error("Tanpri ranpli tout chan obligatwa yo");
            return;
        }

        setIsSubmitting(true);
        try {
            await expenseService.create(newExpense as CreateExpenseData);
            toast.success("Depans lan anrejistre ak siksè");
            setIsAddDialogOpen(false);
            setNewExpense({
                description: "",
                amount: 0,
                date: format(new Date(), 'yyyy-MM-dd'),
                category: "General",
                posId: user?.posId || ""
            });
            fetchExpenses();
        } catch (error) {
            console.error('Error creating expense:', error);
            toast.error("Erè pandan n ap sove depans lan");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteExpense = async (id: string) => {
        if (!window.confirm("Èske ou sèten ou vle efase depans sa a?")) return;
        
        try {
            await expenseService.remove(id);
            toast.success("Depans lan efase");
            fetchExpenses();
        } catch (error) {
            console.error('Error deleting expense:', error);
            toast.error("Erè pandan n ap efase depans lan");
        }
    };

    const filteredExpenses = expenses.filter(exp => 
        exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalExpenses = filteredExpenses.reduce((acc, exp) => acc + Number(exp.amount), 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                        <Wallet className="h-8 w-8 text-rose-500" />
                        Jesyon Depans
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Swiv ak jere tout depans biznis lan</p>
                </div>
                
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-rose-600 hover:bg-rose-700 text-white gap-2">
                            <Plus className="h-4 w-4" /> Anrejistre yon Depans
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-white/10 text-white max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                <Receipt className="h-5 w-5 text-rose-500" />
                                Nouvo Depans
                            </DialogTitle>
                            <DialogDescription className="text-slate-400">
                                Antre detay depans ou vle anrejistre a.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <form onSubmit={handleCreateExpense} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label className="text-slate-300">Deskripsyon <span className="text-rose-500">*</span></Label>
                                <Input 
                                    className="bg-slate-800 border-white/10 text-white"
                                    placeholder="Egz: Peman kouran, Lwaye..."
                                    value={newExpense.description}
                                    onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                                    required
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Montant <span className="text-rose-500">*</span></Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                        <Input 
                                            type="number"
                                            className="bg-slate-800 border-white/10 text-white pl-9"
                                            placeholder="0.00"
                                            value={newExpense.amount || ''}
                                            onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value)})}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Dat <span className="text-rose-500">*</span></Label>
                                    <Input 
                                        type="date"
                                        className="bg-slate-800 border-white/10 text-white"
                                        value={newExpense.date}
                                        onChange={e => setNewExpense({...newExpense, date: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Kategori</Label>
                                    <Select 
                                        value={newExpense.category} 
                                        onValueChange={val => setNewExpense({...newExpense, category: val})}
                                    >
                                        <SelectTrigger className="bg-slate-800 border-white/10 text-white">
                                            <SelectValue placeholder="Chwazi kategori" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-white/10 text-white">
                                            <SelectItem value="General">General</SelectItem>
                                            <SelectItem value="Lwaye">Lwaye (Rent)</SelectItem>
                                            <SelectItem value="Kouran">Kouran (Electricity)</SelectItem>
                                            <SelectItem value="Dlo">Dlo (Water)</SelectItem>
                                            <SelectItem value="Salè">Salè (Salary)</SelectItem>
                                            <SelectItem value="Transpò">Transpò</SelectItem>
                                            <SelectItem value="Lòt">Lòt</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Point de Vente <span className="text-rose-500">*</span></Label>
                                    <Select 
                                        value={newExpense.posId} 
                                        onValueChange={val => setNewExpense({...newExpense, posId: val})}
                                        disabled={!isAdmin}
                                    >
                                        <SelectTrigger className="bg-slate-800 border-white/10 text-white">
                                            <SelectValue placeholder="Chwazi POS" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-white/10 text-white">
                                            {isAdmin ? (
                                                posList.map(pos => (
                                                    <SelectItem key={pos.id} value={pos.id}>{pos.name}</SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value={user?.posId || ""}>Pwen de Vant Mwen</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            
                            <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-700 text-white mt-4" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Ap anrejistre...
                                    </>
                                ) : (
                                    "Anrejistre Depans lan"
                                )}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-slate-900/50 border-white/10 backdrop-blur-xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-400">Total Depans</CardTitle>
                        <Wallet className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{totalExpenses.toLocaleString()} {currency}</div>
                        <p className="text-xs text-slate-500 mt-1">Pou peryòd chwazi a</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/50 border-white/10 backdrop-blur-xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-400">Kantite Depans</CardTitle>
                        <FileText className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{filteredExpenses.length}</div>
                        <p className="text-xs text-slate-500 mt-1">Tranzaksyon depans</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/50 border-white/10 backdrop-blur-xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-400">Mwayèn/Depans</CardTitle>
                        <Tag className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {filteredExpenses.length > 0 ? (totalExpenses / filteredExpenses.length).toLocaleString() : 0} {currency}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Valè mwayèn yon depans</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="bg-slate-900/50 border-white/10 backdrop-blur-xl overflow-hidden">
                <CardContent className="p-4 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <Input 
                            placeholder="Chache pa deskripsyon oswa kategori..." 
                            className="bg-slate-800 border-white/10 text-white pl-10"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 bg-slate-800 rounded-md px-3 border border-white/10">
                            <CalendarIcon className="h-4 w-4 text-slate-500" />
                            <Input 
                                type="date"
                                className="bg-transparent border-none text-white text-xs h-9 p-0"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                            />
                            <span className="text-slate-500">al nan</span>
                            <Input 
                                type="date"
                                className="bg-transparent border-none text-white text-xs h-9 p-0"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                            />
                        </div>
                        
                        {isAdmin && (
                            <Select value={selectedPos} onValueChange={setSelectedPos}>
                                <SelectTrigger className="w-[180px] bg-slate-800 border-white/10 text-white">
                                    <Building2 className="h-4 w-4 mr-2 text-slate-500" />
                                    <SelectValue placeholder="Point de Vente" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/10 text-white">
                                    <SelectItem value="all">Tout POS yo</SelectItem>
                                    {posList.map(pos => (
                                        <SelectItem key={pos.id} value={pos.id}>{pos.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        
                        <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => fetchExpenses()}>
                            <RotateCw className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Expenses Table */}
            <Card className="bg-slate-900/50 border-white/10 backdrop-blur-xl overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-800/50">
                                <TableRow className="border-white/5 hover:bg-transparent">
                                    <TableHead className="text-slate-400 font-medium h-12">Dat</TableHead>
                                    <TableHead className="text-slate-400 font-medium h-12">Deskripsyon</TableHead>
                                    <TableHead className="text-slate-400 font-medium h-12">Kategori</TableHead>
                                    <TableHead className="text-slate-400 font-medium h-12">Point de Vente</TableHead>
                                    <TableHead className="text-slate-400 font-medium h-12">Anrejistre pa</TableHead>
                                    <TableHead className="text-slate-400 font-medium h-12 text-right">Montant</TableHead>
                                    <TableHead className="text-slate-400 font-medium h-12 text-center">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow className="border-white/5">
                                        <TableCell colSpan={7} className="h-32 text-center">
                                            <div className="flex items-center justify-center gap-2 text-slate-400">
                                                <RotateCw className="h-5 w-5 animate-spin" />
                                                Loading expenses...
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredExpenses.length === 0 ? (
                                    <TableRow className="border-white/5">
                                        <TableCell colSpan={7} className="h-32 text-center text-slate-500 italic">
                                            Pa gen okenn depans ki jwenn pou peryòd sa a.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredExpenses.map((expense) => (
                                        <TableRow key={expense.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                                            <TableCell className="text-slate-300">
                                                {format(new Date(expense.date), 'dd/MM/yyyy')}
                                            </TableCell>
                                            <TableCell className="font-medium text-white">
                                                {expense.description}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-slate-800/50 border-white/10 text-slate-300 capitalize">
                                                    {expense.category || "General"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-slate-400 text-xs">
                                                {expense.pos?.name || 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-slate-400 text-xs">
                                                {expense.user ? `${expense.user.firstName} ${expense.user.lastName}` : 'System'}
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-rose-400">
                                                {Number(expense.amount).toLocaleString()} {currency}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10"
                                                    onClick={() => handleDeleteExpense(expense.id)}
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
                </CardContent>
            </Card>
        </div>
    );
};

export default Expenses;
