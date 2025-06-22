import { queryOptions, useQuery } from "@tanstack/react-query";

import { api } from "@/libs/axios";
import { type QueryConfig } from "@/libs/react-query";
import type { Assistant } from "@/types/models";

type ListAssistantsQuery = {
  category?: string;
  ids?: string[];
};

type ListAssistantsParams = {
  query?: ListAssistantsQuery;
};

export type ListAssistantsResponse = Assistant & { id: string };

export const listAssistants = (
  params?: ListAssistantsParams
): Promise<ListAssistantsResponse[]> => {
  return api.get("/assistant", {
    params: params?.query,
    paramsSerializer: {
      indexes: null, // This removes the [] brackets and repeats the parameter name
    },
  });
};

export const listAssistantsQueryOptions = (params?: ListAssistantsParams) => {
  return queryOptions({
    queryKey: ["assistants", params?.query],
    queryFn: () => listAssistants(params || {}),
  });
};

type UseAssistantsOptions = {
  queryParams?: ListAssistantsParams;
  queryConfig?: QueryConfig<typeof listAssistantsQueryOptions>;
};

export const useListAssistants = ({
  queryParams,
  queryConfig,
}: UseAssistantsOptions = {}) => {
  return useQuery({
    ...listAssistantsQueryOptions(queryParams),
    ...queryConfig,
  });
};
