"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "./ImageUploader";
import { RichTextEditor } from "./RichTextEditor";
import { slugify } from "@/lib/utils";
import {
  Plus,
  Edit2,
  Trash2,
  FolderTree,
  ChevronRight,
  Loader2,
  X,
  Search,
} from "lucide-react";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description_html: string | null;
  image_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  display_order: number;
  is_active: boolean;
  subcategories?: Subcategory[];
};

export type Subcategory = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description_html: string | null;
  image_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  display_order: number;
  is_active: boolean;
};

export function CategoryManager({
  initialCategories,
}: {
  initialCategories: Category[];
}) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [isSubcategoryDrawerOpen, setIsSubcategoryDrawerOpen] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [activeCategoryIdForSub, setActiveCategoryIdForSub] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Form states for Category
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catImage, setCatImage] = useState("");
  const [catSeoTitle, setCatSeoTitle] = useState("");
  const [catSeoDesc, setCatSeoDesc] = useState("");
  const [catSeoKeywords, setCatSeoKeywords] = useState("");
  const [catOrder, setCatOrder] = useState(0);
  const [catActive, setCatActive] = useState(true);

  // Form states for Subcategory
  const [subName, setSubName] = useState("");
  const [subSlug, setSubSlug] = useState("");
  const [subDesc, setSubDesc] = useState("");
  const [subImage, setSubImage] = useState("");
  const [subOrder, setSubOrder] = useState(0);
  const [subActive, setSubActive] = useState(true);

  const filteredCategories = categories.filter((cat) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const matchCat = cat.name.toLowerCase().includes(q) || cat.slug.toLowerCase().includes(q);
    const matchSub = (cat.subcategories || []).some(
      (s) => s.name.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q)
    );
    return matchCat || matchSub;
  });

  const openNewCategoryDrawer = () => {
    setSelectedCategory(null);
    setCatName("");
    setCatSlug("");
    setCatDesc("");
    setCatImage("");
    setCatSeoTitle("");
    setCatSeoDesc("");
    setCatSeoKeywords("");
    setCatOrder(categories.length);
    setCatActive(true);
    setError(null);
    setIsCategoryDrawerOpen(true);
  };

  const openEditCategoryDrawer = (cat: Category) => {
    setSelectedCategory(cat);
    setCatName(cat.name);
    setCatSlug(cat.slug);
    setCatDesc(cat.description_html || "");
    setCatImage(cat.image_url || "");
    setCatSeoTitle(cat.seo_title || "");
    setCatSeoDesc(cat.seo_description || "");
    setCatSeoKeywords(cat.seo_keywords || "");
    setCatOrder(cat.display_order);
    setCatActive(cat.is_active);
    setError(null);
    setIsCategoryDrawerOpen(true);
  };

  const openNewSubcategoryDrawer = (categoryId: string) => {
    setActiveCategoryIdForSub(categoryId);
    setSelectedSubcategory(null);
    setSubName("");
    setSubSlug("");
    setSubDesc("");
    setSubImage("");
    setSubOrder(0);
    setSubActive(true);
    setError(null);
    setIsSubcategoryDrawerOpen(true);
  };

  const openEditSubcategoryDrawer = (sub: Subcategory) => {
    setActiveCategoryIdForSub(sub.category_id);
    setSelectedSubcategory(sub);
    setSubName(sub.name);
    setSubSlug(sub.slug);
    setSubDesc(sub.description_html || "");
    setSubImage(sub.image_url || "");
    setSubOrder(sub.display_order);
    setSubActive(sub.is_active);
    setError(null);
    setIsSubcategoryDrawerOpen(true);
  };

  const handleNameChange = (name: string) => {
    setCatName(name);
    if (!selectedCategory) {
      setCatSlug(slugify(name));
    }
  };

  const handleSubNameChange = (name: string) => {
    setSubName(name);
    if (!selectedSubcategory) {
      setSubSlug(slugify(name));
    }
  };

  const toggleCategoryActive = async (cat: Category) => {
    setTogglingId(cat.id);
    const newActive = !cat.is_active;

    // Optimistic UI update
    setCategories((prev) =>
      prev.map((c) => (c.id === cat.id ? { ...c, is_active: newActive } : c))
    );

    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: newActive }),
      });
      if (!res.ok) throw new Error("Failed to toggle status");
      router.refresh();
    } catch (err: any) {
      // Revert
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, is_active: cat.is_active } : c))
      );
      alert(err.message);
    } finally {
      setTogglingId(null);
    }
  };

  const saveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        name: catName,
        slug: catSlug || slugify(catName),
        description_html: catDesc,
        image_url: catImage,
        seo_title: catSeoTitle,
        seo_description: catSeoDesc,
        seo_keywords: catSeoKeywords,
        display_order: Number(catOrder) || 0,
        is_active: catActive,
      };

      const url = selectedCategory
        ? `/api/admin/categories/${selectedCategory.id}`
        : `/api/admin/categories`;
      const method = selectedCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save category");

      if (selectedCategory) {
        setCategories((prev) =>
          prev.map((c) => (c.id === selectedCategory.id ? { ...data.category, subcategories: c.subcategories } : c))
        );
      } else {
        setCategories((prev) => [...prev, { ...data.category, subcategories: [] }]);
      }

      setIsCategoryDrawerOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"? All subcategories will also be deleted.`)) return;

    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      setCategories((prev) => prev.filter((c) => c.id !== id));
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const saveSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        category_id: activeCategoryIdForSub,
        name: subName,
        slug: subSlug || slugify(subName),
        description_html: subDesc,
        image_url: subImage,
        display_order: Number(subOrder) || 0,
        is_active: subActive,
      };

      const url = selectedSubcategory
        ? `/api/admin/subcategories/${selectedSubcategory.id}`
        : `/api/admin/subcategories`;
      const method = selectedSubcategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save subcategory");

      setCategories((prev) =>
        prev.map((c) => {
          if (c.id !== activeCategoryIdForSub) return c;
          const subs = c.subcategories || [];
          if (selectedSubcategory) {
            return {
              ...c,
              subcategories: subs.map((s) => (s.id === selectedSubcategory.id ? data.subcategory : s)),
            };
          }
          return { ...c, subcategories: [...subs, data.subcategory] };
        })
      );

      setIsSubcategoryDrawerOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteSubcategory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete subcategory "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/subcategories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");

      setCategories((prev) =>
        prev.map((c) => ({
          ...c,
          subcategories: (c.subcategories || []).filter((s) => s.id !== id),
        }))
      );
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Categories &amp; Subcategories</h1>
          <p className="text-xs text-slate-500 mt-0.5">Organize teas, harvest blends, and botanical wares</p>
        </div>

        <button
          onClick={openNewCategoryDrawer}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Category
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories or subcategories..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:bg-white text-slate-800 placeholder:text-slate-400 transition"
          />
        </div>
        <span className="text-xs font-mono text-slate-500">
          {categories.length} total categories
        </span>
      </div>

      {/* Category List */}
      <div className="space-y-3">
        {filteredCategories.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-xl p-10 text-center text-slate-500 shadow-xs">
            <FolderTree className="w-8 h-8 text-slate-400 mx-auto mb-2.5 stroke-1" />
            <h3 className="text-sm font-semibold text-slate-800">
              {search ? "No matching categories found" : "No categories created yet"}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {search
                ? "Try searching for a different keyword or create a new category."
                : "Create your first tea category (e.g., Black Tea, Green Tea, Chai Masala, Herbal Infusions)."}
            </p>
            <button
              onClick={openNewCategoryDrawer}
              className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-lg hover:bg-emerald-100 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Category
            </button>
          </div>
        ) : (
          filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs hover:border-slate-300 transition"
            >
              {/* Category row */}
              <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                    {cat.image_url ? (
                      <img
                        src={cat.image_url}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FolderTree className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-900">{cat.name}</h3>
                      <button
                        type="button"
                        disabled={togglingId === cat.id}
                        onClick={() => toggleCategoryActive(cat)}
                        title="Click to toggle status"
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-medium border transition ${
                          cat.is_active
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        {togglingId === cat.id ? "Updating..." : cat.is_active ? "Active" : "Inactive"}
                      </button>
                    </div>
                    <div className="flex items-center gap-2.5 text-[11px] text-slate-500 mt-0.5">
                      <span className="font-mono text-slate-600">/{cat.slug}</span>
                      <span>•</span>
                      <span>Order: {cat.display_order}</span>
                      <span>•</span>
                      <span>{(cat.subcategories || []).length} subcategories</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto text-xs">
                  <button
                    onClick={() => openNewSubcategoryDrawer(cat.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Subcategory
                  </button>
                  <button
                    onClick={() => openEditCategoryDrawer(cat)}
                    className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                    title="Edit category"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteCategory(cat.id, cat.name)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Subcategories */}
              {cat.subcategories && cat.subcategories.length > 0 && (
                <div className="bg-slate-50/60 p-2 sm:px-5 divide-y divide-slate-100">
                  {cat.subcategories.map((sub) => (
                    <div
                      key={sub.id}
                      className="py-2 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        {sub.image_url && (
                          <img
                            src={sub.image_url}
                            alt={sub.name}
                            className="w-5 h-5 rounded object-cover border border-slate-200"
                          />
                        )}
                        <span className="font-medium text-slate-800">{sub.name}</span>
                        <span className="font-mono text-[11px] text-slate-500">/{sub.slug}</span>
                        {!sub.is_active && (
                          <span className="text-[10px] text-slate-400 italic">(Inactive)</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditSubcategoryDrawer(sub)}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded transition"
                          title="Edit subcategory"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteSubcategory(sub.id, sub.name)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                          title="Delete subcategory"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Category Slide-over Drawer (Right to Left) */}
      {isCategoryDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsCategoryDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-2xl border-l border-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out animate-in slide-in-from-right">
            <div className="px-5 py-3.5 border-b border-slate-200/80 bg-slate-50/75 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  {selectedCategory ? `Edit Category: ${selectedCategory.name}` : "Add New Category"}
                </h2>
                <p className="text-xs text-slate-500">Configure category details, hierarchy and SEO metadata</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={saveCategory} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {error && (
                  <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={catName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g. Masala Chai Blends"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Slug (URL Key) *
                    </label>
                    <input
                      type="text"
                      required
                      value={catSlug}
                      onChange={(e) => setCatSlug(slugify(e.target.value))}
                      placeholder="masala-chai-blends"
                      className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <ImageUploader
                    label="Category Header / Cover Image"
                    value={catImage}
                    onChange={(url) => setCatImage(url as string)}
                    bucket="category-images"
                    helperText="Visual cover displayed on category listing pages"
                  />
                </div>

                <div>
                  <RichTextEditor
                    label="Rich Description &amp; Origin Notes"
                    value={catDesc}
                    onChange={(html) => setCatDesc(html)}
                    placeholder="Describe the category, region of origin, terroir, and flavour profiles..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5 pt-1 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={catOrder}
                      onChange={(e) => setCatOrder(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={catActive}
                        onChange={(e) => setCatActive(e.target.checked)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      Category is Active
                    </label>
                  </div>
                </div>

                <div className="border-t border-slate-200/80 pt-3.5 space-y-3">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    SEO Metadata
                  </h4>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      SEO Meta Title
                    </label>
                    <input
                      type="text"
                      value={catSeoTitle}
                      onChange={(e) => setCatSeoTitle(e.target.value)}
                      placeholder="Best Assam CTC Tea Online | Authentic Blends"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Meta Description
                    </label>
                    <textarea
                      rows={2}
                      value={catSeoDesc}
                      onChange={(e) => setCatSeoDesc(e.target.value)}
                      placeholder="Summary snippet displayed on search engine results..."
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3.5 border-t border-slate-200/80 bg-slate-50/75 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCategoryDrawerOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow-xs transition disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {selectedCategory ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subcategory Slide-over Drawer (Right to Left) */}
      {isSubcategoryDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsSubcategoryDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out animate-in slide-in-from-right">
            <div className="px-5 py-3.5 border-b border-slate-200/80 bg-slate-50/75 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  {selectedSubcategory ? `Edit Subcategory: ${selectedSubcategory.name}` : "Add Subcategory"}
                </h2>
                <p className="text-xs text-slate-500">Configure child category item under parent category</p>
              </div>
              <button
                type="button"
                onClick={() => setIsSubcategoryDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={saveSubcategory} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {error && (
                  <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subcategory Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={subName}
                    onChange={(e) => handleSubNameChange(e.target.value)}
                    placeholder="e.g. Orthodox First Flush"
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
                    value={subSlug}
                    onChange={(e) => setSubSlug(slugify(e.target.value))}
                    placeholder="orthodox-first-flush"
                    className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <ImageUploader
                    label="Subcategory Photo"
                    value={subImage}
                    onChange={(url) => setSubImage(url as string)}
                    bucket="category-images"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Short Description
                  </label>
                  <textarea
                    rows={2}
                    value={subDesc}
                    onChange={(e) => setSubDesc(e.target.value)}
                    placeholder="Brief description of this leaf variety or grade..."
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5 pt-1 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={subOrder}
                      onChange={(e) => setSubOrder(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={subActive}
                        onChange={(e) => setSubActive(e.target.checked)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      Subcategory is Active
                    </label>
                  </div>
                </div>
              </div>

              <div className="p-3.5 border-t border-slate-200/80 bg-slate-50/75 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsSubcategoryDrawerOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow-xs transition disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {selectedSubcategory ? "Save Changes" : "Create Subcategory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
