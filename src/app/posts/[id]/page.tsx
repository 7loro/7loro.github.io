import { getAllPosts } from '@/lib/posts'; // lib/posts.ts 또는 js 파일 경로 확인
import PostDetail from '@/components/PostDetail'; // components/PostDetail 경로 확인
import { notFound } from 'next/navigation';

// 정적 페이지 생성을 위한 경로 파라미터 정의
// 이 함수는 빌드 시 실행되며, 반환 값은 { id: string } 객체들의 배열입니다.
export async function generateStaticParams() {
  const posts = getAllPosts(); // getAllPosts 함수는 { id: string } 형태의 객체 배열을 반환한다고 가정
  return posts.map((post) => ({
    id: post.id,
  }));
}

type PageParams = Promise<{ id: string }>;

export default async function PostPage({ params }: { params: PageParams }) {
  const { id } = await params;

  // 존재하는 포스트인지 확인 (getAllPosts가 동기 함수라고 가정)
  // generateStaticParams가 모든 포스트 ID를 미리 생성하므로,
  // 사실상 여기서는 notFound 체크가 필요 없을 수도 있습니다.
  // 하지만 혹시 모를 경우를 대비하거나, 개발 중 빠른 확인을 위해 남겨둘 수 있습니다.
  const posts = getAllPosts();
  const post = posts.find(p => p.id === id);

  if (!post) {
    // generateStaticParams로 생성되지 않은 ID로 접근 시 notFound 페이지 표시
    return notFound();
  }

  // PostDetail 컴포넌트는 id prop을 string 타입으로 받도록 되어 있음
  return <PostDetail id={id} />;
}