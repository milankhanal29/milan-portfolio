"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import type { Testimonial } from "@/types";

export default function AdminTestimonialsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["testimonials-admin"], queryFn: () => api.testimonials.list(true) });
  const [editing, setEditing] = useState<Partial<Testimonial> | null>(null);
  const [showModal, setShowModal] = useState(false);

  const createMut = useMutation({ mutationFn: (d: Partial<Testimonial>) => api.testimonials.create(d), onSuccess: () => { toast.success("Created!"); queryClient.invalidateQueries({ queryKey: ["testimonials-admin"] }); setShowModal(false); } });
  const updateMut = useMutation({ mutationFn: ({ id, d }: { id: string; d: Partial<Testimonial> }) => api.testimonials.update(id, d), onSuccess: () => { toast.success("Updated!"); queryClient.invalidateQueries({ queryKey: ["testimonials-admin"] }); setShowModal(false); } });
  const deleteMut = useMutation({ mutationFn: (id: string) => api.testimonials.delete(id), onSuccess: () => { toast.success("Deleted!"); queryClient.invalidateQueries({ queryKey: ["testimonials-admin"] }); } });

  const handleSave = () => { if (!editing) return; if (editing.id) updateMut.mutate({ id: editing.id, d: editing }); else createMut.mutate(editing); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Testimonials</h1>
        <button onClick={() => { setEditing({}); setShowModal(true); }} className="px-4 py-2 rounded-xl bg-[hsl(var(--primary))] text-white text-sm font-medium">+ Add</button>
      </div>

      {isLoading ? <div className="space-y-3">{[1,2].map(i=><div key={i} className="skeleton h-20"/>)}</div> : (
        <div className="space-y-4">
          {data?.map(t => (
            <div key={t.id} className="border border-[hsl(var(--border))] rounded-xl p-4 flex justify-between items-start">
              <div>
                <p className="font-medium">{t.author_name}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{t.author_role} at {t.company}</p>
                <p className="text-sm mt-2 italic text-[hsl(var(--muted-foreground))]">&ldquo;{t.text.slice(0, 100)}...&rdquo;</p>
                {t.is_featured && <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded bg-yellow-500/20 text-yellow-400">Featured</span>}
              </div>
              <div className="space-x-2 shrink-0">
                <button onClick={() => { setEditing(t); setShowModal(true); }} className="text-sm text-[hsl(var(--primary))] hover:underline">Edit</button>
                <button onClick={() => { if (confirm("Delete?")) deleteMut.mutate(t.id); }} className="text-sm text-[hsl(var(--destructive))] hover:underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">{editing.id ? "Edit" : "New"} Testimonial</h2>
            <div className="space-y-4">
              {[{ k: "author_name", l: "Author Name" }, { k: "author_role", l: "Role" }, { k: "company", l: "Company" }, { k: "avatar", l: "Avatar URL" }].map(f => (
                <div key={f.k}><label className="block text-sm font-medium mb-1">{f.l}</label>
                  <input value={(editing as Record<string, string>)[f.k] || ""} onChange={e => setEditing({ ...editing, [f.k]: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]" /></div>
              ))}
              <div><label className="block text-sm font-medium mb-1">Text</label>
                <textarea value={editing.text || ""} onChange={e => setEditing({ ...editing, text: e.target.value })} rows={4}
                  className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] text-sm resize-none focus:outline-none" /></div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.is_featured || false} onChange={e => setEditing({ ...editing, is_featured: e.target.checked })} />Featured</label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">{editing.id ? "Update" : "Create"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
