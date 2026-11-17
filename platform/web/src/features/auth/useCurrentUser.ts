import { useQuery } from "@tanstack/react-query";
import { ApiError, apiRequest } from "../../shared/api/client";

export type CurrentUser = { id: string; name: string; email: string; role: "learner" | "admin" };

export function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: () => apiRequest<CurrentUser>("/me"),
    retry: (count, error) => !(error instanceof ApiError && error.status === 401) && count < 1,
    staleTime: 5 * 60_000,
  });
}
