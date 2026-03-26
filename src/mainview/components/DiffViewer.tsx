import hljs from "highlight.js";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

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
	const bgClass =
		line.type === "added"
			? "diff-added"
			: line.type === "removed"
				? "diff-removed"
				: "diff-unchanged";

	const prefixChar =
		line.type === "added" ? "+" : line.type === "removed" ? "-" : " ";

	const prefixColor =
		line.type === "added"
			? "text-[hsl(var(--neon-green))]"
			: line.type === "removed"
				? "text-[hsl(var(--neon-red))]"
				: "text-muted-foreground/30";

	return (
		<div className={`flex font-mono text-[13px] leading-[1.6] ${bgClass} transition-colors hover:brightness-110`}>
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
				{renderHighlightedLine(line.value, language)}
			</span>
		</div>
	);
}

export function DiffViewer({ oldLines, newLines, language, viewMode }: DiffViewerProps) {
	const [copiedPanel, setCopiedPanel] = useState<string | null>(null);

	const copyDiff = (panel: "old" | "new" | "unified") => {
		let text = "";
		if (panel === "unified") {
			const allLines: DiffLine[] = [];
			let oi = 0, ni = 0;
			while (oi < oldLines.length || ni < newLines.length) {
				if (oi < oldLines.length && oldLines[oi].type === "removed") {
					allLines.push(oldLines[oi]);
					oi++;
				} else if (ni < newLines.length && newLines[ni].type === "added") {
					allLines.push(newLines[ni]);
					ni++;
				} else {
					if (oi < oldLines.length) {
						allLines.push(oldLines[oi]);
						oi++;
					}
					if (ni < newLines.length && newLines[ni].type === "unchanged") {
						ni++;
					}
				}
			}
			text = allLines
				.map((l) => {
					const prefix = l.type === "added" ? "+" : l.type === "removed" ? "-" : " ";
					return `${prefix} ${l.value}`;
				})
				.join("\n");
		} else {
			const lines = panel === "old" ? oldLines : newLines;
			text = lines.map((l) => l.value).join("\n");
		}
		navigator.clipboard.writeText(text);
		setCopiedPanel(panel);
		setTimeout(() => setCopiedPanel(null), 2000);
	};

	// Unified view: merge all lines
	const unifiedLines: DiffLine[] = [];
	if (viewMode === "unified") {
		let oi = 0, ni = 0;
		while (oi < oldLines.length || ni < newLines.length) {
			if (oi < oldLines.length && oldLines[oi].type === "removed") {
				unifiedLines.push(oldLines[oi]);
				oi++;
			} else if (ni < newLines.length && newLines[ni].type === "added") {
				unifiedLines.push(newLines[ni]);
				ni++;
			} else {
				if (oi < oldLines.length) {
					unifiedLines.push(oldLines[oi]);
					oi++;
				}
				if (ni < newLines.length && newLines[ni].type === "unchanged") {
					ni++;
				}
			}
		}
	}

	return (
		<div className="space-y-3 animate-fade-in flex-1 flex flex-col min-h-0">
			{/* Diff Stats Bar */}
			<div className="flex items-center justify-between px-1 flex-shrink-0">
				<DiffStats oldLines={oldLines} newLines={newLines} />
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
						<div className="flex-1 overflow-auto min-h-0">
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
						<div className="flex-1 overflow-auto min-h-0">
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
					<div className="flex-1 overflow-auto min-h-0">
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
