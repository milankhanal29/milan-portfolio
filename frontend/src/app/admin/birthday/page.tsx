"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatDate, cn } from "@/lib/utils";
import toast from "react-hot-toast";
import type { BirthdayEvent, MenuItem, RSVP } from "@/types";

export default function AdminBirthdayPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"rsvps" | "events" | "menu">("rsvps");

  // Queries
  const { data: rsvps, isLoading: loadingRsvps } = useQuery({ 
    queryKey: ["admin-rsvps"], 
    queryFn: () => api.birthday.rsvps(),
    enabled: activeTab === "rsvps"
  });
  const { data: events, isLoading: loadingEvents } = useQuery({ 
    queryKey: ["admin-events"], 
    queryFn: api.birthday.events,
    enabled: activeTab === "events"
  });
  const { data: menuItems, isLoading: loadingMenu } = useQuery({ 
    queryKey: ["admin-menu-items"], 
    queryFn: api.birthday.menuItems,
    enabled: activeTab === "menu"
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Birthday Management</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-[hsl(var(--secondary))] rounded-lg w-fit">
        {[
          { id: "rsvps", label: "RSVPs", icon: "📋" },
          { id: "events", label: "Events", icon: "🎂" },
          { id: "menu", label: "Menu Items", icon: "🍕" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
              activeTab === tab.id 
                ? "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-sm" 
                : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            )}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "rsvps" && (
        <RSVPTable rsvps={rsvps} isLoading={loadingRsvps} />
      )}
      {activeTab === "events" && (
        <EventsTable events={events} isLoading={loadingEvents} queryClient={queryClient} />
      )}
      {activeTab === "menu" && (
        <MenuTable items={menuItems} isLoading={loadingMenu} queryClient={queryClient} />
      )}
    </div>
  );
}

// --- Sub-components ---

function RSVPTable({ rsvps, isLoading }: { rsvps?: RSVP[], isLoading: boolean }) {
  if (isLoading) return <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="skeleton h-16" />)}</div>;

  return (
    <div className="border border-[hsl(var(--border))] rounded-xl overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-[hsl(var(--secondary))]">
          <tr>
            <th className="text-left p-3">Guest</th>
            <th className="text-left p-3">Party Type</th>
            <th className="text-left p-3">Selections / Notes</th>
            <th className="text-left p-3">Date</th>
          </tr>
        </thead>
        <tbody>
          {rsvps?.map((rsvp) => (
            <tr key={rsvp.id} className="border-t border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary)/0.5)]">
              <td className="p-3">
                <p className="font-medium">{rsvp.guest_name}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{rsvp.guest_email || "No email"}</p>
              </td>
              <td className="p-3">
                <span className={cn(
                  "px-2 py-0.5 rounded text-xs",
                  rsvp.party_type === "room_party" ? "bg-purple-500/10 text-purple-400" : "bg-blue-500/10 text-blue-400"
                )}>
                  {rsvp.party_type === "room_party" ? "🏠 Room" : "🍽️ Resto"}
                </span>
                {rsvp.table_guests && <p className="text-xs mt-1">Guests: {rsvp.table_guests}</p>}
              </td>
              <td className="p-3 max-w-xs">
                <div className="space-y-1">
                  {rsvp.menu_selections.map(s => (
                    <span key={s.id} className="inline-block mr-2 text-[10px] bg-[hsl(var(--secondary))] px-1.5 py-0.5 rounded">
                      {s.menu_item_name} x{s.quantity}
                    </span>
                  ))}
                  {rsvp.special_note && (
                    <p className="text-xs italic text-[hsl(var(--muted-foreground))] line-clamp-1">"{rsvp.special_note}"</p>
                  )}
                </div>
              </td>
              <td className="p-3 text-[hsl(var(--muted-foreground))] whitespace-nowrap">
                {formatDate(rsvp.created_at)}
              </td>
            </tr>
          ))}
          {rsvps?.length === 0 && (
            <tr><td colSpan={4} className="p-8 text-center text-[hsl(var(--muted-foreground))]">No RSVPs yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function EventsTable({ events, isLoading, queryClient }: { events?: BirthdayEvent[], isLoading: boolean, queryClient: any }) {
  const [editing, setEditing] = useState<Partial<BirthdayEvent> | null>(null);

  const mutation = useMutation({
    mutationFn: (data: any) => data.id ? api.birthday.updateEvent(data.id, data) : api.birthday.createEvent(data),
    onSuccess: () => {
      toast.success("Event saved!");
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      setEditing(null);
    }
  });

  if (isLoading) return <div className="space-y-3">{[1, 2].map(i => <div key={i} className="skeleton h-24" />)}</div>;

  return (
    <div className="space-y-4">
      <button onClick={() => setEditing({ year: new Date().getFullYear(), is_active: true })} className="px-4 py-2 bg-[hsl(var(--primary))] text-white rounded-lg text-sm">+ Add Event</button>
      
      <div className="grid gap-4">
        {events?.map(event => (
          <div key={event.id} className="glass p-4 rounded-xl flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg">{event.title}</h3>
                {event.is_active && <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] rounded">Active</span>}
              </div>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">📅 {event.birthday_date} (Year {event.year})</p>
              <p className="text-xs line-clamp-2 text-[hsl(var(--muted-foreground))]">{event.message_from_milan}</p>
            </div>
            <button onClick={() => setEditing(event)} className="text-sm text-[hsl(var(--primary))] hover:underline">Edit</button>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[hsl(var(--card))] p-6 rounded-2xl w-full max-w-lg space-y-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold">{editing.id ? "Edit" : "New"} Event</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs mb-1">Year</label>
                <input type="number" value={editing.year} onChange={e => setEditing({...editing, year: parseInt(e.target.value)})} className="w-full bg-[hsl(var(--secondary))] p-2 rounded border border-[hsl(var(--border))]" />
              </div>
              <div>
                <label className="block text-xs mb-1">Date</label>
                <input type="date" value={editing.birthday_date} onChange={e => setEditing({...editing, birthday_date: e.target.value})} className="w-full bg-[hsl(var(--secondary))] p-2 rounded border border-[hsl(var(--border))]" />
              </div>
            </div>
            <div>
              <label className="block text-xs mb-1">Title</label>
              <input value={editing.title} onChange={e => setEditing({...editing, title: e.target.value})} className="w-full bg-[hsl(var(--secondary))] p-2 rounded border border-[hsl(var(--border))]" />
            </div>
            <div>
              <label className="block text-xs mb-1">Message</label>
              <textarea value={editing.message_from_milan || ""} onChange={e => setEditing({...editing, message_from_milan: e.target.value})} rows={3} className="w-full bg-[hsl(var(--secondary))] p-2 rounded border border-[hsl(var(--border))] resize-none" />
            </div>
            <div>
              <label className="block text-xs mb-1">Restaurant Info</label>
              <textarea value={editing.restaurant_info || ""} onChange={e => setEditing({...editing, restaurant_info: e.target.value})} rows={3} className="w-full bg-[hsl(var(--secondary))] p-2 rounded border border-[hsl(var(--border))] resize-none" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.is_active} onChange={e => setEditing({...editing, is_active: e.target.checked})} />
              Set as active event
            </label>
            <div className="flex gap-2 pt-4">
              <button onClick={() => setEditing(null)} className="flex-1 py-2 border border-[hsl(var(--border))] rounded-lg">Cancel</button>
              <button onClick={() => mutation.mutate(editing)} className="flex-1 py-2 bg-[hsl(var(--primary))] text-white rounded-lg">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuTable({ items, isLoading, queryClient }: { items?: MenuItem[], isLoading: boolean, queryClient: any }) {
  const [editing, setEditing] = useState<Partial<MenuItem> | null>(null);

  const mutation = useMutation({
    mutationFn: (data: any) => data.id ? api.birthday.updateMenuItem(data.id, data) : api.birthday.createMenuItem(data),
    onSuccess: () => {
      toast.success("Item saved!");
      queryClient.invalidateQueries({ queryKey: ["admin-menu-items"] });
      setEditing(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.birthday.deleteMenuItem(id),
    onSuccess: () => {
      toast.success("Deleted!");
      queryClient.invalidateQueries({ queryKey: ["admin-menu-items"] });
    }
  });

  if (isLoading) return <div className="grid grid-cols-2 gap-4">{[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-20" />)}</div>;

  return (
    <div className="space-y-4">
      <button onClick={() => setEditing({ category: "food", is_available: true, is_veg: false })} className="px-4 py-2 bg-[hsl(var(--primary))] text-white rounded-lg text-sm">+ Add Item</button>
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items?.map(item => (
          <div key={item.id} className="glass p-3 rounded-xl">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider">{item.category}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(item)} className="text-xs text-[hsl(var(--primary))] hover:underline">Edit</button>
                <button onClick={() => { if(confirm("Delete?")) deleteMutation.mutate(item.id); }} className="text-xs text-[hsl(var(--destructive))] hover:underline">Del</button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn("text-[10px] px-1.5 py-0.5 rounded", item.is_available ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400")}>
                {item.is_available ? "Available" : "Sold Out"}
              </span>
              {item.is_veg && <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400">VEG</span>}
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[hsl(var(--card))] p-6 rounded-2xl w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold">{editing.id ? "Edit" : "New"} Menu Item</h2>
            <div>
              <label className="block text-xs mb-1">Name</label>
              <input value={editing.name} onChange={e => setEditing({...editing, name: e.target.value})} className="w-full bg-[hsl(var(--secondary))] p-2 rounded border border-[hsl(var(--border))]" />
            </div>
            <div>
              <label className="block text-xs mb-1">Category</label>
              <select value={editing.category} onChange={e => setEditing({...editing, category: e.target.value})} className="w-full bg-[hsl(var(--secondary))] p-2 rounded border border-[hsl(var(--border))]">
                <option value="food">Food</option>
                <option value="drink">Drink</option>
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1">Description</label>
              <textarea value={editing.description || ""} onChange={e => setEditing({...editing, description: e.target.value})} rows={2} className="w-full bg-[hsl(var(--secondary))] p-2 rounded border border-[hsl(var(--border))] resize-none" />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.is_available} onChange={e => setEditing({...editing, is_available: e.target.checked})} />
                Available
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.is_veg} onChange={e => setEditing({...editing, is_veg: e.target.checked})} />
                Vegetarian
              </label>
            </div>
            <div className="flex gap-2 pt-4">
              <button onClick={() => setEditing(null)} className="flex-1 py-2 border border-[hsl(var(--border))] rounded-lg">Cancel</button>
              <button onClick={() => mutation.mutate(editing)} className="flex-1 py-2 bg-[hsl(var(--primary))] text-white rounded-lg">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
