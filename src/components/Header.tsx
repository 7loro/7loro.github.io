// useState와 useEffect는 필요 없어지지만, useTheme 훅 사용을 위해 React 임포트는 필요할 수 있습니다.
import React from "react";
import ThemeSwitch from "./ThemeSwitch";
import Link from "next/link";

export default function Header() {
  return (
    // 이제 mounted 상태를 사용하지 않으므로 조건부 클래스 및 아이콘 렌더링을 단순화합니다.
    <header className="flex items-center justify-between w-full h-16 px-4 bg-white dark:bg-gray-800 transition-colors duration-200">
      <div className="flex items-center">
        <Link href="/" className="text-gray-700 hover:text-blue-500 dark:text-gray-200">
          {/* Link 컴포넌트 사용 예시: <Link href="/"><a>...</a></Link> 또는 <Link href="/">...</Link> (Next.js 13+) */}
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Casper blog</h1>
        </Link>
      </div>
      <nav className="flex items-center space-x-4">
        {/* Link 컴포넌트 사용을 권장합니다. */}
        <ThemeSwitch />
        <Link href="/" className="text-gray-700 hover:text-blue-500 dark:text-gray-200">
          Home
        </Link>
        <Link href="/about" className="text-gray-700 hover:text-blue-500 dark:text-gray-200">
          About
        </Link>
      </nav>
    </header>
  );
}
