"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "./ImageUploader";
import { slugify } from "@/lib/utils";
import {
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  Loader2,
  X,
  Search,
  Check,
} from "lucide-react";

export type Ingredient = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  short_description: string | null;
  created_at: string;
};

const COMMON_BOTANICAL_PRESETS = [
  { name: "Single-Estate Assam CTC Leaf", desc: "Granular, high-grown strong Assam tea leaves" },
  { name: "Darjeeling Whole Leaf (FTGFOP1)", desc: "Delicate muscatel floral orthodox tea leaves" },
  { name: "Green Cardamom (Elaichi)", desc: "Whole crushed green cardamom pods for sweet aroma" },
  { name: "Sun-Dried Ginger (Sonth)", desc: "Warm, spicy dried ginger flakes for digestion" },
  { name: "Ceylon Cinnamon Bark (Dalchini)", desc: "Naturally sweet, aromatic pure quill cinnamon" },
  { name: "Whole Cloves (Laung)", desc: "Pungent, warming spice with rich eugenol oils" },
  { name: "Holy Basil (Krishna Tulsi)", desc: "Adaptogenic sacred basil leaves for immunity" },
  { name: "Lemongrass (Citronella)", desc: "Crisp, zesty citrus herbal infusion" },
  { name: "Kashmiri Rose Petals", desc: "Fragrant sun-dried pink rose petals" },
  { name: "Star Anise", desc: "Sweet licorice notes with subtle woody pungency" },
  { name: "Mulethi (Licorice Root)", desc: "Naturally sweet root soothing for throat" },
  { name: "Fennel Seeds (Saunf)", desc: "Cooling sweet aroma aiding after-meal digestion" },
];

export function IngredientManager({
  initialIngredients,
}: {
  initialIngredients: Ingredient[];
}) {
  const router = useRouter();
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialIngredients);
  const [search, setSearch] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<Ingredient | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [desc, setDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredIngredients = ingredients.filter((ing) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      ing.name.toLowerCase().includes(q) ||
      (ing.short_description || "").toLowerCase().includes(q)
    );
  });

  const openNewDrawer = (presetName?: string, presetDesc?: string) => {
    setSelected(null);
    setName(presetName || "");
    setSlug(presetName ? slugify(presetName) : "");
    setImageUrl("");
    setDesc(presetDesc || "");
    setError(null);
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (item: Ingredient) => {
    setSelected(item);
    setName(item.name);
    setSlug(item.slug);
    setImageUrl(item.image_url || "");
    setDesc(item.short_description || "");
    setError(null);
    setIsDrawerOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!selected) setSlug(slugify(val));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        name,
        slug: slug || slugify(name),
        image_url: imageUrl || null,
        short_description: desc || null,
      };

      const url = selected
        ? `/api/admin/ingredients/${selected.id}`
        : `/api/admin/ingredients`;
      const method = selected ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save botanical");

      if (selected) {
        setIngredients(ingredients.map((i) => (i.id === selected.id ? data.ingredient : i)));
      } else {
        setIngredients([data.ingredient, ...ingredients]);
      }

      setIsDrawerOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (id: string, itemName: string) => {
    if (!confirm(`Are you sure you want to delete ingredient "${itemName}"?`)) return;

    try {
      const res = await fetch(`/api/admin/ingredients/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      setIngredients(ingredients.filter((i) => i.id !== id));
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Botanicals &amp; Ingredients</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Single-origin leaves, dried spices, herbs, and botanicals associated with tea blends
          </p>
        </div>

        <button
          onClick={() => openNewDrawer()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Botanical
        </button>
      </div>

      {/* Preset Suggestions & Instant Search */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search botanicals..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-lg focus:outline-none focus:border-emerald-500 focus:bg-white transition"
            />
          </div>

          <span className="text-xs font-mono text-slate-500">
            {ingredients.length} botanical{ingredients.length === 1 ? "" : "s"} total
          </span>
        </div>

        {/* 1-click Preset chips */}
        <div className="pt-2.5 border-t border-slate-100">
          <p className="text-[11px] font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            1-Click Popular Indian Tea Botanicals:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_BOTANICAL_PRESETS.map((p) => {
              const alreadyExists = ingredients.some(
                (i) => i.name.toLowerCase() === p.name.toLowerCase()
              );
              return (
                <button
                  key={p.name}
                  type="button"
                  disabled={alreadyExists}
                  onClick={() => openNewDrawer(p.name, p.desc)}
                  className={`text-[11px] font-mono px-2.5 py-1 rounded-full border transition flex items-center gap-1 ${
                    alreadyExists
                      ? "bg-slate-50 text-slate-400 border-slate-200 cursor-default"
                      : "bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 text-slate-700 border-slate-200"
                  }`}
                >
                  {alreadyExists ? <Check className="w-3 h-3 text-emerald-600" /> : <Plus className="w-3 h-3 text-emerald-600" />}
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {filteredIngredients.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-xl p-10 text-center text-slate-500 shadow-xs">
          <Sparkles className="w-8 h-8 text-slate-400 mx-auto mb-2.5 stroke-1" />
          <h3 className="text-sm font-semibold text-slate-800">
            {search ? "No matching botanicals" : "No ingredients configured yet"}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {search
              ? "Try adjusting your search query or add a new botanical."
              : "Add ingredients like Assam CTC Leaf, Green Cardamom, Dried Ginger, Cinnamon Bark, Tulsi."}
          </p>
          <button
            onClick={() => openNewDrawer()}
            className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-lg hover:bg-emerald-100 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add First Botanical
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredIngredients.map((ing) => (
            <div
              key={ing.id}
              className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs flex items-start justify-between gap-3 hover:border-slate-300 transition"
            >
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                  {ing.image_url ? (
                    <img src={ing.image_url} alt={ing.name} className="w-full h-full object-cover" />
                  ) : (
                    <Sparkles className="w-5 h-5 text-slate-400" />
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-900">{ing.name}</h4>
                  <p className="text-[10px] text-slate-500 font-mono">/{ing.slug}</p>
                  {ing.short_description && (
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                      {ing.short_description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => openEditDrawer(ing)}
                  className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                  title="Edit botanical"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteItem(ing.id, ing.name)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Delete botanical"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide-over Drawer (Right to Left) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out animate-in slide-in-from-right">
            <div className="px-5 py-3.5 border-b border-slate-200/80 bg-slate-50/75 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {selected ? `Edit Botanical: ${selected.name}` : "Create Botanical"}
                </h3>
                <p className="text-xs text-slate-500">Configure ingredient details and imagery</p>
              </div>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={save} className="flex-1 flex flex-col overflow-hidden text-xs">
              <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
                {error && (
                  <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Botanical / Spice Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Green Cardamom (Elaichi)"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                    placeholder="green-cardamom"
                    className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <ImageUploader
                    label="Botanical Photo (Optional)"
                    value={imageUrl}
                    onChange={(url) => setImageUrl(url as string)}
                    bucket="ingredient-images"
                    helperText="Photograph of dried pods, leaves, or whole spice"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Short Description
                  </label>
                  <textarea
                    rows={3}
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Sun-dried pods sourced from Idukki hills in Kerala..."
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="p-3.5 border-t border-slate-200/80 bg-slate-50/75 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {selected ? "Save Changes" : "Create Botanical"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
