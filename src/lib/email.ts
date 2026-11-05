import nodemailer from "nodemailer";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSetting, getSecret } from "@/lib/settings";

export type SmtpConfig = {
  enabled: boolean;
  host: string;
  port: number;
  username: string;
  encryption: "tls" | "ssl" | "none";
  from_name: string;
  from_email: string;
};

export async function getTransporter() {
  const smtp = await getSetting<SmtpConfig>("smtp", {
    enabled: false,
    host: "",
    port: 587,
    username: "",
    encryption: "tls",
    from_name: "Pure Pour Co.",
    from_email: "",
  });

  if (!smtp.enabled || !smtp.host) {
    return null;
  }

  const password = (await getSecret("smtp_password")) || "";

  return {
    transporter: nodemailer.createTransport({
      host: smtp.host,
      port: Number(smtp.port) || 587,
      secure: smtp.encryption === "ssl" || Number(smtp.port) === 465,
      auth: {
        user: smtp.username,
        pass: password,
      },
      tls: {
        rejectUnauthorized: false,
      },
    }),
    from: `"${smtp.from_name || "Pure Pour Co."}" <${smtp.from_email || smtp.username}>`,
  };
}

export function renderTemplate(template: string, vars: Record<string, string | number | undefined | null>) {
  let result = template;
  for (const [key, val] of Object.entries(vars)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    result = result.replace(regex, String(val ?? ""));
  }
  return result;
}

export async function sendEmail(params: {
  to: string;
  templateKey?: string;
  subject?: string;
  bodyHtml?: string;
  variables?: Record<string, string | number | undefined | null>;
  orderId?: string | null;
}) {
  const admin = createSupabaseAdminClient();
  const transportData = await getTransporter();

  let subject = params.subject || "";
  let bodyHtml = params.bodyHtml || "";

  if (params.templateKey) {
    const { data: tmpl } = await admin
      .from("email_templates")
      .select("subject, body_html, is_active")
      .eq("key", params.templateKey)
      .single();

    if (tmpl && tmpl.is_active) {
      const vars = {
        site_name: "Pure Pour Co.",
        ...params.variables,
      };
      subject = renderTemplate(tmpl.subject, vars);
      bodyHtml = renderTemplate(tmpl.body_html, vars);
    }
  }

  if (!transportData) {
    // SMTP disabled or not configured; log as failed/skipped
    await admin.from("email_logs").insert({
      order_id: params.orderId || null,
      to_email: params.to,
      template_key: params.templateKey || null,
      subject,
      status: "failed",
      error: "SMTP is disabled or not configured in Admin Settings.",
    });
    return { success: false, reason: "SMTP is not configured" };
  }

  try {
    await transportData.transporter.sendMail({
      from: transportData.from,
      to: params.to,
      subject,
      html: bodyHtml,
    });

    await admin.from("email_logs").insert({
      order_id: params.orderId || null,
      to_email: params.to,
      template_key: params.templateKey || null,
      subject,
      status: "sent",
      sent_at: new Date().toISOString(),
    });

    return { success: true };
  } catch (err: any) {
    console.error("Email send error:", err);
    await admin.from("email_logs").insert({
      order_id: params.orderId || null,
      to_email: params.to,
      template_key: params.templateKey || null,
      subject,
      status: "failed",
      error: err.message || "Unknown error",
    });
    return { success: false, error: err.message };
  }
}

