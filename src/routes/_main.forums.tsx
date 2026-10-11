import { createFileRoute } from "@tanstack/react-router";
import ForumLayout from "@/fuseon-web/components/Forum_page/ForumLayout";

export const Route = createFileRoute("/_main/forums")({
  head: () => ({
    meta: [{"title": "Forums — Fuseon"}, {"name": "description", "content": "Campus discussion forums."}, {"property": "og:title", "content": "Forums — Fuseon"}, {"property": "og:description", "content": "Campus discussion forums."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}],
  }),
  component: ForumLayout,
});
