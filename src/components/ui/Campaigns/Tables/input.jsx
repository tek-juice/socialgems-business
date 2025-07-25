import * as React from "react"
import { cn } from "../../../../lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md border border-[#F9D769]/30 bg-white px-3 py-2 text-xs ring-offset-background file:border-0 file:bg-transparent file:text-xs file:font-medium file:text-[#734D20] placeholder:text-[#734D20]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F9D769] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }