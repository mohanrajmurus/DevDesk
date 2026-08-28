import { useEffect, useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { COUNTRIES, COUNTRY_CODES, PROJECT_COLORS, type Country, type ProjectColor } from "@/lib/constants"
import { useCreateProject, useUpdateProject } from "@/features/projects/queries"
import { PROJECT_STATUSES } from "@/features/projects/constants"
import type { Project, ProjectStatus } from "@/features/projects/types"

interface CreateProjectSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project?: Project | null
}

export function CreateProjectSheet({ open, onOpenChange, project }: CreateProjectSheetProps) {
  const isEditMode = Boolean(project)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<ProjectStatus>("active")
  const [color, setColor] = useState<ProjectColor>(PROJECT_COLORS[0])
  const [clientName, setClientName] = useState("")
  const [countryCode, setCountryCode] = useState("+91")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [country, setCountry] = useState<Country | null>(null)
  const [countryOpen, setCountryOpen] = useState(false)

  const createProject = useCreateProject()
  const updateProject = useUpdateProject()
  const isPending = createProject.isPending || updateProject.isPending

  const reset = () => {
    setName("")
    setDescription("")
    setStatus("active")
    setColor(PROJECT_COLORS[0])
    setClientName("")
    setCountryCode("+91")
    setPhone("")
    setEmail("")
    setAddress("")
    setCountry(null)
  }

  useEffect(() => {
    if (!open) return
    if (project) {
      setName(project.name)
      setDescription(project.description ?? "")
      setStatus(project.status)
      setColor(project.color)
      setClientName(project.clientName ?? "")
      setCountryCode(project.countryCode ?? "+91")
      setPhone(project.phone ?? "")
      setEmail(project.email ?? "")
      setAddress(project.address ?? "")
      setCountry(project.country ?? null)
    } else {
      reset()
    }
  }, [open, project])

  const handleSave = () => {
    if (!name.trim() || isPending) return
    const input = {
      name: name.trim(),
      description,
      status,
      color,
      clientName,
      countryCode,
      phone,
      email,
      address,
      country: country ?? undefined,
    }

    if (project) {
      updateProject.mutate(
        { id: project._id, input },
        {
          onSuccess: () => {
            toast.success("Project updated successfully")
            onOpenChange(false)
          },
          onError: (error) => toast.error(error.message),
        }
      )
      return
    }

    createProject.mutate(input, {
      onSuccess: () => {
        toast.success("Project created successfully")
        reset()
        onOpenChange(false)
      },
      onError: (error) => toast.error(error.message),
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full lg:w-[460px] lg:max-w-[460px] p-0 flex flex-col gap-0">
        <SheetHeader className="px-6 py-5 border-b border-border">
          <SheetTitle className="text-base">{isEditMode ? "Edit Project" : "Create Project"}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5.5 space-y-4">
          <div className="font-mono text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground/70 mb-1">
            Project Details
          </div>

          <div className="space-y-1.5">
            <Label className="text-[12.5px] font-medium">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input placeholder="Enter project name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[12.5px] font-medium">Description</Label>
            <Textarea
              placeholder="Add a short project description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[12.5px] font-medium">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as ProjectStatus)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[12.5px] font-medium">Color</Label>
            <Select
              value={color.name}
              onValueChange={(v) => setColor(PROJECT_COLORS.find((c) => c.name === v) ?? PROJECT_COLORS[0])}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  <span className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full" style={{ background: color.hex }} />
                    {color.name} · {color.hex}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PROJECT_COLORS.map((c) => (
                  <SelectItem key={c.name} value={c.name}>
                    <span className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full" style={{ background: c.hex }} />
                      {c.name} <span className="text-muted-foreground">{c.hex}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator className="my-5!" />

          <div className="font-mono text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground/70 mb-1">
            Client Details
          </div>

          <div className="space-y-1.5">
            <Label className="text-[12.5px] font-medium">Client Name</Label>
            <Input placeholder="Enter client name" value={clientName} onChange={(e) => setClientName(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[12.5px] font-medium">Phone Number</Label>
            <div className="flex gap-2">
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
                placeholder="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[12.5px] font-medium">Email</Label>
            <Input type="email" placeholder="client@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[12.5px] font-medium">Address</Label>
            <Textarea
              placeholder="Enter client address"
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[12.5px] font-medium">Country</Label>
            <Popover open={countryOpen} onOpenChange={setCountryOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "w-full border border-input rounded-md px-3 py-2 text-sm flex items-center justify-between bg-transparent",
                    !country && "text-muted-foreground",
                  )}
                >
                  <span>{country ? `${country.flag} ${country.name}` : "Select country"}</span>
                  <ChevronDown className="size-3.5 opacity-60" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search country" />
                  <CommandList>
                    <CommandEmpty>No country found.</CommandEmpty>
                    <CommandGroup>
                      {COUNTRIES.map((c) => (
                        <CommandItem
                          key={c.name}
                          value={c.name}
                          onSelect={() => {
                            setCountry(c)
                            setCountryOpen(false)
                          }}
                        >
                          <span className="mr-1">{c.flag}</span>
                          {c.name}
                          {country?.name === c.name && <Check className="ml-auto size-4" />}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <SheetFooter className="flex-row justify-end gap-2.5 px-6 py-4 border-t border-border">
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <Button disabled={!name.trim() || isPending} onClick={handleSave}>
            {isPending ? "Saving..." : isEditMode ? "Save Changes" : "Save Project"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
