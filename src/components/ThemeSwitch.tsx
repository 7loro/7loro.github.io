// src/components/ThemeSwitch.tsx
'use client';

import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react"; // React는 여전히 필요합니다.

export default function ThemeSwitch() {
    const [mounted, setMounted] = useState(false)
    const { theme, setTheme } = useTheme();
    console.log("ThemeSwitch 렌더링", theme);

    // useEffect only runs on the client, so now we can safely show the UI
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return null
    }

    const isDarkMode = theme === 'dark';

    return (
        <button
            // 버튼의 클래스 이름은 isDarkMode 값에 따라 결정됩니다.
            // isDarkMode가 첫 렌더링부터 올바르므로, 버튼 스타일도 처음부터 올바르게 적용됩니다.
            className={`p-2 rounded-full`}
            onClick={() => setTheme(isDarkMode ? 'light' : 'dark')} // 클릭 시 테마 전환 함수 호출
            aria-label="테마 전환" // 접근성을 위한 레이블 추가
        >
            <span className="flex items-center justify-center w-5 h-5">
                {/* 아이콘은 isDarkMode 값에 따라 렌더링됩니다. */}
                {isDarkMode ? (
                    // 다크 모드일 때는 라이트 모드 전환 아이콘 (태양)
                    '☀️'
                ) : (
                    // 라이트 모드일 때는 다크 모드 전환 아이콘 (달)
                    '🌙'
                )}
            </span>
        </button>
    );
}