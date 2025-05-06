'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>('light');

    useEffect(() => {
        // 로컬스토리지에서 저장된 테마 가져오기
        const savedTheme = localStorage.getItem('theme') as Theme | null;

        // 시스템 설정 확인
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        // 저장된 테마가 있으면 그것을 사용, 없으면 시스템 설정 사용
        const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

        setTheme(initialTheme);

        // HTML에 테마 클래스 적용
        applyTheme(initialTheme);

        // 시스템 테마 변경 감지
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            // 로컬스토리지에 저장된 테마가 없을 때만 시스템 설정을 따름
            if (!localStorage.getItem('theme')) {
                const newTheme = e.matches ? 'dark' : 'light';
                setTheme(newTheme);
                applyTheme(newTheme);
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // 테마 클래스를 HTML 요소에 적용하는 함수
    const applyTheme = (newTheme: Theme) => {
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    // 테마 전환 함수
    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        applyTheme(newTheme);

        // 사용자 설정을 localStorage에 저장
        localStorage.setItem('theme', newTheme);
    };

    const value = {
        theme,
        toggleTheme
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}