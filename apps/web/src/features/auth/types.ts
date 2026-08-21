export interface User {
  id: string
  countryCode: string
  phone: string
  name?: string
  email?: string
  profession?: string
  city?: string
  pan?: string
  profileComplete: boolean
}

export interface SendOtpInput {
  countryCode: string
  phone: string
}

export interface SendOtpResponse {
  message: string
  devOtp?: string
}

export interface VerifyOtpInput extends SendOtpInput {
  otp: string
}

export interface VerifyOtpResponse {
  profileComplete: boolean
  user: User
}

export interface CompleteProfileInput {
  name: string
  email: string
  profession: string
  city: string
  pan?: string
}

export interface CompleteProfileResponse {
  user: User
}

export interface MeResponse {
  user: User
}
