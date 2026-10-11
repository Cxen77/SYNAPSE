import { createFileRoute } from "@tanstack/react-router";
import ForumDetails from "@/fuseon-web/components/Forum_page/ForumDetails";

export const Route = createFileRoute("/_main/forums/$id")({
  head: () => ({
    meta: [{"title": "Forum — Fuseon"}, {"name": "description", "content": "Forum posts and members."}, {"property": "og:title", "content": "Forum — Fuseon"}, {"property": "og:description", "content": "Forum posts and members."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}],
  }),
  component: ForumDetails,
});
