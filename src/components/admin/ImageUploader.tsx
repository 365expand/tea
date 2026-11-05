"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, Link as LinkIcon, AlertCircle } from "lucide-react";

interface ImageUploaderProps {
  value?: string | string[];
  onChange: (url: string | string[]) => void;
  multiple?: boolean;
  bucket?: string;
  label?: string;
  helperText?: string;
}

export function ImageUploader({
  value,
  onChange,
  multiple = false,
  bucket = "product-images",
  label = "Image",
  helperText = "PNG, JPG, WEBP, SVG up to 10MB",
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [urlInput, setUrlInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingPreviews, setUploadingPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const images: string[] = multiple
    ? Array.isArray(value)
      ? value
      : value
      ? [value]
      : []
    : typeof value === "string" && value
    ? [value]
    : [];

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);

    // Create instant local object URLs for zero-latency instant preview!
    const localPreviews = Array.from(files).map((f) => URL.createObjectURL(f));
    setUploadingPreviews(localPreviews);
    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`"${file.name}" exceeds the 10MB limit.`);
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("bucket", bucket);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || `Failed to upload ${file.name}`);
        }
        uploadedUrls.push(data.url);
      }

      if (multiple) {
        onChange([...images, ...uploadedUrls]);
      } else {
        onChange(uploadedUrls[0] || "");
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload image. You can also paste an image URL directly.");
    } finally {
      setUploading(false);
      setUploadingPreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    const trimmed = urlInput.trim();

    if (multiple) {
      onChange([...images, trimmed]);
    } else {
      onChange(trimmed);
    }
    setUrlInput("");
    setError(null);
  };

  const handleRemove = (indexToRemove: number) => {
    if (multiple) {
      const filtered = images.filter((_, idx) => idx !== indexToRemove);
      onChange(filtered);
    } else {
      onChange("");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700">{label}</label>
        <div className="flex items-center gap-2">
          {helperText && <span className="text-[11px] text-slate-400 font-mono">{helperText}</span>}
          {/* Mode switch */}
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200 text-[11px]">
            <button
              type="button"
              onClick={() => setMode("upload")}
              className={`px-2.5 py-0.5 rounded-md font-medium transition ${
                mode === "upload"
                  ? "bg-white text-emerald-800 shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Upload
            </button>
            <button
              type="button"
              onClick={() => setMode("url")}
              className={`px-2.5 py-0.5 rounded-md font-medium transition ${
                mode === "url"
                  ? "bg-white text-emerald-800 shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              URL
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-2.5 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setMode("url")}
            className="text-[11px] font-bold underline hover:text-rose-900 shrink-0"
          >
            Paste URL instead
          </button>
        </div>
      )}

      {/* Grid of uploaded images + active instant uploading previews */}
      {(images.length > 0 || uploadingPreviews.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5 mb-2">
          {images.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              className="group relative aspect-square rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shadow-2xs"
            >
              <img
                src={url}
                alt={`Image ${idx + 1}`}
                className="w-full h-full object-cover transition duration-200 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLElement).style.opacity = "0.5";
                }}
              />
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/70 hover:bg-rose-600 text-white transition shadow-xs opacity-90 group-hover:opacity-100"
                title="Remove image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              {idx === 0 && multiple && (
                <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-white/90 border border-slate-200 text-[10px] text-emerald-800 font-mono font-semibold shadow-2xs">
                  Primary
                </span>
              )}
            </div>
          ))}

          {/* Instant local previews while actively uploading */}
          {uploadingPreviews.map((previewUrl, idx) => (
            <div
              key={`preview-${idx}`}
              className="relative aspect-square rounded-xl border-2 border-emerald-500 bg-slate-50 overflow-hidden shadow-2xs animate-pulse"
            >
              <img src={previewUrl} alt="Uploading preview" className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center text-white text-[10px] font-mono gap-1">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Uploading...</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload button area or URL input depending on mode */}
      {(!images.length || multiple) && mode === "upload" && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition ${
            isDragging
              ? "border-emerald-500 bg-emerald-50 scale-[1.01]"
              : "border-slate-300 hover:border-emerald-500 bg-slate-50/60 hover:bg-slate-50"
          } ${uploading ? "opacity-60 pointer-events-none" : ""}`}
        >
          <input
            type="file"
            ref={fileInputRef}
            multiple={multiple}
            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml,image/avif"
            onChange={(e) => handleUpload(e.target.files)}
            className="hidden"
          />
          {uploading ? (
            <div className="flex items-center gap-2 text-xs text-emerald-700 font-mono font-semibold py-1">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Uploading to {bucket}...</span>
            </div>
          ) : (
            <>
              <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-emerald-700 mb-1.5 shadow-2xs">
                <Upload className="w-3.5 h-3.5" />
              </div>
              <p className="text-xs font-semibold text-slate-800">
                Click to browse or drag &amp; drop images
              </p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Target bucket: {bucket}
              </p>
            </>
          )}
        </div>
      )}

      {/* Direct URL input mode */}
      {(!images.length || multiple) && mode === "url" && (
        <form onSubmit={handleAddUrl} className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://images.unsplash.com/... or /images/..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 placeholder-slate-400 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={!urlInput.trim()}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition shadow-xs"
          >
            Add Image
          </button>
        </form>
      )}
    </div>
  );
}
