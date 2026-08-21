import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { authApi } from "./api"
import type { CompleteProfileInput, MeResponse, SendOtpInput, VerifyOtpInput } from "./types"

export const authKeys = {
  me: ["auth", "me"] as const,
}

export function useMe(enabled = true) {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: authApi.me,
    enabled,
    retry: false,
  })
}

export function useSendOtp() {
  return useMutation({
    mutationFn: (input: SendOtpInput) => authApi.sendOtp(input),
  })
}

export function useVerifyOtp() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: VerifyOtpInput) => authApi.verifyOtp(input),
    onSuccess: (data) => {
      queryClient.setQueryData<MeResponse>(authKeys.me, { user: data.user })
    },
  })
}

export function useCompleteProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CompleteProfileInput) => authApi.completeProfile(input),
    onSuccess: (data) => {
      queryClient.setQueryData<MeResponse>(authKeys.me, { user: data.user })
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: authKeys.me })
    },
  })
}
