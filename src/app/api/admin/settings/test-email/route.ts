import { NextRequest, NextResponse } from "next/server";
import { getAdminContext } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const context = await getAdminContext();
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { to } = await req.json();
    if (!to) {
      return NextResponse.json({ error: "Recipient email required" }, { status: 400 });
    }

    const result = await sendEmail({
      to,
      subject: "Pure Pour Co. — SMTP Configuration Test",
      bodyHtml: `
        <div style="font-family: sans-serif; padding: 20px; color: #1c1917;">
          <h2 style="color: #467139;">SMTP Connection Verified!</h2>
          <p>This is a live test email from your <strong>Pure Pour Co.</strong> store administration console.</p>
          <p>Your SMTP host, authentication credentials, and TLS encryption are configured and working properly.</p>
          <hr style="border: none; border-top: 1px solid #e7e5e4; margin: 20px 0;" />
          <p style="font-size: 11px; color: #78716c;">Sent at: ${new Date().toISOString()}</p>
        </div>
      `,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error || result.reason }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

