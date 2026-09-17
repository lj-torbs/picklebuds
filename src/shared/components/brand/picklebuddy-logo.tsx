import { cn } from "@/lib/utils"

const PICKLEBUDDY_LOGO_SRC = "/images/picklebuddy.png"

export function PickleBuddyLogo({
  className,
  imageClassName,
  alt = "PickleBuddy",
}: {
  className?: string
  imageClassName?: string
  alt?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-background ring-1 ring-border",
        className
      )}
    >
      <img
        src={PICKLEBUDDY_LOGO_SRC}
        alt={alt}
        className={cn("h-full w-full object-contain", imageClassName)}
      />
    </span>
  )
}

export { PICKLEBUDDY_LOGO_SRC }
