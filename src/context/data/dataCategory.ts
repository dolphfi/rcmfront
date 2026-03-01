export interface CategoryProducts {
    id: string;
    name: string;
    category_slug: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface CategoryServices {
    id: string;
    name: string;
    category_slug: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface SubCategory {
    id: string;
    image: string;
    category_id: string;
    name: string;
    description: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export const category: CategoryProducts[] = [
    {
        id: "550e8400-e29b-41d4-a716-446655440001",
        name: "Computers",
        category_slug: "computers",
        status: "Active",
        created_at: "2022-01-01",
        updated_at: "2022-01-01",
    },
    {
        id: "550e8400-e29b-41d4-a716-446655440002",
        name: "Electronics",
        category_slug: "electronics",
        status: "Active",
        created_at: "2022-01-01",
        updated_at: "2022-01-01",
    },
    {
        id: "550e8400-e29b-41d4-a716-446655440003",
        name: "Shoe",
        category_slug: "shoe",
        status: "Active",
        created_at: "2022-01-01",
        updated_at: "2022-01-01",
    },
    {
        id: "550e8400-e29b-41d4-a716-446655440004",
        name: "Furnitures",
        category_slug: "furnitures",
        status: "Active",
        created_at: "2022-01-01",
        updated_at: "2022-01-01",
    },
    {
        id: "550e8400-e29b-41d4-a716-446655440005",
        name: "Bags",
        category_slug: "bags",
        status: "Active",
        created_at: "2022-01-01",
        updated_at: "2022-01-01",
    },
];

export const categoryServices: CategoryServices[] = [
    {
        id: "550e8400-e29b-41d4-a716-446655440001",
        name: "Printing",
        category_slug: "printing",
        status: "Active",
        created_at: "2022-01-01",
        updated_at: "2022-01-01",
    },
    {
        id: "550e8400-e29b-41d4-a716-446655440002",
        name: "Studio",
        category_slug: "studio",
        status: "Active",
        created_at: "2022-01-01",
        updated_at: "2022-01-01",
    },
    {
        id: "550e8400-e29b-41d4-a716-446655440003",
        name: "Development",
        category_slug: "development",
        status: "Active",
        created_at: "2022-01-01",
        updated_at: "2022-01-01",
    },
    {
        id: "550e8400-e29b-41d4-a716-446655440004",
        name: "Design",
        category_slug: "design",
        status: "Active",
        created_at: "2022-01-01",
        updated_at: "2022-01-01",
    },
    {
        id: "550e8400-e29b-41d4-a716-446655440005",
        name: "Network",
        category_slug: "network",
        status: "Active",
        created_at: "2022-01-01",
        updated_at: "2022-01-01",
    },
    {
        id: "550e8400-e29b-41d4-a716-446655440006",
        name: "Consultation",
        category_slug: "consultation",
        status: "Active",
        created_at: "2022-01-01",
        updated_at: "2022-01-01",
    },
    {
        id: "550e8400-e29b-41d4-a716-446655440007",
        name: "Repair",
        category_slug: "repair",
        status: "Active",
        created_at: "2022-01-01",
        updated_at: "2022-01-01",
    },
    {
        id: "550e8400-e29b-41d4-a716-446655440008",
        name: "Coworking",
        category_slug: "coworking",
        status: "Active",
        created_at: "2022-01-01",
        updated_at: "2022-01-01",
    },
    {
        id: "550e8400-e29b-41d4-a716-446655440009",
        name: "Meeting Room",
        category_slug: "meeting-room",
        status: "Active",
        created_at: "2022-01-01",
        updated_at: "2022-01-01",
    },
    {
        id: "550e8400-e29b-41d4-a716-446655440010",
        name: "Event",
        category_slug: "event",
        status: "Active",
        created_at: "2022-01-01",
        updated_at: "2022-01-01",
    },
];

export const subCategory: SubCategory[] = [
    {
        id: "650e8400-e29b-41d4-a716-446655440001",
        image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=100&h=100&fit=crop',
        category_id: category[0].id, // Computers
        name: "Laptops",
        description: "Laptop computers",
        status: "Active",
        created_at: "2022-01-01",
        updated_at: "2022-01-01",
    },
    {
        id: "650e8400-e29b-41d4-a716-446655440002",
        image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=100&h=100&fit=crop",
        category_id: category[1].id, // Electronics
        name: "Headphones",
        description: "Audio headphones",
        status: "Active",
        created_at: "2022-01-01",
        updated_at: "2022-01-01",
    },
    {
        id: "650e8400-e29b-41d4-a716-446655440003",
        image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=100&h=100&fit=crop",
        category_id: category[1].id, // Electronics
        name: "Watches",
        description: "Smart watches",
        status: "Active",
        created_at: "2022-01-01",
        updated_at: "2022-01-01",
    },
    {
        id: "650e8400-e29b-41d4-a716-446655440004",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop",
        category_id: category[2].id, // Shoe
        name: "Sneakers",
        description: "Athletic sneakers",
        status: "Active",
        created_at: "2022-01-01",
        updated_at: "2022-01-01",
    },
    {
        id: "650e8400-e29b-41d4-a716-446655440005",
        image: "https://images.unsplash.com/photo-1543512214-318c7553f230?w=100&h=100&fit=crop",
        category_id: category[1].id, // Electronics
        name: "Smart Home",
        description: "Smart home devices",
        status: "Active",
        created_at: "2022-01-01",
        updated_at: "2022-01-01",
    },
    {
        id: "650e8400-e29b-41d4-a716-446655440006",
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100&h=100&fit=crop",
        category_id: category[3].id, // Furnitures
        name: "Chairs",
        description: "Furniture chairs",
        status: "Active",
        created_at: "2022-01-01",
        updated_at: "2022-01-01",
    },
    {
        id: "650e8400-e29b-41d4-a716-446655440007",
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=100&h=100&fit=crop",
        category_id: category[4].id, // Bags
        name: "Handbags",
        description: "Fashion handbags",
        status: "Active",
        created_at: "2022-01-01",
        updated_at: "2022-01-01",
    },
];

// Helper functions
export const getCategoryById = (categoryId: string) => {
    return category.find(cat => cat.id === categoryId);
};

export const getSubCategoryById = (subCategoryId: string) => {
    return subCategory.find(sub => sub.id === subCategoryId);
};

export const getSubCategoriesForCategory = (categoryId: string) => {
    return subCategory.filter(sub => sub.category_id === categoryId);
};

export const getCategoryName = (categoryId: string) => {
    return getCategoryById(categoryId)?.name || 'Unknown';
};

export const getSubCategoryName = (subCategoryId: string) => {
    return getSubCategoryById(subCategoryId)?.name || 'Unknown';
};

// Validate if a subcategory belongs to a category
export const isValidSubCategoryForCategory = (categoryId: string, subCategoryId: string) => {
    const sub = getSubCategoryById(subCategoryId);
    return sub?.category_id === categoryId;
};

// Find subcategory by name within a specific category (using category ID)
export const findSubCategoryByName = (categoryId: string, subCategoryName: string) => {
    return subCategory.find(
        sub => sub.category_id === categoryId && sub.name === subCategoryName
    );
};

// Find subcategory by name within a specific category (using category name)
export const findSubCategory = (categoryName: string, subCategoryName: string) => {
    const cat = category.find(c => c.name === categoryName);
    if (!cat) return undefined;
    return findSubCategoryByName(cat.id, subCategoryName);
};