import { createFileRoute } from "@tanstack/react-router";
import Settings from "@/fuseon-web/components/Settings_page/Settings";

export const Route = createFileRoute("/_main/settings")({
  head: () => ({
    meta: [{"title": "Settings — Fuseon"}, {"name": "description", "content": "Account, privacy, notifications and app preferences."}, {"property": "og:title", "content": "Settings — Fuseon"}, {"property": "og:description", "content": "Account, privacy, notifications and app preferences."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}],
  }),
  component: Settings,
});
