import { createFileRoute } from "@tanstack/react-router";
import Home from "@/fuseon-web/components/Home_page/Home";

export const Route = createFileRoute("/_main/")({
  head: () => ({
    meta: [{"title": "Home — Fuseon"}, {"name": "description", "content": "Your campus feed of posts, open teams and upcoming events."}, {"property": "og:title", "content": "Home — Fuseon"}, {"property": "og:description", "content": "Your campus feed of posts, open teams and upcoming events."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}],
  }),
  component: Home,
});
