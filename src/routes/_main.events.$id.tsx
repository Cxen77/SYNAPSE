import { createFileRoute } from "@tanstack/react-router";
import EventDetails from "@/fuseon-web/components/Event_page/EventDetails";

export const Route = createFileRoute("/_main/events/$id")({
  head: () => ({
    meta: [{"title": "Event details — Fuseon"}, {"name": "description", "content": "Event schedule, teams and registration."}, {"property": "og:title", "content": "Event details — Fuseon"}, {"property": "og:description", "content": "Event schedule, teams and registration."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}],
  }),
  component: EventDetails,
});
