import { createFileRoute } from "@tanstack/react-router";
import Profile from "@/fuseon-web/components/Profile_page/Profile";

export const Route = createFileRoute("/_main/profile/$username")({
  head: () => ({
    meta: [{"title": "Profile — Fuseon"}, {"name": "description", "content": "Student profile on Fuseon."}, {"property": "og:title", "content": "Profile — Fuseon"}, {"property": "og:description", "content": "Student profile on Fuseon."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}],
  }),
  component: Profile,
});
