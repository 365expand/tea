"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Code,
  RotateCcw,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  label?: string;
  placeholder?: string;
  rows?: number;
}

export function RichTextEditor({
  value,
  onChange,
  label,
  placeholder = "Write description here...",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [internalValue, setInternalValue] = useState(value || "");

  useEffect(() => {
    if (editorRef.current && !isHtmlMode) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || "";
      }
    }
    setInternalValue(value || "");
  }, [value, isHtmlMode]);

  const exec = (command: string, arg: string | undefined = undefined) => {
    document.execCommand(command, false, arg);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleLink = () => {
    const url = prompt("Enter link URL:", "https://");
    if (url) {
      exec("createLink", url);
    }
  };

  return (
    <div className="space-y-1.5">
      {label && <label className="block text-xs font-semibold text-slate-700">{label}</label>}

      <div className="border border-slate-300 rounded-xl overflow-hidden bg-white shadow-xs focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-200 text-slate-600">
          <button
            type="button"
            onClick={() => exec("bold")}
            title="Bold"
            className="p-1 rounded-md hover:bg-slate-200/70 hover:text-slate-900 transition"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => exec("italic")}
            title="Italic"
            className="p-1 rounded-md hover:bg-slate-200/70 hover:text-slate-900 transition"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <span className="w-px h-4 bg-slate-300 mx-1" />
          <button
            type="button"
            onClick={() => exec("formatBlock", "<h2>")}
            title="Heading 2"
            className="p-1 rounded-md hover:bg-slate-200/70 hover:text-slate-900 transition"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => exec("formatBlock", "<h3>")}
            title="Heading 3"
            className="p-1 rounded-md hover:bg-slate-200/70 hover:text-slate-900 transition"
          >
            <Heading3 className="w-3.5 h-3.5" />
          </button>
          <span className="w-px h-4 bg-slate-300 mx-1" />
          <button
            type="button"
            onClick={() => exec("insertUnorderedList")}
            title="Bullet List"
            className="p-1 rounded-md hover:bg-slate-200/70 hover:text-slate-900 transition"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => exec("insertOrderedList")}
            title="Numbered List"
            className="p-1 rounded-md hover:bg-slate-200/70 hover:text-slate-900 transition"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleLink}
            title="Insert Link"
            className="p-1 rounded-md hover:bg-slate-200/70 hover:text-slate-900 transition"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => exec("removeFormat")}
            title="Clear formatting"
            className="p-1 rounded-md hover:bg-slate-200/70 hover:text-slate-900 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="ml-auto">
            <button
              type="button"
              onClick={() => setIsHtmlMode(!isHtmlMode)}
              className={`flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-mono rounded-md transition ${
                isHtmlMode
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold"
                  : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
              }`}
            >
              <Code className="w-3 h-3" />
              {isHtmlMode ? "Rich View" : "HTML"}
            </button>
          </div>
        </div>

        {/* Content area */}
        {isHtmlMode ? (
          <textarea
            value={internalValue}
            onChange={(e) => {
              setInternalValue(e.target.value);
              onChange(e.target.value);
            }}
            rows={8}
            className="w-full p-3 font-mono text-xs bg-slate-900 text-emerald-300 focus:outline-none resize-y border-0"
            placeholder="<div>Write custom HTML...</div>"
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            className="p-3.5 min-h-[140px] max-h-[380px] overflow-y-auto text-xs text-slate-800 focus:outline-none prose prose-sm max-w-none bg-white"
            data-placeholder={placeholder}
          />
        )}
      </div>
    </div>
  );
}
