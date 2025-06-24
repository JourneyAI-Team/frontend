import { queryOptions, useQuery } from "@tanstack/react-query";

import { api } from "@/libs/axios";
import { type QueryConfig } from "@/libs/react-query";
import type { Session, Base } from "@/types/models";

type ListSessionsQuery = {
  account_id: string;
};

type ListSessionsParams = {
  query?: ListSessionsQuery;
};

export type ListSessionResponse = Session & Base;

export const listSessions = (
  params: ListSessionsParams
): Promise<ListSessionResponse[]> => {
  return api.get(`/session`, {
    params: params.query,
  });
};

export const listSessionsQueryOptions = (params: ListSessionsParams) => {
  return queryOptions({
    queryKey: ["sessions", params.query],
    queryFn: () => listSessions(params),
  });
};

type UseSessionsOptions = {
  queryParams: ListSessionsParams;
  queryConfig?: QueryConfig<typeof listSessionsQueryOptions>;
};

export const useListSessions = ({
  queryParams,
  queryConfig,
}: UseSessionsOptions) => {
  return useQuery({
    ...listSessionsQueryOptions(queryParams),
    ...queryConfig,
  });
};
