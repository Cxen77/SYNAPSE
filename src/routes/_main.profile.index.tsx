import { createFileRoute } from "@tanstack/react-router";
import Profile from "@/fuseon-web/components/Profile_page/Profile";

export const Route = createFileRoute("/_main/profile/")({
  head: () => ({
    meta: [{"title": "My profile — Fuseon"}, {"name": "description", "content": "Your Fuseon profile, projects, teams and achievements."}, {"property": "og:title", "content": "My profile — Fuseon"}, {"property": "og:description", "content": "Your Fuseon profile, projects, teams and achievements."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}],
  }),
  component: Profile,
});
