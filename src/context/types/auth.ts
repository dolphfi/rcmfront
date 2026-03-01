export enum UserRoleName {
    SUPER_ADMIN = 'SUPER_ADMIN',
    ADMIN = 'ADMIN',
    CASHIER = 'CASHIER',
    USER = 'USER',
}

export interface Role {
    id: string;
    name: string;
    label: string;
    description?: string;
    permissions?: string[];
}

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
    phone?: string;
    posId?: string;
    avatarUrl?: string;
    isVerified: boolean;
    isActive: boolean;
    createdAt?: string;
    lastLoginAt?: string;
    loginAttempts?: number;
}

export interface LoginResponse {
    access_token: string;
    refresh_token: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}
