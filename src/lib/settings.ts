import { cache } from "react";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type SettingsMap = Record<string, any>;

export const getSettingsMap = cache(async (): Promise<SettingsMap> => {
  const admin = createSupabaseAdminClient();
  const { data } = await admin.from("settings").select("key, value");
  const map: SettingsMap = {};
  for (const row of data ?? []) map[row.key] = row.value ?? {};
  return map;
});

export async function getSetting<T = any>(key: string, fallback?: T): Promise<T> {
  const settings = await getSettingsMap();
  return (settings[key] ?? fallback) as T;
}

export const getPublicSettings = cache(async (): Promise<SettingsMap> => {
  const admin = createSupabaseAdminClient();
  const { data } = await admin.from("settings").select("key, value").eq("is_public", true);
  const map: SettingsMap = {};
  for (const row of data ?? []) map[row.key] = row.value ?? {};
  return map;
});

export async function updateSetting(
  key: string,
  value: Record<string, unknown>,
  groupName: string,
  isPublic = false,
) {
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("settings")
    .upsert({ key, value, group_name: groupName, is_public: isPublic }, { onConflict: "key" });
  if (error) throw new Error(error.message);
}

export async function getSecret(name: string): Promise<string | null> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.rpc("get_app_secret", { p_name: name });
  if (error) return null;
  return (data as string | null) ?? null;
}

export async function setSecret(name: string, value: string) {
  const admin = createSupabaseAdminClient();
  if (!value) {
    const { error } = await admin.rpc("delete_app_secret", { p_name: name });
    if (error) throw new Error(error.message);
    return;
  }
  const { error } = await admin.rpc("set_app_secret", { p_name: name, p_secret: value });
  if (error) throw new Error(error.message);
}

export async function secretIsConfigured(name: string): Promise<boolean> {
  const secret = await getSecret(name);
  return Boolean(secret && secret.length > 0);
}
