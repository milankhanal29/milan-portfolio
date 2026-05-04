"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function ProjectsPage() {
  const [filter, setFilter] = useState<string | null>(null);

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects", filter],
    queryFn: () => api.projects.list(filter || undefined),
  });

  // Collect all unique techs for filter chips
  const allTechs = Array.from(
    new Set(projects?.flatMap((p) => p.tech_stack) || [])
  ).sort();

  return (
    <div className="max-w-7xl mx-auto px-4 py-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
          My <span className="gradient-text">Projects</span>
        </h1>
        <p className="text-[hsl(var(--muted-foreground))] mb-8 text-lg">
          Things I&apos;ve built with love and code
        </p>
      </motion.div>

      {/* Filter chips */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-2 mb-10"
      >
        <button
          onClick={() => setFilter(null)}
          className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
            !filter
              ? "bg-[hsl(var(--primary))] text-white"
              : "bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary)/0.8)]"
          }`}
        >
          All
        </button>
        {allTechs.map((tech) => (
          <button
            key={tech}
            onClick={() => setFilter(filter === tech ? null : tech)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
              filter === tech
                ? "bg-[hsl(var(--primary))] text-white"
                : "bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary)/0.8)]"
            }`}
          >
            {tech}
          </button>
        ))}
      </motion.div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton h-64" />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {projects?.map((project, i) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
                className="group gradient-border p-6 rounded-xl hover:scale-[1.02] transition-transform duration-300"
              >
                <div className="relative z-10">
                  {project.featured && (
                    <span className="inline-block px-2 py-0.5 text-xs rounded-md bg-[hsl(var(--warning)/0.15)] text-[hsl(var(--warning))] border border-[hsl(var(--warning)/0.3)] mb-3">
                      ⭐ Featured
                    </span>
                  )}

                  <h3 className="text-xl font-semibold mb-2 group-hover:text-[hsl(var(--primary))] transition-colors">
                    {project.title}
                  </h3>

                  <p className="text-[hsl(var(--muted-foreground))] text-sm mb-4 line-clamp-3">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {project.tech_stack.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 text-xs rounded-md bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-4 pt-2 border-t border-[hsl(var(--border))]">
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors"
                      >
                        🔗 Source Code
                      </a>
                    )}
                    {project.live_url && (
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors"
                      >
                        🌐 Live Demo
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
