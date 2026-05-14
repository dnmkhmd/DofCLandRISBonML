'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Currency = 'USD' | 'KZT' | 'RUB';

interface CurrencyContextType {
    currency: Currency;
    setCurrency: (c: Currency) => void;
    convertPrice: (kztAmount: number) => number;
    formatPrice: (kztAmount: number) => string;
    getCurrencySymbol: () => string;
}

const RATES: Record<Currency, number> = {
    KZT: 1,
    USD: 485,
    RUB: 5.2
};

const SYMBOLS: Record<Currency, string> = {
    KZT: '₸',
    USD: '$',
    RUB: '₽'
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const PRICE_MULTIPLIER = 1.15; // 15% increase requested by user

export function CurrencyProvider({ children }: { children: ReactNode }) {
    const [currency, setCurrencyState] = useState<Currency>('KZT');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('selectedCurrency') as Currency;
        if (saved && RATES[saved]) {
            setCurrencyState(saved);
        }
        setIsMounted(true);
    }, []);

    const setCurrency = (c: Currency) => {
        setCurrencyState(c);
        localStorage.setItem('selectedCurrency', c);
    };

    const convertPrice = (kztAmount: number) => {
        const increasedAmount = kztAmount * PRICE_MULTIPLIER;
        if (currency === 'KZT') return increasedAmount;
        return increasedAmount / RATES[currency];
    };

    const getCurrencySymbol = () => SYMBOLS[currency];

    const formatPrice = (kztAmount: number) => {
        const converted = convertPrice(kztAmount);
        const symbol = getCurrencySymbol();
        
        // Format based on currency type
        if (currency === 'USD') {
            return `${symbol}${Math.round(converted).toLocaleString()}`;
        }
        return `${Math.round(converted).toLocaleString()} ${symbol}`;
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, convertPrice, formatPrice, getCurrencySymbol }}>
            <div style={{ visibility: isMounted ? 'visible' : 'hidden' }}>
                {children}
            </div>
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
}
