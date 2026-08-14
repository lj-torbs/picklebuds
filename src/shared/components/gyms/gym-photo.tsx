import { useState } from "react"
import { ImageOff } from "lucide-react"

import { cn } from "@/lib/utils"

export function GymPhoto({
  src,
  alt,
  className,
}: {
  src?: string
  alt: string
  className?: string
}) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          className
        )}
      >
        <ImageOff className="size-6" aria-hidden="true" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
    />
  )
}
