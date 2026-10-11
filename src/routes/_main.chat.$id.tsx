import { createFileRoute } from "@tanstack/react-router";
import Chat from "@/fuseon-web/components/Chat_page/Chat";

export const Route = createFileRoute("/_main/chat/$id")({
  head: () => ({
    meta: [{"title": "Conversation — Fuseon"}, {"name": "description", "content": "Chat with your teammates."}, {"property": "og:title", "content": "Conversation — Fuseon"}, {"property": "og:description", "content": "Chat with your teammates."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}],
  }),
  component: Chat,
});
