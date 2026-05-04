"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import type { Experience } from "@/types";

export default function AdminExperiencesPage() {
  const queryClient = useQueryClient();
  const { data: experiences, isLoading } = useQuery({ queryKey: ["experiences"], queryFn: api.experiences.list });
  const [editing, setEditing] = useState<Partial<Experience> | null>(null);
  const [showModal, setShowModal] = useState(false);

  const createMutation = useMutation({
    mutationFn: (data: Partial<Experience>) => api.experiences.create(data),
    onSuccess: () => { toast.success("Created!"); queryClient.invalidateQueries({ queryKey: ["experiences"] }); setShowModal(false); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Experience> }) => api.experiences.update(id, data),
    onSuccess: () => { toast.success("Updated!"); queryClient.invalidateQueries({ queryKey: ["experiences"] }); setShowModal(false); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.experiences.delete(id),
    onSuccess: () => { toast.success("Deleted!"); queryClient.invalidateQueries({ queryKey: ["experiences"] }); },
  });

  const openNew = () => { setEditing({}); setShowModal(true); };
  const openEdit = (exp: Experience) => { setEditing(exp); setShowModal(true); };
  const handleSave = () => {
    if (!editing) return;
    if (editing.id) updateMutation.mutate({ id: editing.id, data: editing });
    else createMutation.mutate(editing);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Experiences</h1>
        <button onClick={openNew} className="px-4 py-2 rounded-xl bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90">+ Add</button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="skeleton h-16"/>)}</div>
      ) : (
        <div className="border border-[hsl(var(--border))] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-[hsl(var(--secondary))]">
              <th className="text-left p-3 font-medium">Company</th>
              <th className="text-left p-3 font-medium">Role</th>
              <th className="text-left p-3 font-medium hidden md:table-cell">Period</th>
              <th className="text-left p-3 font-medium">Current</th>
              <th className="text-right p-3 font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {experiences?.map(exp => (
                <tr key={exp.id} className="border-t border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary)/0.5)]">
                  <td className="p-3">{exp.company}</td>
                  <td className="p-3">{exp.role}</td>
                  <td className="p-3 hidden md:table-cell text-[hsl(var(--muted-foreground))]">{exp.start_date} — {exp.is_current ? "Present" : exp.end_date}</td>
                  <td className="p-3">{exp.is_current ? "✅" : "—"}</td>
                  <td className="p-3 text-right space-x-2">
                    <button onClick={() => openEdit(exp)} className="text-[hsl(var(--primary))] hover:underline">Edit</button>
                    <button onClick={() => { if (confirm("Delete?")) deleteMutation.mutate(exp.id); }} className="text-[hsl(var(--destructive))] hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">{editing.id ? "Edit" : "New"} Experience</h2>
            <div className="space-y-4">
              {[{k:"company",l:"Company"},{k:"role",l:"Role"},{k:"start_date",l:"Start Date",t:"date"},{k:"end_date",l:"End Date",t:"date"},{k:"description",l:"Description",t:"textarea"},{k:"logo_url",l:"Logo URL"}].map(f=>(
                <div key={f.k}>
                  <label className="block text-sm font-medium mb-1">{f.l}</label>
                  {f.t==="textarea" ? (
                    <textarea value={(editing as Record<string,string>)[f.k]||""} onChange={e=>setEditing({...editing,[f.k]:e.target.value})} rows={3}
                      className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] resize-none text-sm"/>
                  ) : (
                    <input type={f.t||"text"} value={(editing as Record<string,string>)[f.k]||""} onChange={e=>setEditing({...editing,[f.k]:e.target.value})}
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
                <input type="checkbox" checked={editing.is_current||false} onChange={e=>setEditing({...editing,is_current:e.target.checked})}/>
                Currently working here
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--secondary))]">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90">
                {editing.id ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
