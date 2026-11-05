"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

export interface ContactInfoProps {
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  workingHours: string;
  socials?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
    pinterest?: string;
  };
}

export function ContactClient({ contactInfo }: { contactInfo: ContactInfoProps }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to send your message. Please try again.");
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });
  };

  return (
    <div className="bg-stone-50 min-h-screen py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="max-w-2xl mb-14 sm:mb-20">
          <p className="text-xs font-semibold tracking-widest text-emerald-800 uppercase mb-3">
            Concierge &amp; Inquiries
          </p>
          <h1 className="text-3xl sm:text-5xl font-serif text-stone-900 tracking-tight leading-tight">
            We are here to assist your tea journey.
          </h1>
          <p className="mt-4 text-stone-600 text-sm sm:text-base leading-relaxed">
            Whether you have a question regarding an estate harvest, steeping ritual, custom gifting, or an existing order — our team is glad to assist you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Direct Contact Details */}
          <div className="lg:col-span-5 space-y-10 lg:pr-6">
            {/* Email */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block">
                Electronic Mail
              </span>
              <a
                href={`mailto:${contactInfo.email}`}
                className="text-lg sm:text-xl font-medium text-stone-900 hover:text-emerald-800 transition block"
              >
                {contactInfo.email}
              </a>
              <p className="text-xs text-stone-500">
                Responses typically dispatched within 24 hours.
              </p>
            </div>

            {/* Phone & Hours */}
            {(contactInfo.phone || contactInfo.whatsapp) && (
              <div className="space-y-2 pt-6 border-t border-stone-200">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block">
                  Telephone &amp; WhatsApp
                </span>
                <a
                  href={`tel:${contactInfo.phone || contactInfo.whatsapp}`}
                  className="text-lg sm:text-xl font-medium text-stone-900 hover:text-emerald-800 transition block"
                >
                  {contactInfo.phone || contactInfo.whatsapp}
                </a>
                <p className="text-xs text-stone-500">
                  {contactInfo.workingHours}
                </p>
              </div>
            )}

            {/* Studio / Estate Address */}
            {contactInfo.address && (
              <div className="space-y-2 pt-6 border-t border-stone-200">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block">
                  Studio &amp; Dispatch Facility
                </span>
                <p className="text-sm text-stone-800 leading-relaxed whitespace-pre-line">
                  {contactInfo.address}
                </p>
              </div>
            )}

            {/* Social Channels if configured */}
            {contactInfo.socials &&
              (contactInfo.socials.instagram ||
                contactInfo.socials.facebook ||
                contactInfo.socials.twitter ||
                contactInfo.socials.youtube) && (
                <div className="space-y-2 pt-6 border-t border-stone-200">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block">
                    Social Dispatches &amp; Media
                  </span>
                  <div className="flex items-center gap-3 pt-1">
                    {contactInfo.socials.instagram && (
                      <a
                        href={contactInfo.socials.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-stone-700 hover:text-emerald-800 transition"
                      >
                        Instagram &rarr;
                      </a>
                    )}
                    {contactInfo.socials.facebook && (
                      <a
                        href={contactInfo.socials.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-stone-700 hover:text-emerald-800 transition"
                      >
                        Facebook &rarr;
                      </a>
                    )}
                    {contactInfo.socials.twitter && (
                      <a
                        href={contactInfo.socials.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-stone-700 hover:text-emerald-800 transition"
                      >
                        Twitter/X &rarr;
                      </a>
                    )}
                    {contactInfo.socials.youtube && (
                      <a
                        href={contactInfo.socials.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-stone-700 hover:text-emerald-800 transition"
                      >
                        YouTube &rarr;
                      </a>
                    )}
                  </div>
                </div>
              )}

            {/* Quick Self-Serve Order Tracking */}
            <div className="pt-6 border-t border-stone-200">
              <p className="text-xs text-stone-500 mb-1.5">
                Looking for the delivery status of a current order?
              </p>
              <Link
                href="/track-order"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-900 hover:text-emerald-800 group transition"
              >
                <span>Self-service order tracking</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Column: Clean, Visible Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-stone-200/90 rounded-2xl p-7 sm:p-10 shadow-xs">
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-800 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-2 max-w-md mx-auto">
                    <h3 className="text-xl font-serif text-stone-900">
                      Message Received
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                      Thank you, <span className="font-semibold text-stone-900">{formData.name}</span>. Your inquiry has been sent to our tea curators. We will review your note and write back to{" "}
                      <span className="font-medium text-stone-900">{formData.email}</span> shortly.
                    </p>
                  </div>
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-xs font-semibold text-stone-900 hover:text-emerald-800 underline underline-offset-4"
                    >
                      Send another message
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h2 className="text-lg font-serif text-stone-900">
                      Send a Message
                    </h2>
                    <p className="text-xs text-stone-500 mt-1">
                      Leave your details below and we will follow up with you.
                    </p>
                  </div>

                  {error && (
                    <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Name */}
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-xs font-medium text-stone-700 mb-1.5"
                      >
                        Your Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="name"
                        type="text"
                        required
                        placeholder="e.g. Arjun Sharma"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-xs font-medium text-stone-700 mb-1.5"
                      >
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Phone */}
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-xs font-medium text-stone-700 mb-1.5"
                      >
                        Phone Number <span className="text-stone-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition"
                      />
                    </div>

                    {/* Subject */}
                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-xs font-medium text-stone-700 mb-1.5"
                      >
                        Subject
                      </label>
                      <input
                        id="subject"
                        type="text"
                        placeholder="e.g. Order query, Tea recommendation"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-xs font-medium text-stone-700 mb-1.5"
                    >
                      Message <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      placeholder="Write your message here..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition leading-relaxed"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto px-7 py-3 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white font-medium text-xs tracking-wider uppercase rounded-lg transition shadow-xs flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <span>Send Message</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
