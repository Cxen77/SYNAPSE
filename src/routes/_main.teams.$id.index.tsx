import { createFileRoute } from "@tanstack/react-router";
import TeamDetails from "@/fuseon-web/components/Team_page/TeamDetails";

export const Route = createFileRoute("/_main/teams/$id/")({
  head: () => ({
    meta: [{"title": "Team details — Fuseon"}, {"name": "description", "content": "See team members, roles and open positions."}, {"property": "og:title", "content": "Team details — Fuseon"}, {"property": "og:description", "content": "See team members, roles and open positions."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}],
  }),
  component: TeamDetails,
});
