import { http } from "@/lib/http"
import type {
  SendOtpInput,
  SendOtpResponse,
  VerifyOtpInput,
  VerifyOtpResponse,
  CompleteProfileInput,
  CompleteProfileResponse,
  MeResponse,
} from "./types"

export const authApi = {
  sendOtp: (input: SendOtpInput) => http.post<SendOtpResponse>("/auth/send-otp", input).then((res) => res.data),

  verifyOtp: (input: VerifyOtpInput) =>
    http.post<VerifyOtpResponse>("/auth/verify-otp", input).then((res) => res.data),

  completeProfile: (input: CompleteProfileInput) =>
    http.post<CompleteProfileResponse>("/auth/complete-profile", input).then((res) => res.data),

  me: () => http.get<MeResponse>("/auth/me").then((res) => res.data),

  logout: () => http.post<{ message: string }>("/auth/logout").then((res) => res.data),
}
