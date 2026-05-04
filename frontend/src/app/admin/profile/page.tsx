"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function AdminProfilePage() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useQuery({ queryKey: ["profile"], queryFn: api.profile.get });

  const [form, setForm] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: (data: Record<string, string>) => api.profile.update(data),
    onSuccess: () => { toast.success("Profile updated!"); queryClient.invalidateQueries({ queryKey: ["profile"] }); },
    onError: () => toast.error("Failed to update profile"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  if (isLoading) return <div className="space-y-4">{[1,2,3,4].map(i=><div key={i} className="skeleton h-14"/>)}</div>;

  const fields = [
    { key: "name", label: "Name", type: "text" },
    { key: "tagline", label: "Tagline", type: "text" },
    { key: "email", label: "Email", type: "email" },
    { key: "location", label: "Location", type: "text" },
    { key: "avatar_url", label: "Avatar URL", type: "text" },
    { key: "resume_url", label: "Resume URL", type: "text" },
    { key: "bio", label: "Bio", type: "textarea" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
        {fields.map(f => (
          <div key={f.key}>
            <label className="block text-sm font-medium mb-1.5">{f.label}</label>
            {f.type === "textarea" ? (
              <textarea
                defaultValue={(profile as unknown as Record<string, string>)?.[f.key] || ""}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] resize-none"
              />
            ) : (
              <input
                type={f.type}
                defaultValue={(profile as unknown as Record<string, string>)?.[f.key] || ""}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
              />
            )}
          </div>
        ))}
        <button type="submit" disabled={mutation.isPending}
          className="px-6 py-2.5 rounded-xl bg-[hsl(var(--primary))] text-white font-medium hover:opacity-90 disabled:opacity-50">
          {mutation.isPending ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
