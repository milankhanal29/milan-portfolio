"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import dynamic from "next/dynamic";
import { api } from "@/lib/api";

const ReactConfetti = dynamic(() => import("react-confetti"), { ssr: false });

function CountdownTimer({ targetSeconds }: { targetSeconds: number }) {
  const [timeLeft, setTimeLeft] = useState(targetSeconds);

  useEffect(() => {
    setTimeLeft(targetSeconds);
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetSeconds]);

  const days = Math.floor(timeLeft / 86400);
  const hours = Math.floor((timeLeft % 86400) / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const units = [
    { label: "Days", value: days },
    { label: "Hours", value: hours },
    { label: "Minutes", value: minutes },
    { label: "Seconds", value: seconds },
  ];

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-6">
      {units.map((unit) => (
        <div key={unit.label} className="text-center">
          <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center mb-2">
            <span className="text-2xl sm:text-4xl font-bold text-white">
              {String(unit.value).padStart(2, "0")}
            </span>
          </div>
          <span className="text-xs sm:text-sm text-purple-300/70">{unit.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function BirthdayLandingPage() {
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  const { data, isLoading } = useQuery({
    queryKey: ["birthday-active"],
    queryFn: api.birthday.active,
  });

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    const timer = setTimeout(() => setShowConfetti(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-purple-300">Loading the celebration...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <p className="text-6xl mb-4">🎂</p>
          <h1 className="text-3xl font-bold text-white mb-2">No Active Event</h1>
          <p className="text-purple-300">Check back later for the next celebration!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Confetti */}
      {showConfetti && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={300}
          colors={["#a855f7", "#ec4899", "#f59e0b", "#10b981", "#6366f1"]}
        />
      )}

      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-20"
            style={{
              width: `${Math.random() * 8 + 4}px`,
              height: `${Math.random() * 8 + 4}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: ["#a855f7", "#ec4899", "#f59e0b"][i % 3],
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center max-w-3xl mx-auto">
        {/* Age Badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="inline-block mb-6"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/30">
            <span className="text-4xl font-bold text-white">{data.age}</span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl sm:text-6xl font-bold text-white mb-4"
        >
          🎂 {data.event.title}
        </motion.h1>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-10"
        >
          <p className="text-purple-300 mb-4 text-lg">Counting down to the celebration...</p>
          <CountdownTimer targetSeconds={data.countdown_seconds} />
        </motion.div>

        {/* Message from Milan */}
        {data.event.message_from_milan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-10 max-w-xl mx-auto"
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-left">
              <p className="text-sm text-purple-400 font-medium mb-2">💌 A message from Milan</p>
              <p className="text-purple-100 whitespace-pre-line leading-relaxed">
                {data.event.message_from_milan}
              </p>
            </div>
          </motion.div>
        )}

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/birthday/rsvp"
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-lg hover:opacity-90 transition-all hover:scale-105 shadow-xl shadow-purple-500/25"
          >
            🎉 RSVP Now
          </Link>
          <Link
            href="/birthday/wishes"
            className="px-8 py-3.5 rounded-2xl border border-white/20 text-white font-medium hover:bg-white/5 transition-all"
          >
            💝 View Wishes
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
