// import { queryOptions, useQuery } from "@tanstack/react-query";

// import { api } from "@/libs/axios";
// import { type QueryConfig } from "@/libs/react-query";
// import type { Session } from "@/types/api";

// type UseSessionsQueryParams = {
//   accountId: string;
// };

// export const getSessions = ({
//   accountId,
// }: UseSessionsQueryParams): Promise<Session[]> => {
//   return api.get(`/session`, {
//     params: {
//       account_id: accountId,
//     },
//   });
// };

// export const getSessionsQueryOptions = ({
//   accountId,
// }: UseSessionsQueryParams) => {
//   return queryOptions({
//     queryKey: ["sessions", accountId],
//     queryFn: () => getSessions({ accountId }),
//   });
// };

// type UseSessionsOptions = {
//   queryParams: UseSessionsQueryParams;
//   queryConfig?: QueryConfig<typeof getSessionsQueryOptions>;
// };

// export const useSessions = ({
//   queryParams,
//   queryConfig,
// }: UseSessionsOptions) => {
//   return useQuery({
//     ...getSessionsQueryOptions(queryParams),
//     ...queryConfig,
//   });
// };
