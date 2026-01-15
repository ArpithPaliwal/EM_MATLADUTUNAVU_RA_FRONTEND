// hooks/useSearchUsers.ts
import { useQuery } from "@tanstack/react-query";

import { getUserNames } from "../API/userApi";

export const useGetUserNames = (prefix: string) => {
  return useQuery({
    queryKey: ["search-users", prefix],
    queryFn: () => getUserNames(prefix),
    enabled: !!prefix,
    staleTime: 60 * 1000,
  });
};
