import type { Metadata } from "next";
import { CapabilityStrip } from "@/components/landing/capability-strip";
import { CraftSection } from "@/components/landing/craft-section";
import { GroupsSection } from "@/components/landing/groups-section";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { LandingCta } from "@/components/landing/landing-cta";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNav } from "@/components/landing/landing-nav";
import { RealtimeBand } from "@/components/landing/realtime-band";
import { SupportBot } from "@/components/landing/support-bot";
import { PRODUCT_NAME } from "@/components/landing/wordmark";

const DESCRIPTION =
  "A real-time messenger built on the phone number you already have. No usernames, no invites — enter a number, find a person, and your message lands on their screen as you send it.";

export const metadata: Metadata = {
  title: `${PRODUCT_NAME} — chat that starts with a phone number`,
  description: DESCRIPTION,
  openGraph: {
    title: `${PRODUCT_NAME} — chat that starts with a phone number`,
    description: DESCRIPTION,
    type: "website",
  },
};

export default function LandingPage() {
  return (
    <>
      {/* Sections fade in as they are scrolled to. Without scripting there is
          nothing to fade them, so they simply start where they end up. */}
      <noscript>
        <style>
          {
            ".reveal { opacity: 1 !important; translate: none !important; transform: none !important }"
          }
        </style>
      </noscript>

      <LandingNav />
      <main id="main">
        <Hero />
        <CapabilityStrip />
        <HowItWorks />
        <RealtimeBand />
        <GroupsSection />
        <CraftSection />
        <LandingCta />
      </main>
      <LandingFooter />
      <SupportBot />
    </>
  );
}
