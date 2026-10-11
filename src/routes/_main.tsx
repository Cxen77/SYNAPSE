import { createFileRoute } from "@tanstack/react-router";
import AppLayout from "@/fuseon-web/AppLayout";

// Signed-in app shell (top bar + bottom tabs). Child routes render inside it.
export const Route = createFileRoute("/_main")({
  component: AppLayout,
});
