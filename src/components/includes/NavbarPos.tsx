import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import {
    Calculator,
    Maximize,
    Clock,
    Monitor,
    BanknoteArrowUp,
    Calendar
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import { category, categoryServices } from '../../context/data/dataCategory';
import { UserNav } from './UserAvatar';
import settingsService from '../../context/api/settingsService';
import { useAuth } from '../../context/AuthContext';
import posService from '../../context/api/posservice';

interface NavbarPosProps {
    sellType: string;
    setSellType: (type: string) => void;
}

export default function NavbarPos({ sellType, setSellType }: NavbarPosProps) {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [calculatorOpen, setCalculatorOpen] = useState(false);
    const [display, setDisplay] = useState('0');
    const [previousValue, setPreviousValue] = useState<string | null>(null);
    const [operation, setOperation] = useState<string | null>(null);

    const [businessName, setBusinessName] = useState('Kolabo POS');
    const [logoUrl, setLogoUrl] = useState('');
    const [posName, setPosName] = useState('Main POS');
    const { user } = useAuth();

    useEffect(() => {
        const fetchNavbarSettings = async () => {
            try {
                const response = await settingsService.getAll();
                const data = response.data;
                const name = data.find((s: any) => s.key === 'BUSINESS_NAME')?.value;
                const logo = data.find((s: any) => s.key === 'BUSINESS_LOGO_URL')?.value;

                if (name) setBusinessName(name);
                if (logo) setLogoUrl(logo);
            } catch (error) {
                console.error("Error fetching navbar settings:", error);
            }
        };
        fetchNavbarSettings();

        const fetchPosName = async () => {
            if (user?.posId) {
                try {
                    const posData = await posService.getById(user.posId);
                    if (posData && posData.name) {
                        setPosName(posData.name);
                    }
                } catch (error) {
                    console.error("Error fetching POS details:", error);
                }
            }
        };

        fetchPosName();

        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, [user?.posId]);

    // Auto-switch logic
    useEffect(() => {
        const hasProducts = category.length > 0;
        const hasServices = categoryServices.length > 0;

        // If currently on Product but no products available, and services exist -> switch to Service
        if (sellType === 'Product' && !hasProducts && hasServices) {
            setSellType('Service');
        }
        // If currently on Service but no services available, and products exist -> switch to Product
        else if (sellType === 'Service' && !hasServices && hasProducts) {
            setSellType('Product');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category, categoryServices, sellType, setSellType]);

    // Calculator functions
    const handleNumber = (num: string) => {
        if (display === '0') {
            setDisplay(num);
        } else {
            setDisplay(display + num);
        }
    };

    const handleOperation = (op: string) => {
        setPreviousValue(display);
        setOperation(op);
        setDisplay('0');
    };

    const handleEquals = () => {
        if (previousValue && operation) {
            const prev = parseFloat(previousValue);
            const current = parseFloat(display);
            let result = 0;

            switch (operation) {
                case '+':
                    result = prev + current;
                    break;
                case '-':
                    result = prev - current;
                    break;
                case '×':
                    result = prev * current;
                    break;
                case '÷':
                    result = prev / current;
                    break;
            }

            setDisplay(result.toString());
            setPreviousValue(null);
            setOperation(null);
        }
    };

    const handleClear = () => {
        setDisplay('0');
        setPreviousValue(null);
        setOperation(null);
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('fr-HT', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('fr-HT', {
            year: 'numeric',
            month: 'short',
            day: '2-digit'
        });
    };

    return (
        <div className="bg-black/40 backdrop-blur-xl border-b border-white/10 text-white">
            <div className="flex h-16 items-center px-2 sm:px-4 justify-between gap-2">
                {/* Left Section - Logo & Clock */}
                <div className="flex items-center gap-2 sm:gap-4">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        {logoUrl ? (
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white/5 border border-white/10 p-1 flex items-center justify-center overflow-hidden">
                                <img src={logoUrl} alt="Logo" className="h-full w-full object-contain" />
                            </div>
                        ) : (
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-base sm:text-lg">
                                    {businessName.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                        <span className="text-lg sm:text-xl font-bold text-white hidden md:block">
                            {businessName}
                        </span>
                    </div>

                    {/* Clock */}
                    <div className="flex items-center gap-1.5 sm:gap-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 backdrop-blur-sm">
                        <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400 animate-pulse" />
                        <span className="text-emerald-400 font-mono text-xs sm:text-sm font-semibold">
                            {formatTime(currentTime)}
                        </span>
                        <div className="h-4 w-px bg-emerald-400"></div>
                        <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400 animate-pulse " />
                        <span className="text-emerald-400 font-mono text-xs sm:text-sm font-semibold">
                            {formatDate(currentTime)}
                        </span>
                    </div>
                </div>

                {/* Right Section - Actions */}
                <div className="flex items-center gap-1 sm:gap-2">
                    {/* POS point */}
                    <div className="hidden lg:flex items-center gap-2 bg-white/5 px-3 h-9 rounded-lg border border-white/10">
                        <Monitor className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-400 font-mono text-sm">{posName}</span>
                    </div>

                    {/* Sell type Selector */}
                    {(category.length > 0 || categoryServices.length > 0) && (
                        <Select value={sellType} onValueChange={setSellType}>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white h-9 w-20 sm:w-28 text-xs sm:text-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900/95 backdrop-blur-xl border-white/10 text-white">
                                {category.length > 0 && (
                                    <SelectItem value="Product" className="focus:bg-white/10 focus:text-white cursor-pointer">
                                        Product
                                    </SelectItem>
                                )}
                                {categoryServices.length > 0 && (
                                    <SelectItem value="Service" className="focus:bg-white/10 focus:text-white cursor-pointer">
                                        Service
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    )}

                    {/* Action Icons */}
                    <div className="flex items-center gap-0.5 sm:gap-1 bg-white/5 p-0.5 sm:p-1 rounded-lg border border-white/10">
                        <Button variant="ghost" size="icon" onClick={() => setCalculatorOpen(true)} className="h-7 w-7 sm:h-8 sm:w-8 text-slate-400 hover:bg-white/10 hover:text-white" title="Calculator">
                            <Calculator className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                if (!document.fullscreenElement) {
                                    document.documentElement.requestFullscreen();
                                } else {
                                    document.exitFullscreen();
                                }
                            }}
                            className="h-7 w-7 sm:h-8 sm:w-8 text-slate-400 hover:bg-white/10 hover:text-white"
                            title="Fullscreen"
                        >
                            <Maximize className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="hidden sm:flex h-8 w-8 text-slate-400 hover:bg-white/10 hover:text-white" title="Profit">
                            <BanknoteArrowUp className="h-4 w-4" />
                        </Button>
                    </div>
                    {/* User Avatar */}
                    <div className="hidden sm:block">
                        <UserNav />
                    </div>
                </div>
            </div>

            {/* Calculator Dialog */}
            <Dialog open={calculatorOpen} onOpenChange={setCalculatorOpen}>
                <DialogContent className="bg-slate-900/95 backdrop-blur-xl border-white/20 text-white max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-white text-xl">Calculator</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Display */}
                        <div className="bg-slate-800/50 border border-white/10 rounded-lg p-4 text-right">
                            <div className="text-slate-400 text-sm h-6">{previousValue && operation ? `${previousValue} ${operation}` : ''}</div>
                            <div className="text-white text-3xl font-bold truncate">{display}</div>
                        </div>

                        {/* Buttons Grid */}
                        <div className="grid grid-cols-4 gap-2">
                            {/* Row 1 */}
                            <Button onClick={handleClear} className="h-14 bg-red-600 hover:bg-red-700 text-white font-bold text-lg">C</Button>
                            <Button onClick={() => handleOperation('÷')} className="h-14 bg-slate-700 hover:bg-slate-600 text-white font-bold text-lg">÷</Button>
                            <Button onClick={() => handleOperation('×')} className="h-14 bg-slate-700 hover:bg-slate-600 text-white font-bold text-lg">×</Button>
                            <Button onClick={() => handleOperation('-')} className="h-14 bg-slate-700 hover:bg-slate-600 text-white font-bold text-lg">-</Button>

                            {/* Row 2 */}
                            <Button onClick={() => handleNumber('7')} className="h-14 bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg">7</Button>
                            <Button onClick={() => handleNumber('8')} className="h-14 bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg">8</Button>
                            <Button onClick={() => handleNumber('9')} className="h-14 bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg">9</Button>
                            <Button onClick={() => handleOperation('+')} className="h-14 bg-slate-700 hover:bg-slate-600 text-white font-bold text-lg row-span-2">+</Button>

                            {/* Row 3 */}
                            <Button onClick={() => handleNumber('4')} className="h-14 bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg">4</Button>
                            <Button onClick={() => handleNumber('5')} className="h-14 bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg">5</Button>
                            <Button onClick={() => handleNumber('6')} className="h-14 bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg">6</Button>

                            {/* Row 4 */}
                            <Button onClick={() => handleNumber('1')} className="h-14 bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg">1</Button>
                            <Button onClick={() => handleNumber('2')} className="h-14 bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg">2</Button>
                            <Button onClick={() => handleNumber('3')} className="h-14 bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg">3</Button>
                            <Button onClick={handleEquals} className="h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg row-span-2">=</Button>

                            {/* Row 5 */}
                            <Button onClick={() => handleNumber('0')} className="h-14 bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg col-span-2">0</Button>
                            <Button onClick={() => handleNumber('.')} className="h-14 bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg">.</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}