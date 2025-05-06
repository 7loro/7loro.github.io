import { getAllPosts } from '@/lib/posts';
import PostDetail from '@/components/PostDetail';
import { notFound } from 'next/navigation';

// 정적 페이지 생성을 위한 경로 파라미터 정의
export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    id: post.id,
  }));
}

export default function PostPage({ params }: { params: { id: string } }) {
  const { id } = params;

  // 존재하는 포스트인지 확인
  const posts = getAllPosts();
  const post = posts.find(p => p.id === id);

  if (!post) {
    return notFound();
  }

  return <PostDetail id={id} />;
}