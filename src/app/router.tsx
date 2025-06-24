import { createBrowserRouter, RouterProvider } from "react-router";
import { useMemo } from "react";
import { QueryClient } from "@tanstack/react-query";
import { ChatBody } from "./routes/chat/chat-body";

import { ChatMessages } from "./routes/chat/chat-messages-v2";
import { NewChatV2 } from "./routes/chat/new-chat-v2";
import { ErrorPage } from "./routes/error";
import { AuthPage } from "./routes/auth/auth";

import { loader as chatMessagesLoader } from "@/features/chat/loaders/chat-messages-loader";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { ChatLayout } from "@/components/layout/chat-layout";

const createAppRouter = (queryClient: QueryClient) =>
  createBrowserRouter([
    {
      path: "/",
      element: <AuthPage />,
      errorElement: <ErrorPage />,
    },
    {
      path: "/setup",
      element: (
        <ProtectedRoute>
          <ChatLayout isSetup={true} />
        </ProtectedRoute>
      ),
    },
    {
      path: "/a/:accountId",
      element: (
        <ProtectedRoute>
          <ChatLayout />
        </ProtectedRoute>
      ),
      children: [
        {
          path: "/a/:accountId",
          element: (
            <ChatBody>
              <NewChatV2 />
            </ChatBody>
          ),
        },
        {
          path: "/a/:accountId/s/:sessionId",
          element: (
            <ChatBody>
              <ChatMessages />
            </ChatBody>
          ),
          loader: chatMessagesLoader(queryClient),
        },
      ],
    },
  ]);

export const AppRouter = ({ queryClient }: { queryClient: QueryClient }) => {
  const router = useMemo(() => createAppRouter(queryClient), [queryClient]);
  return <RouterProvider router={router} />;
};
