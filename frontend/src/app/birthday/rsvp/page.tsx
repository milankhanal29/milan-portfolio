"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import Link from "next/link";
import { api } from "@/lib/api";
import type { MenuItem, MenuSelectionItem, RSVPCreate } from "@/types";
import toast from "react-hot-toast";

const ReactConfetti = dynamic(() => import("react-confetti"), { ssr: false });

type PartyType = "room_party" | "restaurant";

export default function RSVPPage() {
  const [step, setStep] = useState(1);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [partyType, setPartyType] = useState<PartyType | null>(null);
  const [menuSelections, setMenuSelections] = useState<Record<string, number>>({});
  const [tableGuests, setTableGuests] = useState(2);
  const [specialNote, setSpecialNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { data: activeEvent } = useQuery({
    queryKey: ["birthday-active"],
    queryFn: api.birthday.active,
  });

  const { data: menuData } = useQuery({
    queryKey: ["birthday-menu"],
    queryFn: api.birthday.menu,
    enabled: partyType === "room_party",
  });

  const rsvpMutation = useMutation({
    mutationFn: api.birthday.submitRSVP,
    onSuccess: () => {
      setSubmitted(true);
      setStep(4);
    },
    onError: () => toast.error("Failed to submit RSVP. Please try again."),
  });

  const updateQuantity = (itemId: string, delta: number) => {
    setMenuSelections((prev) => {
      const current = prev[itemId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: next };
    });
  };

  const totalSelections = Object.values(menuSelections).reduce((a, b) => a + b, 0);

  const handleSubmit = () => {
    if (!activeEvent || !partyType) return;

    const selections: MenuSelectionItem[] = Object.entries(menuSelections).map(
      ([menu_item_id, quantity]) => ({ menu_item_id, quantity })
    );

    const data: RSVPCreate = {
      event_id: activeEvent.event.id,
      guest_name: guestName,
      guest_email: guestEmail || undefined,
      party_type: partyType,
      table_guests: partyType === "restaurant" ? tableGuests : undefined,
      special_note: specialNote || undefined,
      menu_selections: selections,
    };

    rsvpMutation.mutate(data);
  };

  // Step 4: Success
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 relative">
        <ReactConfetti
          width={typeof window !== "undefined" ? window.innerWidth : 800}
          height={typeof window !== "undefined" ? window.innerHeight : 600}
          recycle={false}
          numberOfPieces={400}
        />
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md mx-auto relative z-10"
        >
          <div className="text-7xl mb-6">🎉</div>
          <h1 className="text-3xl font-bold text-white mb-4">You&apos;re All Set!</h1>
          <p className="text-purple-200 mb-8">
            Thanks <strong>{guestName}</strong>! Your RSVP has been confirmed.
            {partyType === "room_party" ? " See you at the room party! 🏠" : " See you at the restaurant! 🍽️"}
          </p>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
            <p className="text-purple-300 text-sm mb-2">Share your celebration card</p>
            <div className="bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-xl p-6 border border-white/10">
              <p className="text-white font-semibold text-lg">{guestName}</p>
              <p className="text-purple-200 text-sm">is celebrating with Milan! 🎂</p>
            </div>
          </div>
          <Link href="/birthday/wishes" className="text-purple-400 hover:text-purple-300 underline">
            View all wishes →
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress bar */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                s <= step ? "bg-purple-600 text-white" : "bg-white/10 text-white/40"
              }`}>
                {s}
              </div>
              {s < 3 && <div className={`w-12 h-0.5 ${s < step ? "bg-purple-600" : "bg-white/10"}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Guest Info */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-3xl font-bold text-white mb-2">Who&apos;s Coming? 🎈</h2>
              <p className="text-purple-300 mb-8">Tell us a bit about yourself</p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm text-purple-200 mb-1.5">Your Name *</label>
                  <input
                    type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-purple-200 mb-1.5">Email (optional)</label>
                  <input
                    type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="For confirmation email"
                  />
                </div>
              </div>

              <button
                onClick={() => { if (guestName.trim()) setStep(2); else toast.error("Please enter your name"); }}
                className="mt-8 w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:opacity-90 transition-all"
              >
                Continue →
              </button>
            </motion.div>
          )}

          {/* Step 2: Party Type */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-3xl font-bold text-white mb-2">Choose Your Vibe 🎉</h2>
              <p className="text-purple-300 mb-8">How would you like to celebrate?</p>

              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {/* Room Party Card */}
                <button
                  onClick={() => setPartyType("room_party")}
                  className={`text-left p-6 rounded-2xl border-2 transition-all ${
                    partyType === "room_party"
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="text-4xl mb-3">🏠</div>
                  <h3 className="text-xl font-semibold text-white mb-1">Room Party</h3>
                  <p className="text-purple-300 text-sm">Cozy vibes with food & drinks at Milan&apos;s place</p>
                </button>

                {/* Restaurant Card */}
                <button
                  onClick={() => setPartyType("restaurant")}
                  className={`text-left p-6 rounded-2xl border-2 transition-all ${
                    partyType === "restaurant"
                      ? "border-pink-500 bg-pink-500/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="text-4xl mb-3">🍽️</div>
                  <h3 className="text-xl font-semibold text-white mb-1">Restaurant</h3>
                  <p className="text-purple-300 text-sm">Fine dining experience at a curated restaurant</p>
                </button>
              </div>

              {/* Room Party — Menu Selection */}
              {partyType === "room_party" && menuData && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-4">🍕 Pick Your Favorites</h3>

                  {Object.entries(menuData).map(([category, items]) => (
                    <div key={category} className="mb-6">
                      <h4 className="text-sm font-medium text-purple-400 uppercase tracking-wider mb-3">
                        {category === "food" ? "🍔 Food" : "🥤 Drinks"}
                      </h4>
                      <div className="grid gap-3">
                        {(items as MenuItem[]).map((item) => (
                          <div key={item.id} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-white">{item.name}</span>
                                {item.is_veg && <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">Veg</span>}
                              </div>
                              {item.description && <p className="text-purple-300 text-xs mt-0.5">{item.description}</p>}
                            </div>
                            <div className="flex items-center gap-3 ml-4">
                              <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 rounded-lg bg-white/10 text-white hover:bg-white/20 flex items-center justify-center">−</button>
                              <span className="text-white font-medium w-6 text-center">{menuSelections[item.id] || 0}</span>
                              <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 rounded-lg bg-purple-600 text-white hover:bg-purple-500 flex items-center justify-center">+</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {totalSelections > 0 && (
                    <div className="bg-purple-600/20 border border-purple-500/30 rounded-xl p-4 text-center">
                      <span className="text-purple-200">🛒 {totalSelections} items selected</span>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Restaurant — Group Size */}
              {partyType === "restaurant" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                  {activeEvent?.event.restaurant_info && (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                      <p className="text-sm text-purple-400 font-medium mb-2">📍 Restaurant Details</p>
                      <p className="text-purple-200 whitespace-pre-line text-sm">{activeEvent.event.restaurant_info}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm text-purple-200 mb-1.5">How many in your group?</label>
                    <input
                      type="number" min={1} max={20} value={tableGuests} onChange={(e) => setTableGuests(parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </motion.div>
              )}

              {/* Special Note */}
              {partyType && (
                <div className="mb-6">
                  <label className="block text-sm text-purple-200 mb-1.5">Special Note / Birthday Wish 💌</label>
                  <textarea
                    value={specialNote} onChange={(e) => setSpecialNote(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    placeholder="Write a birthday wish or any dietary preferences..."
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="px-6 py-3 rounded-xl border border-white/20 text-white hover:bg-white/5">
                  ← Back
                </button>
                <button
                  onClick={() => { if (partyType) setStep(3); else toast.error("Please choose a party type"); }}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:opacity-90 transition-all"
                >
                  Review →
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-3xl font-bold text-white mb-2">Review Your RSVP ✨</h2>
              <p className="text-purple-300 mb-8">Make sure everything looks good</p>

              <div className="space-y-4 mb-8">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-xs text-purple-400 uppercase tracking-wider mb-1">Guest</p>
                  <p className="text-white font-medium">{guestName}</p>
                  {guestEmail && <p className="text-purple-300 text-sm">{guestEmail}</p>}
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-xs text-purple-400 uppercase tracking-wider mb-1">Party Type</p>
                  <p className="text-white font-medium">
                    {partyType === "room_party" ? "🏠 Room Party" : "🍽️ Restaurant"}
                  </p>
                  {partyType === "restaurant" && <p className="text-purple-300 text-sm">{tableGuests} guests</p>}
                </div>

                {partyType === "room_party" && totalSelections > 0 && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-purple-400 uppercase tracking-wider mb-2">Menu Selections</p>
                    {Object.entries(menuSelections).map(([itemId, qty]) => {
                      const allItems = Object.values(menuData || {}).flat() as MenuItem[];
                      const item = allItems.find((m) => m.id === itemId);
                      return item ? (
                        <div key={itemId} className="flex justify-between text-sm py-1">
                          <span className="text-white">{item.name}</span>
                          <span className="text-purple-300">×{qty}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}

                {specialNote && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-purple-400 uppercase tracking-wider mb-1">Special Note</p>
                    <p className="text-purple-200 text-sm">{specialNote}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="px-6 py-3 rounded-xl border border-white/20 text-white hover:bg-white/5">
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={rsvpMutation.isPending}
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {rsvpMutation.isPending ? "Confirming..." : "Confirm RSVP 🎉"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
