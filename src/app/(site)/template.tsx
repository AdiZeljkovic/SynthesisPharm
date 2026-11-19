import { ViewTransition } from "react";

/**
 * template.tsx se ponovo montira pri svakoj navigaciji, pa stara stranica dobije "exit",
 * a nova "enter" animaciju (vidi ::view-transition-*(.page) u globals.css).
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page" exit="page" default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
