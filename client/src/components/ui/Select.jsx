import { forwardRef } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "../../lib/utils"

const Select = forwardRef(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none text-slate-900 dark:text-white bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700",
        className,
      )}
      ref={ref}
      {...props}
    >
      {children}
    </select>
    <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
  </div>
))
Select.displayName = "Select"

export { Select }
