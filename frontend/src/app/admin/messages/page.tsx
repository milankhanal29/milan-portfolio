"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatDate, cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function AdminMessagesPage() {
  const queryClient = useQueryClient();
  const { data: messages, isLoading } = useQuery({ 
    queryKey: ["admin-messages"], 
    queryFn: api.contact.list 
  });

  const markReadMut = useMutation({
    mutationFn: (id: string) => api.contact.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
      toast.success("Marked as read");
    }
  });

  if (isLoading) return <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="skeleton h-32" />)}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Contact Messages</h1>

      <div className="space-y-4">
        {messages?.map((msg) => (
          <div 
            key={msg.id} 
            className={cn(
              "glass p-6 rounded-2xl border transition-all",
              msg.is_read ? "opacity-60 grayscale-[0.5]" : "border-[hsl(var(--primary)/0.3)] shadow-lg shadow-[hsl(var(--primary)/0.05)]"
            )}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg">{msg.name}</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{msg.email}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2">{formatDate(msg.created_at)}</p>
                {!msg.is_read && (
                  <button 
                    onClick={() => markReadMut.mutate(msg.id)}
                    className="px-3 py-1 bg-[hsl(var(--primary))] text-white text-[10px] font-bold rounded-full uppercase tracking-wider"
                  >
                    Mark Read
                  </button>
                )}
                {msg.is_read && <span className="text-[10px] font-bold text-green-500 uppercase">Read</span>}
              </div>
            </div>
            
            <div className="bg-[hsl(var(--secondary)/0.5)] p-4 rounded-xl">
              <p className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase mb-1">Subject</p>
              <p className="font-medium mb-3">{msg.subject || "(No Subject)"}</p>
              <p className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase mb-1">Message</p>
              <p className="text-sm leading-relaxed whitespace-pre-line">{msg.message}</p>
            </div>
          </div>
        ))}

        {messages?.length === 0 && (
          <div className="text-center py-20 bg-[hsl(var(--card))] rounded-2xl border border-dashed border-[hsl(var(--border))]">
            <p className="text-4xl mb-4">📭</p>
            <p className="text-[hsl(var(--muted-foreground))]">No messages yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
