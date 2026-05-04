"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: api.profile.get,
  });

  const mutation = useMutation({
    mutationFn: api.contact.submit,
    onSuccess: () => {
      toast.success("Message sent! I'll get back to you soon. 🎉");
      setForm({ name: "", email: "", subject: "", message: "" });
    },
    onError: () => toast.error("Failed to send message. Please try again."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    mutation.mutate(form);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
          Get in <span className="gradient-text">Touch</span>
        </h1>
        <p className="text-[hsl(var(--muted-foreground))] mb-12 text-lg">
          Have a project in mind or just want to say hi? Drop me a message!
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all"
                placeholder="Your name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Subject</label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all"
                placeholder="What's this about?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Message *</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={5}
                className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all resize-none"
                placeholder="Tell me about your project..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full py-3 rounded-xl bg-[hsl(var(--primary))] text-white font-medium hover:opacity-90 transition-all disabled:opacity-50 hover:scale-[1.02]"
            >
              {mutation.isPending ? "Sending..." : "Send Message 🚀"}
            </button>
          </form>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <div className="glass p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-4">Let&apos;s Connect</h3>
            <div className="space-y-4">
              {profile?.email && (
                <a href={`mailto:${profile.email}`} className="flex items-center gap-3 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors">
                  <span className="text-xl">📧</span>
                  <span>{profile.email}</span>
                </a>
              )}
              {profile?.location && (
                <div className="flex items-center gap-3 text-[hsl(var(--muted-foreground))]">
                  <span className="text-xl">📍</span>
                  <span>{profile.location}</span>
                </div>
              )}
            </div>
          </div>

          {profile?.social_links && Object.keys(profile.social_links).length > 0 && (
            <div className="glass p-6 rounded-xl">
              <h3 className="text-lg font-semibold mb-4">Social Links</h3>
              <div className="space-y-3">
                {Object.entries(profile.social_links).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors capitalize"
                  >
                    <span className="text-xl">
                      {platform === "github" ? "🐙" : platform === "linkedin" ? "💼" : platform === "twitter" ? "🐦" : "🔗"}
                    </span>
                    <span>{platform}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
