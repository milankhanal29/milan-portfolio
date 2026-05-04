"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({ 
    queryKey: ["site-settings"], 
    queryFn: api.settings.get 
  });

  const [form, setForm] = useState<any>({});

  const mutation = useMutation({
    mutationFn: (data: any) => api.settings.update(data),
    onSuccess: () => {
      toast.success("Settings updated!");
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
    },
    onError: () => toast.error("Failed to update settings")
  });

  if (isLoading) return <div className="space-y-6">{[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-16" />)}</div>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Site Settings</h1>

      <form onSubmit={handleSubmit} className="glass p-6 rounded-2xl space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1.5">Meta Title</label>
          <input 
            defaultValue={settings?.meta_title}
            onChange={e => setForm({...form, meta_title: e.target.value})}
            className="w-full px-4 py-2 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Meta Description</label>
          <textarea 
            defaultValue={settings?.meta_description}
            onChange={e => setForm({...form, meta_description: e.target.value})}
            rows={3}
            className="w-full px-4 py-2 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Accent Color</label>
          <div className="flex gap-4 items-center">
            <input 
              type="color"
              defaultValue={settings?.accent_color || "#6366f1"}
              onChange={e => setForm({...form, accent_color: e.target.value})}
              className="w-12 h-12 rounded-lg bg-transparent border-none cursor-pointer"
            />
            <input 
              defaultValue={settings?.accent_color}
              onChange={e => setForm({...form, accent_color: e.target.value})}
              className="flex-1 px-4 py-2 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Maintenance Mode</label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox"
              defaultChecked={settings?.maintenance_mode}
              onChange={e => setForm({...form, maintenance_mode: e.target.checked})}
              className="w-5 h-5 rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]"
            />
            <span className="text-sm text-[hsl(var(--muted-foreground))]">Enable maintenance mode (locks public site)</span>
          </label>
        </div>

        <div className="pt-4 border-t border-[hsl(var(--border))]">
          <button 
            type="submit"
            disabled={mutation.isPending}
            className="w-full py-3 bg-[hsl(var(--primary))] text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
          >
            {mutation.isPending ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
