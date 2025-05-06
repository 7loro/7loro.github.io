import { getAllPosts } from '@/lib/posts';
import Link from 'next/link';

export default function Posts() {
    const posts = getAllPosts();

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">블로그 포스트</h1>
            <div className="grid gap-6">
                {posts.map((post) => (
                    <article key={post.id} className="border rounded-md p-6 shadow-sm">
                        <Link href={`/posts/${post.id}`}>
                            <h2 className="text-2xl font-semibold mb-2">{post.title}</h2>
                        </Link>
                        <div className="text-gray-500 mb-2">{post.date}</div>
                        <p className="text-gray-700 mb-4">{post.description}</p>
                        <div className="flex gap-2">
                            {post.tags && post.tags.map((tag: string) => (
                                <span key={tag} className="bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}