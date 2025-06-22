import { api } from "@/libs/axios";
import { type QueryConfig } from "@/libs/react-query";
import { queryOptions, useQuery } from "@tanstack/react-query";
import type { Message } from "@/types/models";

type ListMessagesQuery = {
  session_id: string;
  account_id: string;
};

type ListMessagesParams = {
  query?: ListMessagesQuery;
};

export type ListMessagesResponse = Message & { id: string };

export const listMessages = (
  params: ListMessagesParams
): Promise<ListMessagesResponse[]> => {
  return api.get("/message", {
    params: params.query,
  });
};

export const listMessagesQueryOptions = (params: ListMessagesParams) => {
  return queryOptions({
    queryKey: ["messages", params.query],
    queryFn: () => listMessages(params),
  });
};

type UseListMessagesOptions = {
  queryParams: ListMessagesParams;
  queryConfig?: QueryConfig<typeof listMessagesQueryOptions>;
};

export const useListMessages = ({
  queryParams,
  queryConfig,
}: UseListMessagesOptions) => {
  return useQuery({
    ...listMessagesQueryOptions(queryParams),
    ...queryConfig,
  });
};
