import { queryOptions, useQuery } from "@tanstack/react-query";

import { api } from "@/libs/axios";
import { type QueryConfig } from "@/libs/react-query";
import type { Session } from "@/types/models";

type UseSessionQueryParams = {
  sessionId: string;
};

export const getSession = ({
  sessionId,
}: UseSessionQueryParams): Promise<Session[]> => {
  return api.get(`/session/:sessionId`, {
    urlParams: {
      ":sessionId": sessionId,
    },
  });
};

export const getSessionQueryOptions = ({
  sessionId,
}: UseSessionQueryParams) => {
  return queryOptions({
    queryKey: ["session", sessionId],
    queryFn: () => getSession({ sessionId }),
  });
};

type UseSessionOptions = {
  queryParams: UseSessionQueryParams;
  queryConfig?: QueryConfig<typeof getSessionQueryOptions>;
};

export const useSession = ({ queryParams, queryConfig }: UseSessionOptions) => {
  return useQuery({
    ...getSessionQueryOptions(queryParams),
    ...queryConfig,
  });
};
