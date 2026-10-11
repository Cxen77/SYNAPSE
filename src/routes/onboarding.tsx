import { createFileRoute } from "@tanstack/react-router";
import Onboarding from "@/fuseon-web/components/Onboarding";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [{"title": "Your interests — Fuseon"}, {"name": "description", "content": "Pick the events you love so Fuseon can personalize your feed."}, {"property": "og:title", "content": "Your interests — Fuseon"}, {"property": "og:description", "content": "Pick the events you love so Fuseon can personalize your feed."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}],
  }),
  component: Onboarding,
});
