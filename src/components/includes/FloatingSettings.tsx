import { Button } from "../../components/ui/button";
import { Settings, Languages, Check } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "../../components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";

export function FloatingSettings() {
    const { i18n, t } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const languages = [
        { code: 'ht', name: 'Kreyòl', flag: '🇭🇹' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'en', name: 'English', flag: '🇺🇸' },
    ];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    size="icon"
                    className="hidden md:flex fixed right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-orange-500 hover:bg-orange-600 shadow-xl z-50 transition-transform hover:scale-110 group border-2 border-white/20"
                >
                    <div className="relative">
                        <Settings className="h-6 w-6 text-white animate-spin-slow group-hover:opacity-0 transition-opacity" />
                        <Languages className="h-6 w-6 text-white absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-slate-900/95 border-slate-800 backdrop-blur-md text-white">
                <DropdownMenuLabel className="text-slate-400 font-medium">
                    {t('common.language') || 'Language / Lang / Langue'}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-800" />
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className="flex items-center justify-between cursor-pointer focus:bg-white/10 focus:text-white"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-lg">{lang.flag}</span>
                            <span>{lang.name}</span>
                        </div>
                        {i18n.language === lang.code && <Check className="h-4 w-4 text-orange-500" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
