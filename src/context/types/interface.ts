export interface Brand {
    id: string;
    name: string;
}

export interface Category {
    id: string;
    name: string;
    type: 'product' | 'service';
}

export interface PointOfSale {
    id: string;
    name: string;
    address?: string;
    phone?: string;
    type?: string;
}

export interface ProductPosStock {
    id: string;
    posId: string;
    stock: number;
    minStock?: number;
    pointOfSale?: PointOfSale;
}

export interface PricingStock {
    id: string;
    sku: string;
    price: string | number;
    costPrice?: string | number;
    taxType?: string;
    tax?: string | number;
    discountType?: string;
    discountValue?: string | number;
    quantityAlert?: number;
    variantName?: string | null;
    posStocks?: ProductPosStock[];
}

export interface ProductImage {
    id: string;
    url: string;
    publicId: string;
    isPrimary: boolean;
}

export interface Product {
    id: string;
    name: string;
    barcode?: string;
    description?: string;
    slug?: string;
    sellingType?: string;
    unit?: string;
    barcodeSymbology?: string;
    productType?: string;
    manufacturer?: string;
    manufacturedDate?: string;
    expiryDate?: string;
    subCategoryId?: string;
    warranties?: string;
    isActive: boolean;
    categoryId?: string;
    category?: Category;
    brandId?: string;
    brand?: Brand;
    pricingStocks?: PricingStock[];
    images?: ProductImage[];
    createdAt: string;
    updatedAt: string;
}
export interface Service {
    id: string;
    name: string;
    description?: string;
    price: number;
    isActive: boolean;
    categoryId?: string;
    category?: Category;
    pointOfSales?: PointOfSale[];
    createdAt: string;
    updatedAt: string;
}
export interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    address?: string;
    loyaltyPoints: number;
    bonusPoints: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
