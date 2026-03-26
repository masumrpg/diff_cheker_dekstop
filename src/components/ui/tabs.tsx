import * as React from "react"
import { cn } from "@/lib/utils"

/* Lightweight Tabs — no Radix dependency */

interface TabsContextValue {
	value: string
	onValueChange: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

function useTabs() {
	const ctx = React.useContext(TabsContext)
	if (!ctx) throw new Error("Tabs components must be used within <Tabs>")
	return ctx
}

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
	value: string
	onValueChange: (value: string) => void
}

function Tabs({ value, onValueChange, className, children, ...props }: TabsProps) {
	return (
		<TabsContext.Provider value={{ value, onValueChange }}>
			<div className={cn("", className)} {...props}>
				{children}
			</div>
		</TabsContext.Provider>
	)
}

const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => (
		<div
			ref={ref}
			className={cn(
				"inline-flex h-9 items-center justify-center rounded-[10px] bg-surface-2 p-1 text-muted-foreground",
				className
			)}
			{...props}
		/>
	)
)
TabsList.displayName = "TabsList"

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	value: string
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
	({ className, value, ...props }, ref) => {
		const { value: selectedValue, onValueChange } = useTabs()
		const isActive = selectedValue === value

		return (
			<button
				ref={ref}
				type="button"
				role="tab"
				aria-selected={isActive}
				onClick={() => onValueChange(value)}
				className={cn(
					"inline-flex items-center justify-center whitespace-nowrap rounded-[8px] px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
					isActive
						? "bg-gradient-synthwave text-primary-foreground shadow glow-purple font-medium"
						: "hover:bg-surface-3 hover:text-foreground",
					className
				)}
				{...props}
			/>
		)
	}
)
TabsTrigger.displayName = "TabsTrigger"

export { Tabs, TabsList, TabsTrigger }
