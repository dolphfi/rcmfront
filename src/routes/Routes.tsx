import { createBrowserRouter } from "react-router-dom";
import Login from '../pages/auth/Login';
import ForgotPassword from '../pages/auth/Forgot-password';
import ResetPassword from '../pages/auth/Reset-password';
import DashboardLayout from '../components/layout/DashboardLayout';
import AdminDashboard from '../pages/dashboard/Dashboard';
import Products from 'pages/products/Products';
import ProductsLayout from 'components/layout/productlayout/ProductsLayout';
import AddProductLayout from 'components/layout/productlayout/AddProductLayout';
import AddProduct from 'pages/products/AddProduct';
import ProductDetails from 'pages/products/ProductDetails';
import ProductDetailsLayout from 'components/layout/productlayout/ProductDetailsLayout';
import EditProductLayout from 'components/layout/productlayout/EditProductLayout';
import EditProduct from 'pages/products/EditProduct';
import ExpiredProducts from 'pages/products/ExpiredProducts';
import ExpiredProductsLayout from 'components/layout/productlayout/ExpiredProductsLayout';
import CategoryLayout from 'components/layout/categorylayout/CategoryLayout';
import Category from 'pages/category/Category';
import BrandLayout from 'components/layout/brandlayout/BrandLayout';
import Brand from 'pages/brand/Brand';
import CashierPOS from 'pages/pos/cashierPOS';
import PosLayout from 'components/layout/posLayout/PosLayout';
import PrivateRoute from '../components/auth/ProtectedRoute';
import SalesLayout from 'components/layout/saleslayout/SalesLayout';
import SalesHistory from 'pages/sales/SalesHistory';
import CreditManagement from 'pages/credit/CreditManagement';
import ProformaList from 'pages/proforma/ProformaList';
import CreateProforma from 'pages/proforma/CreateProforma';
import ProformaDetails from 'pages/proforma/ProformaDetails';
import ProformaLayout from 'components/layout/proformalayout/ProformaLayout';
import PurchaseList from 'pages/purchases/PurchaseList';
import CreatePurchase from 'pages/purchases/CreatePurchase';
import PurchaseLayout from 'components/layout/purchaselayout/PurchaseLayout';
import Reports from 'pages/reports/Reports';
import ReportsLayout from 'components/layout/reportslayout/ReportsLayout';
import Settings from 'pages/settings/Settings';
import SettingsLayout from 'components/layout/settingslayout/SettingsLayout';
import UserList from 'pages/settings/UserList';
import RoleList from 'pages/settings/RoleList';
import AuditLogs from 'pages/settings/AuditLogs';
import NotFound from 'pages/errors/NotFound';
import PosadminLayout from 'components/layout/posLayout/PosadminLayout';
import PosAdmin from 'pages/pos/pos';
import Stock from 'pages/products/Stock';
import StockLayout from 'components/layout/stocklayout/StockLayout';
import WarrantyLayout from 'components/layout/warrantylayout/WarrantyLayout';
import Warranty from 'pages/products/Warranty';
import ServicesLayout from 'components/layout/servicelayout/ServicesLayout';
import Services from 'pages/services/Services';
import ClientLayout from 'components/layout/marketingcustomerslayout/ClientLayout';
import Client from 'pages/marketingcustomers/client';
import PromotionLayout from 'components/layout/marketingcustomerslayout/PromotionLayout';
import Promotion from 'pages/marketingcustomers/promotion';
import LoyaltyLayout from 'components/layout/marketingcustomerslayout/LoyaltyLayout';
import Loyalty from 'pages/marketingcustomers/loyalty';

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Login />,
    },
    {
        path: "/forgot-password",
        element: <ForgotPassword />,
    },
    {
        path: "/reset-password",
        element: <ResetPassword />,
    },
    // Protected Routes for Cashier
    {
        element: <PrivateRoute />,
        children: [
            {
                path: "/pos",
                element: <PosLayout />,
                children: [
                    {
                        index: true,
                        element: <CashierPOS />
                    },
                ],
            },
        ]
    },
    // Protected Routes for Admin and others
    {
        element: <PrivateRoute />,
        children: [
            {
                path: "/dashboard",
                element: <DashboardLayout />,
                children: [
                    {
                        index: true,
                        element: <AdminDashboard />,
                    },
                ],
            },
            // Products
            {
                path: "/products",
                element: <ProductsLayout />,
                children: [
                    {
                        index: true,
                        element: <Products />,
                    },
                ],
            },
            {
                path: "/products/add",
                element: <AddProductLayout />,
                children: [
                    {
                        index: true,
                        element: <AddProduct />,
                    },
                ],
            },
            {
                path: "/products/details/:id",
                element: <ProductDetailsLayout />,
                children: [
                    {
                        index: true,
                        element: <ProductDetails />,
                    },
                ],
            },
            {
                path: "/products/edit/:id",
                element: <EditProductLayout />,
                children: [
                    {
                        index: true,
                        element: <EditProduct />,
                    },
                ],
            },
            {
                path: "/products/expired",
                element: <ExpiredProductsLayout />,
                children: [
                    {
                        index: true,
                        element: <ExpiredProducts />,
                    },
                ],
            },
            // Category
            {
                path: "/category",
                element: <CategoryLayout />,
                children: [
                    {
                        index: true,
                        element: <Category />,
                    },
                ],
            },
            // Brand
            {
                path: "/brand",
                element: <BrandLayout />,
                children: [
                    {
                        index: true,
                        element: <Brand />,
                    },
                ],
            },
            // Sales
            {
                path: "/sales",
                element: <SalesLayout />,
                children: [
                    {
                        path: "history",
                        element: <SalesHistory />,
                    },
                    {
                        path: "invoices",
                        element: <div className="text-white p-6">Paj Faktire (Invoices) - Byento</div>,
                    },
                    {
                        path: "returns",
                        element: <div className="text-white p-6">Paj Retou (Returns) - Byento</div>,
                    },
                    {
                        path: "credits",
                        element: <CreditManagement />,
                    },
                ],
            },
            // Proforma
            {
                path: "/proforma",
                element: <ProformaLayout />,
                children: [
                    {
                        path: "list",
                        element: <ProformaList />,
                    },
                    {
                        path: "new",
                        element: <CreateProforma />,
                    },
                    {
                        path: "details/:id",
                        element: <ProformaDetails />,
                    },
                ],
            },
            // Purchase
            {
                path: "/purchases",
                element: <PurchaseLayout />,
                children: [
                    {
                        path: "list",
                        element: <PurchaseList />,
                    },
                    {
                        path: "new",
                        element: <CreatePurchase />,
                    },
                ],
            },
            // Reports
            {
                path: "/reports",
                element: <ReportsLayout />,
                children: [
                    {
                        index: true,
                        element: <Reports />,
                    },
                    {
                        path: "sales-report",
                        element: <Reports />,
                    },
                    {
                        path: "purchase-report",
                        element: <Reports />,
                    },
                ],
            },
            // Settings
            {
                path: "/settings",
                element: <SettingsLayout />,
                children: [
                    {
                        index: true,
                        element: <Settings />,
                    },
                    {
                        path: "users",
                        element: <UserList />,
                    },
                    {
                        path: "roles",
                        element: <RoleList />,
                    },
                    {
                        path: "audit-logs",
                        element: <AuditLogs />,
                    },
                ],
            },
            // POS Admin
            {
                path: "/pos-admin",
                element: <PosadminLayout />,
                children: [
                    {
                        index: true,
                        element: <PosAdmin />,
                    },
                ],
            },
            // Stock
            {
                path: "/stock",
                element: <StockLayout />,
                children: [
                    {
                        index: true,
                        element: <Stock />,
                    },
                ],
            },
            // warranty
            {
                path: "/warranty",
                element: <WarrantyLayout />,
                children: [
                    {
                        index: true,
                        element: <Warranty />,
                    },
                ],
            },
            // Services
            {
                path: "/services",
                element: <ServicesLayout />,
                children: [
                    {
                        index: true,
                        element: <Services />,
                    },
                ],
            },
            // Marketing Customers
            {
                path: "/clients",
                element: <ClientLayout />,
                children: [
                    {
                        index: true,
                        element: <Client />,
                    },
                ],
            },
            {
                path: "/marketing/promos",
                element: <PromotionLayout />,
                children: [
                    {
                        index: true,
                        element: <Promotion />,
                    },
                ],
            },
            {
                path: "/marketing/rewards",
                element: <LoyaltyLayout />,
                children: [
                    {
                        index: true,
                        element: <Loyalty />,
                    },
                ],
            },
        ]
    },
    {
        path: "*",
        element: <NotFound />,
    },
]);