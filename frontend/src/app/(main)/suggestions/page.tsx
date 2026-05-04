"use client";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function SuggestionsPage() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["blog"],
    queryFn: () => api.blog.list(),
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
          Blog & <span className="gradient-text">Suggestions</span>
        </h1>
        <p className="text-[hsl(var(--muted-foreground))] mb-12 text-lg">
          Thoughts, tutorials, and tech insights
        </p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-40" />)}
        </div>
      ) : (
        <div className="space-y-6">
          {posts?.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/suggestions/${post.slug}`}>
                <article className="glass p-6 rounded-xl hover:scale-[1.01] transition-all group cursor-pointer">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold group-hover:text-[hsl(var(--primary))] transition-colors">
                      {post.title}
                    </h2>
                    <span className="text-sm text-[hsl(var(--muted-foreground))] shrink-0">
                      {post.published_at ? formatDate(post.published_at) : "Draft"}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-[hsl(var(--muted-foreground))] mb-3">
                    <span>📖 {post.reading_time} min read</span>
                    <span>👁️ {post.views} views</span>
                  </div>

                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 text-xs rounded-md bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              </Link>
            </motion.div>
          ))}

          {posts?.length === 0 && (
            <p className="text-center text-[hsl(var(--muted-foreground))] py-12">No posts yet. Check back soon!</p>
          )}
        </div>
      )}
    </div>
  );
}
