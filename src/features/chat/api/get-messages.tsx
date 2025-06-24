// import { queryOptions, useQuery } from "@tanstack/react-query";

// import { api } from "@/libs/axios";
// import { type QueryConfig } from "@/libs/react-query";
// import type { Messages } from "@/types/api";

// type UseMessagesQueryParams = {
//   sessionId: string;
//   accountId: string;
// };

// export const getMessages = ({
//   sessionId,
//   accountId,
// }: UseMessagesQueryParams): Promise<Messages[]> => {
//   return api.get(`/message`, {
//     params: {
//       account_id: accountId,
//       session_id: sessionId,
//     },
//   });
// };

// export const getMessagesQueryOptions = ({
//   sessionId,
//   accountId,
// }: UseMessagesQueryParams) => {
//   return queryOptions({
//     queryKey: ["messages", accountId, sessionId],
//     queryFn: () => getMessages({ sessionId, accountId }),
//   });
// };

// type UseMessagesOptions = {
//   queryParams: UseMessagesQueryParams;
//   queryConfig?: QueryConfig<typeof getMessagesQueryOptions>;
// };

// export const useMessages = ({
//   queryParams,
//   queryConfig,
// }: UseMessagesOptions) => {
//   return useQuery({
//     ...getMessagesQueryOptions(queryParams),
//     ...queryConfig,
//   });
// };
