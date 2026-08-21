import { useRef, useState, type KeyboardEvent } from "react"
import { useNavigate } from "react-router-dom"
import { Check } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { COUNTRY_CODES } from "@/lib/dummy-data"
import { ApiError } from "@/lib/http"
import { useSendOtp, useVerifyOtp, useCompleteProfile } from "@/features/auth/queries"
import logo from "@/assets/logo.png"

type Step = "phone" | "otp" | "profile" | "done"

interface ProfileFields {
  name: string
  email: string
  profession: string
  city: string
  pan: string
}

export default function Login() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>("phone")

  const [countryCode, setCountryCode] = useState("+91")
  const [phone, setPhone] = useState("")
  const [phoneError, setPhoneError] = useState("")

  const [otp, setOtp] = useState(["", "", "", ""])
  const [otpError, setOtpError] = useState("")
  const [devOtp, setDevOtp] = useState<string | null>(null)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  const [profile, setProfile] = useState<ProfileFields>({ name: "", email: "", profession: "", city: "", pan: "" })
  const [profileErrors, setProfileErrors] = useState<Partial<ProfileFields>>({})

  const sendOtp = useSendOtp()
  const verifyOtp = useVerifyOtp()
  const completeProfile = useCompleteProfile()

  const goToDashboard = () => {
    setStep("done")
    setTimeout(() => navigate("/dashboard"), 1200)
  }

  const handleSendOtp = () => {
    const digits = phone.replace(/\D/g, "")
    if (digits.length < 7) {
      setPhoneError("Enter a valid phone number")
      return
    }
    setPhoneError("")
    sendOtp.mutate(
      { countryCode, phone },
      {
        onSuccess: (data) => {
          if (data.devOtp) {
            toast.info(`Dev OTP: ${data.devOtp}`)
            setDevOtp(data.devOtp)
            setOtp(data.devOtp.split(""))
          } else {
            setDevOtp(null)
            setOtp(["", "", "", ""])
          }
          setOtpError("")
          setStep("otp")
        },
        onError: (error) => setPhoneError(error.message),
      }
    )
  }

  const setOtpDigit = (i: number, value: string) => {
    const val = value.replace(/\D/g, "").slice(-1)
    setOtp((prev) => {
      const next = [...prev]
      next[i] = val
      return next
    })
    setOtpError("")
    if (val && i < 3) otpRefs.current[i + 1]?.focus()
  }

  const onOtpKeyDown = (i: number) => (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus()
    if (e.key === "Enter") handleVerifyOtp()
  }

  const handleVerifyOtp = () => {
    const code = otp.join("")
    if (code.length < 4) {
      setOtpError("Enter the 4-digit code")
      return
    }
    verifyOtp.mutate(
      { countryCode, phone, otp: code },
      {
        onSuccess: (data) => {
          if (data.profileComplete) {
            goToDashboard()
          } else {
            setStep("profile")
          }
        },
        onError: (error) => setOtpError(error.message),
      }
    )
  }

  const setProfileField = (key: keyof ProfileFields) => (value: string) => {
    setProfile((p) => ({ ...p, [key]: value }))
    setProfileErrors((e) => ({ ...e, [key]: undefined }))
  }

  const handleSaveProfile = () => {
    const errors: Partial<ProfileFields> = {}
    if (!profile.name.trim()) errors.name = "Full name is required"
    if (!profile.profession.trim()) errors.profession = "Profession is required"
    if (!profile.city.trim()) errors.city = "City is required"
    if (!profile.email.trim()) errors.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) errors.email = "Enter a valid email address"
    if (profile.pan.trim() && !/^[A-Za-z]{5}[0-9]{4}[A-Za-z]$/.test(profile.pan.trim())) {
      errors.pan = "Enter a valid PAN number"
    }

    if (Object.keys(errors).length) {
      setProfileErrors(errors)
      return
    }

    completeProfile.mutate(profile, {
      onSuccess: () => goToDashboard(),
      onError: (error) => {
        if (error instanceof ApiError && error.fields) {
          setProfileErrors(error.fields)
        }
      },
    })
  }

  return (
    <div className="w-full min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="w-full max-w-[380px] flex flex-col items-center">
        <img src={logo} alt="DevDesk" className="h-[150px] w-auto object-contain mb-8" />

        <div className="w-full bg-card border border-border rounded-xl px-7 pt-7 pb-6">
          {step === "phone" && (
            <div>
              <h1 className="text-lg font-semibold tracking-tight mb-1">Sign in</h1>
              <p className="text-[13px] text-muted-foreground mb-5.5">Enter your mobile number to continue.</p>

              <Label className="text-[12.5px] font-medium mb-1.5 block">Phone Number</Label>
              <div className="flex gap-2 mb-1.5">
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger className="w-[88px] shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRY_CODES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="tel"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value)
                    setPhoneError("")
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                  className={phoneError ? "border-destructive" : ""}
                />
              </div>
              {phoneError && <div className="text-xs text-destructive mb-3.5">{phoneError}</div>}

              <Button className="w-full mt-4" disabled={sendOtp.isPending} onClick={handleSendOtp}>
                {sendOtp.isPending ? "Sending..." : "Send Code"}
              </Button>
            </div>
          )}

          {step === "otp" && (
            <div>
              <h1 className="text-lg font-semibold tracking-tight mb-1">Enter code</h1>
              <p className="text-[13px] text-muted-foreground mb-5.5">
                We sent a 4-digit code to {countryCode} {phone}.{" "}
                <span className="text-[#0070f3] cursor-pointer" onClick={() => setStep("phone")}>
                  Edit
                </span>
              </p>

              <Label className="text-[12.5px] font-medium mb-2 block">Verification Code</Label>
              <div className="flex gap-2.5 mb-1.5">
                {otp.map((d, i) => (
                  <Input
                    key={i}
                    ref={(el) => {
                      otpRefs.current[i] = el
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => setOtpDigit(i, e.target.value)}
                    onKeyDown={onOtpKeyDown(i)}
                    className={`w-13 h-13 text-center text-xl font-semibold ${otpError ? "border-destructive" : ""}`}
                  />
                ))}
              </div>
              {otpError && <div className="text-xs text-destructive mb-3.5">{otpError}</div>}
              {devOtp && !otpError && (
                <div className="text-xs text-muted-foreground mb-3.5">
                  Dev OTP (auto-filled): <span className="font-mono font-semibold">{devOtp}</span>
                </div>
              )}

              <Button className="w-full mt-4" disabled={verifyOtp.isPending} onClick={handleVerifyOtp}>
                {verifyOtp.isPending ? "Verifying..." : "Verify & Continue"}
              </Button>

              <div className="text-center mt-3.5 text-[12.5px] text-muted-foreground">
                Didn't get a code?{" "}
                <span
                  className="text-[#0070f3] cursor-pointer"
                  onClick={() => {
                    setOtp(["", "", "", ""])
                    setOtpError("")
                    handleSendOtp()
                  }}
                >
                  Resend
                </span>
              </div>
            </div>
          )}

          {step === "profile" && (
            <div>
              <h1 className="text-lg font-semibold tracking-tight mb-1">Complete your profile</h1>
              <p className="text-[13px] text-muted-foreground mb-5.5">Just a few details to set up DevDesk.</p>

              <div className="space-y-1">
                <Label className="text-[12.5px] font-medium">Full Name</Label>
                <Input
                  placeholder="Enter your full name"
                  value={profile.name}
                  onChange={(e) => setProfileField("name")(e.target.value)}
                  className={profileErrors.name ? "border-destructive" : ""}
                />
                {profileErrors.name && <div className="text-xs text-destructive mb-1">{profileErrors.name}</div>}
              </div>

              <div className="space-y-1 mt-2.5">
                <Label className="text-[12.5px] font-medium">Email</Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={profile.email}
                  onChange={(e) => setProfileField("email")(e.target.value)}
                  className={profileErrors.email ? "border-destructive" : ""}
                />
                {profileErrors.email && <div className="text-xs text-destructive mb-1">{profileErrors.email}</div>}
              </div>

              <div className="space-y-1 mt-2.5">
                <Label className="text-[12.5px] font-medium">Profession</Label>
                <Input
                  placeholder="e.g. Software Engineer"
                  value={profile.profession}
                  onChange={(e) => setProfileField("profession")(e.target.value)}
                  className={profileErrors.profession ? "border-destructive" : ""}
                />
                {profileErrors.profession && (
                  <div className="text-xs text-destructive mb-1">{profileErrors.profession}</div>
                )}
              </div>

              <div className="space-y-1 mt-2.5">
                <Label className="text-[12.5px] font-medium">City</Label>
                <Input
                  placeholder="Enter your city"
                  value={profile.city}
                  onChange={(e) => setProfileField("city")(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveProfile()}
                  className={profileErrors.city ? "border-destructive" : ""}
                />
                {profileErrors.city && <div className="text-xs text-destructive mb-1">{profileErrors.city}</div>}
              </div>

              <div className="space-y-1 mt-2.5">
                <Label className="text-[12.5px] font-medium">
                  PAN Number <span className="text-muted-foreground font-normal">(Optional)</span>
                </Label>
                <Input
                  placeholder="e.g. ABCDE1234F"
                  value={profile.pan}
                  onChange={(e) => setProfileField("pan")(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveProfile()}
                  className={profileErrors.pan ? "border-destructive" : ""}
                />
                {profileErrors.pan && <div className="text-xs text-destructive mb-1">{profileErrors.pan}</div>}
              </div>

              <Button className="w-full mt-4" disabled={completeProfile.isPending} onClick={handleSaveProfile}>
                {completeProfile.isPending ? "Saving..." : "Continue"}
              </Button>
            </div>
          )}

          {step === "done" && (
            <div className="text-center py-3 pb-1">
              <div className="size-11 rounded-full bg-[#e6f4ea] flex items-center justify-center mx-auto mb-3.5">
                <Check className="size-5.5 text-[#1a7f3c]" strokeWidth={2.5} />
              </div>
              <h1 className="text-base font-semibold mb-1">All set</h1>
              <p className="text-[13px] text-muted-foreground">Redirecting to your dashboard…</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
