import { QueryClient } from "@tanstack/react-query";
import type { LoaderFunctionArgs } from "react-router";
import { listMessagesQueryOptions } from "../api/list-messages";

export const loader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const accountId = params.accountId as string;
    const sessionId = params.sessionId as string;

    await queryClient.ensureQueryData(
      listMessagesQueryOptions({
        query: {
          account_id: accountId,
          session_id: sessionId,
        },
      })
    );
    return { accountId, sessionId };
  };
