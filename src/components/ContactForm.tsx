"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2, Send, TriangleAlert } from "lucide-react";
import { sendContact, type ContactState, type ContactValues } from "@/app/kontakt/actions";

const initial: ContactState = { status: "idle" };

const inputCls =
  "w-full rounded-2xl border bg-white px-5 py-3.5 text-base outline-none transition placeholder:text-muted/70 focus:border-brand-400 focus:ring-4 focus:ring-brand-100";

function Field({
  name,
  label,
  type = "text",
  required,
  autoComplete,
  state,
  textarea,
}: {
  name: keyof ContactValues;
  label: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  state: ContactState;
  textarea?: boolean;
}) {
  const error = state.errors?.[name];
  const id = `kontakt-${name}`;
  const common = {
    id,
    name,
    required,
    autoComplete,
    defaultValue: state.values?.[name] ?? "",
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-greska` : undefined,
    className: `${inputCls} ${error ? "border-red-400" : "border-slate-200"}`,
  };
  return (
    <div className={textarea ? "sm:col-span-2" : ""}>
      <label htmlFor={id} className="mb-2 block text-sm font-bold text-ink">
        {label} {required && <span className="text-brand-500">*</span>}
      </label>
      {textarea ? <textarea rows={6} {...common} /> : <input type={type} {...common} />}
      {error && (
        <p id={`${id}-greska`} className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export function ContactForm() {
  const [state, action, pending] = useActionState(sendContact, initial);

  if (state.status === "success") {
    return (
      <div role="status" className="flex flex-col items-center rounded-3xl bg-leaf-50 p-12 text-center">
        <CheckCircle2 className="size-14 text-leaf-500" aria-hidden />
        <h3 className="mt-5 text-2xl font-extrabold text-ink">Poruka je poslana</h3>
        <p className="mt-2 text-muted">{state.message}</p>
      </div>
    );
  }

  // key resetuje polja s vraćenim vrijednostima nakon greške
  return (
    <form action={action} key={JSON.stringify(state.values ?? {})} className="grid gap-5 sm:grid-cols-2" noValidate>
      <Field name="name" label="Ime i prezime" required autoComplete="name" state={state} />
      <Field name="email" label="Email" type="email" required autoComplete="email" state={state} />
      <Field name="phone" label="Broj telefona" type="tel" autoComplete="tel" state={state} />
      <Field name="subject" label="Naslov" state={state} />
      <Field name="message" label="Poruka" required state={state} textarea />

      {/* Honeypot */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Web stranica
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {state.status === "error" && state.message && (
        <p role="alert" className="flex items-start gap-2 rounded-2xl bg-red-50 p-4 text-sm text-red-700 sm:col-span-2">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {state.message}
        </p>
      )}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-8 py-4 text-sm font-bold tracking-wide text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-600 disabled:opacity-70"
        >
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Send className="size-4" aria-hidden />}
          {pending ? "Šaljem…" : "Pošalji poruku"}
        </button>
      </div>
    </form>
  );
}
