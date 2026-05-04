"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: api.birthday.stats,
  });

  const statCards = stats ? [
    { label: "Total Blog Views", value: stats.total_blog_views, icon: "👁️", color: "from-blue-500/20 to-cyan-500/20" },
    { label: "Published Posts", value: `${stats.published_posts} / ${stats.total_blog_posts}`, icon: "📝", color: "from-purple-500/20 to-pink-500/20" },
    { label: "Total RSVPs", value: stats.total_rsvps, icon: "🎉", color: "from-amber-500/20 to-orange-500/20" },
    { label: "Room Party", value: stats.room_party_rsvps, icon: "🏠", color: "from-emerald-500/20 to-teal-500/20" },
    { label: "Restaurant", value: stats.restaurant_rsvps, icon: "🍽️", color: "from-rose-500/20 to-red-500/20" },
    { label: "Unread Messages", value: stats.unread_messages, icon: "📬", color: "from-indigo-500/20 to-violet-500/20" },
  ] : [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {stats?.active_event && (
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Active Birthday Event</p>
          <p className="font-semibold text-lg">🎂 {stats.active_event}</p>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="skeleton h-28" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-gradient-to-br ${card.color} border border-[hsl(var(--border))] rounded-xl p-5`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{card.icon}</span>
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">{card.label}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
