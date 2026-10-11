import { createFileRoute } from "@tanstack/react-router";
import ThreadPage from "@/fuseon-web/components/Forum_page/ThreadPage";

export const Route = createFileRoute("/_main/forums/post/$id")({
  head: () => ({
    meta: [{"title": "Thread — Fuseon"}, {"name": "description", "content": "Forum thread and replies."}, {"property": "og:title", "content": "Thread — Fuseon"}, {"property": "og:description", "content": "Forum thread and replies."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}],
  }),
  component: ThreadPage,
});
