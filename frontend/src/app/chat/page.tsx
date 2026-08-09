import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { ChatView } from "@/components/chat/chat-view";

export const metadata: Metadata = {
  title: "AI Chat",
  description: "Chat with DevPilot AI — investigate failures, analyze deployments, and get intelligent root cause analysis.",
};

export default function ChatPage() {
  return (
    <AppShell>
      <ChatView />
    </AppShell>
  );
}
