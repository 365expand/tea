"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ImageUploader } from "./ImageUploader";
import { RichTextEditor } from "./RichTextEditor";
import { slugify, formatCurrency } from "@/lib/utils";
import {
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  Trash2,
  Sparkles,
  HelpCircle,
  Search,
  Package,
  FolderPlus,
  Tag,
  Percent,
  RefreshCw,
  X,
  Info,
} from "lucide-react";

export type ProductFormProps = {
  initialProduct?: any;
  categories: { id: string; name: string; subcategories: { id: string; name: string }[] }[];
  ingredients: { id: string; name: string }[];
};

const TEA_FEATURE_PRESETS = [
  { title: "Origin / Estate", description: "Upper Assam, Mangalam Estate (4,500 ft ASL)" },
  { title: "Harvest Season", description: "Second Flush (Summer Harvest, Peak Malty Character)" },
  { title: "Tea Grade", description: "FTGFOP1 (Finest Tippy Golden Flowery Orange Pekoe)" },
  { title: "Tasting Notes", description: "Rich, brisk, malty aroma with hints of caramel & cocoa" },
  { title: "Caffeine Level", description: "Medium-High Caffeine (Natural Energizer)" },
  { title: "Steep Temp & Time", description: "95°C water, steep 2.5g for 3–4 minutes" },
  { title: "Best Enjoyed", description: "With warm milk & raw sugar, or brisk black" },
  { title: "Liquor Color", description: "Deep amber liquor with vibrant golden halo" },
];

const TEA_FAQ_PRESETS = [
  {
    question: "How should I brew this tea for the best flavor?",
    answer: "Boil fresh water to 95°C (203°F). Use 1 teaspoon (approx 2.5g) per 200ml cup. Steep for 3-4 minutes. Add milk and sweetener to taste if desired.",
  },
  {
    question: "How many times can I re-steep these leaves?",
    answer: "Whole-leaf orthodox and artisanal grades can be re-steeped up to 2-3 times, adding 30-45 seconds for each subsequent steep.",
  },
  {
    question: "What is the shelf life and proper storage?",
    answer: "Keep stored in an airtight, opaque container away from direct sunlight, moisture, and pungent spices. Best consumed within 18 months of harvest.",
  },
  {
    question: "Does this tea contain caffeine?",
    answer: "Yes, authentic Camellia Sinensis black teas contain moderate-high natural caffeine (approx 40-50mg per cup), providing balanced alertness without jitteriness.",
  },
];

const QUANTITY_PRESETS = [
  { label: "50g Pouch", value: "50g Pouch", grams: "65" },
  { label: "100g Tin", value: "100g Airtight Tin", grams: "125" },
  { label: "250g Zip-Pack", value: "250g Zip-Pack", grams: "275" },
  { label: "500g Value Pack", value: "500g Value Pack", grams: "530" },
  { label: "1kg Bulk Bag", value: "1kg Master Bag", grams: "1050" },
  { label: "20 Pyramid Bags", value: "20 Pyramid Biodegradable Bags", grams: "70" },
  { label: "50 Pyramid Bags", value: "50 Pyramid Biodegradable Bags", grams: "160" },
];

export function ProductForm({ initialProduct, categories: initialCategories, ingredients }: ProductFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialProduct?.id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Categories list local state for quick inline addition
  const [categoryList, setCategoryList] = useState(initialCategories);
  const [isQuickCatDrawerOpen, setIsQuickCatDrawerOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [creatingCat, setCreatingCat] = useState(false);
  const [catDrawerError, setCatDrawerError] = useState<string | null>(null);

  // Core fields
  const [name, setName] = useState(initialProduct?.name || "");
  const [slug, setSlug] = useState(initialProduct?.slug || "");
  const [sku, setSku] = useState(initialProduct?.sku || "");
  const [featuredImage, setFeaturedImage] = useState(initialProduct?.featured_image_url || "");
  const [galleryImages, setGalleryImages] = useState<string[]>(
    initialProduct?.product_images?.map((img: any) => img.url) || []
  );
  const [videoUrl, setVideoUrl] = useState(initialProduct?.video_url || "");
  const [regularPrice, setRegularPrice] = useState(initialProduct?.regular_price?.toString() || "");
  const [salePrice, setSalePrice] = useState(initialProduct?.sale_price?.toString() || "");
  const [netQuantity, setNetQuantity] = useState(initialProduct?.net_quantity || "100g Airtight Tin");
  const [categoryId, setCategoryId] = useState(initialProduct?.category_id || "");
  const [subcategoryId, setSubcategoryId] = useState(initialProduct?.subcategory_id || "");
  const [shortDesc, setShortDesc] = useState(initialProduct?.short_description || "");
  const [descHtml, setDescHtml] = useState(initialProduct?.description_html || "");
  const [stockQuantity, setStockQuantity] = useState(
    initialProduct?.stock_quantity !== undefined ? initialProduct.stock_quantity.toString() : "50"
  );
  const [lowStockThreshold, setLowStockThreshold] = useState(
    initialProduct?.low_stock_threshold?.toString() || "5"
  );
  const [taxRate, setTaxRate] = useState(initialProduct?.tax_rate?.toString() || "5");
  const [hsnCode, setHsnCode] = useState(initialProduct?.hsn_code || "0902");
  const [weightGrams, setWeightGrams] = useState(initialProduct?.weight_grams?.toString() || "125");
  const [status, setStatus] = useState<"draft" | "active" | "archived">(
    initialProduct?.status || "active"
  );
  const [isFeatured, setIsFeatured] = useState<boolean>(initialProduct?.is_featured || false);

  // SEO fields
  const [seoTitle, setSeoTitle] = useState(initialProduct?.seo_title || "");
  const [seoDesc, setSeoDesc] = useState(initialProduct?.seo_description || "");
  const [seoKeywords, setSeoKeywords] = useState(initialProduct?.seo_keywords || "");

  // Structured features
  const [features, setFeatures] = useState<{ title: string; description: string }[]>(
    initialProduct?.product_features?.map((f: any) => ({
      title: f.title,
      description: f.description || "",
    })) || [
      { title: "Origin / Estate", description: "Upper Assam, Single Estate" },
      { title: "Tasting Notes", description: "Brisk, malty, with sweet caramel undertones" },
      { title: "Steep Guide", description: "95°C water, 2.5g per 200ml, steep for 3-4 mins" },
    ]
  );

  // Product FAQs
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>(
    initialProduct?.product_faqs?.map((faq: any) => ({
      question: faq.question,
      answer: faq.answer,
    })) || [
      {
        question: "How should I brew this tea?",
        answer: "Bring fresh water to 95°C, steep 2.5g in 200ml for 3-4 minutes. Add milk to taste.",
      },
    ]
  );

  // Associated ingredients
  const [selectedIngredients, setSelectedIngredients] = useState<
    { ingredient_id: string; notes: string }[]
  >(
    initialProduct?.product_ingredients?.map((pi: any) => ({
      ingredient_id: pi.ingredient_id,
      notes: pi.notes || "",
    })) || []
  );

  // Ingredient search filter inside selector
  const [ingredientSearch, setIngredientSearch] = useState("");

  const selectedCategory = categoryList.find((c) => c.id === categoryId);
  const availableSubcategories = selectedCategory?.subcategories || [];

  // Generate automated SKU based on product name
  const generateSku = (prodName: string) => {
    const clean = prodName.replace(/[^a-zA-Z0-9 ]/g, "").trim();
    const initials = clean
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 4) || "TEA";
    const rand = Math.floor(100 + Math.random() * 900);
    return `TEA-${initials}-${rand}`;
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing) {
      setSlug(slugify(val));
      if (!sku) {
        setSku(generateSku(val));
      }
      if (!seoTitle) {
        setSeoTitle(`Buy ${val} Online | Authentic Pure Indian Tea`);
      }
    }
  };

  const handleQuickAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setCreatingCat(true);
    setCatDrawerError(null);
    try {
      const generatedSlug = slugify(newCatName);
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCatName.trim(),
          slug: generatedSlug,
          description_html: newCatDesc.trim() || null,
          is_active: true,
          display_order: categoryList.length,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create category");

      const newCategory = { ...data.category, subcategories: [] };
      setCategoryList([...categoryList, newCategory]);
      setCategoryId(newCategory.id);
      setSubcategoryId("");
      setIsQuickCatDrawerOpen(false);
      setNewCatName("");
      setNewCatDesc("");
    } catch (err: any) {
      setCatDrawerError(err.message);
    } finally {
      setCreatingCat(false);
    }
  };

  const addFeature = () => {
    setFeatures([...features, { title: "", description: "" }]);
  };

  const addPresetFeature = (title: string, description: string) => {
    if (features.some((f) => f.title.toLowerCase() === title.toLowerCase())) return;
    setFeatures([...features, { title, description }]);
  };

  const removeFeature = (idx: number) => {
    setFeatures(features.filter((_, i) => i !== idx));
  };

  const addFaq = () => {
    setFaqs([...faqs, { question: "", answer: "" }]);
  };

  const addPresetFaq = (question: string, answer: string) => {
    if (faqs.some((f) => f.question.toLowerCase() === question.toLowerCase())) return;
    setFaqs([...faqs, { question, answer }]);
  };

  const removeFaq = (idx: number) => {
    setFaqs(faqs.filter((_, i) => i !== idx));
  };

  const toggleIngredient = (id: string) => {
    if (selectedIngredients.some((si) => si.ingredient_id === id)) {
      setSelectedIngredients(selectedIngredients.filter((si) => si.ingredient_id !== id));
    } else {
      setSelectedIngredients([...selectedIngredients, { ingredient_id: id, notes: "" }]);
    }
  };

  const updateIngredientNotes = (id: string, notes: string) => {
    setSelectedIngredients(
      selectedIngredients.map((si) => (si.ingredient_id === id ? { ...si, notes } : si))
    );
  };

  // Price calculations
  const numRegular = parseFloat(regularPrice) || 0;
  const numSale = parseFloat(salePrice) || 0;
  const hasSale = numSale > 0 && numSale < numRegular;
  const discountPercent = hasSale ? Math.round(((numRegular - numSale) / numRegular) * 100) : 0;
  const savingsAmount = hasSale ? numRegular - numSale : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const payload = {
        name,
        slug: slug || slugify(name),
        sku,
        featured_image_url: featuredImage || null,
        video_url: videoUrl || null,
        regular_price: numRegular,
        sale_price: hasSale ? numSale : null,
        net_quantity: netQuantity,
        category_id: categoryId || null,
        subcategory_id: subcategoryId || null,
        short_description: shortDesc || null,
        description_html: descHtml || null,
        stock_quantity: parseInt(stockQuantity) || 0,
        low_stock_threshold: parseInt(lowStockThreshold) || 5,
        tax_rate: parseFloat(taxRate) || 0,
        hsn_code: hsnCode || null,
        weight_grams: weightGrams ? parseInt(weightGrams) : null,
        status,
        is_featured: isFeatured,
        seo_title: seoTitle || null,
        seo_description: seoDesc || null,
        seo_keywords: seoKeywords || null,
        gallery_images: galleryImages,
        features: features.filter((f) => f.title.trim()),
        faqs: faqs.filter((f) => f.question.trim()),
        ingredients: selectedIngredients,
      };

      const url = isEditing
        ? `/api/admin/products/${initialProduct.id}`
        : `/api/admin/products`;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save product");

      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const filteredIngredients = ingredients.filter((ing) =>
    ing.name.toLowerCase().includes(ingredientSearch.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-6xl mx-auto pb-16">
      {/* Sticky top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky top-14 bg-slate-50/95 backdrop-blur-md py-3 z-20 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 shadow-xs transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              {isEditing ? `Edit: ${initialProduct.name}` : "Create New Product"}
              {isFeatured && (
                <span className="text-[10px] uppercase font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                  Featured
                </span>
              )}
            </h1>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              Manage inventory, photos, specifications, GST and live pricing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/products"
            className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {isEditing ? "Save Product Changes" : "Publish Tea to Store"}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-xl flex items-center gap-2 font-mono">
          <Info className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Main details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Section: Title & Descriptions */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-600" />
                Product Title &amp; Identifiers
              </h3>
              <span className="text-[11px] font-mono text-slate-400">* mandatory</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Royal Assam CTC Second Flush with Golden Tips"
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  URL Slug *
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  placeholder="royal-assam-ctc"
                  className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    SKU (Stock Keeping Unit) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setSku(generateSku(name || "TEA"))}
                    className="text-[10px] text-emerald-700 hover:text-emerald-800 font-mono font-medium flex items-center gap-1 transition"
                    title="Generate random tea SKU"
                  >
                    <RefreshCw className="w-3 h-3" /> Auto
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value.toUpperCase())}
                  placeholder="TEA-ASM-001"
                  className="w-full px-3 py-1.5 text-xs font-mono uppercase bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Short Description / Tea Summary
              </label>
              <textarea
                rows={2}
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                placeholder="A strong, amber liquor with golden tips from the upper Brahmaputra valley. Full-bodied with malty nuances..."
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <RichTextEditor
                label="Full Rich Description &amp; Heritage"
                value={descHtml}
                onChange={(html) => setDescHtml(html)}
                placeholder="Write rich details about harvest, terroir, notes, tasting notes, and brewing methods..."
              />
            </div>
          </div>

          {/* Section: Images & Media */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs space-y-3.5">
            <div className="border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Media, Photos &amp; Video
              </h3>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                Upload clear, high-resolution photographs to build buyer trust
              </p>
            </div>

            <div>
              <ImageUploader
                label="Cover / Featured Image *"
                value={featuredImage}
                onChange={(url) => setFeaturedImage(url as string)}
                bucket="product-images"
                helperText="Primary image shown on storefront cards, search, and checkout"
              />
            </div>

            <div className="border-t border-slate-100 pt-3">
              <ImageUploader
                label="Product Gallery (Multiple Angles)"
                value={galleryImages}
                onChange={(urls) => setGalleryImages(urls as string[])}
                multiple
                bucket="product-images"
                helperText="Dry tea leaf close-ups, packaging box, brewed liquor cup in sunlight"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Video URL (YouTube or Vimeo, Optional)
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Section: Structured Product Features */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-600" />
                  Structured Tea Specifications
                </h3>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                  Displayed as clean specification badges on the customer product page
                </p>
              </div>
              <button
                type="button"
                onClick={addFeature}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Custom Feature
              </button>
            </div>

            {/* Quick 1-click preset chips */}
            <div>
              <p className="text-[11px] font-semibold text-slate-600 mb-1.5">1-Click Quick Fill Chips:</p>
              <div className="flex flex-wrap gap-1.5">
                {TEA_FEATURE_PRESETS.map((preset) => (
                  <button
                    key={preset.title}
                    type="button"
                    onClick={() => addPresetFeature(preset.title, preset.description)}
                    className="inline-flex items-center gap-1 text-[11px] font-mono bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200 transition"
                  >
                    <Plus className="w-3 h-3 text-emerald-600" />
                    {preset.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-1">
              {features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={feat.title}
                    onChange={(e) => {
                      const updated = [...features];
                      updated[idx].title = e.target.value;
                      setFeatures(updated);
                    }}
                    placeholder="Feature title (e.g. Origin)"
                    className="w-1/3 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    value={feat.description}
                    onChange={(e) => {
                      const updated = [...features];
                      updated[idx].description = e.target.value;
                      setFeatures(updated);
                    }}
                    placeholder="Feature description (e.g. Upper Assam, India)"
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Product FAQs */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-emerald-600" />
                  Product FAQs &amp; Brewing Guides
                </h3>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                  Answer common customer questions right on the product page
                </p>
              </div>
              <button
                type="button"
                onClick={addFaq}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Custom FAQ
              </button>
            </div>

            {/* Quick 1-click FAQ chips */}
            <div>
              <p className="text-[11px] font-semibold text-slate-600 mb-1.5">1-Click Common Questions:</p>
              <div className="flex flex-wrap gap-1.5">
                {TEA_FAQ_PRESETS.map((preset) => (
                  <button
                    key={preset.question}
                    type="button"
                    onClick={() => addPresetFaq(preset.question, preset.answer)}
                    className="inline-flex items-center gap-1 text-[11px] font-mono bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200 transition"
                  >
                    <Plus className="w-3 h-3 text-emerald-600" />
                    {preset.question.slice(0, 32)}...
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-1">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="p-3 border border-slate-200 rounded-xl bg-slate-50/50 space-y-2 relative"
                >
                  <button
                    type="button"
                    onClick={() => removeFaq(idx)}
                    className="absolute top-2.5 right-2.5 p-1 text-slate-400 hover:text-rose-600 rounded transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => {
                      const updated = [...faqs];
                      updated[idx].question = e.target.value;
                      setFaqs(updated);
                    }}
                    placeholder="Question (e.g. Can this tea be brewed with milk?)"
                    className="w-full pr-8 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                  <textarea
                    rows={2}
                    value={faq.answer}
                    onChange={(e) => {
                      const updated = [...faqs];
                      updated[idx].answer = e.target.value;
                      setFaqs(updated);
                    }}
                    placeholder="Answer (e.g. Yes! This robust Assam CTC is blended especially for traditional karak chai with whole milk...)"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-700 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section: Associated Ingredients */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Blend Ingredients &amp; Botanicals
                </h3>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                  Select all leaves, herbs, and spices present in this tea
                </p>
              </div>
              <div className="relative w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                <input
                  type="text"
                  value={ingredientSearch}
                  onChange={(e) => setIngredientSearch(e.target.value)}
                  placeholder="Filter botanicals..."
                  className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-50 border border-slate-200 text-slate-800 rounded-md focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto p-0.5">
              {filteredIngredients.map((ing) => {
                const selected = selectedIngredients.find((si) => si.ingredient_id === ing.id);
                return (
                  <div
                    key={ing.id}
                    className={`p-2.5 rounded-lg border text-xs transition ${
                      selected
                        ? "border-emerald-300 bg-emerald-50/60 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={Boolean(selected)}
                        onChange={() => toggleIngredient(ing.id)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span className={`font-medium ${selected ? "text-emerald-900 font-semibold" : "text-slate-700"}`}>
                        {ing.name}
                      </span>
                    </div>
                    {selected && (
                      <input
                        type="text"
                        value={selected.notes}
                        onChange={(e) => updateIngredientNotes(ing.id, e.target.value)}
                        placeholder="Optional note / ratio (e.g. 10% crushed pods)"
                        className="mt-1.5 w-full px-2 py-1 text-[11px] bg-white border border-slate-200 text-slate-800 rounded-md focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    )}
                  </div>
                );
              })}
              {filteredIngredients.length === 0 && (
                <p className="col-span-2 text-xs font-mono text-slate-400 py-3 text-center">
                  No matching ingredients found. You can add new ingredients in Admin &gt; Ingredients.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Pricing, Inventory, Classification, SEO */}
        <div className="space-y-4">
          {/* Status & Featured */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
              Visibility &amp; Publishing
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Storefront Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-1.5 text-xs font-mono font-semibold border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 bg-white text-slate-900"
              >
                <option value="active">Active (Visible in Storefront)</option>
                <option value="draft">Draft (Hidden from Catalog)</option>
                <option value="archived">Archived (Unlisted)</option>
              </select>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="relative flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                Feature on Storefront Homepage
              </label>
              <p className="text-[11px] font-mono text-slate-400 pl-6 mt-0.5">
                Highlights this blend in the top curations section on the home page
              </p>
            </div>
          </div>

          {/* Pricing & Units */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs space-y-3">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-800">
                Pricing &amp; Packaging
              </h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Regular Price (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={regularPrice}
                onChange={(e) => setRegularPrice(e.target.value)}
                placeholder="499.00"
                className="w-full px-3 py-1.5 text-sm font-mono font-bold bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sale Price (₹, optional)
              </label>
              <input
                type="number"
                step="0.01"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                placeholder="399.00"
                className="w-full px-3 py-1.5 text-sm font-mono font-bold bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
              />

              {/* Live Discount Calculator Preview */}
              {hasSale && (
                <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-800 font-mono">
                  <div className="flex items-center gap-1 font-semibold">
                    <Percent className="w-3.5 h-3.5" />
                    <span>{discountPercent}% OFF</span>
                  </div>
                  <span>Saves {formatCurrency(savingsAmount)}</span>
                </div>
              )}
              {numSale > 0 && numSale >= numRegular && (
                <p className="text-[11px] font-mono text-rose-600 mt-1">
                  Sale price must be strictly lower than regular price to offer a discount.
                </p>
              )}
            </div>

            {/* Net Quantity with Quick Presets */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Net Quantity *
                </label>
                <span className="text-[10px] font-mono text-slate-400">Presets below:</span>
              </div>
              <input
                type="text"
                required
                value={netQuantity}
                onChange={(e) => setNetQuantity(e.target.value)}
                placeholder="e.g. 100g Airtight Tin"
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500 mb-2 font-mono"
              />

              <div className="flex flex-wrap gap-1">
                {QUANTITY_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      setNetQuantity(p.value);
                      setWeightGrams(p.grams);
                    }}
                    className={`text-[10px] px-2 py-0.5 rounded border font-mono transition ${
                      netQuantity === p.value
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Shipping Weight in Grams
              </label>
              <input
                type="number"
                value={weightGrams}
                onChange={(e) => setWeightGrams(e.target.value)}
                placeholder="125"
                className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[10px] font-mono text-slate-400 mt-1">Used by courier rate calculators</p>
            </div>
          </div>

          {/* Classification & Quick Category Creator */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-800">
                Classification
              </h3>
              <button
                type="button"
                onClick={() => setIsQuickCatDrawerOpen(true)}
                className="text-[11px] font-mono font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition"
              >
                <FolderPlus className="w-3.5 h-3.5" /> + New Category
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setSubcategoryId("");
                }}
                className="w-full px-3 py-1.5 text-xs font-mono font-medium border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 bg-white text-slate-900"
              >
                <option value="">Select Category</option>
                {categoryList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subcategory
              </label>
              <select
                value={subcategoryId}
                disabled={!categoryId || availableSubcategories.length === 0}
                onChange={(e) => setSubcategoryId(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-mono font-medium border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 disabled:bg-slate-50 disabled:text-slate-400 bg-white text-slate-900"
              >
                <option value="">None / Select Subcategory</option>
                {availableSubcategories.map((sc) => (
                  <option key={sc.id} value={sc.id}>
                    {sc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Inventory & Tax */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
              Inventory &amp; GST Details
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Stock Units *
                </label>
                <input
                  type="number"
                  required
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Low Stock Alert
                </label>
                <input
                  type="number"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  GST Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  placeholder="5"
                  className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">HSN Code</label>
                <input
                  type="text"
                  value={hsnCode}
                  onChange={(e) => setHsnCode(e.target.value)}
                  placeholder="0902"
                  className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>
            </div>
          </div>

          {/* SEO Metadata */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
              Search Engine Optimization (SEO)
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">SEO Title</label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Buy Royal Assam CTC Tea Online | Pure Leaves"
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Meta Description
              </label>
              <textarea
                rows={3}
                value={seoDesc}
                onChange={(e) => setSeoDesc(e.target.value)}
                placeholder="Handpicked single-origin Assam tea leaves with malty punch. Shipped fresh from garden to cup..."
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Keywords</label>
              <input
                type="text"
                value={seoKeywords}
                onChange={(e) => setSeoKeywords(e.target.value)}
                placeholder="assam ctc, buy pure tea, golden tips chai"
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Category Slide-over Drawer (Right to Left) */}
      {isQuickCatDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsQuickCatDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out animate-in slide-in-from-right">
            <div className="px-5 py-3.5 border-b border-slate-200/80 bg-slate-50/75 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Add New Category Quickly</h3>
                <p className="text-xs text-slate-500">Create and instantly bind category to this tea</p>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickCatDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
              {catDrawerError && (
                <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg font-mono">
                  {catDrawerError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Masala Chai Blends"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Short Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Aromatic crushed spices blended with robust Assam CTC..."
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="p-3.5 border-t border-slate-200/80 bg-slate-50/75 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsQuickCatDrawerOpen(false)}
                className="px-3 py-1.5 border border-slate-300 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleQuickAddCategory}
                disabled={creatingCat || !newCatName.trim()}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition disabled:opacity-50 shadow-xs"
              >
                {creatingCat && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Create &amp; Select
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
