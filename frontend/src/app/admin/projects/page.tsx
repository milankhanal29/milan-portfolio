"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import type { Project } from "@/types";

export default function AdminProjectsPage() {
  const queryClient = useQueryClient();
  const { data: projects, isLoading } = useQuery({ queryKey: ["projects"], queryFn: () => api.projects.list() });
  const [editing, setEditing] = useState<Partial<Project> | null>(null);
  const [showModal, setShowModal] = useState(false);

  const createMut = useMutation({
    mutationFn: (d: Partial<Project>) => api.projects.create(d),
    onSuccess: () => { toast.success("Created!"); queryClient.invalidateQueries({ queryKey: ["projects"] }); setShowModal(false); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, d }: { id: string; d: Partial<Project> }) => api.projects.update(id, d),
    onSuccess: () => { toast.success("Updated!"); queryClient.invalidateQueries({ queryKey: ["projects"] }); setShowModal(false); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => api.projects.delete(id),
    onSuccess: () => { toast.success("Deleted!"); queryClient.invalidateQueries({ queryKey: ["projects"] }); },
  });

  const handleSave = () => {
    if (!editing) return;
    if (editing.id) updateMut.mutate({ id: editing.id, d: editing });
    else createMut.mutate(editing);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <button onClick={() => { setEditing({}); setShowModal(true); }} className="px-4 py-2 rounded-xl bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90">+ Add</button>
      </div>

      {isLoading ? <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="skeleton h-16"/>)}</div> : (
        <div className="border border-[hsl(var(--border))] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-[hsl(var(--secondary))]">
              <th className="text-left p-3 font-medium">Title</th>
              <th className="text-left p-3 font-medium hidden md:table-cell">Tech Stack</th>
              <th className="text-left p-3 font-medium">Featured</th>
              <th className="text-right p-3 font-medium">Actions</th>
            </tr></thead>
            <tbody>{projects?.map(p=>(
              <tr key={p.id} className="border-t border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary)/0.5)]">
                <td className="p-3 font-medium">{p.title}</td>
                <td className="p-3 hidden md:table-cell text-[hsl(var(--muted-foreground))]">{p.tech_stack.slice(0,3).join(", ")}</td>
                <td className="p-3">{p.featured?"⭐":"—"}</td>
                <td className="p-3 text-right space-x-2">
                  <button onClick={()=>{setEditing(p);setShowModal(true)}} className="text-[hsl(var(--primary))] hover:underline">Edit</button>
                  <button onClick={()=>{if(confirm("Delete?"))deleteMut.mutate(p.id)}} className="text-[hsl(var(--destructive))] hover:underline">Delete</button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {showModal && editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={()=>setShowModal(false)}>
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">{editing.id?"Edit":"New"} Project</h2>
            <div className="space-y-4">
              {[{k:"title",l:"Title"},{k:"description",l:"Description",t:"textarea"},{k:"github_url",l:"GitHub URL"},{k:"live_url",l:"Live URL"},{k:"cover_image",l:"Cover Image URL"}].map(f=>(
                <div key={f.k}>
                  <label className="block text-sm font-medium mb-1">{f.l}</label>
                  {f.t==="textarea"?(
                    <textarea value={(editing as Record<string,string>)[f.k]||""} onChange={e=>setEditing({...editing,[f.k]:e.target.value})} rows={3}
                      className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] resize-none text-sm"/>
                  ):(
                    <input value={(editing as Record<string,string>)[f.k]||""} onChange={e=>setEditing({...editing,[f.k]:e.target.value})}
                      className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] text-sm"/>
                  )}
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium mb-1">Tech Stack (comma-separated)</label>
                <input value={editing.tech_stack?.join(", ")||""} onChange={e=>setEditing({...editing,tech_stack:e.target.value.split(",").map(s=>s.trim()).filter(Boolean)})}
                  className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] text-sm"/>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.featured||false} onChange={e=>setEditing({...editing,featured:e.target.checked})}/>
                Featured project
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={()=>setShowModal(false)} className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90">
                {editing.id?"Update":"Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
