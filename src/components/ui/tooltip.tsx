import * as React from "react"

interface TooltipProps {
	content: string
	children: React.ReactElement
	side?: "top" | "bottom" | "left" | "right"
}

function Tooltip({ content, children, side = "top" }: TooltipProps) {
	const [show, setShow] = React.useState(false)
	const triggerRef = React.useRef<HTMLDivElement>(null)
	const [pos, setPos] = React.useState({ top: 0, left: 0 })

	const updatePos = React.useCallback(() => {
		if (!triggerRef.current) return
		const rect = triggerRef.current.getBoundingClientRect()
		let top = 0
		let left = 0

		switch (side) {
			case "top":
				top = rect.top - 8
				left = rect.left + rect.width / 2
				break
			case "bottom":
				top = rect.bottom + 8
				left = rect.left + rect.width / 2
				break
			case "left":
				top = rect.top + rect.height / 2
				left = rect.left - 8
				break
			case "right":
				top = rect.top + rect.height / 2
				left = rect.right + 8
				break
		}

		setPos({ top, left })
	}, [side])

	const handleEnter = () => {
		updatePos()
		setShow(true)
	}

	const transformOrigin = {
		top: "translateX(-50%) translateY(-100%)",
		bottom: "translateX(-50%)",
		left: "translateY(-50%) translateX(-100%)",
		right: "translateY(-50%)",
	}

	return (
		<>
			<div
				ref={triggerRef}
				className="inline-flex"
				onMouseEnter={handleEnter}
				onMouseLeave={() => setShow(false)}
			>
				{children}
			</div>
			{show && (
				<div
					className="fixed z-[9999] rounded-md bg-popover px-3 py-1.5 text-xs text-popover-foreground border border-border shadow-lg animate-fade-in whitespace-nowrap pointer-events-none"
					style={{
						top: pos.top,
						left: pos.left,
						transform: transformOrigin[side],
					}}
				>
					{content}
				</div>
			)}
		</>
	)
}

export { Tooltip }
