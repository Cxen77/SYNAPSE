import { createFileRoute } from "@tanstack/react-router";
import ResetPassword from "@/fuseon-web/components/ResetPassword";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [{"title": "Reset password — Fuseon"}, {"name": "description", "content": "Choose a new password for your Fuseon account."}, {"property": "og:title", "content": "Reset password — Fuseon"}, {"property": "og:description", "content": "Choose a new password for your Fuseon account."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}],
  }),
  component: ResetPassword,
});
