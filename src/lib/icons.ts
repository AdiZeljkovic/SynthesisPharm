import {
  Award,
  BadgeCheck,
  ClipboardCheck,
  FileSearch,
  Handshake,
  HeartPulse,
  Leaf,
  Megaphone,
  Pill,
  ShieldCheck,
  Stethoscope,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";

/** Ikone koje se mogu izabrati u adminu (ključ → ikona). Spisak ključeva je i u admin/schema.ts. */
export const icons: Record<string, LucideIcon> = {
  istrazivanje: FileSearch,
  registracija: ClipboardCheck,
  promocija: Megaphone,
  zdravstvo: Stethoscope,
  srce: HeartPulse,
  stit: ShieldCheck,
  kvalitet: BadgeCheck,
  nagrada: Award,
  partnerstvo: Handshake,
  priroda: Leaf,
  lijek: Pill,
  distribucija: Truck,
  tim: Users,
};

export function icon(key: string | undefined, fallback: LucideIcon = BadgeCheck) {
  return (key && icons[key]) || fallback;
}
