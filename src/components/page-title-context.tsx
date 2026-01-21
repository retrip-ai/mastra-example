'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface PageTitleContextType {
    title: string | null;
    setTitle: (title: string | null) => void;
}

const PageTitleContext = createContext<PageTitleContextType | null>(null);

export function PageTitleProvider({ children }: { children: ReactNode }) {
    const [title, setTitleState] = useState<string | null>(null);

    const setTitle = useCallback((newTitle: string | null) => {
        setTitleState(newTitle);
    }, []);

    return (
        <PageTitleContext.Provider value={{ title, setTitle }}>
            {children}
        </PageTitleContext.Provider>
    );
}

export function usePageTitle() {
    const context = useContext(PageTitleContext);
    if (!context) {
        throw new Error('usePageTitle must be used within a PageTitleProvider');
    }
    return context;
}
