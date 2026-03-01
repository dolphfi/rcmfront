import { category, getSubCategoriesForCategory } from './dataCategory';

export interface Product {
    id: string;
    sku: string;
    name: string;
    image: string;
    category: string;
    subCategory?: string; // Added for edit form
    brand: string;
    price: string;
    unit: string;
    qty: number;
    description?: string; // Added for edit form
    minQty?: number; // Added for edit form
    tax?: string; // Added for edit form
    discountType?: string; // Added for edit form
    discountValue?: string; // Added for edit form
    status?: string; // Added for edit form
    createdBy: {
        name: string;
        avatar: string;
    };
    images?: string[]; // Added for gallery
}

export const products: Product[] = [
    {
        id: '1',
        sku: 'PT001',
        name: 'Lenovo IdeaPad 3',
        image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=100&h=100&fit=crop',
        category: category[0].id, // Computers
        subCategory: getSubCategoriesForCategory(category[0].id)[0].id, // Laptops
        brand: 'Lenovo',
        price: '600',
        unit: 'Pc',
        qty: 100,
        minQty: 10,
        tax: '0',
        discountType: 'Percentage',
        discountValue: '10',
        description: 'Powerful laptop for everyday use.',
        createdBy: { name: 'James Kirwin', avatar: 'https://i.pravatar.cc/150?u=1' },
        images: [
            'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=1000&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?q=80&w=1000&auto=format&fit=crop'
        ]
    },
    {
        id: '2',
        sku: 'PT002',
        name: 'Beats Pro',
        image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=100&h=100&fit=crop',
        category: category[1].id, // Electronics
        subCategory: getSubCategoriesForCategory(category[1].id)[0].id, // Headphones
        brand: 'Beats',
        price: '160',
        unit: 'Pc',
        qty: 140,
        minQty: 20,
        tax: '10',
        discountType: 'Fixed',
        discountValue: '20',
        description: 'High performance wireless earphones.',
        createdBy: { name: 'Francis Chang', avatar: 'https://i.pravatar.cc/150?u=2' },
        images: [
            'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1000&auto=format&fit=crop'
        ]
    },
    {
        id: '3',
        sku: 'PT003',
        name: 'Nike Jordan',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop',
        category: category[2].id, // Shoe
        subCategory: getSubCategoriesForCategory(category[2].id)[0].id, // Sneakers
        brand: 'Nike',
        price: '110',
        unit: 'Pc',
        qty: 300,
        minQty: 5,
        tax: '0',
        discountType: 'Percentage',
        discountValue: '5',
        description: 'Iconic basketball shoes.',
        createdBy: { name: 'Antonio Engle', avatar: 'https://i.pravatar.cc/150?u=3' },
        images: [
            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&auto=format&fit=crop'
        ]
    },
    {
        id: '4',
        sku: 'PT004',
        name: 'Apple Series 5 Watch',
        image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=100&h=100&fit=crop',
        category: category[1].id, // Electronics
        subCategory: getSubCategoriesForCategory(category[1].id)[1].id, // Watches
        brand: 'Apple',
        price: '120',
        unit: 'Pc',
        qty: 450,
        minQty: 30,
        tax: '15',
        discountType: 'Fixed',
        discountValue: '15',
        description: 'Smart watch with health features.',
        createdBy: { name: 'Leo Kelly', avatar: 'https://i.pravatar.cc/150?u=4' },
        images: [
            'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=1000&auto=format&fit=crop'
        ]
    },
    {
        id: '5',
        sku: 'PT005',
        name: 'Amazon Echo Dot',
        image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=100&h=100&fit=crop',
        category: category[1].id, // Electronics
        subCategory: getSubCategoriesForCategory(category[1].id)[2].id, // Smart Home
        brand: 'Amazon',
        price: '80',
        unit: 'Pc',
        qty: 320,
        minQty: 50,
        tax: '0',
        discountType: 'Percentage',
        discountValue: '0',
        description: 'Smart speaker with Alexa.',
        createdBy: { name: 'Annette Walker', avatar: 'https://i.pravatar.cc/150?u=5' },
        images: [
            'https://images.unsplash.com/photo-1543512214-318c7553f230?w=1000&auto=format&fit=crop'
        ]
    },
    {
        id: '6',
        sku: 'PT006',
        name: 'Sanford Chair Sofa',
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100&h=100&fit=crop',
        category: category[3].id, // Furnitures
        subCategory: getSubCategoriesForCategory(category[3].id)[0].id, // Chairs
        brand: 'Modern Wave',
        price: '320',
        unit: 'Pc',
        qty: 650,
        minQty: 10,
        tax: '10',
        discountType: 'Percentage',
        discountValue: '10',
        description: 'Comfortable sofa chair.',
        createdBy: { name: 'John Weaver', avatar: 'https://i.pravatar.cc/150?u=6' },
        images: [
            'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1000&auto=format&fit=crop'
        ]
    },
    {
        id: '7',
        sku: 'PT007',
        name: 'Red Premium Satchel',
        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=100&h=100&fit=crop',
        category: category[4].id, // Bags
        subCategory: getSubCategoriesForCategory(category[4].id)[0].id, // Handbags
        brand: 'Dior',
        price: '60',
        unit: 'Pc',
        qty: 700,
        minQty: 100,
        tax: '0',
        discountType: 'Fixed',
        discountValue: '5',
        description: 'Stylish red satchel.',
        createdBy: { name: 'Gary Hennessy', avatar: 'https://i.pravatar.cc/150?u=7' },
        images: [
            'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1000&auto=format&fit=crop'
        ]
    },
    {
        id: '8',
        sku: 'PT008',
        name: 'Red Premium Satchel',
        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=100&h=100&fit=crop',
        category: category[4].id, // Bags
        subCategory: getSubCategoriesForCategory(category[4].id)[0].id, // Handbags
        brand: 'Dior',
        price: '60',
        unit: 'Pc',
        qty: 700,
        minQty: 100,
        tax: '0',
        discountType: 'Fixed',
        discountValue: '5',
        description: 'Stylish red satchel.',
        createdBy: { name: 'Gary Hennessy', avatar: 'https://i.pravatar.cc/150?u=8' },
        images: [
            'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1000&auto=format&fit=crop'
        ]
    },
    {
        id: '9',
        sku: 'PT009',
        name: 'Red Premium Satchel',
        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=100&h=100&fit=crop',
        category: category[4].id, // Bags
        subCategory: getSubCategoriesForCategory(category[4].id)[0].id, // Handbags
        brand: 'Dior',
        price: '60',
        unit: 'Pc',
        qty: 700,
        minQty: 100,
        tax: '0',
        discountType: 'Fixed',
        discountValue: '5',
        description: 'Stylish red satchel.',
        createdBy: { name: 'Gary Hennessy', avatar: 'https://i.pravatar.cc/150?u=9' },
        images: [
            'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1000&auto=format&fit=crop'
        ]
    },
    {
        id: '10',
        sku: 'PT010',
        name: 'Red Premium Satchel',
        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=100&h=100&fit=crop',
        category: category[4].id, // Bags
        subCategory: getSubCategoriesForCategory(category[4].id)[0].id, // Handbags
        brand: 'Dior',
        price: '60',
        unit: 'Pc',
        qty: 700,
        minQty: 100,
        tax: '0',
        discountType: 'Fixed',
        discountValue: '5',
        description: 'Stylish red satchel.',
        createdBy: { name: 'Gary Hennessy', avatar: 'https://i.pravatar.cc/150?u=10' },
        images: [
            'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1000&auto=format&fit=crop'
        ]
    },
    {
        id: '11',
        sku: 'PT011',
        name: 'Red Premium Satchel',
        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=100&h=100&fit=crop',
        category: category[4].id, // Bags
        subCategory: getSubCategoriesForCategory(category[4].id)[0].id, // Handbags
        brand: 'Dior',
        price: '60',
        unit: 'Pc',
        qty: 700,
        minQty: 100,
        tax: '0',
        discountType: 'Fixed',
        discountValue: '5',
        description: 'Stylish red satchel.',
        createdBy: { name: 'Gary Hennessy', avatar: 'https://i.pravatar.cc/150?u=11' },
        images: [
            'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1000&auto=format&fit=crop'
        ]
    },
    {
        id: '12',
        sku: 'PT012',
        name: 'Red Premium Satchel',
        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=100&h=100&fit=crop',
        category: category[4].id, // Bags
        subCategory: getSubCategoriesForCategory(category[4].id)[0].id, // Handbags
        brand: 'Dior',
        price: '60',
        unit: 'Pc',
        qty: 700,
        minQty: 100,
        tax: '0',
        discountType: 'Fixed',
        discountValue: '5',
        description: 'Stylish red satchel.',
        createdBy: { name: 'Gary Hennessy', avatar: 'https://i.pravatar.cc/150?u=12' },
        images: [
            'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1000&auto=format&fit=crop'
        ]
    },
];
