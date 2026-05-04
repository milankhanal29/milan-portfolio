"use client";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/api";
import { timeAgo } from "@/lib/utils";

export default function WishesPage() {
  const { data: wishes, isLoading } = useQuery({
    queryKey: ["birthday-wishes"],
    queryFn: api.birthday.wishes,
  });

  const colors = [
    "from-purple-600/20 to-pink-600/20 border-purple-500/20",
    "from-blue-600/20 to-cyan-600/20 border-blue-500/20",
    "from-amber-600/20 to-orange-600/20 border-amber-500/20",
    "from-emerald-600/20 to-teal-600/20 border-emerald-500/20",
    "from-rose-600/20 to-red-600/20 border-rose-500/20",
  ];

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            💝 Birthday Wishes Wall
          </h1>
          <p className="text-purple-300 text-lg">
            Messages of love from friends and family
          </p>
          <Link
            href="/birthday"
            className="inline-block mt-4 text-purple-400 hover:text-purple-300 text-sm underline"
          >
            ← Back to celebration
          </Link>
        </motion.div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton h-32" />
            ))}
          </div>
        ) : wishes && wishes.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {wishes.map((wish, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`break-inside-avoid bg-gradient-to-br ${colors[i % colors.length]} border rounded-2xl p-5`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg font-bold text-white">
                    {wish.guest_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{wish.guest_name}</p>
                    <p className="text-xs text-purple-300">
                      {wish.party_type === "room_party" ? "🏠 Room Party" : "🍽️ Restaurant"}
                      {" · "}{timeAgo(wish.created_at)}
                    </p>
                  </div>
                </div>

                {wish.special_note && (
                  <p className="text-purple-200 text-sm leading-relaxed">
                    &ldquo;{wish.special_note}&rdquo;
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">💌</p>
            <p className="text-purple-300 text-lg">No wishes yet. Be the first!</p>
            <Link
              href="/birthday/rsvp"
              className="inline-block mt-4 px-6 py-2.5 rounded-xl bg-purple-600 text-white font-medium hover:opacity-90 transition-all"
            >
              Send a Wish
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
