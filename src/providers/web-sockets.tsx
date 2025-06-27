// SocketProvider.tsx
import { useAuth } from "@/hooks/use-auth";
import { createContext, type ReactNode } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

export type WebSocketContext<TReturnData = unknown> = {
  sendJsonMessage: (data: unknown) => void;
  lastJsonMessage: TReturnData;
  readyState: ReadyState;
};

export const WebSocketContext = createContext<WebSocketContext | null>(null);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const { apiKey, logout } = useAuth();
  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    `${import.meta.env.VITE_WS_URL}/ws/main`,
    {
      queryParams: { api_key: apiKey! },
      share: true,
      onError(event) {
        if (event.type === "error") {
          // TODO: Refresh api keys, since common error could be websocket api key expiry
          logout();
        }
      },
    }
  );

  return (
    <WebSocketContext.Provider
      value={{ sendJsonMessage, lastJsonMessage, readyState }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};
