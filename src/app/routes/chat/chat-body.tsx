import type React from "react";
import { WebSocketProvider } from "@/providers/web-sockets";

export const ChatBody = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex flex-col gap-5 h-full mt-10">
      <WebSocketProvider>{children}</WebSocketProvider>
    </main>
  );
};
