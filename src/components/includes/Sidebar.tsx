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
import { useSettings } from "../../context/SettingsContext";


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
        "w-full justify-start hover:bg-primary/10 hover:text-primary transition-all duration-200",
        !isSidebarOpen && "justify-center px-2",
        isActive && "bg-primary/10 text-primary font-semibold border-r-4 border-primary rounded-none",
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
    const { businessName, logoUrl } = useSettings();

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
            "sidebar-container no-print bg-white border-r border-slate-200 text-gray-900 h-full transition-all duration-300 flex flex-col shadow-sm",
            isMobile
                ? cn("fixed inset-y-0 left-0 z-50 w-64", !isSidebarOpen && "-translate-x-full")
                : cn("relative", isSidebarOpen ? "w-64" : "w-20"),
            className
        )}>
            <div className={cn("h-16 flex items-center border-b border-slate-100 shrink-0", isSidebarOpen ? "px-6" : "px-0 justify-center")}>
                <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 p-1 flex items-center justify-center overflow-hidden shadow-sm">
                    <img
                        src={logoUrl || '/logo.jpeg'}
                        alt="Logo"
                        className="h-full w-full object-contain"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/logo.png'; // Fallback if logo.jpeg fails
                        }}
                    />
                </div>
                {isSidebarOpen && (
                    <h2 className="text-lg font-semibold tracking-tight ml-3 text-foreground mr-auto">
                        <span className="text-lg sm:text-xl font-bold text-foreground hidden md:block">
                            {businessName || 'KOLABO POS'}
                        </span>
                    </h2>
                )}
            </div>

            <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <div className="px-3 py-2">
                    {isSidebarOpen && (
                        <h3 className="mb-2 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
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
                        <h3 className="mb-2 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
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
                                                "py-2 hover:bg-primary/10 hover:text-primary hover:no-underline rounded-md px-4 text-sm font-medium transition-all",
                                                !isSidebarOpen && "justify-center px-2 [&>svg]:hidden"
                                            )}
                                            onClick={handleAccordionTriggerClick}
                                        >
                                            <div className="flex items-center">
                                                <Package className={cn("h-4 w-4", isSidebarOpen ? "mr-3" : "")} />
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
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-9 hover:bg-primary/10 hover:text-primary text-gray-800 font-medium transition-colors" asChild onClick={handleLinkClick}>
                                            <Link to="/products">
                                                <Package className="mr-3 h-4 w-4" />
                                                {t('sidebar.all_products')}
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-9 hover:bg-primary/10 hover:text-primary text-gray-800 font-medium transition-colors" asChild onClick={handleLinkClick}>
                                            <Link to="/products/expired">
                                                <ClockFading className="mr-3 h-4 w-4" />
                                                {t('sidebar.expired_products')}
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-9 hover:bg-primary/10 hover:text-primary text-gray-800 font-medium transition-colors" asChild onClick={handleLinkClick}>
                                            <Link to="/category">
                                                <LayoutList className="mr-3 h-4 w-4" />
                                                {t('sidebar.categories')}
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-9 hover:bg-primary/10 hover:text-primary text-gray-800 font-medium transition-colors" asChild onClick={handleLinkClick}>
                                            <Link to="/brand">
                                                <Tags className="mr-2 h-4 w-4" />
                                                {t('sidebar.brands')}
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-9 hover:bg-primary/10 hover:text-primary text-gray-800 font-medium transition-colors" asChild onClick={handleLinkClick}>
                                            <Link to="/stock">
                                                <Layers className="mr-2 h-4 w-4" />
                                                {t('sidebar.stock')}
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-9 hover:bg-primary/10 hover:text-primary text-gray-800 font-medium transition-colors" asChild onClick={handleLinkClick}>
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
                                                "py-2 hover:bg-primary/10 hover:text-primary hover:no-underline rounded-md px-4 text-sm font-medium transition-all",
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
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-9 hover:bg-primary/10 hover:text-primary text-gray-800 font-medium transition-colors" asChild onClick={handleLinkClick}>
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
                        <h3 className="mb-2 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
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
                                                "py-2 hover:bg-primary/10 hover:text-primary hover:no-underline rounded-md px-4 text-sm font-medium transition-all",
                                                !isSidebarOpen && "justify-center px-2 [&>svg]:hidden"
                                            )}
                                            onClick={handleAccordionTriggerClick}
                                        >
                                            <div className="flex items-center">
                                                <ShoppingCart className={cn("h-4 w-4", isSidebarOpen ? "mr-3" : "")} />
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
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-9 hover:bg-primary/10 hover:text-primary text-gray-800 font-medium transition-colors" asChild onClick={handleLinkClick}>
                                            <Link to="/sales/history">
                                                <History className="mr-2 h-4 w-4" />
                                                {t('sidebar.sales_history')}
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-9 hover:bg-primary/10 hover:text-primary text-gray-800 font-medium transition-colors" asChild onClick={handleLinkClick}>
                                            <Link to="/sales/invoices">
                                                <ReceiptText className="mr-2 h-4 w-4" />
                                                {t('sidebar.invoices')}
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-9 hover:bg-primary/10 hover:text-primary text-gray-800 font-medium transition-colors" asChild onClick={handleLinkClick}>
                                            <Link to="/sales/returns">
                                                <CornerDownLeft className="mr-2 h-4 w-4" />
                                                {t('sidebar.returns')}
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-9 hover:bg-primary/10 hover:text-primary text-gray-800 font-medium transition-colors" asChild onClick={handleLinkClick}>
                                            <Link to="/sales/credits">
                                                <HandCoins className="mr-2 h-4 w-4" />
                                                {t('sidebar.credits')}
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-9 hover:bg-primary/10 hover:text-primary text-gray-800 font-medium transition-colors" asChild onClick={handleLinkClick}>
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
                                                "py-2 hover:bg-primary/10 hover:text-primary hover:no-underline rounded-md px-4 text-sm font-medium transition-all",
                                                !isSidebarOpen && "justify-center px-2 [&>svg]:hidden"
                                            )}
                                            onClick={handleAccordionTriggerClick}
                                        >
                                            <div className="flex items-center">
                                                <Monitor className={cn("h-4 w-4", isSidebarOpen ? "mr-3" : "")} />
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
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-9 hover:bg-primary/10 hover:text-primary text-gray-800 font-medium transition-colors" asChild onClick={handleLinkClick}>
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
                        <h3 className="mb-2 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
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
                                                "py-2 hover:bg-primary/10 hover:text-primary hover:no-underline rounded-md px-4 text-sm font-medium transition-all",
                                                !isSidebarOpen && "justify-center px-2 [&>svg]:hidden"
                                            )}
                                            onClick={handleAccordionTriggerClick}
                                        >
                                            <div className="flex items-center">
                                                <Megaphone className={cn("h-4 w-4", isSidebarOpen ? "mr-3" : "")} />
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
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-9 hover:bg-primary/10 hover:text-primary text-gray-800 font-medium transition-colors" asChild onClick={handleLinkClick}>
                                            <Link to="/clients">
                                                <Users className="mr-2 h-4 w-4" />
                                                {t('sidebar.clients')}
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-9 hover:bg-primary/10 hover:text-primary text-gray-800 font-medium transition-colors" asChild onClick={handleLinkClick}>
                                            <Link to="/marketing/rewards">
                                                <Gift className="mr-2 h-4 w-4" />
                                                {t('sidebar.loyalty')}
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-9 hover:bg-primary/10 hover:text-primary text-gray-800 font-medium transition-colors" asChild onClick={handleLinkClick}>
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
                        <h3 className="mb-2 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
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
                                                "py-2 hover:bg-primary/10 hover:text-primary hover:no-underline rounded-md px-4 text-sm font-medium transition-all",
                                                !isSidebarOpen && "justify-center px-2 [&>svg]:hidden"
                                            )}
                                            onClick={handleAccordionTriggerClick}
                                        >
                                            <div className="flex items-center">
                                                <ShoppingBasket className={cn("h-4 w-4", isSidebarOpen ? "mr-3" : "")} />
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
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-9 hover:bg-primary/10 hover:text-primary text-gray-800 font-medium transition-colors" asChild onClick={handleLinkClick}>
                                            <Link to="/purchases/list">
                                                <ShoppingBag className="mr-2 h-4 w-4" />
                                                {t('sidebar.all_purchases')}
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-9 hover:bg-primary/10 hover:text-primary text-gray-800 font-medium transition-colors" asChild onClick={handleLinkClick}>
                                            <Link to="/expenses">
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
                        <h3 className="mb-2 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
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
                                                "py-2 hover:bg-primary/10 hover:text-primary hover:no-underline rounded-md px-4 text-sm font-medium transition-all",
                                                !isSidebarOpen && "justify-center px-2 [&>svg]:hidden"
                                            )}
                                            onClick={handleAccordionTriggerClick}
                                        >
                                            <div className="flex items-center">
                                                <FileStack className={cn("h-4 w-4", isSidebarOpen ? "mr-3" : "")} />
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
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-9 hover:bg-primary/10 hover:text-primary text-gray-800 font-medium transition-colors" asChild onClick={handleLinkClick}>
                                            <Link to="/reports/sales-report">
                                                <Store className="mr-2 h-4 w-4" />
                                                {t('sidebar.sales_report')}
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-9 hover:bg-primary/10 hover:text-primary text-gray-800 font-medium transition-colors" asChild onClick={handleLinkClick}>
                                            <Link to="/reports/purchase-report">
                                                <Receipt className="mr-2 h-4 w-4" />
                                                {t('sidebar.purchase_report')}
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-9 hover:bg-primary/10 hover:text-primary text-gray-800 font-medium transition-colors" asChild onClick={handleLinkClick}>
                                            <Link to="/reports/expense-report">
                                                <Book className="mr-2 h-4 w-4" />
                                                {t('sidebar.expense_report')}
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-9 hover:bg-primary/10 hover:text-primary text-gray-800 font-medium transition-colors" asChild onClick={handleLinkClick}>
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
                        <h3 className="mb-2 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
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
                                                "py-2 hover:bg-primary/10 hover:text-primary hover:no-underline rounded-md px-4 text-sm font-medium transition-all",
                                                !isSidebarOpen && "justify-center px-2 [&>svg]:hidden"
                                            )}
                                            onClick={handleAccordionTriggerClick}
                                        >
                                            <div className="flex items-center">
                                                <Settings className={cn("h-4 w-4", isSidebarOpen ? "mr-3" : "")} />
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
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-9 hover:bg-primary/10 hover:text-primary text-gray-800 font-medium transition-colors" asChild onClick={handleLinkClick}>
                                            <Link to="/settings/roles">
                                                <Lock className="mr-3 h-4 w-4" />
                                                {t('sidebar.roles')}
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-9 hover:bg-primary/10 hover:text-primary text-gray-800 font-medium transition-colors" asChild onClick={handleLinkClick}>
                                            <Link to="/settings/users">
                                                <Users className="mr-3 h-4 w-4" />
                                                {t('sidebar.users')}
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="w-full justify-start h-9 hover:bg-primary/10 hover:text-primary text-gray-800 font-medium transition-colors" asChild onClick={handleLinkClick}>
                                            <Link to="/settings">
                                                <MonitorCog className="mr-3 h-4 w-4" />
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

            {/* <div className="px-3 py-4 mt-auto">
                <Button variant="ghost" className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10" asChild onClick={handleLinkClick}>
                    <Link to="/settings">
                        <SettingsIcon className="mr-2 h-4 w-4" />
                        {isSidebarOpen && <span>{t('sidebar.settings')}</span>}
                    </Link>
                </Button>
            </div> */}
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
