import { Button } from "../ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { useTranslation } from "react-i18next"

const languages = [
    { name: "Kreyòl", code: "ht", flag: "https://flagcdn.com/ht.svg" },
    { name: "English", code: "en", flag: "https://flagcdn.com/us.svg" },
    { name: "Français", code: "fr", flag: "https://flagcdn.com/fr.svg" },
]

const Language = () => {
    const { i18n } = useTranslation()

    const currentLanguage = languages.find(l => l.code === i18n.language) || languages[0]

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng)
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-4 w-4 rounded-full overflow-hidden p-0 hover:bg-white/10">
                    <img
                        src={currentLanguage.flag}
                        alt={currentLanguage.name}
                        className="h-full w-full object-cover"
                    />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40 bg-black/80 backdrop-blur-xl border-white/10 text-slate-400" align="end" forceMount>
                <DropdownMenuGroup>
                    {languages.map((lang) => (
                        <DropdownMenuItem
                            key={lang.code}
                            onClick={() => changeLanguage(lang.code)}
                            className="flex items-center gap-2 cursor-pointer focus:bg-white/10 focus:text-white"
                        >
                            <img
                                src={lang.flag}
                                alt={lang.name}
                                className="h-4 w-6 object-cover rounded-sm"
                            />
                            <span className={i18n.language === lang.code ? "text-white font-medium" : ""}>
                                {lang.name}
                            </span>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
export default Language
