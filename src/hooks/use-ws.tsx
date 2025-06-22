import * as React from "react";

import { WebSocketContext } from "@/providers/web-sockets";

export const useWebSocketConnection = () => {
  const context = React.useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within an WebSocketProvider");
  }
  return context;
};
