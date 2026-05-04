"use client";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/api";

export default function HomePage() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: api.profile.get,
  });

  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.projects.list(),
  });

  const { data: testimonials } = useQuery({
    queryKey: ["testimonials"],
    queryFn: () => api.testimonials.list(),
  });

  const featuredProjects = projects?.filter((p) => p.featured).slice(0, 3) || [];

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[hsl(243,75%,59%)] rounded-full blur-[128px] opacity-20 animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[hsl(280,75%,60%)] rounded-full blur-[128px] opacity-15 animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-[hsl(320,75%,60%)] rounded-full blur-[128px] opacity-10 animate-pulse" style={{ animationDelay: "2s" }} />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          {isLoading ? (
            <div className="space-y-4">
              <div className="skeleton h-16 w-3/4 mx-auto" />
              <div className="skeleton h-8 w-1/2 mx-auto" />
              <div className="skeleton h-6 w-2/3 mx-auto" />
            </div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-4"
              >
                <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.3)]">
                  {profile?.location || "Available for work"}
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight mb-6"
              >
                <span className="gradient-text">{profile?.name || "Milan Khanal"}</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xl sm:text-2xl text-[hsl(var(--muted-foreground))] mb-8 max-w-2xl mx-auto"
              >
                {profile?.tagline || "Full-Stack Developer • Building the Future"}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-wrap items-center justify-center gap-4"
              >
                <Link
                  href="/projects"
                  className="px-8 py-3 rounded-xl bg-[hsl(var(--primary))] text-white font-medium hover:opacity-90 transition-all hover:scale-105 glow"
                >
                  View My Work
                </Link>
                <Link
                  href="/contact"
                  className="px-8 py-3 rounded-xl border border-[hsl(var(--border))] font-medium hover:bg-[hsl(var(--secondary))] transition-all hover:scale-105"
                >
                  Get in Touch
                </Link>
              </motion.div>
            </>
          )}
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-[hsl(var(--muted-foreground))] flex items-start justify-center p-1.5">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--muted-foreground))]"
            />
          </div>
        </motion.div>
      </section>

      {/* Featured Projects Section */}
      {featuredProjects.length > 0 && (
        <section className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Featured Projects</h2>
              <p className="text-[hsl(var(--muted-foreground))] max-w-xl mx-auto">
                A selection of my most impactful work
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProjects.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group gradient-border p-6 rounded-xl hover:scale-[1.02] transition-transform duration-300"
                >
                  <div className="relative z-10">
                    <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                    <p className="text-[hsl(var(--muted-foreground))] text-sm mb-4 line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tech_stack.slice(0, 4).map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 text-xs rounded-md bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      {project.github_url && (
                        <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="text-sm text-[hsl(var(--primary))] hover:underline">
                          GitHub →
                        </a>
                      )}
                      {project.live_url && (
                        <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="text-sm text-[hsl(var(--primary))] hover:underline">
                          Live Demo →
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link href="/projects" className="text-[hsl(var(--primary))] font-medium hover:underline">
                View all projects →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      {testimonials && testimonials.length > 0 && (
        <section className="py-24 px-4 bg-[hsl(var(--card)/0.5)]">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">What People Say</h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {testimonials.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass p-6 rounded-xl"
                >
                  <p className="text-[hsl(var(--muted-foreground))] mb-4 italic">&ldquo;{t.text}&rdquo;</p>
                  <div>
                    <p className="font-semibold">{t.author_name}</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      {t.author_role}{t.company ? ` at ${t.company}` : ""}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Let&apos;s Build Something <span className="gradient-text">Amazing</span>
            </h2>
            <p className="text-[hsl(var(--muted-foreground))] mb-8">
              Have a project in mind? I&apos;d love to hear about it.
            </p>
            <Link
              href="/contact"
              className="inline-block px-8 py-3 rounded-xl bg-[hsl(var(--primary))] text-white font-medium hover:opacity-90 transition-all hover:scale-105 glow"
            >
              Start a Conversation
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
