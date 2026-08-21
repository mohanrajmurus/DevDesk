import { http } from "@/lib/http"
import type { SearchResults } from "./types"

export const searchApi = {
  query: (q: string) => http.get<SearchResults>("/search", { params: { q } }).then((res) => res.data),
}
