import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function CmsPageRenderer({
  page,
}: {
  page: {
    title: string;
    content_html?: string | null;
    seo_title?: string | null;
    seo_description?: string | null;
    updated_at?: string;
  };
}) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      <div>
        <Link
          href="/"
          className="text-xs font-semibold text-stone-500 hover:text-stone-800 flex items-center gap-1 mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Home
        </Link>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 tracking-tight font-serif">
          {page.title}
        </h1>
      </div>

      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-12 shadow-xs">
        <div
          className="text-xs sm:text-sm text-stone-700 leading-relaxed prose prose-stone max-w-none prose-headings:font-serif prose-headings:text-stone-900"
          dangerouslySetInnerHTML={{ __html: page.content_html || "<p>Content coming soon.</p>" }}
        />
      </div>
    </div>
  );
}

