import * as React from "react"
import { cn } from "@/lib/utils"

const ScrollArea = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & { maxHeight?: string }
>(({ className, maxHeight = "600px", children, ...props }, ref) => (
	<div
		ref={ref}
		className={cn("overflow-auto", className)}
		style={{ maxHeight }}
		{...props}
	>
		{children}
	</div>
))
ScrollArea.displayName = "ScrollArea"

export { ScrollArea }
