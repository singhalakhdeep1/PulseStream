import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PostThread } from "@/components/feed/post-thread";

interface Props { params: Promise<{ postId: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { postId } = await params;
    const supabase = await createClient();
    const { data: post } = await supabase
        .from("posts")
        .select("content, author:profiles!posts_author_id_fkey(username)")
        .eq("id", postId)
        .single();
    if (!post) return { title: "Post not found" };
    const username = (post.author as unknown as { username: string }).username;
    return {
        title: `@${username}: ${(post.content as string).slice(0, 60)}`,
    };
}

export default async function PostPage({ params }: Props) {
    const { postId } = await params;
    const supabase = await createClient();
    const { data: post } = await supabase
        .from("posts")
        .select(`*, author:profiles!posts_author_id_fkey(*), media:post_media(*)`)
        .eq("id", postId)
        .single();
    if (!post) notFound();
    return <PostThread post={post as any} />;
}
