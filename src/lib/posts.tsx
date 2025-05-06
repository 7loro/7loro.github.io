import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'src/posts');

export function getAllPosts(): Post[] {
    const fileNames = fs.readdirSync(postsDirectory);

    const allPostsData = fileNames
        .filter(fileName => fileName.endsWith('.md'))
        .map(fileName => {
            // 파일명에서 .md 확장자 제거
            const id = fileName.replace(/\.md$/, '');

            // 마크다운 파일을 문자열로 읽기
            const fullPath = path.join(postsDirectory, fileName);
            const fileContents = fs.readFileSync(fullPath, 'utf8');

            // gray-matter로 메타데이터 파싱
            const matterResult = matter(fileContents);

            return {
                id,
                ...matterResult.data,
            } as Post;
        })
        // 날짜 내림차순으로 정렬
        .sort((a, b) => {
            if (a.date < b.date) {
                return 1;
            } else {
                return -1;
            }
        });

    return allPostsData;
}