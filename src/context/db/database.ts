import Dexie, { Table } from 'dexie';

export interface OfflineProduct {
    id: string;
    name: string;
    price: number;
    sku: string;
    stock: number;
    categoryId?: string;
    categoryName?: string;
    brandId?: string;
    brandName?: string;
    imageUrl?: string;
    // We store the serialized raw product data for UI components
    rawData: any; 
}

export interface OfflineCategory {
    id: string;
    name: string;
    rawData: any;
}

export interface OfflineCustomer {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    rawData: any;
}

export interface PendingSale {
    id?: number; 
    payload: any; // The POS sale payload
    createdAt: Date;
    status: 'pending' | 'failed';
    error?: string;
}

export class KolaboDatabase extends Dexie {
    products!: Table<OfflineProduct>;
    categories!: Table<OfflineCategory>;
    customers!: Table<OfflineCustomer>;
    pendingSales!: Table<PendingSale>;

    constructor() {
        super('KolaboPOS_DB');
        
        // Declare tables, primary keys and indexes
        // The first string is the primary key.
        this.version(1).stores({
            products: 'id, name, sku, categoryId, brandId',
            categories: 'id, name',
            customers: 'id, phone, firstName, lastName',
            pendingSales: '++id, status, createdAt' // ++ means auto-increment
        });
    }
}

export const db = new KolaboDatabase();
