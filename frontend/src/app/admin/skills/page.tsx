"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import type { Skill } from "@/types";

export default function AdminSkillsPage() {
  const queryClient = useQueryClient();
  const { data: skills, isLoading } = useQuery({ queryKey: ["skills-flat"], queryFn: api.skills.flat });
  const [editing, setEditing] = useState<Partial<Skill> | null>(null);
  const [showModal, setShowModal] = useState(false);

  const createMut = useMutation({ mutationFn: (d: Partial<Skill>) => api.skills.create(d), onSuccess: () => { toast.success("Created!"); queryClient.invalidateQueries({ queryKey: ["skills-flat"] }); setShowModal(false); } });
  const updateMut = useMutation({ mutationFn: ({ id, d }: { id: string; d: Partial<Skill> }) => api.skills.update(id, d), onSuccess: () => { toast.success("Updated!"); queryClient.invalidateQueries({ queryKey: ["skills-flat"] }); setShowModal(false); } });
  const deleteMut = useMutation({ mutationFn: (id: string) => api.skills.delete(id), onSuccess: () => { toast.success("Deleted!"); queryClient.invalidateQueries({ queryKey: ["skills-flat"] }); } });

  const handleSave = () => { if (!editing) return; if (editing.id) updateMut.mutate({ id: editing.id, d: editing }); else createMut.mutate(editing); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Skills</h1>
        <button onClick={() => { setEditing({ proficiency: 3 }); setShowModal(true); }} className="px-4 py-2 rounded-xl bg-[hsl(var(--primary))] text-white text-sm font-medium">+ Add</button>
      </div>

      {isLoading ? <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="skeleton h-12"/>)}</div> : (
        <div className="border border-[hsl(var(--border))] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-[hsl(var(--secondary))]">
              <th className="text-left p-3 font-medium">Name</th>
              <th className="text-left p-3 font-medium">Category</th>
              <th className="text-left p-3 font-medium">Proficiency</th>
              <th className="text-right p-3 font-medium">Actions</th>
            </tr></thead>
            <tbody>{skills?.map(s=>(
              <tr key={s.id} className="border-t border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary)/0.5)]">
                <td className="p-3 font-medium">{s.name}</td>
                <td className="p-3 capitalize">{s.category}</td>
                <td className="p-3">{"⭐".repeat(s.proficiency)}</td>
                <td className="p-3 text-right space-x-2">
                  <button onClick={()=>{setEditing(s);setShowModal(true)}} className="text-[hsl(var(--primary))] hover:underline">Edit</button>
                  <button onClick={()=>{if(confirm("Delete?"))deleteMut.mutate(s.id)}} className="text-[hsl(var(--destructive))] hover:underline">Delete</button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {showModal && editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={()=>setShowModal(false)}>
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 w-full max-w-md" onClick={e=>e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">{editing.id?"Edit":"New"} Skill</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium mb-1">Name</label>
                <input value={editing.name||""} onChange={e=>setEditing({...editing,name:e.target.value})} className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"/></div>
              <div><label className="block text-sm font-medium mb-1">Category</label>
                <select value={editing.category||"frontend"} onChange={e=>setEditing({...editing,category:e.target.value})} className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] text-sm focus:outline-none">
                  <option value="frontend">Frontend</option><option value="backend">Backend</option><option value="devops">DevOps</option><option value="tools">Tools</option>
                </select></div>
              <div><label className="block text-sm font-medium mb-1">Proficiency (1-5)</label>
                <input type="number" min={1} max={5} value={editing.proficiency||3} onChange={e=>setEditing({...editing,proficiency:parseInt(e.target.value)})} className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] text-sm focus:outline-none"/></div>
              <div><label className="block text-sm font-medium mb-1">Icon URL</label>
                <input value={editing.icon_url||""} onChange={e=>setEditing({...editing,icon_url:e.target.value})} className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] text-sm focus:outline-none"/></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={()=>setShowModal(false)} className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">{editing.id?"Update":"Create"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
