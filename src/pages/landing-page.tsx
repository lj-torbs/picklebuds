import { LandingFeatures } from "@/components/landing/landing-features"
import { LandingHero } from "@/components/landing/landing-hero"
import { LandingNav } from "@/components/landing/landing-nav"
import { LandingWorkflow } from "@/components/landing/landing-workflow"

export function LandingPage() {
  return (
    <main className="min-h-svh bg-background">
      <LandingNav />
      <LandingHero />
      <LandingFeatures />
      <LandingWorkflow />
    </main>
  )
}
