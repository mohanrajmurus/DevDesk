import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { LogOut } from "lucide-react"
import { AppShell } from "@/components/AppShell"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useMe, useCompleteProfile, useLogout } from "@/features/auth/queries"
import { ApiError } from "@/lib/http"

interface ProfileForm {
  name: string
  profession: string
  city: string
  email: string
  pan: string
}

const EMPTY_FORM: ProfileForm = { name: "", profession: "", city: "", email: "", pan: "" }

export default function Profile() {
  const navigate = useNavigate()
  const { data, isLoading } = useMe()
  const user = data?.user
  const completeProfile = useCompleteProfile()
  const logout = useLogout()

  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<ProfileForm>>({})
  const [saved, setSaved] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  // Seed the editable form from the fetched user exactly once — after that,
  // local edits are the source of truth until the next save.
  useEffect(() => {
    if (user && !hydrated) {
      setForm({
        name: user.name ?? "",
        profession: user.profession ?? "",
        city: user.city ?? "",
        email: user.email ?? "",
        pan: user.pan ?? "",
      })
      setHydrated(true)
    }
  }, [user, hydrated])

  const setField = (key: keyof ProfileForm) => (value: string) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
    setSaved(false)
  }

  const handleSave = () => {
    completeProfile.mutate(form, {
      onSuccess: () => setSaved(true),
      onError: (error) => {
        if (error instanceof ApiError && error.fields) setErrors(error.fields)
      },
    })
  }

  const avatarLetter = (form.name.trim()[0] || "?").toUpperCase()

  const handleSignOut = () => {
    logout.mutate(undefined, {
      onSettled: () => navigate("/login"),
    })
  }

  return (
    <AppShell active="profile">
      <div className="max-w-[860px]">
        <div className="mb-6.5">
          <h1 className="text-2xl font-semibold tracking-tight mb-1">Profile</h1>
          <p className="text-[13.5px] text-muted-foreground">Manage your personal details and account.</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 mb-5">
          <div className="flex items-center gap-4.5">
            <span className="size-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[22px] font-semibold shrink-0">
              {avatarLetter}
            </span>
            <div className="flex-1">
              <div className="text-[17px] font-semibold tracking-tight">{form.name || "—"}</div>
              <div className="text-[13px] text-muted-foreground mt-0.5">
                {form.profession}
                {form.city && ` · ${form.city}`}
              </div>
            </div>
            <Badge className="bg-[#e6f4ea] text-[#1a7f3c] rounded-full font-medium text-[11px] shrink-0">Verified</Badge>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="font-mono text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground/70 mb-4">
            Personal Details
          </div>

          <div className="grid grid-cols-1 gap-4 mb-4 lg:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-[12.5px] font-medium">Full Name</Label>
              <Input value={form.name} onChange={(e) => setField("name")(e.target.value)} disabled={isLoading} />
              {errors.name && <div className="text-xs text-destructive">{errors.name}</div>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12.5px] font-medium">Profession</Label>
              <Input
                value={form.profession}
                onChange={(e) => setField("profession")(e.target.value)}
                disabled={isLoading}
              />
              {errors.profession && <div className="text-xs text-destructive">{errors.profession}</div>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-4 lg:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-[12.5px] font-medium">Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setField("email")(e.target.value)}
                disabled={isLoading}
              />
              {errors.email && <div className="text-xs text-destructive">{errors.email}</div>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12.5px] font-medium">City</Label>
              <Input value={form.city} onChange={(e) => setField("city")(e.target.value)} disabled={isLoading} />
              {errors.city && <div className="text-xs text-destructive">{errors.city}</div>}
            </div>
          </div>

          <div className="mb-4 space-y-1.5">
            <Label className="text-[12.5px] font-medium">
              PAN Number <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <Input
              placeholder="e.g. ABCDE1234F"
              value={form.pan}
              onChange={(e) => setField("pan")(e.target.value.toUpperCase())}
              disabled={isLoading}
            />
            {errors.pan && <div className="text-xs text-destructive">{errors.pan}</div>}
          </div>

          <div className="mb-5 space-y-1.5">
            <Label className="text-[12.5px] font-medium">Phone Number</Label>
            <Input
              type="tel"
              value={user ? `${user.countryCode} ${user.phone}` : ""}
              disabled
              className="bg-muted text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">
              Phone number is tied to your account and can't be changed here.
            </p>
          </div>

          <div className="flex justify-end items-center gap-2.5 pt-4 border-t border-border">
            {saved && <span className="text-[12.5px] text-[#1a7f3c] mr-auto">Saved</span>}
            <Button disabled={completeProfile.isPending || isLoading} onClick={handleSave}>
              {completeProfile.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          disabled={logout.isPending}
          className="flex items-center gap-2 mt-5 text-[13px] text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
        >
          <LogOut className="size-3.5" strokeWidth={2} />
          Sign Out
        </button>
      </div>
    </AppShell>
  )
}
