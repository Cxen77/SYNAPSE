import { createFileRoute } from "@tanstack/react-router";
import ForumHome from "@/fuseon-web/components/Forum_page/ForumHome";

export const Route = createFileRoute("/_main/forums/")({
  head: () => ({
    meta: [{"title": "Forums — Fuseon"}, {"name": "description", "content": "Trending threads and campus discussions."}, {"property": "og:title", "content": "Forums — Fuseon"}, {"property": "og:description", "content": "Trending threads and campus discussions."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}],
  }),
  component: ForumHome,
});
