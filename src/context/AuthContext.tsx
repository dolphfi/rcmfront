import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthState } from './types/auth';
import authService from './api/authservice';
import { LoginDto } from './types/dtos/auth.dto';
import { toast } from 'sonner';

interface AuthContextType extends AuthState {
    login: (credentials: LoginDto) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: true,
    });

    // Load user from localStorage and verify token on mount
    const initAuth = useCallback(async () => {
        const token = localStorage.getItem('access_token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            try {
                // Optional: Call profile endpoint to verify token is still valid
                const userProfile = await authService.getProfile();
                setState({
                    user: userProfile,
                    isAuthenticated: true,
                    isLoading: false,
                });
                localStorage.setItem('user', JSON.stringify(userProfile));
            } catch (error) {
                console.error('Failed to restore auth session:', error);
                logout();
            }
        } else {
            setState((prev: AuthState) => ({ ...prev, isLoading: false }));
        }
    }, []);

    useEffect(() => {
        initAuth();
    }, [initAuth]);

    const login = async (credentials: LoginDto) => {
        try {
            setState((prev: AuthState) => ({ ...prev, isLoading: true }));
            const { access_token, refresh_token } = await authService.login(credentials);

            localStorage.setItem('access_token', access_token);
            localStorage.setItem('refresh_token', refresh_token);

            const userProfile = await authService.getProfile();
            localStorage.setItem('user', JSON.stringify(userProfile));

            setState({
                user: userProfile,
                isAuthenticated: true,
                isLoading: false,
            });

            toast.success(`Byenvini, ${userProfile.firstName}!`);
        } catch (error: any) {
            setState((prev: AuthState) => ({ ...prev, isLoading: false }));
            const errorMessage = error.response?.data?.message || 'Erè pandan koneksyon an';
            toast.error(errorMessage);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
        });
        toast.info('Ou dekonekte ak siksè');
    };

    return (
        <AuthContext.Provider value={{ ...state, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
