import { createFileRoute } from "@tanstack/react-router";
import Login from "@/fuseon-web/components/Login";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{"title": "Sign in — Fuseon"}, {"name": "description", "content": "Sign in to your Fuseon account to find events, teammates and campus communities."}, {"property": "og:title", "content": "Sign in — Fuseon"}, {"property": "og:description", "content": "Sign in to your Fuseon account to find events, teammates and campus communities."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}],
  }),
  component: Login,
});
