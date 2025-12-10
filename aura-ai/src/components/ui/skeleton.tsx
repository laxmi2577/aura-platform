import { cn } from "@/lib/utils"

/**
 * Loading Placeholder Primitive.
 * Renders an animated pulse effect to indicate content loading states.
 * Used to compose skeleton screens for perceived performance optimization.
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted/50", className)}
      {...props}
    />
  )
}

export { Skeleton }