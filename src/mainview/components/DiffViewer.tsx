import hljs from "highlight.js";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useRef, useEffect, useMemo } from "react";

type DiffLine = {
	value: string;
	type: "added" | "removed" | "unchanged";
	lineNumberOld?: number;
	lineNumberNew?: number;
};

type ViewMode = "split" | "unified";

// Map language to highlight.js language
const HLJS_MAP: Record<string, string> = {
	plaintext: "plaintext",
	javascript: "javascript",
	typescript: "typescript",
	jsx: "javascript",
	tsx: "typescript",
	python: "python",
	java: "java",
	kotlin: "kotlin",
	cpp: "cpp",
	c: "c",
	go: "go",
	rust: "rust",
	php: "php",
	ruby: "ruby",
	html: "html",
	css: "css",
	json: "json",
	sql: "sql",
	yaml: "yaml",
	xml: "xml",
	markdown: "markdown",
};

function renderHighlightedLine(line: string, language: string) {
	try {
		const result = hljs.highlight(line || " ", {
			language: HLJS_MAP[language] || "plaintext",
			ignoreIllegals: true,
		});
		return (
			<span
				dangerouslySetInnerHTML={{ __html: result.value }}
				className="hljs"
			/>
		);
	} catch {
		return <span>{line || " "}</span>;
	}
}

interface DiffViewerProps {
	oldLines: DiffLine[];
	newLines: DiffLine[];
	language: string;
	viewMode: ViewMode;
}

function DiffStats({ oldLines, newLines }: { oldLines: DiffLine[]; newLines: DiffLine[] }) {
	const added = newLines.filter((l) => l.type === "added").length;
	const removed = oldLines.filter((l) => l.type === "removed").length;
	const unchanged = oldLines.filter((l) => l.type === "unchanged").length;

	return (
		<div className="flex items-center gap-2 text-xs">
			<Badge variant="success" className="font-mono">
				+{added}
			</Badge>
			<Badge variant="destructive" className="font-mono">
				-{removed}
			</Badge>
			<span className="text-muted-foreground">{unchanged} unchanged</span>
		</div>
	);
}

function DiffLineRow({
	line,
	language,
	showLineNumberOld,
	showLineNumberNew,
}: {
	line: DiffLine;
	language: string;
	showLineNumberOld?: boolean;
	showLineNumberNew?: boolean;
}) {
	const isPlaceholder = !line.lineNumberOld && !line.lineNumberNew;

	const bgClass =
		isPlaceholder
			? "opacity-20"
			: line.type === "added"
				? "diff-added"
				: line.type === "removed"
					? "diff-removed"
					: "diff-unchanged";

	const prefixChar =
		isPlaceholder ? " " : line.type === "added" ? "+" : line.type === "removed" ? "-" : " ";

	const prefixColor =
		line.type === "added"
			? "text-[hsl(var(--neon-green))]"
			: line.type === "removed"
				? "text-[hsl(var(--neon-red))]"
				: "text-muted-foreground/30";

	return (
		<div className={`flex font-mono text-[13px] leading-[1.6] ${bgClass} transition-colors hover:brightness-110 min-h-[22px] ${isPlaceholder ? "bg-surface-2/20" : ""}`}>
			{showLineNumberOld !== false && (
				<span className="w-12 text-right pr-2 text-muted-foreground/50 select-none flex-shrink-0 py-px">
					{line.lineNumberOld || ""}
				</span>
			)}
			{showLineNumberNew !== false && (
				<span className="w-12 text-right pr-2 text-muted-foreground/50 select-none border-r border-border/30 flex-shrink-0 py-px">
					{line.lineNumberNew || ""}
				</span>
			)}
			<span className={`w-5 text-center select-none flex-shrink-0 py-px font-bold ${prefixColor}`}>
				{prefixChar}
			</span>
			<span className="flex-1 px-3 whitespace-pre py-px">
				{isPlaceholder ? "" : renderHighlightedLine(line.value, language)}
			</span>
		</div>
	);
}

export function DiffViewer({ oldLines, newLines, language, viewMode }: DiffViewerProps) {
	const [copiedPanel, setCopiedPanel] = useState<string | null>(null);
	const leftContainerRef = useRef<HTMLDivElement>(null);
	const rightContainerRef = useRef<HTMLDivElement>(null);
	const syncScrollLock = useRef<boolean>(false);

	// Synchronize scrolling
	useEffect(() => {
		if (viewMode !== "split") return;

		const left = leftContainerRef.current;
		const right = rightContainerRef.current;

		if (!left || !right) return;

		let rAF: number | null = null;

		const handleScroll = (source: HTMLDivElement, target: HTMLDivElement) => {
			if (syncScrollLock.current) return;
			
			if (rAF !== null) {
				cancelAnimationFrame(rAF);
			}

			rAF = requestAnimationFrame(() => {
				syncScrollLock.current = true;
				
				// Only sync if there's a meaningful difference to avoid unnecessary layout thrashing
				if (Math.abs(target.scrollTop - source.scrollTop) > 0.5) {
					target.scrollTop = source.scrollTop;
				}
				if (Math.abs(target.scrollLeft - source.scrollLeft) > 0.5) {
					target.scrollLeft = source.scrollLeft;
				}
				
				// Reset lock immediately after setting position
				// In most browsers, setting scrollTop triggers a scroll event synchronously
				syncScrollLock.current = false;
				rAF = null;
			});
		};

		const leftListener = () => handleScroll(left, right);
		const rightListener = () => handleScroll(right, left);

		left.addEventListener("scroll", leftListener, { passive: true });
		right.addEventListener("scroll", rightListener, { passive: true });

		return () => {
			if (rAF !== null) cancelAnimationFrame(rAF);
			left.removeEventListener("scroll", leftListener);
			right.removeEventListener("scroll", rightListener);
		};
	}, [viewMode]);

	const copyDiff = (panel: "old" | "new" | "unified") => {
		let text = "";
		if (panel === "unified") {
			text = unifiedLines
				.map((l) => {
					const prefix = l.type === "added" ? "+" : l.type === "removed" ? "-" : " ";
					return `${prefix} ${l.value}`;
				})
				.join("\n");
		} else {
			const lines = panel === "old" ? oldLines : newLines;
			text = lines
				.filter(l => l.lineNumberOld || l.lineNumberNew) // Skip placeholders
				.map((l) => l.value)
				.join("\n");
		}
		navigator.clipboard.writeText(text);
		setCopiedPanel(panel);
		setTimeout(() => setCopiedPanel(null), 2000);
	};

	// Unified view: merge all lines, skipping artificial placeholders
	const unifiedLines = useMemo(() => {
		if (viewMode !== "unified") return [];
		
		const lines: DiffLine[] = [];
		let i = 0;
		while (i < Math.max(oldLines.length, newLines.length)) {
			const oldL = oldLines[i];
			const newL = newLines[i];

			if (oldL && oldL.lineNumberOld && oldL.type === "removed") {
				lines.push(oldL);
			} else if (newL && newL.lineNumberNew && newL.type === "added") {
				lines.push(newL);
			} else if (oldL && oldL.lineNumberOld && oldL.type === "unchanged") {
				lines.push(oldL);
			}
			i++;
		}
		return lines;
	}, [oldLines, newLines, viewMode]);

	return (
		<div className="space-y-3 animate-fade-in flex-1 flex flex-col min-h-0">
			{/* Diff Stats Bar */}
			<div className="flex items-center justify-between px-1 flex-shrink-0">
				<DiffStats oldLines={oldLines.filter(l => l.lineNumberOld)} newLines={newLines.filter(l => l.lineNumberNew)} />
				{viewMode === "unified" && (
					<Button
						variant="ghost"
						size="sm"
						onClick={() => copyDiff("unified")}
						title="Copy unified diff"
						className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
					>
						{copiedPanel === "unified" ? (
							<><Check className="w-3 h-3" /> Copied</>
						) : (
							<><Copy className="w-3 h-3" /> Copy Diff</>
						)}
					</Button>
				)}
			</div>

			{viewMode === "split" ? (
				/* ===== SPLIT VIEW ===== */
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-1 min-h-0">
					{/* Original Panel */}
					<Card className="overflow-hidden bg-surface-1 flex flex-col min-h-0">
						<div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface-2/50 flex-shrink-0">
							<span className="font-medium text-sm text-foreground">Original</span>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => copyDiff("old")}
								title="Copy original"
								className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
							>
								{copiedPanel === "old" ? (
									<Check className="w-3.5 h-3.5 text-[hsl(var(--neon-green))]" />
								) : (
									<Copy className="w-3.5 h-3.5" />
								)}
							</Button>
						</div>
						<div 
							ref={leftContainerRef}
							className="flex-1 overflow-auto min-h-0 scrollbar-thin"
						>
							{oldLines.map((line, idx) => (
								<DiffLineRow
									key={`old-${idx}`}
									line={line}
									language={language}
									showLineNumberNew={false}
								/>
							))}
						</div>
					</Card>

					{/* Changed Panel */}
					<Card className="overflow-hidden bg-surface-1 flex flex-col min-h-0">
						<div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface-2/50 flex-shrink-0">
							<span className="font-medium text-sm text-foreground">Changed</span>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => copyDiff("new")}
								title="Copy changed"
								className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
							>
								{copiedPanel === "new" ? (
									<Check className="w-3.5 h-3.5 text-[hsl(var(--neon-green))]" />
								) : (
									<Copy className="w-3.5 h-3.5" />
								)}
							</Button>
						</div>
						<div 
							ref={rightContainerRef}
							className="flex-1 overflow-auto min-h-0 scrollbar-thin"
						>
							{newLines.map((line, idx) => (
								<DiffLineRow
									key={`new-${idx}`}
									line={line}
									language={language}
									showLineNumberOld={false}
								/>
							))}
						</div>
					</Card>
				</div>
			) : (
				/* ===== UNIFIED VIEW ===== */
				<Card className="overflow-hidden bg-surface-1 flex flex-col flex-1 min-h-0">
					<div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface-2/50 flex-shrink-0">
						<span className="font-medium text-sm text-foreground">Unified Diff</span>
					</div>
					<div className="flex-1 overflow-auto min-h-0 scrollbar-thin">
						{unifiedLines.map((line, idx) => (
							<DiffLineRow
								key={`unified-${idx}`}
								line={line}
								language={language}
							/>
						))}
					</div>
				</Card>
			)}
		</div>
	);
}
