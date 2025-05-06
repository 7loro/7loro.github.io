import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getAllPosts } from '@/lib/posts';

export async function generateStaticParams() {
    const posts = getAllPosts();
    return posts.map((post) => ({
        slug: post.id,
    }));
}

export default function Post({ params }: { params: { slug: string } }) {
    const { slug } = params;
    const fullPath = path.join(process.cwd(), 'src/posts', `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

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

            <div className="prose prose-lg max-w-none">
                <MDXRemote source={content} />
            </div>
        </div>
    );
}