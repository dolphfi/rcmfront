import * as React from "react"
import { cn } from "../../lib/utils"
import { Button } from "../../components/ui/button"
import {
    LayoutDashboard,
    Users,
    LucideIcon,
    Lock,
    Activity,
    Monitor,
    ShoppingCart,
    Package,
    Layers,
    Megaphone,
    Gift,
    Percent,
    Settings,
    Store,
    Receipt,
    ClockFading,
    Tags,
    LayoutList,
    ShieldCheck,
    History,
    ReceiptText,
    CornerDownLeft,
    ShoppingBasket,
    ShoppingBag,
    HandCoins,
    FileStack,
    Book,
    ChartLine,
    MonitorCog,
    FileText,
    Toolbox
} from "lucide-react"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "../../components/ui/tooltip"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "../../components/ui/accordion"
import { Link } from "react-router-dom"
import { useSidebar } from "../layout/SidebarContext";
import { useTranslation } from "react-i18next";
import { Settings as SettingsIcon } from "lucide-react";
import settingsService from '../../context/api/settingsService';


interface SidebarItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon: LucideIcon
    label: string
    isSidebarOpen: boolean
    isActive?: boolean
    expanded?: boolean
    href?: string
}

const SidebarItem = ({ icon: Icon, label, isSidebarOpen, isActive, className, href, ...props }: SidebarItemProps) => {
    const { isMobile, closeSidebar } = useSidebar();


    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (props.onClick) props.onClick(e);
        if (isMobile && href) {
            closeSidebar();
        }
    }

    const buttonContent = (
        <>
            <Icon className={cn("h-4 w-4", isSidebarOpen ? "mr-2" : "")} />
            {isSidebarOpen && <span>{label}</span>}
            {!isSidebarOpen && <span className="sr-only">{label}</span>}
        </>
    )

    const buttonClasses = cn(
        "w-full justify-start hover:bg-white/10 hover:text-white",
        !isSidebarOpen && "justify-center px-2",
        isActive && "bg-white/10 text-white",
        isSidebarOpen ? "pl-4" : "",
        className
    )

    if (href) {
        return (
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        className={buttonClasses}
                        asChild
                        onClick={handleClick}
                        {...props}
                    >
                        <Link to={href}>
                            {buttonContent}
                        </Link>
                    </Button>
                </TooltipTrigger>
                {!isSidebarOpen && (
                    <TooltipContent side="right" className="flex items-center gap-4">
                        {label}
                    </TooltipContent>
                )}
            </Tooltip>
        )
    }

    return (
        <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
                <Button
                    variant="ghost"
                    className={buttonClasses}
                    onClick={handleClick}
                    {...props}
                >
                    {buttonContent}
                </Button>
            </TooltipTrigger>
            {!isSidebarOpen && (
                <TooltipContent side="right" className="flex items-center gap-4">
                    {label}
                </TooltipContent>
            )}
        </Tooltip>
    )
}
export function Sidebar({ className }: React.HTMLAttributes<HTMLDivElement>) {
    const { t } = useTranslation();
    const { isSidebarOpen, toggleSidebar, isMobile, closeSidebar } = useSidebar();
    const [openAccordion, setOpenAccordion] = React.useState<string>("");
    const [businessName, setBusinessName] = React.useState('Kolabo POS');
    const [logoUrl, setLogoUrl] = React.useState('');

    React.useEffect(() => {
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
    }, []);

    React.useEffect(() => {
        if (!isSidebarOpen) {
            setOpenAccordion("");
        }
    }, [isSidebarOpen]);

    const handleAccordionTriggerClick = () => {
        if (!isSidebarOpen) {
            toggleSidebar();
        }
    };

    const handleLinkClick = () => {
        if (isMobile) closeSidebar();
    };

    const sidebarContent = (
        <div className={cn(
            "sidebar-container no-print bg-black/40 backdrop-blur-xl border-r border-white/10 text-white h-full transition-all duration-300 flex flex-col",
            isMobile
                ? cn("fixed inset-y-0 left-0 z-50 w-64", !isSidebarOpen && "-translate-x-full")
                : cn("relative", isSidebarOpen ? "w-64" : "w-20"),
            className
        )}>
            <div className={cn("h-16 flex items-center border-b border-white/10 shrink-0", isSidebarOpen ? "px-6" : "px-0 justify-center")}>
                {logoUrl ? (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white/5 border border-white/10 p-1 flex items-center justify-center overflow-hidden">
                        <img src={logoUrl} alt="Logo" className="h-full w-full object-contain" />
                    </div>
                ) : (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-base sm:text-lg">
                            {<img src='/logo.jpeg' alt="Logo" className="h-full w-full object-contain" />}
                        </span>
                    </div>
                )}
                {isSidebarOpen && (
                    <h2 className="text-lg font-semibold tracking-tight ml-2 text-white mr-auto">
                        <span className="text-lg sm:text-xl font-bold text-white hidden md:block">
                            {businessName || 'KOLABO POS'}
                        </span>
                    </h2>
                )}
            </div>

            <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <div className="px-3 py-2">
                    {isSidebarOpen && (
                        <h3 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-white/50">
                            {t('sidebar.general')}
                        </h3>
                    )}
                    <div className="space-y-1">
                        <SidebarItem icon={LayoutDashboard} label={t('sidebar.dashboard')} href="/dashboard" isSidebarOpen={isSidebarOpen} />
                    </div>
                </div>


                {/* Module Produits */}
                <div className="px-3 py-2">
                    {isSidebarOpen && (
                        <h3 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-white/50">
                            {t('sidebar.inventory')}
                        </h3>
                    )}
                    <div className="space-y-1">
                        <Accordion type="single" collapsible className="w-full" value={openAccordion} onValueChange={setOpenAccordion}>
                            <AccordionItem value="produits" className="border-b-0">
                                <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                        <AccordionTrigger
                                            className={cn(
                                                "py-2 hover:bg-white/10 hover:text-white hover:no-underline rounded-md px-4 text-sm font-medium",
                                                !isSidebarOpen && "justify-center px-2 [&>svg]:hidden"
                                            )}
                                            onClick={handleAccordionTriggerClick}
                                        >
                                            <div className="flex items-center">
                                                <Package className={cn("h-4 w-4", isSidebarOpen ? "mr-2" : "")} />
                                                {isSidebarOpen && <span>{t('sidebar.products')}</span>}
                                            </div>
                                        </AccordionTrigger>
                                    </TooltipTrigger>
                                    {!isSidebarOpen && (
                                        <TooltipContent side="right" className="flex items-center gap-4">
                                            {t('sidebar.products')}
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                                <AccordionContent className="pb-0 pl-10">
                                    <div className="space-y-1 mt-1">
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-8 hover:bg-white/10 hover:text-white" asChild onClick={handleLinkClick}>
                                            <Link to="/products">
                                                <Package className="mr-2 h-4 w-4" />
                                                {t('sidebar.all_products')}
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-8 hover:bg-white/10 hover:text-white" asChild onClick={handleLinkClick}>
                                            <Link to="/products/expired">
                                                <ClockFading className="mr-2 h-4 w-4" />
                                                {t('sidebar.expired_products')}
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-8 hover:bg-white/10 hover:text-white" asChild onClick={handleLinkClick}>
                                            <Link to="/category">
                                                <LayoutList className="mr-2 h-4 w-4" />
                                                {t('sidebar.categories')}
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-8 hover:bg-white/10 hover:text-white" asChild onClick={handleLinkClick}>
                                            <Link to="/brand">
                                                <Tags className="mr-2 h-4 w-4" />
                                                {t('sidebar.brands')}
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-8 hover:bg-white/10 hover:text-white" asChild onClick={handleLinkClick}>
                                            <Link to="/stock">
                                                <Layers className="mr-2 h-4 w-4" />
                                                {t('sidebar.stock')}
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-8 hover:bg-white/10 hover:text-white" asChild onClick={handleLinkClick}>
                                            <Link to="/warranty">
                                                <ShieldCheck className="mr-2 h-4 w-4" />
                                                {t('sidebar.warranty')}
                                            </Link>
                                        </Button>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                    <div className="space-y-1">
                        <Accordion type="single" collapsible className="w-full" value={openAccordion} onValueChange={setOpenAccordion}>
                            <AccordionItem value="services" className="border-b-0">
                                <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                        <AccordionTrigger
                                            className={cn(
                                                "py-2 hover:bg-white/10 hover:text-white hover:no-underline rounded-md px-4 text-sm font-medium",
                                                !isSidebarOpen && "justify-center px-2 [&>svg]:hidden"
                                            )}
                                            onClick={handleAccordionTriggerClick}
                                        >
                                            <div className="flex items-center">
                                                <Toolbox className={cn("h-4 w-4", isSidebarOpen && "mr-2")} />
                                                {isSidebarOpen && t('sidebar.services')}
                                            </div>
                                        </AccordionTrigger>
                                    </TooltipTrigger>
                                    {!isSidebarOpen && (
                                        <TooltipContent side="right" className="flex items-center gap-4">
                                            {t('sidebar.services')}
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                                <AccordionContent className="pb-0 pl-10">
                                    <div className="space-y-1 mt-1">
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-8 hover:bg-white/10 hover:text-white" asChild onClick={handleLinkClick}>
                                            <Link to="/services">
                                                <Toolbox className="mr-2 h-4 w-4" />
                                                {t('sidebar.all_services')}
                                            </Link>
                                        </Button>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </div>

                {/* Module Vente (POS) */}
                <div className="px-3 py-2">
                    {isSidebarOpen && (
                        <h3 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-white/50">
                            {t('sidebar.sales')}
                        </h3>
                    )}
                    <div className="space-y-1">
                        <Accordion type="single" collapsible className="w-full" value={openAccordion} onValueChange={setOpenAccordion}>
                            <AccordionItem value="vente" className="border-b-0">
                                <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                        <AccordionTrigger
                                            className={cn(
                                                "py-2 hover:bg-white/10 hover:text-white hover:no-underline rounded-md px-4 text-sm font-medium",
                                                !isSidebarOpen && "justify-center px-2 [&>svg]:hidden"
                                            )}
                                            onClick={handleAccordionTriggerClick}
                                        >
                                            <div className="flex items-center">
                                                <ShoppingCart className={cn("h-4 w-4", isSidebarOpen ? "mr-2" : "")} />
                                                {isSidebarOpen && <span>{t('sidebar.orders')}</span>}
                                            </div>
                                        </AccordionTrigger>
                                    </TooltipTrigger>
                                    {!isSidebarOpen && (
                                        <TooltipContent side="right" className="flex items-center gap-4">
                                            {t('sidebar.orders')}
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                                <AccordionContent className="pb-0 pl-10">
                                    <div className="space-y-1 mt-1">
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-8 hover:bg-white/10 hover:text-white" asChild onClick={handleLinkClick}>
                                            <Link to="/sales/history">
                                                <History className="mr-2 h-4 w-4" />
                                                {t('sidebar.sales_history')}
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-8 hover:bg-white/10 hover:text-white" asChild onClick={handleLinkClick}>
                                            <Link to="/sales/invoices">
                                                <ReceiptText className="mr-2 h-4 w-4" />
                                                {t('sidebar.invoices')}
                                            </Link>
                                        </Button>
                                         <Button variant="ghost" size="sm" className="w-full justify-start h-8 hover:bg-white/10 hover:text-white" asChild onClick={handleLinkClick}>
                                             <Link to="/sales/returns">
                                                 <CornerDownLeft className="mr-2 h-4 w-4" />
                                                 {t('sidebar.returns')}
                                             </Link>
                                         </Button>
                                         <Button variant="ghost" size="sm" className="w-full justify-start h-8 hover:bg-white/10 hover:text-white" asChild onClick={handleLinkClick}>
                                             <Link to="/sales/credits">
                                                 <HandCoins className="mr-2 h-4 w-4" />
                                                 {t('sidebar.credits')}
                                             </Link>
                                         </Button>
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-8 hover:bg-white/10 hover:text-white" asChild onClick={handleLinkClick}>
                                            <Link to="/proforma/list">
                                                <FileText className="mr-2 h-4 w-4" />
                                                {t('sidebar.proforma')}
                                            </Link>
                                        </Button>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>

                        {/* Point de Vente */}
                        <Accordion type="single" collapsible className="w-full" value={openAccordion} onValueChange={setOpenAccordion}>
                            <AccordionItem value="caisse" className="border-b-0">
                                <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                        <AccordionTrigger
                                            className={cn(
                                                "py-2 hover:bg-white/10 hover:text-white hover:no-underline rounded-md px-4 text-sm font-medium",
                                                !isSidebarOpen && "justify-center px-2 [&>svg]:hidden"
                                            )}
                                            onClick={handleAccordionTriggerClick}
                                        >
                                            <div className="flex items-center">
                                                <Monitor className={cn("h-4 w-4", isSidebarOpen ? "mr-2" : "")} />
                                                {isSidebarOpen && <span>{t('sidebar.pos')}</span>}
                                            </div>
                                        </AccordionTrigger>
                                    </TooltipTrigger>
                                    {!isSidebarOpen && (
                                        <TooltipContent side="right" className="flex items-center gap-4">
                                            {t('sidebar.pos')}
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                                <AccordionContent className="pb-0 pl-10">
                                    <div className="space-y-1 mt-1">
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-8 hover:bg-white/10 hover:text-white" asChild onClick={handleLinkClick}>
                                            <Link to="/pos-admin">
                                                <Activity className="mr-2 h-4 w-4" />
                                                {t('sidebar.all_points')}
                                            </Link>
                                        </Button>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </div>

                {/* Module Marketing & Clients */}
                <div className="px-3 py-2">
                    {isSidebarOpen && (
                        <h3 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-white/50">
                            {t('sidebar.marketing')}
                        </h3>
                    )}
                    <div className="space-y-1">
                        <Accordion type="single" collapsible className="w-full" value={openAccordion} onValueChange={setOpenAccordion}>
                            <AccordionItem value="marketing" className="border-b-0">
                                <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                        <AccordionTrigger
                                            className={cn(
                                                "py-2 hover:bg-white/10 hover:text-white hover:no-underline rounded-md px-4 text-sm font-medium",
                                                !isSidebarOpen && "justify-center px-2 [&>svg]:hidden"
                                            )}
                                            onClick={handleAccordionTriggerClick}
                                        >
                                            <div className="flex items-center">
                                                <Megaphone className={cn("h-4 w-4", isSidebarOpen ? "mr-2" : "")} />
                                                {isSidebarOpen && <span>{t('sidebar.marketing')}</span>}
                                            </div>
                                        </AccordionTrigger>
                                    </TooltipTrigger>
                                    {!isSidebarOpen && (
                                        <TooltipContent side="right" className="flex items-center gap-4">
                                            {t('sidebar.marketing')}
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                                <AccordionContent className="pb-0 pl-10">
                                    <div className="space-y-1 mt-1">
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-8 hover:bg-white/10 hover:text-white" asChild onClick={handleLinkClick}>
                                            <Link to="/clients">
                                                <Users className="mr-2 h-4 w-4" />
                                                {t('sidebar.clients')}
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-8 hover:bg-white/10 hover:text-white" asChild onClick={handleLinkClick}>
                                            <Link to="/marketing/rewards">
                                                <Gift className="mr-2 h-4 w-4" />
                                                {t('sidebar.loyalty')}
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-8 hover:bg-white/10 hover:text-white" asChild onClick={handleLinkClick}>
                                            <Link to="/marketing/promos">
                                                <Percent className="mr-2 h-4 w-4" />
                                                {t('sidebar.promotions')}
                                            </Link>
                                        </Button>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </div>

                {/* Module Achat */}
                <div className="px-3 py-2">
                    {isSidebarOpen && (
                        <h3 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-white/50">
                            {t('sidebar.purchases')}
                        </h3>
                    )}
                    <div className="space-y-1">
                        <Accordion type="single" collapsible className="w-full" value={openAccordion} onValueChange={setOpenAccordion}>
                            <AccordionItem value="purchases" className="border-b-0">
                                <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                        <AccordionTrigger
                                            className={cn(
                                                "py-2 hover:bg-white/10 hover:text-white hover:no-underline rounded-md px-4 text-sm font-medium",
                                                !isSidebarOpen && "justify-center px-2 [&>svg]:hidden"
                                            )}
                                            onClick={handleAccordionTriggerClick}
                                        >
                                            <div className="flex items-center">
                                                <ShoppingBasket className={cn("h-4 w-4", isSidebarOpen ? "mr-2" : "")} />
                                                {isSidebarOpen && <span>{t('sidebar.all_purchases')}</span>}
                                            </div>
                                        </AccordionTrigger>
                                    </TooltipTrigger>
                                    {!isSidebarOpen && (
                                        <TooltipContent side="right" className="flex items-center gap-4">
                                            {t('sidebar.all_purchases')}
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                                <AccordionContent className="pb-0 pl-10">
                                    <div className="space-y-1 mt-1">
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-8 hover:bg-white/10 hover:text-white" asChild onClick={handleLinkClick}>
                                            <Link to="/purchases/list">
                                                <ShoppingBag className="mr-2 h-4 w-4" />
                                                {t('sidebar.all_purchases')}
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-8 hover:bg-white/10 hover:text-white" asChild onClick={handleLinkClick}>
                                            <Link to="/purchases/expenses">
                                                <HandCoins className="mr-2 h-4 w-4" />
                                                {t('sidebar.expenses')}
                                            </Link>
                                        </Button>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </div>

                {/* Module Rapports */}
                <div className="px-3 py-2">
                    {isSidebarOpen && (
                        <h3 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-white/50">
                            {t('sidebar.reports')}
                        </h3>
                    )}
                    <div className="space-y-1">
                        <Accordion type="single" collapsible className="w-full" value={openAccordion} onValueChange={setOpenAccordion}>
                            <AccordionItem value="settings" className="border-b-0">
                                <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                        <AccordionTrigger
                                            className={cn(
                                                "py-2 hover:bg-white/10 hover:text-white hover:no-underline rounded-md px-4 text-sm font-medium",
                                                !isSidebarOpen && "justify-center px-2 [&>svg]:hidden"
                                            )}
                                            onClick={handleAccordionTriggerClick}
                                        >
                                            <div className="flex items-center">
                                                <FileStack className={cn("h-4 w-4", isSidebarOpen ? "mr-2" : "")} />
                                                {isSidebarOpen && <span>{t('sidebar.reports')}</span>}
                                            </div>
                                        </AccordionTrigger>
                                    </TooltipTrigger>
                                    {!isSidebarOpen && (
                                        <TooltipContent side="right" className="flex items-center gap-4">
                                            {t('sidebar.reports')}
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                                <AccordionContent className="pb-0 pl-10">
                                    <div className="space-y-1 mt-1">
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-8 hover:bg-white/10 hover:text-white" asChild onClick={handleLinkClick}>
                                            <Link to="/reports/sales-report">
                                                <Store className="mr-2 h-4 w-4" />
                                                {t('sidebar.sales_report')}
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-8 hover:bg-white/10 hover:text-white" asChild onClick={handleLinkClick}>
                                            <Link to="/reports/purchase-report">
                                                <Receipt className="mr-2 h-4 w-4" />
                                                {t('sidebar.purchase_report')}
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-8 hover:bg-white/10 hover:text-white" asChild onClick={handleLinkClick}>
                                            <Link to="/reports/expense-report">
                                                <Book className="mr-2 h-4 w-4" />
                                                {t('sidebar.expense_report')}
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-8 hover:bg-white/10 hover:text-white" asChild onClick={handleLinkClick}>
                                            <Link to="/reports/profit-loss-report">
                                                <ChartLine className="mr-2 h-4 w-4" />
                                                {t('sidebar.profit_loss')}
                                            </Link>
                                        </Button>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </div>

                {/* Administration */}
                <div className="px-3 py-2">
                    {isSidebarOpen && (
                        <h3 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-white/50">
                            {t('sidebar.administration')}
                        </h3>
                    )}
                    <div className="space-y-1">
                        <Accordion type="single" collapsible className="w-full" value={openAccordion} onValueChange={setOpenAccordion}>
                            <AccordionItem value="admin" className="border-b-0">
                                <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                        <AccordionTrigger
                                            className={cn(
                                                "py-2 hover:bg-white/10 hover:text-white hover:no-underline rounded-md px-4 text-sm font-medium",
                                                !isSidebarOpen && "justify-center px-2 [&>svg]:hidden"
                                            )}
                                            onClick={handleAccordionTriggerClick}
                                        >
                                            <div className="flex items-center">
                                                <Settings className={cn("h-4 w-4", isSidebarOpen ? "mr-2" : "")} />
                                                {isSidebarOpen && <span>{t('sidebar.settings')}</span>}
                                            </div>
                                        </AccordionTrigger>
                                    </TooltipTrigger>
                                    {!isSidebarOpen && (
                                        <TooltipContent side="right" className="flex items-center gap-4">
                                            {t('sidebar.settings')}
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                                <AccordionContent className="pb-0 pl-10">
                                    <div className="space-y-1 mt-1">
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-8 hover:bg-white/10 hover:text-white" asChild onClick={handleLinkClick}>
                                            <Link to="/settings/roles">
                                                <Lock className="mr-2 h-4 w-4" />
                                                {t('sidebar.roles')}
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-8 hover:bg-white/10 hover:text-white" asChild onClick={handleLinkClick}>
                                            <Link to="/settings/users">
                                                <Users className="mr-2 h-4 w-4" />
                                                {t('sidebar.users')}
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-8 hover:bg-white/10 hover:text-white" asChild onClick={handleLinkClick}>
                                            <Link to="/settings">
                                                <MonitorCog className="mr-2 h-4 w-4" />
                                                {t('sidebar.system')}
                                            </Link>
                                        </Button>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </div>
            </div >

            <div className="px-3 py-4 mt-auto">
                <Button variant="ghost" className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10" asChild onClick={handleLinkClick}>
                    <Link to="/settings">
                        <SettingsIcon className="mr-2 h-4 w-4" />
                        {isSidebarOpen && <span>{t('sidebar.settings')}</span>}
                    </Link>
                </Button>
            </div>
        </div >
    )

    return (
        <TooltipProvider>
            <>
                {isMobile && isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/80 z-40 backdrop-blur-sm"
                        onClick={closeSidebar}
                    />
                )}
                {sidebarContent}
            </>
        </TooltipProvider>
    )
}
