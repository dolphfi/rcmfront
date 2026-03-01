import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "../ui/avatar"
import { Button } from "../ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { useTranslation } from "react-i18next"
import { useAuth } from "../../context/AuthContext"
import { User, Settings, LogOut } from "lucide-react"

export function UserNav() {
    const { t } = useTranslation();
    const { user, logout } = useAuth();

    if (!user) return null;

    const initials = `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full border border-white/10 hover:bg-white/10 transition-colors">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatarUrl} alt={`${user.firstName} ${user.lastName}`} />
                        <AvatarFallback className="bg-orange-500/10 text-orange-500 font-bold text-xs">
                            {initials || 'U'}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 bg-slate-900/95 backdrop-blur-xl border-white/10 text-slate-400 p-2" align="end" forceMount shadow-2xl>
                <DropdownMenuLabel className="font-normal p-2">
                    <div className="flex flex-col space-y-2">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-white/10">
                                <AvatarImage src={user.avatarUrl} alt={`${user.firstName} ${user.lastName}`} />
                                <AvatarFallback className="bg-orange-500/10 text-orange-500 font-bold">
                                    {initials || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <p className="text-sm font-semibold leading-none text-white">{user.firstName} {user.lastName}</p>
                                <p className="text-[10px] mt-1 text-orange-500 font-bold uppercase tracking-widest">{user.role?.label}</p>
                            </div>
                        </div>
                        <p className="text-xs leading-none text-slate-500 pt-1 border-t border-white/5">
                            {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10 my-2" />
                <DropdownMenuGroup>
                    <DropdownMenuItem className="flex items-center gap-2 p-2 focus:bg-white/10 focus:text-white cursor-pointer rounded-lg transition-colors group">
                        <User className="h-4 w-4 text-slate-500 group-focus:text-orange-500 transition-colors" />
                        <span className="flex-1">{t('common.profile')}</span>
                        <DropdownMenuShortcut className="text-[10px] opacity-50">⇧⌘P</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2 p-2 focus:bg-white/10 focus:text-white cursor-pointer rounded-lg transition-colors group">
                        <Settings className="h-4 w-4 text-slate-500 group-focus:text-orange-500 transition-colors" />
                        <span className="flex-1">{t('common.settings')}</span>
                        <DropdownMenuShortcut className="text-[10px] opacity-50">⌘S</DropdownMenuShortcut>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-white/10 my-2" />
                <DropdownMenuItem onClick={logout} className="flex items-center gap-2 p-2 text-red-400 focus:bg-red-400/10 focus:text-red-400 cursor-pointer rounded-lg transition-colors group">
                    <LogOut className="h-4 w-4 text-red-400/50 group-focus:text-red-400 transition-colors" />
                    <span className="flex-1 font-medium">{t('common.logout')}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
