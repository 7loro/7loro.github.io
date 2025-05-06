import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { MDXRemote } from 'next-mdx-remote/rsc';

interface PostDetailProps {
    id: string;
}

export default function PostDetail({ id }: PostDetailProps) {
    // 마크다운 파일 읽기
    const fullPath = path.join(process.cwd(), 'src/posts', `${id}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // 메타데이터와 콘텐츠 분리
    const { data, content } = matter(fileContents);
    const { title, date, tags } = data;

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">{title}</h1>
            <div className="text-gray-500 mb-4">{date}</div>

            <div className="flex gap-2 mb-8">
                {tags && tags.map((tag: string) => (
                    <span key={tag} className="bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded">
                        {tag}
                    </span>
                ))}
            </div>

            <div className="prose prose-lg max-w-none dark:prose-invert">
                <MDXRemote source={content} />
            </div>
        </div>
    );
}