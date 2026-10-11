import { createFileRoute } from "@tanstack/react-router";
import VerifyEmail from "@/fuseon-web/components/VerifyEmail";

export const Route = createFileRoute("/verify-email")({
  head: () => ({
    meta: [{"title": "Verify email — Fuseon"}, {"name": "description", "content": "Enter the code sent to your email to activate Fuseon."}, {"property": "og:title", "content": "Verify email — Fuseon"}, {"property": "og:description", "content": "Enter the code sent to your email to activate Fuseon."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}],
  }),
  component: VerifyEmail,
});
