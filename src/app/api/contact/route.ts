import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { getSetting } from "@/lib/settings";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Please enter your message." }, { status: 400 });
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone ? String(phone).trim() : null;
    const trimmedSubject = subject ? String(subject).trim() : "General Inquiry";
    const trimmedMessage = message.trim();

    const admin = createSupabaseAdminClient();
    const { data: inquiry, error: insertError } = await admin
      .from("contact_inquiries")
      .insert({
        name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
        subject: trimmedSubject,
        message: trimmedMessage,
        status: "unread",
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Attempt to notify store owner / support email asynchronously (fire & forget, safe fallback)
    try {
      const general = await getSetting<any>("general", {
        support_email: "care@purepour.co",
        website_name: "Pure Pour Co.",
      });
      const notifyEmail = general?.support_email || "care@purepour.co";

      await sendEmail({
        to: notifyEmail,
        subject: `[New Inquiry] ${trimmedSubject} - ${trimmedName}`,
        bodyHtml: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #047857;">New Customer Inquiry Received</h2>
            <p><strong>Customer Name:</strong> ${trimmedName}</p>
            <p><strong>Email:</strong> <a href="mailto:${trimmedEmail}">${trimmedEmail}</a></p>
            <p><strong>Phone:</strong> ${trimmedPhone || "Not provided"}</p>
            <p><strong>Topic / Subject:</strong> ${trimmedSubject}</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p><strong>Message:</strong></p>
            <blockquote style="background: #f8fafc; border-left: 4px solid #10b981; padding: 12px 16px; margin: 0; white-space: pre-wrap;">
              ${trimmedMessage}
            </blockquote>
            <p style="margin-top: 24px; font-size: 12px; color: #64748b;">
              You can review, manage, and respond to this message directly in the Pure Pour Co. Admin Console.
            </p>
          </div>
        `,
      });
    } catch {
      // Non-fatal if SMTP is not configured
    }

    return NextResponse.json(
      {
        success: true,
        message: "Thank you for reaching out! Your message has been received and our tea specialists will respond shortly.",
        inquiry,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to submit inquiry. Please try again." },
      { status: 500 }
    );
  }
}
