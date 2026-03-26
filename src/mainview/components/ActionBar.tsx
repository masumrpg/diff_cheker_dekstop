import { RefreshCw, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type ViewMode = "split" | "unified";

const LANGUAGE_OPTIONS = [
	{ value: "plaintext", label: "Plain Text" },
	{ value: "javascript", label: "JavaScript" },
	{ value: "typescript", label: "TypeScript" },
	{ value: "python", label: "Python" },
	{ value: "java", label: "Java" },
	{ value: "kotlin", label: "Kotlin" },
	{ value: "cpp", label: "C++" },
	{ value: "c", label: "C" },
	{ value: "go", label: "Go" },
	{ value: "rust", label: "Rust" },
	{ value: "php", label: "PHP" },
	{ value: "ruby", label: "Ruby" },
	{ value: "html", label: "HTML" },
	{ value: "css", label: "CSS" },
	{ value: "json", label: "JSON" },
	{ value: "sql", label: "SQL" },
	{ value: "yaml", label: "YAML" },
	{ value: "xml", label: "XML" },
	{ value: "markdown", label: "Markdown" },
];

interface ActionBarProps {
	language: string;
	onLanguageChange: (lang: string) => void;
	autoDetect: boolean;
	onAutoDetectToggle: () => void;
	viewMode: ViewMode;
	onViewModeChange: (mode: ViewMode) => void;
	showDiff: boolean;
	onCompare: () => void;
	onEdit: () => void;
	onClear: () => void;
	canCompare: boolean;
}

export function ActionBar({
	language,
	onLanguageChange,
	autoDetect,
	onAutoDetectToggle,
	viewMode,
	onViewModeChange,
	showDiff,
	onCompare,
	onEdit,
	onClear,
	canCompare,
}: ActionBarProps) {
	return (
		<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-[10px] bg-surface-1 border border-border/50 flex-shrink-0">
			{/* Left: Controls */}
			<div className="flex flex-col gap-3 w-full sm:w-auto">
				<div className="flex flex-wrap items-center gap-2">
					{autoDetect ? (
						<div className="flex items-center gap-2 px-3 h-9 rounded-md bg-surface-2 border border-border/50 text-xs text-muted-foreground animate-in fade-in zoom-in-95 duration-300">
							<span className="opacity-70">Detected:</span>
							<span className="font-semibold text-primary text-glow-purple lowercase">
								{LANGUAGE_OPTIONS.find(opt => opt.value === language)?.label || language}
							</span>
						</div>
					) : null}

					<Button
						variant={autoDetect ? "default" : "outline"}
						size="sm"
						onClick={onAutoDetectToggle}
						className={cn(
							"transition-all duration-300",
							autoDetect 
								? "bg-gradient-synthwave text-primary-foreground border-transparent glow-purple font-medium" 
								: "hover:border-primary/50"
						)}
					>
						Auto-detect
					</Button>

					<Tabs value={viewMode} onValueChange={(v) => onViewModeChange(v as ViewMode)}>
						<TabsList className="h-9">
							<TabsTrigger value="split" className="text-xs h-[28px] px-3">
								Split
							</TabsTrigger>
							<TabsTrigger value="unified" className="text-xs h-[28px] px-3">
								Unified
							</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>

				{/* Language Tabs - Only show when auto-detect is OFF */}
				{!autoDetect && (
					<div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-surface-2/30 border border-border/30 animate-in fade-in slide-in-from-top-2 duration-300">
						{LANGUAGE_OPTIONS.map((opt) => (
							<Button
								key={opt.value}
								variant={language === opt.value ? "default" : "ghost"}
								size="sm"
								onClick={() => onLanguageChange(opt.value)}
								className={cn(
									"h-7 px-2.5 text-[11px] font-medium transition-all duration-200",
									language === opt.value 
										? "bg-primary/20 text-primary border border-primary/50 glow-purple-sm shadow-[0_0_10px_rgba(189,147,249,0.2)]" 
										: "text-muted-foreground hover:text-foreground hover:bg-surface-2"
								)}
							>
								{opt.label}
							</Button>
						))}
					</div>
				)}
			</div>

			{/* Right: Actions */}
			<div className="flex items-center gap-2 self-end sm:self-center">
				{!showDiff ? (
					<Button
						onClick={onCompare}
						size="sm"
						disabled={!canCompare}
						className="gap-1.5 bg-gradient-synthwave text-primary-foreground font-medium glow-purple transition-all"
					>
						<RefreshCw className="w-3.5 h-3.5" />
						Compare
					</Button>
				) : (
					<>
						<Button
							variant="outline"
							size="sm"
							onClick={onEdit}
							title="Back to editor"
							className="gap-1.5"
						>
							<Pencil className="w-3.5 h-3.5" />
							Edit
						</Button>
						<Button
							variant="destructive"
							size="sm"
							onClick={onClear}
							title="Clear all"
							className="gap-1.5"
						>
							<Trash2 className="w-3.5 h-3.5" />
							Clear
						</Button>
					</>
				)}
			</div>
		</div>
	);
}
