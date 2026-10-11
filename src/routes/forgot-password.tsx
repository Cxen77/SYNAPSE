import { createFileRoute } from "@tanstack/react-router";
import ForgotPassword from "@/fuseon-web/components/ForgotPassword";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [{"title": "Forgot password — Fuseon"}, {"name": "description", "content": "Reset access to your Fuseon account."}, {"property": "og:title", "content": "Forgot password — Fuseon"}, {"property": "og:description", "content": "Reset access to your Fuseon account."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}],
  }),
  component: ForgotPassword,
});
