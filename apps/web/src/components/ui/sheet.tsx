import * as React from "react"
import { XIcon } from "lucide-react"
import { Dialog as SheetPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { useSheetDrag } from "@/hooks/use-sheet-drag"

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left"
  showCloseButton?: boolean
}) {
  const closeRef = React.useRef<HTMLButtonElement>(null)
  const { handleProps, contentStyle, expanded } = useSheetDrag(() => closeRef.current?.click())

  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        data-expanded={expanded}
        style={contentStyle}
        className={cn(
          "fixed z-50 flex flex-col gap-4 bg-background shadow-lg ease-out data-[state=closed]:animate-out data-[state=closed]:duration-200 data-[state=open]:animate-in data-[state=open]:duration-300",
          // Mobile (below lg): always a bottom sheet, regardless of `side`.
          // dvh (not vh) so it never slides under the browser chrome;
          // transform-gpu + will-change keep the slide-in on its own layer.
          "max-lg:inset-x-0 max-lg:bottom-0 max-lg:top-auto max-lg:h-auto max-lg:max-h-[90dvh] max-lg:w-full max-lg:overflow-y-auto max-lg:overscroll-contain max-lg:rounded-t-2xl max-lg:border-t max-lg:pb-[max(1rem,env(safe-area-inset-bottom))] max-lg:transform-gpu max-lg:[will-change:transform] max-lg:[backface-visibility:hidden] max-lg:data-[state=closed]:slide-out-to-bottom max-lg:data-[state=open]:slide-in-from-bottom max-lg:data-[state=open]:duration-200",
          // Swipe the grab handle up to expand to (near) full height.
          "max-lg:transition-[height,max-height] max-lg:duration-200 max-lg:ease-out max-lg:data-[expanded=true]:h-[94dvh] max-lg:data-[expanded=true]:max-h-[94dvh]",
          // Desktop (lg+): original side-based positioning, untouched.
          side === "right" &&
            "lg:inset-y-0 lg:right-0 lg:h-full lg:w-3/4 lg:border-l lg:data-[state=closed]:slide-out-to-right lg:data-[state=open]:slide-in-from-right lg:max-w-sm",
          side === "left" &&
            "lg:inset-y-0 lg:left-0 lg:h-full lg:w-3/4 lg:border-r lg:data-[state=closed]:slide-out-to-left lg:data-[state=open]:slide-in-from-left lg:max-w-sm",
          side === "top" &&
            "lg:inset-x-0 lg:top-0 lg:h-auto lg:border-b lg:data-[state=closed]:slide-out-to-top lg:data-[state=open]:slide-in-from-top",
          side === "bottom" &&
            "lg:inset-x-0 lg:bottom-0 lg:h-auto lg:border-t lg:data-[state=closed]:slide-out-to-bottom lg:data-[state=open]:slide-in-from-bottom",
          className
        )}
        {...props}
      >
        <div
          className="flex items-center justify-center py-3 lg:hidden touch-none cursor-grab active:cursor-grabbing"
          {...handleProps}
        >
          <div className="h-1 w-9 shrink-0 rounded-full bg-muted" />
        </div>
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close className="absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-[state=open]:bg-secondary">
            <XIcon className="size-4" />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        )}
        <SheetPrimitive.Close ref={closeRef} tabIndex={-1} aria-hidden="true" className="hidden" />
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("font-semibold text-foreground", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
