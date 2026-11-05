import { NextRequest, NextResponse } from "next/server";
import { getAdminContext, logActivity } from "@/lib/auth";
import { setSecret } from "@/lib/settings";

export async function PUT(req: NextRequest) {
  const context = await getAdminContext();
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { name, secret } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Secret name is required" }, { status: 400 });
    }

    const allowed = ["razorpay_secret", "smtp_password"];
    if (!allowed.includes(name)) {
      return NextResponse.json({ error: "Invalid secret key" }, { status: 400 });
    }

    await setSecret(name, secret);

    await logActivity({
      actorId: context.user.id,
      actorEmail: context.admin.email,
      action: "update_vault_secret",
      entityType: "vault",
      entityId: name,
      description: `Updated encrypted secret in Vault: ${name}`,
    });

    return NextResponse.json({ success: true, name });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

