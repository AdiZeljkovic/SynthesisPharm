import type { SVGProps } from "react";
import { site } from "@/lib/site";

export function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8v3h2.6V21h2.9Z" />
    </svg>
  );
}

export function LinkedinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M6.9 8.8H3.8V20h3.1V8.8ZM5.4 3.5a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6ZM20.2 13.6c0-3-1.6-4.9-4.3-4.9-1.4 0-2.4.8-2.8 1.5V8.8H10V20h3.1v-6c0-1.4.6-2.6 2.1-2.6s2 1.2 2 2.6v6h3.1v-6.4Z" />
    </svg>
  );
}

export function SocialLinks({ className = "", itemClassName = "" }: { className?: string; itemClassName?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {site.social.facebook && (
        <a
          href={site.social.facebook}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Synthesis Pharma na Facebooku"
          className={itemClassName}
        >
          <FacebookIcon className="size-4" />
        </a>
      )}
      {site.social.linkedin && (
        <a
          href={site.social.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Synthesis Pharma na LinkedInu"
          className={itemClassName}
        >
          <LinkedinIcon className="size-4" />
        </a>
      )}
    </div>
  );
}
