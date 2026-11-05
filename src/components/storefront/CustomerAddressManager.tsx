"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, MapPin, Trash2, Edit2, Loader2, X, Check } from "lucide-react";

export type AddressItem = {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
};

export function CustomerAddressManager({
  initialAddresses,
}: {
  initialAddresses: AddressItem[];
}) {
  const router = useRouter();
  const [addresses, setAddresses] = useState<AddressItem[]>(initialAddresses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAddr, setSelectedAddr] = useState<AddressItem | null>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openNew = () => {
    setSelectedAddr(null);
    setFullName("");
    setPhone("");
    setLine1("");
    setLine2("");
    setCity("");
    setState("");
    setPostalCode("");
    setIsDefault(addresses.length === 0);
    setError(null);
    setIsModalOpen(true);
  };

  const openEdit = (addr: AddressItem) => {
    setSelectedAddr(addr);
    setFullName(addr.full_name);
    setPhone(addr.phone);
    setLine1(addr.line1);
    setLine2(addr.line2 || "");
    setCity(addr.city);
    setState(addr.state);
    setPostalCode(addr.postal_code);
    setIsDefault(addr.is_default);
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        fullName,
        phone,
        line1,
        line2,
        city,
        state,
        postalCode,
        isDefault,
      };

      const url = selectedAddr
        ? `/api/account/addresses/${selectedAddr.id}`
        : `/api/account/addresses`;
      const method = selectedAddr ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save address");

      setIsModalOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const res = await fetch(`/api/account/addresses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete address");
      setAddresses(addresses.filter((a) => a.id !== id));
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/account"
            className="text-xs font-semibold text-stone-500 hover:text-stone-800 flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Account
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 font-serif">
            Saved Delivery Addresses
          </h1>
        </div>

        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-700 hover:bg-brand-600 text-white text-xs font-bold rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          Add New Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center text-xs text-stone-400">
          <MapPin className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <p>No addresses saved yet. Click "Add New Address" above to save your delivery location.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-5 rounded-2xl border bg-white shadow-xs space-y-3 flex flex-col justify-between ${
                addr.is_default ? "border-brand-500 ring-1 ring-brand-100" : "border-stone-200"
              }`}
            >
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-stone-900">{addr.full_name}</span>
                  {addr.is_default && (
                    <span className="text-[10px] bg-brand-100 text-brand-800 font-bold px-2 py-0.5 rounded-full">
                      Default Delivery Address
                    </span>
                  )}
                </div>
                <p className="text-stone-700 pt-1">{addr.line1}</p>
                {addr.line2 && <p className="text-stone-700">{addr.line2}</p>}
                <p className="text-stone-700 font-medium">
                  {addr.city}, {addr.state} - {addr.postal_code}
                </p>
                <p className="text-stone-500 font-mono text-[11px] pt-1">Phone: {addr.phone}</p>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2 text-xs">
                <button
                  onClick={() => openEdit(addr)}
                  className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md"
                  title="Edit address"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                  title="Delete address"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900">
                {selectedAddr ? "Edit Delivery Address" : "Add Delivery Address"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-3 text-xs">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl">
                  {error}
                </div>
              )}

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Recipient Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Contact Mobile Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  required
                  value={line1}
                  onChange={(e) => setLine1(e.target.value)}
                  placeholder="Flat / House / Apartment / Street"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  value={line2}
                  onChange={(e) => setLine2(e.target.value)}
                  placeholder="Landmark / Locality"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Guwahati"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Assam"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">PIN *</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="781001"
                    className="w-full px-3 py-2 font-mono border border-stone-300 rounded-lg focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="relative flex items-center gap-2 cursor-pointer font-semibold text-stone-800">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="rounded border-stone-300 text-brand-600 focus:ring-brand-500 w-4 h-4"
                  />
                  Set as default delivery address
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-brand-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

