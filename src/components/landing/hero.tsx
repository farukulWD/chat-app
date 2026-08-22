import Link from "next/link";
import { ArrowRight, BookText } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { API_DOCS_URL } from "./links";
import { LiveDemo } from "./live-demo";
import { Reveal } from "./reveal";
import { PRODUCT_NAME } from "./wordmark";

export function Hero() {
  return (
    <section className="px-5 pt-14 pb-16 sm:px-8 sm:pt-20 sm:pb-24">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal delay={80}>
            <h1 className="mt-6 text-4xl font-bold tracking-[-0.035em] text-balance sm:text-5xl lg:text-6xl">
              Type a number.
              <br className="hidden sm:block" /> Start talking.
            </h1>
          </Reveal>

          <Reveal delay={140}>
            <p className="mx-auto mt-5 max-w-[52ch] text-base leading-relaxed text-muted-foreground sm:text-lg">
              {PRODUCT_NAME} has one address: the phone number you already have.
              No usernames, no invite links, no signup step — enter a number,
              find a person, send. It lands on their screen as you press send.
            </p>
          </Reveal>

          <Reveal delay={200}>
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
                href={API_DOCS_URL}
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({
                  variant: "outline",
                  className: "h-11 w-full px-5 text-base sm:w-auto",
                })}
              >
                <BookText data-icon="inline-start" />
                Read the API docs
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal delay={260} className="mt-14">
          <p className="mb-3 text-center font-mono text-[0.625rem] tracking-[0.16em] text-muted-foreground uppercase sm:text-xs sm:tracking-[0.18em]">
            <span className="hidden sm:inline">One conversation · </span>
            Two screens, both live
          </p>
          <LiveDemo />
        </Reveal>
      </div>
    </section>
  );
}
