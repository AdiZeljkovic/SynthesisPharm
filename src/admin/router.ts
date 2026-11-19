"use client";

import { useEffect, useSyncExternalStore } from "react";

/** Jednostavan hash router (#/blog/novi …) – admin je jedna statična stranica. */

let dirty = false;
/** Hash prefiks unutar kojeg se izmjene ne gube (npr. lista ↔ stavka iste kolekcije) */
let scope = "";

export function useDirtyGuard(isDirty: boolean, withinScope = "") {
  useEffect(() => {
    dirty = isDirty;
    scope = withinScope;
    return () => {
      dirty = false;
      scope = "";
    };
  }, [isDirty, withinScope]);
}

function subscribe(cb: () => void) {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}

let last = typeof window !== "undefined" ? window.location.hash : "";

if (typeof window !== "undefined") {
  // Upozorenje pri napuštanju stranice s nesačuvanim izmjenama
  window.addEventListener("beforeunload", (e) => {
    if (dirty) e.preventDefault();
  });
  window.addEventListener("hashchange", () => {
    const inScope = scope !== "" && (window.location.hash === scope || window.location.hash.startsWith(scope + "/"));
    if (dirty && !inScope && window.location.hash !== last) {
      if (!window.confirm("Imate nesačuvane izmjene. Napustiti stranicu bez čuvanja?")) {
        history.replaceState(null, "", last || "#/");
        return;
      }
      dirty = false;
    }
    last = window.location.hash;
  });
}

export function useRoute() {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash, () => "");
  return hash.replace(/^#\/?/, "").split("/").filter(Boolean).map(decodeURIComponent);
}

export function go(path: string) {
  window.location.hash = path.startsWith("#") ? path : `#${path}`;
}
