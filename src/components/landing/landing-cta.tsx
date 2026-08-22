import Link from "next/link";
import { ArrowRight, Code } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { REPO_URL } from "./links";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section";

export function LandingCta() {
  return (
    <section className="px-5 py-24 sm:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <Reveal>
          <div className="rounded-3xl border border-border bg-card px-6 py-14 text-center sm:px-12">
            <SectionHeading className="mx-auto max-w-[18ch]">
              Pick a number and go.
            </SectionHeading>
            <p className="mx-auto mt-4 max-w-[46ch] leading-relaxed text-muted-foreground">
              Any phone number works, including one you invent on the spot. The
              first time it is seen, it becomes an account.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/chat"
                className={buttonVariants({
                  className: "h-11 w-full px-5 text-base sm:w-auto",
                })}
              >
                Open the app
                <ArrowRight data-icon="inline-end" />
              </Link>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({
                  variant: "outline",
                  className: "h-11 w-full px-5 text-base sm:w-auto",
                })}
              >
                <Code data-icon="inline-start" />
                View the source
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
