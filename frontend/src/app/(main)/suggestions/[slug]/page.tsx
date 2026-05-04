"use client";

import { use } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const { data: post, isLoading } = useQuery({
    queryKey: ["blog", slug],
    queryFn: () => api.blog.get(slug),
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24">
        <div className="skeleton h-12 w-3/4 mb-4" />
        <div className="skeleton h-6 w-1/4 mb-8" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton h-5 w-full" />)}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-4">Post not found</h1>
        <Link href="/suggestions" className="text-[hsl(var(--primary))] hover:underline">
          ← Back to blog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Link href="/suggestions" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] text-sm mb-8 inline-block">
          ← Back to blog
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold mb-4">{post.title}</h1>

        <div className="flex items-center gap-4 text-sm text-[hsl(var(--muted-foreground))] mb-2">
          {post.published_at && <span>{formatDate(post.published_at)}</span>}
          <span>📖 {post.reading_time} min read</span>
          <span>👁️ {post.views} views</span>
        </div>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 text-xs rounded-md bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]">
                {tag}
              </span>
            ))}
          </div>
        )}

        <hr className="border-[hsl(var(--border))] mb-8" />

        {/* Markdown Content */}
        <article className="prose prose-invert prose-headings:font-bold prose-a:text-[hsl(243,75%,59%)] prose-code:text-[hsl(280,75%,60%)] prose-pre:bg-[hsl(var(--card))] prose-pre:border prose-pre:border-[hsl(var(--border))] max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.body}
          </ReactMarkdown>
        </article>
      </motion.div>
    </div>
  );
}
