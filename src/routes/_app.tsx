import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/krishi/app-shell";

export const Route = createFileRoute("/_app")({
  component: AppShell,
});
