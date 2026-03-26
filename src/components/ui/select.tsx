import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, Check } from "lucide-react"

interface SelectOption {
	value: string
	label: string
}

interface SelectProps {
	value: string
	onValueChange: (value: string) => void
	options: SelectOption[]
	placeholder?: string
	disabled?: boolean
	className?: string
}

/**
 * Custom shadcn-style Select that avoids Radix Portals for Linux GTK compatibility.
 * Uses relative/absolute positioning within the same DOM hierarchy.
 */
function Select({
	value,
	onValueChange,
	options,
	placeholder = "Select...",
	disabled = false,
	className,
}: SelectProps) {
	const [isOpen, setIsOpen] = React.useState(false)
	const containerRef = React.useRef<HTMLDivElement>(null)

	const selectedOption = options.find((opt) => opt.value === value)

	// Close on click outside
	React.useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setIsOpen(false)
			}
		}
		document.addEventListener("mousedown", handleClickOutside)
		return () => document.removeEventListener("mousedown", handleClickOutside)
	}, [])

	return (
		<div className={cn("relative inline-block w-[180px]", className)} ref={containerRef}>
			<button
				type="button"
				onClick={() => !disabled && setIsOpen(!isOpen)}
				disabled={disabled}
				className={cn(
					"flex h-9 w-full items-center justify-between rounded-[8px] border border-input bg-surface-2 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
					isOpen && "ring-1 ring-ring border-ring"
				)}
			>
				<span className="truncate">
					{selectedOption ? selectedOption.label : placeholder}
				</span>
				<ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", isOpen && "rotate-180")} />
			</button>

			{isOpen && (
				<div 
					className="absolute z-[100] mt-1 max-h-60 w-full overflow-auto rounded-[10px] border border-border bg-popover text-popover-foreground shadow-md animate-in fade-in zoom-in-95"
					style={{ top: '100%', left: 0 }}
				>
					<div className="p-1">
						{options.map((option) => (
							<button
								key={option.value}
								type="button"
								onClick={() => {
									onValueChange(option.value)
									setIsOpen(false)
								}}
								className={cn(
									"relative flex w-full cursor-default select-none items-center rounded-[6px] py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
									value === option.value && "bg-accent text-accent-foreground"
								)}
							>
								<span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
									{value === option.value && <Check className="h-4 w-4" />}
								</span>
								<span className="truncate">{option.label}</span>
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	)
}

export { Select }
export type { SelectOption }
