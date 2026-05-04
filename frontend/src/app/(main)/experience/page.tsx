"use client";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatDateShort } from "@/lib/utils";

export default function ExperiencePage() {
  const { data: experiences, isLoading } = useQuery({
    queryKey: ["experiences"],
    queryFn: api.experiences.list,
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
          Work <span className="gradient-text">Experience</span>
        </h1>
        <p className="text-[hsl(var(--muted-foreground))] mb-16 text-lg">
          My professional journey so far
        </p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-40 w-full" />
          ))}
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-[hsl(243,75%,59%)] via-[hsl(280,75%,60%)] to-[hsl(var(--border))]" />

          <div className="space-y-12">
            {experiences?.map((exp, i) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative pl-12"
              >
                {/* Timeline dot */}
                <div className={`absolute left-2.5 top-1 w-4 h-4 rounded-full border-2 ${
                  exp.is_current
                    ? "bg-[hsl(var(--primary))] border-[hsl(var(--primary))] animate-pulse-glow"
                    : "bg-[hsl(var(--background))] border-[hsl(var(--muted-foreground))]"
                }`} />

                <div className="glass p-6 rounded-xl hover:scale-[1.01] transition-transform">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold">{exp.role}</h3>
                    <span className="text-sm text-[hsl(var(--muted-foreground))]">
                      {formatDateShort(exp.start_date)} — {exp.is_current ? (
                        <span className="text-[hsl(var(--success))] font-medium">Present</span>
                      ) : exp.end_date ? formatDateShort(exp.end_date) : ""}
                    </span>
                  </div>

                  <p className="text-[hsl(var(--primary))] font-medium mb-3">{exp.company}</p>

                  {exp.description && (
                    <p className="text-[hsl(var(--muted-foreground))] text-sm mb-4 leading-relaxed">
                      {exp.description}
                    </p>
                  )}

                  {exp.tech_stack.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {exp.tech_stack.map((tech) => (
                        <span
                          key={tech}
                          className="px-2.5 py-0.5 text-xs rounded-md bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.2)]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
