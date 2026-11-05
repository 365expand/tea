"use client";

import { useState } from "react";
import { Mail, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

export function ReserveClubSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setStatus("success");
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="relative rounded-3xl sm:rounded-[36px] bg-stone-900 text-white overflow-hidden p-8 sm:p-14 lg:p-16 border border-stone-800 shadow-2xl">
        {/* Ambient background glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-800/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-700/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto text-center space-y-4">
          <span className="text-xs font-semibold tracking-widest uppercase text-amber-300 block">
            The Reserve Society
          </span>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight text-white">
            First Access to Rare Flushes.
          </h2>

          <p className="text-xs sm:text-sm text-stone-300 font-light leading-relaxed max-w-lg mx-auto">
            Our highest-elevation micro-lots yield less than 120kg per harvest. Join our private mailing list for early cellar allocations, sommelier brew notes, and private estate tasting invitations.
          </p>

          {status === "success" ? (
            <div className="pt-4 flex items-center justify-center gap-2 text-emerald-400 text-xs sm:text-sm font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Welcome to The Reserve Society. Your allocation privileges are active.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="pt-4 max-w-md mx-auto flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-stone-800/80 border border-stone-700 rounded-full text-xs sm:text-sm text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition"
                />
              </div>
              <button
                type="submit"
                className="px-7 py-3 bg-white hover:bg-stone-100 active:scale-95 text-stone-900 text-xs sm:text-sm font-semibold rounded-full shadow-lg transition flex items-center justify-center gap-2 shrink-0"
              >
                <span>Request Invite</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <p className="text-[11px] text-stone-400 pt-1">
            Zero spam. Strictly harvest announcements &amp; private releases. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}

