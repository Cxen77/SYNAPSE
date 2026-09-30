import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy, useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";

const Editor = lazy(() => import("@/components/certificate/Editor"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Certificate Studio — Synapse" },
      { name: "description", content: "Canva-style certificate editor with 28 templates, 35 certificate types and bulk PDF/ZIP export." },
      { property: "og:title", content: "Certificate Studio — Synapse" },
      { property: "og:description", content: "Design and edit modern certificates for college events, hackathons and courses." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const loading = <div className="flex h-screen items-center justify-center bg-background text-sm text-muted-foreground">Loading studio…</div>;
  return (
    <>
      {ready ? <Suspense fallback={loading}><Editor /></Suspense> : loading}
      <Toaster />
    </>
  );
}
