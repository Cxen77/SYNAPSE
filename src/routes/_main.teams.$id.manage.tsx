import { createFileRoute } from "@tanstack/react-router";
import ManageTeam from "@/fuseon-web/components/Team_page/ManageTeam";

export const Route = createFileRoute("/_main/teams/$id/manage")({
  head: () => ({
    meta: [{"title": "Manage team — Fuseon"}, {"name": "description", "content": "Manage members, roles and join requests for your team."}, {"property": "og:title", "content": "Manage team — Fuseon"}, {"property": "og:description", "content": "Manage members, roles and join requests for your team."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}],
  }),
  component: ManageTeam,
});
