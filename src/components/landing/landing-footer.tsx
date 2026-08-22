import Link from "next/link";
import { API_DOCS_URL, POSTMAN_URL, REPO_URL, SWAGGER_URL } from "./links";
import { PRODUCT_NAME, Wordmark } from "./wordmark";

const LINKS: { label: string; href: string; external?: boolean }[] = [
  { label: "Open the app", href: "/chat" },
  { label: "API reference", href: API_DOCS_URL, external: true },
  { label: "Postman collection", href: POSTMAN_URL, external: true },
  { label: "Swagger source", href: SWAGGER_URL, external: true },
  { label: "Repository", href: REPO_URL, external: true },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-border px-5 py-10 sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Wordmark />
          <p className="mt-2 max-w-[46ch] text-xs leading-relaxed text-muted-foreground">
            {PRODUCT_NAME} is a take-home build — Next.js 16, React 19, Tailwind
            CSS v4 and Socket.io, against a provided chat API.
          </p>
        </div>

        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {LINKS.map((link) => (
            <li key={link.label}>
              {link.external ? (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-sm text-sm text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  href={link.href}
                  className="rounded-sm text-sm text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
