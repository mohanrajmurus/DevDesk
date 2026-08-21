import { useQuery } from "@tanstack/react-query"
import { searchApi } from "./api"

export function useSearch(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: () => searchApi.query(query),
    enabled: query.trim().length >= 2,
    staleTime: 10_000,
  })
}
