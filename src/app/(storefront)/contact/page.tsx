import { getPublicSettings } from "@/lib/settings";
import { ContactClient } from "./ContactClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact Us | Pure Pour Co. Artisanal Tea",
  description:
    "Connect with Pure Pour Co. tea curators for order support, brewing assistance, single-estate harvests, or corporate gifting.",
};

export default async function ContactPage() {
  const settings = await getPublicSettings();
  const contact = settings.contact || {};
  const business = settings.business || {};
  const general = settings.general || {};
  const social = settings.social || {};

  return (
    <ContactClient
      contactInfo={{
        email: contact.email || general.support_email || "care@purepour.co",
        phone: contact.phone || "+91 98765 43210",
        whatsapp: contact.whatsapp || "+91 98765 43210",
        address:
          contact.address ||
          business.address ||
          "Heritage Tea Estate Hub, Upper Assam & Darjeeling, India",
        workingHours:
          contact.working_hours || "Monday – Saturday: 9:00 AM – 6:30 PM IST",
        socials: social,
      }}
    />
  );
}
