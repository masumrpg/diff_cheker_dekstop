import { RefreshCw, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select } from "@/components/ui/select";
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
			<div className="flex flex-wrap items-center gap-2">
				<Select
					value={language}
					onValueChange={onLanguageChange}
					options={LANGUAGE_OPTIONS}
					placeholder="Language"
					disabled={autoDetect}
				/>

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

			{/* Right: Actions */}
			<div className="flex items-center gap-2">
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
