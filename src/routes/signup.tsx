import { createFileRoute } from "@tanstack/react-router";
import Signup from "@/fuseon-web/components/Signup";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [{"title": "Create account — Fuseon"}, {"name": "description", "content": "Join Fuseon to discover college events and build teams."}, {"property": "og:title", "content": "Create account — Fuseon"}, {"property": "og:description", "content": "Join Fuseon to discover college events and build teams."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}],
  }),
  component: Signup,
});
