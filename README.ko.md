# girok.md (기록.md)

> **기록은 나눌 때 비로소 지도가 됩니다.**

*다른 언어로 읽기: [English](README.md), [한국어](README.ko.md)*

마크다운 파일을 정적 블로그로 변환하는 오픈소스 프로젝트입니다.

<p align="center">
  <img src=".github/screenshot.png" alt="girok.md 스크린샷" width="800">
</p>

[![Astro](https://img.shields.io/badge/Astro-5.x-BC52EE?logo=astro&logoColor=white)](https://astro.build)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

## 기록의 힘

- **개인의 기록**: 내가 배운 것을 잊지 않기 위해 남기는 흔적.
- **우리의 기록**: 나의 기록이 공유되어 타인의 성장을 돕는 이정표.

당신의 기록은 단순한 메모가 아닙니다—누군가의 길을 안내하는 지도가 됩니다.

---

## 주요 기능

- **마크다운 네이티브**: Wikilinks, 이미지 임베드, Callouts 등 확장 문법 지원
- **증분 동기화**: `publish_sync_at` 타임스탬프 기반으로 변경된 파일만 동기화
- **전문 검색**: Pagefind 기반 클라이언트 사이드 검색
- **태그 시스템**: 태그별 포스트 분류 및 탐색
- **다크/라이트 테마**: 시스템 설정 연동 및 수동 전환
- **SEO 최적화**: Sitemap, 메타 태그 자동 생성
- **GitHub Pages**: 원클릭 배포 지원

## 빠른 시작

### 1. 프로젝트 클론

```bash
git clone https://github.com/your-username/girok-md.git
cd girok-md
npm install
```

### 2. 설정

`setting.toml` 파일을 수정합니다:

```toml
# 마크다운 파일 폴더의 절대 경로
source_root_path = "/path/to/your/markdown/folder"

# 블로그 이름
blog_name = "My Blog"

# 사이트 URL (SEO용)
site_url = "https://your-username.github.io"
```

### 3. 동기화 및 실행

```bash
# 마크다운 폴더에서 포스트 동기화
npm run sync

# 개발 서버 실행
npm run dev
```

http://localhost:4321 에서 블로그를 확인할 수 있습니다.

## 포스트 작성

마크다운 문서의 frontmatter에 `publish: true`를 추가하면 블로그에 게시됩니다.

```yaml
---
title: 포스트 제목
publish: true
tags: [astro, blog]
description: 포스트 설명 (선택)
---

포스트 내용을 작성합니다.
```

### 지원하는 마크다운 문법

| 문법 | 예시 | 변환 결과 |
|------|------|-----------|
| Wikilinks | `[[문서명]]` | 내부 링크 |
| 별칭 링크 | `[[문서명\|표시텍스트]]` | 커스텀 텍스트 링크 |
| 이미지 임베드 | `![[image.png]]` | 이미지 태그 |
| Callouts | `> [!NOTE]` | 스타일된 콜아웃 박스 |

## 프로젝트 구조

```
.
├── src/
│   ├── components/       # Astro 컴포넌트
│   │   ├── Search.astro      # Pagefind 검색
│   │   ├── ThemeToggle.astro # 테마 전환
│   │   ├── TOC.astro         # 목차
│   │   └── TagList.astro     # 태그 목록
│   ├── layouts/          # 레이아웃
│   ├── pages/            # 라우팅
│   │   ├── index.astro       # 홈
│   │   ├── posts/            # 포스트 페이지
│   │   └── tags/             # 태그 페이지
│   ├── content/
│   │   └── posts/        # 동기화된 포스트 (자동 생성)
│   ├── styles/           # 전역 CSS
│   └── utils/            # 유틸리티
├── scripts/
│   └── sync.ts           # 마크다운 동기화 스크립트
├── public/               # 정적 파일
├── setting.toml          # 블로그 설정
└── astro.config.mjs      # Astro 설정
```

## 명령어

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 (localhost:4321) |
| `npm run build` | 프로덕션 빌드 |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm run sync` | 마크다운 폴더 동기화 |
| `npm test` | 테스트 실행 |

## 배포

### GitHub Pages

1. Repository Settings > Pages > Source에서 "GitHub Actions" 선택
2. `main` 브랜치에 push하면 자동으로 배포됨

### 수동 빌드

```bash
npm run build
# dist/ 폴더를 웹 서버에 업로드
```

## 동기화 로직

동기화는 증분 방식으로 작동합니다:

1. `publish: true`인 문서만 대상으로 함
2. 문서의 `modified` 시간과 `publish_sync_at` 비교
3. 변경된 문서만 동기화하여 빌드 시간 최적화
4. 삭제되거나 `publish: false`로 변경된 문서는 자동 삭제

## 기술 스택

- **프레임워크**: [Astro](https://astro.build) 5.x
- **언어**: TypeScript (strict mode)
- **마크다운**: remark, rehype
- **검색**: [Pagefind](https://pagefind.app)
- **테스트**: Vitest, Playwright

## 기여하기

1. 저장소를 Fork합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 Push합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 엽니다

## 라이선스

[MIT](LICENSE)
