import { queryOptions, useQuery } from "@tanstack/react-query";

import { api } from "@/libs/axios";
import { type QueryConfig } from "@/libs/react-query";
import type { Account } from "@/types/models";

type UseAccountQueryParams = {
  accountId: string;
};

type UseAccountResponse = Account & { id: string };
export const getAccount = ({
  accountId,
}: UseAccountQueryParams): Promise<UseAccountResponse> => {
  return api.get(`/account/:accountId`, {
    urlParams: {
      ":accountId": accountId,
    },
  });
};

export const getAccountQueryOptions = ({
  accountId,
}: UseAccountQueryParams) => {
  return queryOptions({
    queryKey: ["accounts", accountId],
    queryFn: () => getAccount({ accountId }),
  });
};

type UseAccountOptions = {
  queryParams: UseAccountQueryParams;
  queryConfig?: QueryConfig<typeof getAccountQueryOptions>;
};

export const useAccount = ({ queryParams, queryConfig }: UseAccountOptions) => {
  return useQuery({
    ...getAccountQueryOptions(queryParams),
    ...queryConfig,
  });
};
