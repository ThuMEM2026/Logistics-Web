import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/proposal")({
  beforeLoad: () => {
    throw redirect({ href: "/proposal/index.html" });
  },
});
