"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import type { BlogPost } from "@/types";

export default function AdminBlogPage() {
  const queryClient = useQueryClient();
  const { data: posts, isLoading } = useQuery({ queryKey: ["blog-admin"], queryFn: () => api.blog.list(true) });
  const [editing, setEditing] = useState<Partial<BlogPost> | null>(null);
  const [showModal, setShowModal] = useState(false);

  const createMut = useMutation({
    mutationFn: (d: Partial<BlogPost>) => api.blog.create(d),
    onSuccess: () => { toast.success("Created!"); queryClient.invalidateQueries({ queryKey: ["blog-admin"] }); setShowModal(false); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, d }: { id: string; d: Partial<BlogPost> }) => api.blog.update(id, d),
    onSuccess: () => { toast.success("Updated!"); queryClient.invalidateQueries({ queryKey: ["blog-admin"] }); setShowModal(false); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => api.blog.delete(id),
    onSuccess: () => { toast.success("Deleted!"); queryClient.invalidateQueries({ queryKey: ["blog-admin"] }); },
  });

  const handleSave = () => {
    if (!editing) return;
    if (editing.id) updateMut.mutate({ id: editing.id, d: editing });
    else createMut.mutate(editing);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <button onClick={() => { setEditing({ is_published: false }); setShowModal(true); }}
          className="px-4 py-2 rounded-xl bg-[hsl(var(--primary))] text-white text-sm font-medium">+ New Post</button>
      </div>

      {isLoading ? <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="skeleton h-16"/>)}</div> : (
        <div className="border border-[hsl(var(--border))] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-[hsl(var(--secondary))]">
              <th className="text-left p-3 font-medium">Title</th>
              <th className="text-left p-3 font-medium hidden md:table-cell">Status</th>
              <th className="text-left p-3 font-medium hidden md:table-cell">Views</th>
              <th className="text-right p-3 font-medium">Actions</th>
            </tr></thead>
            <tbody>{posts?.map(p => (
              <tr key={p.id} className="border-t border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary)/0.5)]">
                <td className="p-3 font-medium">{p.title}</td>
                <td className="p-3 hidden md:table-cell">
                  <span className={`px-2 py-0.5 rounded text-xs ${p.is_published ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                    {p.is_published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="p-3 hidden md:table-cell text-[hsl(var(--muted-foreground))]">{p.views}</td>
                <td className="p-3 text-right space-x-2">
                  <button onClick={() => { setEditing(p as unknown as Partial<BlogPost>); setShowModal(true); }} className="text-[hsl(var(--primary))] hover:underline">Edit</button>
                  <button onClick={() => { if (confirm("Delete?")) deleteMut.mutate(p.id); }} className="text-[hsl(var(--destructive))] hover:underline">Delete</button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {showModal && editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">{editing.id ? "Edit" : "New"} Post</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input value={editing.title || ""} onChange={e => setEditing({ ...editing, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <input value={editing.slug || ""} onChange={e => setEditing({ ...editing, slug: e.target.value })}
                  placeholder="auto-generated-from-title"
                  className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Content (Markdown)</label>
                <textarea value={editing.body || ""} onChange={e => setEditing({ ...editing, body: e.target.value })}
                  rows={12}
                  className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] resize-none text-sm font-mono" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
                <input value={editing.tags?.join(", ") || ""} onChange={e => setEditing({ ...editing, tags: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                  className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cover Image URL</label>
                <input value={editing.cover_image || ""} onChange={e => setEditing({ ...editing, cover_image: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] text-sm" />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.is_published || false} onChange={e => setEditing({ ...editing, is_published: e.target.checked })} />
                Publish now
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">
                {editing.id ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
