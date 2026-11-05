import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type AdminContext = {
  user: { id: string; email?: string | null };
  admin: {
    id: string;
    full_name: string | null;
    email: string;
    role_id: string | null;
    is_active: boolean;
  };
  roleName: string;
  permissions: string[];
};

export async function getSessionUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireUser(next = "/account") {
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

export async function getAdminContext(): Promise<AdminContext | null> {
  const user = await getSessionUser();
  if (!user) return null;

  const admin = createSupabaseAdminClient();
  const { data: adminUser } = await admin
    .from("admin_users")
    .select("id, full_name, email, role_id, is_active, admin_roles(name, permissions)")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!adminUser) return null;

  const role = (adminUser as any).admin_roles;
  return {
    user: { id: user.id, email: user.email },
    admin: {
      id: adminUser.id,
      full_name: adminUser.full_name,
      email: adminUser.email,
      role_id: adminUser.role_id,
      is_active: adminUser.is_active,
    },
    roleName: role?.name ?? "staff",
    permissions: Array.isArray(role?.permissions) ? role.permissions : [],
  };
}

export async function requireAdmin(permission?: string): Promise<AdminContext> {
  const context = await getAdminContext();
  if (!context) redirect("/admin/login");

  if (
    permission &&
    !context.permissions.includes("*") &&
    !context.permissions.includes(permission)
  ) {
    redirect("/admin?error=permission");
  }

  return context;
}

export async function logActivity(input: {
  actorId?: string | null;
  actorEmail?: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}) {
  const admin = createSupabaseAdminClient();
  await admin.from("activity_logs").insert({
    actor_id: input.actorId ?? null,
    actor_email: input.actorEmail ?? null,
    action: input.action,
    entity_type: input.entityType ?? null,
    entity_id: input.entityId ?? null,
    description: input.description ?? null,
    metadata: input.metadata ?? {},
  });
}

export async function logLogin(input: {
  userId?: string | null;
  email?: string | null;
  success: boolean;
}) {
  const admin = createSupabaseAdminClient();
  await admin.from("login_history").insert({
    user_id: input.userId ?? null,
    email: input.email ?? null,
    success: input.success,
  });
}
