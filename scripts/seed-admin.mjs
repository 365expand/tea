import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const adminEmail = process.env.ADMIN_SEED_EMAIL || "admin@chaileaf.in";
const adminPassword = process.env.ADMIN_SEED_PASSWORD || "AdminTea@2026!";
const adminName = process.env.ADMIN_SEED_NAME || "Head of Operations";

async function main() {
  console.log(`Ensuring super admin exists: ${adminEmail}`);

  // Check if role exists
  const { data: role, error: roleError } = await supabase
    .from("admin_roles")
    .select("id")
    .eq("name", "super_admin")
    .single();

  if (roleError || !role) {
    console.error("super_admin role not found in database:", roleError);
    process.exit(1);
  }

  // Check if auth user exists
  const { data: userList, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("Failed to list users:", listError);
    process.exit(1);
  }

  let user = userList.users.find((u) => u.email?.toLowerCase() === adminEmail.toLowerCase());

  if (!user) {
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { full_name: adminName },
    });
    if (createError) {
      console.error("Failed to create admin user:", createError);
      process.exit(1);
    }
    user = newUser.user;
    console.log(`Created new auth user: ${user.id}`);
  } else {
    // Update password to ensure known credentials
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: adminPassword,
      email_confirm: true,
      user_metadata: { full_name: adminName },
    });
    if (updateError) {
      console.warn("Could not update admin password:", updateError.message);
    } else {
      console.log(`Updated existing auth user credentials.`);
    }
  }

  // Ensure record in admin_users
  const { error: adminUserError } = await supabase.from("admin_users").upsert(
    {
      user_id: user.id,
      role_id: role.id,
      full_name: adminName,
      email: adminEmail,
      is_active: true,
    },
    { onConflict: "user_id" }
  );

  if (adminUserError) {
    console.error("Failed to upsert admin_user record:", adminUserError);
    process.exit(1);
  }

  console.log("Admin setup complete!");
  console.log(`Email: ${adminEmail}`);
  console.log(`Password: ${adminPassword}`);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});

