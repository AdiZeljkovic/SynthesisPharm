"use server";

import nodemailer from "nodemailer";
import { site } from "@/lib/site";

export type ContactValues = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

export type ContactState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Partial<Record<keyof ContactValues, string>>;
  values?: ContactValues;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function field(fd: FormData, key: string, max: number) {
  return String(fd.get(key) ?? "")
    .trim()
    .slice(0, max);
}

export async function sendContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const values: ContactValues = {
    name: field(formData, "name", 120),
    email: field(formData, "email", 200),
    phone: field(formData, "phone", 40),
    subject: field(formData, "subject", 200),
    message: field(formData, "message", 5000),
  };

  // Honeypot – botovi popune skriveno polje
  if (field(formData, "website", 200)) {
    return { status: "success", message: "Hvala! Vaša poruka je poslana." };
  }

  const errors: ContactState["errors"] = {};
  if (values.name.length < 2) errors.name = "Unesite ime i prezime.";
  if (!EMAIL_RE.test(values.email)) errors.email = "Unesite ispravnu email adresu.";
  if (values.message.length < 10) errors.message = "Poruka treba imati barem 10 znakova.";
  if (Object.keys(errors).length) {
    return { status: "error", message: "Molimo ispravite označena polja.", errors, values };
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE, CONTACT_TO, CONTACT_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.error("[kontakt] SMTP nije konfigurisan (SMTP_HOST / SMTP_USER / SMTP_PASS).");
    return {
      status: "error",
      message: `Slanje trenutno nije dostupno. Molimo pišite nam direktno na ${site.email}.`,
      values,
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT ?? 465),
      secure: (SMTP_SECURE ?? "true") === "true",
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    await transporter.sendMail({
      from: CONTACT_FROM ?? `"Synthesis Pharma web" <${SMTP_USER}>`,
      to: CONTACT_TO ?? site.email,
      replyTo: { name: values.name, address: values.email },
      subject: `[Web] ${values.subject || "Nova poruka s web stranice"}`,
      text: [
        `Ime i prezime: ${values.name}`,
        `Email: ${values.email}`,
        `Telefon: ${values.phone || "—"}`,
        `Naslov: ${values.subject || "—"}`,
        "",
        values.message,
      ].join("\n"),
    });

    return { status: "success", message: "Hvala! Vaša poruka je poslana – javit ćemo vam se uskoro." };
  } catch (err) {
    console.error("[kontakt] Greška pri slanju:", err);
    return {
      status: "error",
      message: `Došlo je do greške pri slanju. Pokušajte ponovo ili pišite na ${site.email}.`,
      values,
    };
  }
}
