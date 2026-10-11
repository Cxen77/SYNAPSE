import { createFileRoute } from "@tanstack/react-router";
import Teams from "@/fuseon-web/components/Team_page/Teams";

export const Route = createFileRoute("/_main/teams/")({
  head: () => ({
    meta: [{"title": "Teams — Fuseon"}, {"name": "description", "content": "Manage your teams, find members and join open teams."}, {"property": "og:title", "content": "Teams — Fuseon"}, {"property": "og:description", "content": "Manage your teams, find members and join open teams."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}],
  }),
  component: Teams,
});
