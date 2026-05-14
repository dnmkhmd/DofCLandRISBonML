'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/utils/api';

export interface User {
    id: number;
    email: string;
    full_name: string;
    phone: string;
    avatar: string | null;
    is_active: true;
    is_admin: false;
    created_at: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, userData: User) => void;
    logout: () => void;
    loading: boolean;
    updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    login: () => {},
    logout: () => {},
    loading: true,
    updateUser: () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            api.get('/auth/me').then(res => {
                setUser(res.data);
            }).catch(err => {
                console.error("Auth check failed", err);
                localStorage.removeItem('token');
                setToken(null);
            }).finally(() => {
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, []);

    const login = (newToken: string, userData: User) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const updateUser = (data: Partial<User>) => {
        if (user) {
            setUser({ ...user, ...data });
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
