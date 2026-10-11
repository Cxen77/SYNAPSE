import { createFileRoute } from "@tanstack/react-router";
import Chat from "@/fuseon-web/components/Chat_page/Chat";

export const Route = createFileRoute("/_main/chat/")({
  head: () => ({
    meta: [{"title": "Chat — Fuseon"}, {"name": "description", "content": "Messages and team conversations."}, {"property": "og:title", "content": "Chat — Fuseon"}, {"property": "og:description", "content": "Messages and team conversations."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}],
  }),
  component: Chat,
});
