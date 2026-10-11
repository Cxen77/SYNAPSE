import { createFileRoute } from "@tanstack/react-router";
import Events from "@/fuseon-web/components/Event_page/Events";

export const Route = createFileRoute("/_main/events/")({
  head: () => ({
    meta: [{"title": "Explore events — Fuseon"}, {"name": "description", "content": "Discover hackathons, workshops and campus events."}, {"property": "og:title", "content": "Explore events — Fuseon"}, {"property": "og:description", "content": "Discover hackathons, workshops and campus events."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}],
  }),
  component: Events,
});
