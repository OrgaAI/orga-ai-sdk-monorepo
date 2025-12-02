 "use client";
import { initWidget } from "@orga-ai/widget";
import { useEffect } from "react";
const ORGA_BADGE_ICON_DATA_URI =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTgiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik01My44ODQyIDI5Ljk3NzVDNTMuODg0MiAzMC4yMzQyIDUzLjY3NjIgMzAuNDQyIDUzLjQxOTYgMzAuNDQySDUwLjE0NDlDNDAuOTg0MSAzMC40NDIgMzMuNTU3OSAyMy4wMTU4IDMzLjU1NzkgMTMuODU1MVYxMC41ODA0QzMzLjU1NzkgMTAuMzI0IDMzLjc2NTkgMTAuMTE2IDM0LjAyMjYgMTAuMTE2SDQxLjc3MDlDNDguNDYxIDEwLjExNiA1My44ODQyIDE1LjUzOTIgNTMuODg0MiAyMi4yMjlWMjkuOTc3NVpNNTMuODg0MiA0MS43NzFDNTMuODg0MiA0OC40NjA5IDQ4LjQ2MSA1My44ODQgNDEuNzcwOSA1My44ODRIMzQuMDIyNkMzMy43NjU5IDUzLjg4NCAzMy41NTc5IDUzLjY3NjIgMzMuNTU3OSA1My40MTk2VjUwLjE0NDlDMzMuNTU3OSA0MC45ODQyIDQwLjk4NDEgMzMuNTU4IDUwLjE0NDkgMzMuNTU4SDUzLjQxOTZDNTMuNjc2MiAzMy41NTggNTMuODg0MiAzMy43NjYgNTMuODg0MiAzNC4wMjI0VjQxLjc3MVpNMzAuNDQyMSAxMy44NTUxQzMwLjQ0MjEgMjMuMDE1OCAyMy4wMTU5IDMwLjQ0MiAxMy44NTUxIDMwLjQ0MkgxMC41ODA0QzEwLjMyMzggMzAuNDQyIDEwLjExNiAzMC4yMzQyIDEwLjExNiAyOS45Nzc1VjIyLjIyOUMxMC4xMTYgMTUuNTM5MiAxNS41MzkxIDEwLjExNiAyMi4yMjkxIDEwLjExNkgyOS45Nzc3QzMwLjIzNDEgMTAuMTE2IDMwLjQ0MjEgMTAuMzI0IDMwLjQ0MjEgMTAuNTgwNFYxMy44NTUxWk0zMC40NDIxIDUzLjQxOTZDMzAuNDQyMSA1My42NzYyIDMwLjIzNDEgNTMuODg0IDI5Ljk3NzcgNTMuODg0SDIyLjIyOTFDMTUuNTM5MSA1My44ODQgMTAuMTE2IDQ4LjQ2MDkgMTAuMTE2IDQxLjc3MVYzNC4wMjI0QzEwLjExNiAzMy43NjYgMTAuMzIzOCAzMy41NTggMTAuNTgwNCAzMy41NThIMTMuODU1MUMyMy4wMTU5IDMzLjU1OCAzMC40NDIxIDQwLjk4NDIgMzAuNDQyMSA1MC4xNDQ5VjUzLjQxOTZaTTQxLjc3MzcgN0gyMi4yMjYzQzEzLjgzMTUgNyA3IDEzLjgzMTcgNyAyMi4yMjlWNDEuNzczNkM3IDUwLjE3MDkgMTMuODMxNSA1NyAyMi4yMjYzIDU3SDMySDQxLjc3MzdDNTAuMTY4NSA1NyA1NyA1MC4xNzA5IDU3IDQxLjc3MzZWMjIuMjI5QzU3IDEzLjgzMTcgNTAuMTY4NSA3IDQxLjc3MzcgN1oiIGZpbGw9IiMwMzMxNDciLz4KPC9zdmc+Cg==";


export const OrgaWidgetClient = () => {
  useEffect(() => {
    initWidget({
      fetchSessionConfig: () => fetch("/api").then((res) => res.json()),
      theme: "floating-badge",
      branding: {
        brandName: "My app",
        tagline: "Your app's assistant",
        accentColor: "#000000",
        backgroundColor: "#171717",
        borderColor: "#000000",
        textColor: "#ffffff",
        secondaryTextColor: "#999999",
        // Customize transcription area colors
        transcriptBackgroundColor: "#1a1a1a", // Slightly lighter than main bg for contrast
        assistantBubbleBackgroundColor: "#2a2a2a", // Dark background for assistant bubbles
        assistantBubbleTextColor: "#ffffff", // White text on dark bubble
        // badgeIconUrl: "/favicon.ico",
        logoUrl: "/favicon.ico", // This displays the logo in the widget
        // logoAlt: "My app",
      },
    });
  }, []);

  return <div data-orga-widget />;
};