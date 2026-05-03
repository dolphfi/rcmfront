import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Link } from 'react-router-dom';
import { Wallet } from 'lucide-react';

type TransactionStatus = 'Completed' | 'Draft' | 'Pending' | 'Cancelled';
type TabType = 'Sale' | 'Purchase' | 'Quotation' | 'Expenses' | 'Invoices';

const getStatusStyles = (status: TransactionStatus): string => {
    switch (status) {
        case 'Completed':
            return 'bg-emerald-500/20 text-emerald-600';
        case 'Draft':
            return 'bg-orange-500/20 text-orange-600';
        case 'Pending':
            return 'bg-primary/20 text-primary';
        case 'Cancelled':
            return 'bg-rose-500/20 text-rose-600';
        default:
            return 'bg-gray-200 text-gray-600';
    }
};

interface RecentTransactionsCardProps {
    data?: any[];
}

export const RecentTransactionsCard: React.FC<RecentTransactionsCardProps> = ({ data }) => {
    const [activeTab, setActiveTab] = useState<TabType>('Sale');
    const tabs: TabType[] = ['Sale', 'Purchase', 'Quotation', 'Expenses', 'Invoices'];

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'CU';
    };

    const displayTransactions = activeTab === 'Sale' ? (data || []) : [];

    return (
        <Card className="shadow-sm h-full border border-border flex flex-col">
            <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-center justify-between pb-4 border-b border-border mb-4 px-6 -mx-6">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Wallet className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">Recent Transactions</h3>
                    </div>

                    <Link to="/transactions">
                        <Button variant="link" className="text-sm text-primary hover:text-primary/80 hover:no-underline p-0 h-auto">
                            View All
                        </Button>
                    </Link>
                </div>

                <div className="flex gap-6 mb-4 border-b border-border overflow-x-auto no-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === tab
                                ? 'text-orange-500'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="overflow-x-auto -mx-6 px-6 no-scrollbar">
                    <div className="min-w-[600px]">
                        <div className="grid grid-cols-12 gap-4 text-xs text-muted-foreground font-medium mb-3 px-2">
                            <div className="col-span-3">Date</div>
                            <div className="col-span-4">Customer</div>
                            <div className="col-span-3">Status</div>
                            <div className="col-span-2 text-right">Total</div>
                        </div>

                        <div className="flex flex-col gap-3">
                            {displayTransactions.map((transaction) => (
                                <div key={transaction.id} className="grid grid-cols-12 gap-4 items-center py-2 px-2 rounded-lg hover:bg-primary/5 transition-colors group">
                                    <div className="col-span-3 text-sm text-gray-600 whitespace-nowrap">
                                        {new Date(transaction.createdAt).toLocaleDateString()}
                                    </div>
                                    <div className="col-span-4 flex items-center gap-3 overflow-hidden">
                                        <Avatar className="h-10 w-10 bg-gray-100 shrink-0">
                                            <AvatarFallback className="bg-transparent text-gray-500 text-xs font-bold">
                                                {getInitials(transaction.customer?.firstName, transaction.customer?.lastName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                                {transaction.customer ? `${transaction.customer.firstName} ${transaction.customer.lastName}` : 'Walk-in'}
                                            </span>
                                            <span className="text-xs text-muted-foreground truncate">
                                                {transaction.receiptNumber}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-span-3">
                                        <span className={`px-3 py-1 rounded text-[11px] font-semibold whitespace-nowrap ${getStatusStyles(transaction.status)}`}>
                                            {transaction.status}
                                        </span>
                                    </div>
                                    <div className="col-span-2 text-right text-sm font-bold text-foreground">
                                        {formatCurrency(parseFloat(transaction.total))}
                                    </div>
                                </div>
                            ))}
                            {displayTransactions.length === 0 && (
                                <div className="text-center py-12 text-muted-foreground text-sm">
                                    {activeTab === 'Sale' ? 'No recent sales found' : `No ${activeTab.toLowerCase()} records yet`}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
