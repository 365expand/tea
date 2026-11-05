import { Metadata } from "next";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { CouponManager, CouponItem } from "@/components/admin/CouponManager";

export const metadata: Metadata = {
  title: "Coupon Management | Pure Pour Co. Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const supabase = createSupabaseAdminClient();
  const { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  return <CouponManager initialCoupons={(coupons as CouponItem[]) || []} />;
}
