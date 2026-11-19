import type { Metadata } from "next";
import { AdminApp } from "@/admin/AdminApp";

export const metadata: Metadata = {
  title: { absolute: "Admin – Synthesis Pharma" },
  robots: { index: false, follow: false },
};

/**
 * Admin panel: statična stranica (React) + PHP API u /admin/api (public/admin/api).
 * Sav sadržaj se učitava i čuva preko API-ja, pa stranica ne zavisi od builda sadržaja.
 */
export default function AdminPage() {
  return <AdminApp />;
}
