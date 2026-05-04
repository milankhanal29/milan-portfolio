"use client";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function AboutPage() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: api.profile.get,
  });

  const { data: skills } = useQuery({
    queryKey: ["skills"],
    queryFn: api.skills.grouped,
  });

  const categoryLabels: Record<string, string> = {
    frontend: "🎨 Frontend",
    backend: "⚙️ Backend",
    devops: "🚀 DevOps",
    tools: "🛠️ Tools",
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16"
      >
        <h1 className="text-4xl sm:text-5xl font-bold mb-6">
          About <span className="gradient-text">Me</span>
        </h1>

        {isLoading ? (
          <div className="space-y-4">
            <div className="skeleton h-6 w-full" />
            <div className="skeleton h-6 w-3/4" />
            <div className="skeleton h-6 w-1/2" />
          </div>
        ) : (
          <div className="prose prose-invert max-w-none">
            <p className="text-lg text-[hsl(var(--muted-foreground))] leading-relaxed">
              {profile?.bio}
            </p>
            {profile?.location && (
              <p className="text-[hsl(var(--muted-foreground))]">📍 {profile.location}</p>
            )}
          </div>
        )}
      </motion.div>

      {/* Resume Download */}
      {profile?.resume_url && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <a
            href={profile.resume_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[hsl(var(--primary))] text-white font-medium hover:opacity-90 transition-all hover:scale-105"
          >
            📄 Download Resume
          </a>
        </motion.div>
      )}

      {/* Skills Grid */}
      {skills && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-3xl font-bold mb-8">Skills & Technologies</h2>

          <div className="grid md:grid-cols-2 gap-8">
            {Object.entries(skills).map(([category, categorySkills], catIdx) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * catIdx }}
                className="glass p-6 rounded-xl"
              >
                <h3 className="text-lg font-semibold mb-4">
                  {categoryLabels[category] || category}
                </h3>
                <div className="space-y-3">
                  {categorySkills.map((skill) => (
                    <div key={skill.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{skill.name}</span>
                        <span className="text-xs text-[hsl(var(--muted-foreground))]">
                          {skill.proficiency}/5
                        </span>
                      </div>
                      <div className="h-2 bg-[hsl(var(--secondary))] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${(skill.proficiency / 5) * 100}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.1 }}
                          className="h-full rounded-full bg-gradient-to-r from-[hsl(243,75%,59%)] to-[hsl(280,75%,60%)]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
