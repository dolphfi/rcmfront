import { categoryServices } from './dataCategory';

interface Services {
    id: string;
    sku: string;
    name: string;
    category: string;
    price: string;
    description?: string; // Added for edit form
    status?: string; // Added for edit form
    createdBy: {
        name: string;
        avatar: string;
    };
}

export const services: Services[] = [
    {
        id: '650e8400-e29b-41d4-a716-446655440001',
        sku: 'SV001',
        name: 'Printing 8.5*11',
        category: categoryServices[0].id, // Printing
        price: '10',
        description: 'Printing services',
        status: 'Active',
        createdBy: {
            name: 'James Kirwin',
            avatar: 'https://i.pravatar.cc/150?u=1'
        },
    },
    {
        id: '650e8400-e29b-41d4-a716-446655440002',
        sku: 'SV002',
        name: 'Photo shoot',
        category: categoryServices[1].id, // Studio
        price: '20',
        description: 'Studio services',
        status: 'Active',
        createdBy: {
            name: 'Francis Chang',
            avatar: 'https://i.pravatar.cc/150?u=2'
        },
    },
    {
        id: '650e8400-e29b-41d4-a716-446655440003',
        sku: 'SV003',
        name: 'Development Application Web',
        category: categoryServices[2].id, // Development
        price: '30',
        description: 'Development services',
        status: 'Active',
        createdBy: {
            name: 'Antonio Engle',
            avatar: 'https://i.pravatar.cc/150?u=3'
        },
    },
    {
        id: '650e8400-e29b-41d4-a716-446655440004',
        sku: 'SV004',
        name: 'Graphic Design',
        category: categoryServices[3].id, // Design
        price: '40',
        description: 'Design services',
        status: 'Active',
        createdBy: {
            name: 'Leo Kelly',
            avatar: 'https://i.pravatar.cc/150?u=4'
        },
    },
    {
        id: '650e8400-e29b-41d4-a716-446655440005',
        sku: 'SV005',
        name: 'Network Installation',
        category: categoryServices[4].id, // Network
        price: '50',
        description: 'Network services',
        status: 'Active',
        createdBy: {
            name: 'Annette Walker',
            avatar: 'https://i.pravatar.cc/150?u=5'
        },
    },
    {
        id: '650e8400-e29b-41d4-a716-446655440006',
        sku: 'SV006',
        name: 'Consultation IT',
        category: categoryServices[5].id, // Consultation
        price: '60',
        description: 'Consultation services',
        status: 'Active',
        createdBy: {
            name: 'John Weaver',
            avatar: 'https://i.pravatar.cc/150?u=6'
        },
    },
    {
        id: '650e8400-e29b-41d4-a716-446655440007',
        sku: 'SV007',
        name: 'Repair Computer',
        category: categoryServices[6].id, // Repair
        price: '70',
        description: 'Repair services',
        status: 'Active',
        createdBy: {
            name: 'Antonio Engle',
            avatar: 'https://i.pravatar.cc/150?u=3'
        },
    },
    {
        id: '650e8400-e29b-41d4-a716-446655440008',
        sku: 'SV008',
        name: 'Coworking Space',
        category: categoryServices[7].id, // Coworking
        price: '80',
        description: 'Coworking services',
        status: 'Active',
        createdBy: {
            name: 'Leo Kelly',
            avatar: 'https://i.pravatar.cc/150?u=4'
        },
    },
    {
        id: '650e8400-e29b-41d4-a716-446655440009',
        sku: 'SV009',
        name: 'Meeting Room',
        category: categoryServices[8].id, // Meeting Room
        price: '90',
        description: 'Meeting room services',
        status: 'Active',
        createdBy: {
            name: 'Annette Walker',
            avatar: 'https://i.pravatar.cc/150?u=5'
        },
    },
    {
        id: '650e8400-e29b-41d4-a716-446655440010',
        sku: 'SV010',
        name: 'Event Space',
        category: categoryServices[9].id, // Event
        price: '100',
        description: 'Event services',
        status: 'Active',
        createdBy: {
            name: 'John Weaver',
            avatar: 'https://i.pravatar.cc/150?u=6'
        },
    },
];