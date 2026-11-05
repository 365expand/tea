"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Plus, Minus, ArrowRight, X } from "lucide-react";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  display_order?: number;
}

export function FaqsClient({ initialFaqs }: { initialFaqs: FaqItem[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [openIds, setOpenIds] = useState<Record<string, boolean>>(() => {
    // Open the first item by default
    if (initialFaqs.length > 0) {
      return { [initialFaqs[0].id]: true };
    }
    return {};
  });

  const filteredFaqs = useMemo(() => {
    if (!searchTerm.trim()) return initialFaqs;
    const q = searchTerm.toLowerCase();
    return initialFaqs.filter(
      (f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
    );
  }, [initialFaqs, searchTerm]);

  const toggle = (id: string) => {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    filteredFaqs.forEach((f) => {
      all[f.id] = true;
    });
    setOpenIds(all);
  };

  const collapseAll = () => {
    setOpenIds({});
  };

  return (
    <div className="bg-stone-50 min-h-screen py-16 sm:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Header */}
        <div className="max-w-2xl mb-12 sm:mb-16">
          <p className="text-xs font-semibold tracking-widest text-emerald-800 uppercase mb-3">
            Pure Pour Co. &bull; Knowledge Base
          </p>
          <h1 className="text-3xl sm:text-5xl font-serif text-stone-900 tracking-tight leading-tight">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-stone-600 text-sm sm:text-base leading-relaxed">
            Honest answers regarding our single-origin flushes, leaf preservation, steeping parameters, and order delivery across India.
          </p>
        </div>

        {/* Minimalist Search & Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by keyword (e.g. storage, brew, cod, delivery)..."
              className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-stone-500 self-end sm:self-auto">
            <span>
              {filteredFaqs.length} {filteredFaqs.length === 1 ? "entry" : "entries"}
            </span>
            <span className="text-stone-300">&bull;</span>
            <button
              type="button"
              onClick={expandAll}
              className="hover:text-stone-900 transition font-medium"
            >
              Expand all
            </button>
            <span className="text-stone-300">/</span>
            <button
              type="button"
              onClick={collapseAll}
              className="hover:text-stone-900 transition font-medium"
            >
              Collapse
            </button>
          </div>
        </div>

        {/* Editorial Accordion List */}
        <div className="divide-y divide-stone-200 border-b border-stone-200">
          {filteredFaqs.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <p className="text-sm text-stone-500">
                No matching questions found for &ldquo;{searchTerm}&rdquo;
              </p>
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="text-xs font-semibold text-stone-900 hover:text-emerald-800 underline underline-offset-4"
              >
                Clear filter
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq, index) => {
              const isOpen = openIds[faq.id] ?? false;
              const itemNumber = String(index + 1).padStart(2, "0");

              return (
                <div key={faq.id} className="group">
                  <button
                    type="button"
                    onClick={() => toggle(faq.id)}
                    className="w-full py-5 sm:py-6 flex items-start justify-between gap-4 sm:gap-6 text-left transition"
                  >
                    <div className="flex items-start gap-4 sm:gap-6">
                      <span className="text-xs font-mono text-stone-400 pt-1 shrink-0 select-none">
                        {itemNumber}
                      </span>
                      <h2 className="text-base sm:text-lg font-serif text-stone-900 group-hover:text-emerald-900 transition-colors leading-snug">
                        {faq.question}
                      </h2>
                    </div>

                    <div className="mt-1 shrink-0 text-stone-400 group-hover:text-stone-800 transition">
                      {isOpen ? (
                        <Minus className="w-4 h-4 stroke-[1.5]" />
                      ) : (
                        <Plus className="w-4 h-4 stroke-[1.5]" />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="pb-6 pl-8 sm:pl-12 pr-4 sm:pr-8 animate-in fade-in duration-200">
                      <p className="text-xs sm:text-sm text-stone-600 leading-relaxed whitespace-pre-line max-w-2xl font-sans">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Understated Editorial Help Note */}
        <div className="mt-14 sm:mt-20 pt-8 border-t border-stone-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-sm font-serif font-medium text-stone-900">
              Have an unanswered inquiry?
            </h3>
            <p className="text-xs text-stone-500">
              Our team answers queries regarding specific harvests, tasting profiles, and orders.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link
              href="/track-order"
              className="text-stone-600 hover:text-stone-900 transition underline underline-offset-4"
            >
              Track an existing order
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-stone-900 text-white hover:bg-stone-800 transition shadow-xs"
            >
              <span>Contact Concierge</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
