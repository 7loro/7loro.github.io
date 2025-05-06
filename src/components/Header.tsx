'use client';

import { useTheme } from "@/context/theme/ThemeProvider";
import { useEffect, useState } from "react";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // 클라이언트 사이드 렌더링 확인
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // 서버/클라이언트 일치를 위한 초기 렌더링 처리
  const isDarkMode = mounted && theme === 'dark';

  return (
    <header className="flex items-center justify-between w-full h-16 px-4 bg-white dark:bg-gray-800 transition-colors duration-200">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Casper blog</h1>
      </div>
      <nav className="flex items-center space-x-4">
        <button
          className={`p-2 rounded-full transition-colors ${mounted ? (isDarkMode
            ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300') : 'bg-gray-200 text-gray-700'
          }`}
          onClick={toggleTheme}
          aria-label="테마 전환"
        >
          {mounted && (isDarkMode ? (
            // 태양 아이콘 (라이트 모드로 전환)
            <span className="flex items-center justify-center w-5 h-5">☀️</span>
          ) : (
            // 달 아이콘 (다크 모드로 전환)
            <span className="flex items-center justify-center w-5 h-5">🌙</span>
          ))}
        </button>
        <a href="/" className="text-gray-700 hover:text-blue-500 dark:text-gray-200">
          Home
        </a>
        <a href="/about" className="text-gray-700 hover:text-blue-500 dark:text-gray-200">
          About
        </a>
        <a href="/contact" className="text-gray-700 hover:text-blue-500 dark:text-gray-200">
          Contact
        </a>
      </nav>
    </header>
  );
}