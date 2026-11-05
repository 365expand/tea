import { NextRequest, NextResponse } from "next/server";
import { getAdminContext } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const adminContext = await getAdminContext();
    if (!adminContext) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const bucket = (formData.get("bucket") as string) || "product-images";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedBuckets = [
      "product-images",
      "category-images",
      "ingredient-images",
      "review-images",
      "branding",
      "shipping-documents",
      "invoices",
    ];

    if (!allowedBuckets.includes(bucket)) {
      return NextResponse.json({ error: "Invalid bucket specified" }, { status: 400 });
    }

    // Extract extension safely
    const extMatch = file.name.match(/\.([a-zA-Z0-9]+)$/);
    const ext = extMatch ? extMatch[1].toLowerCase() : "jpg";

    // Clean up filename and append timestamp
    const cleanBase = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 50);
    const filename = `${Date.now()}-${cleanBase}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    // Content type normalization
    let contentType = file.type || "application/octet-stream";
    if (contentType === "application/octet-stream" || !contentType) {
      if (ext === "jpg" || ext === "jpeg") contentType = "image/jpeg";
      else if (ext === "png") contentType = "image/png";
      else if (ext === "webp") contentType = "image/webp";
      else if (ext === "gif") contentType = "image/gif";
      else if (ext === "svg") contentType = "image/svg+xml";
      else if (ext === "ico") contentType = "image/x-icon";
      else if (ext === "pdf") contentType = "application/pdf";
    }
    if (contentType === "image/jpg") contentType = "image/jpeg";

    const supabase = createSupabaseAdminClient();
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filename, buffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filename);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      filename,
      bucket,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}
