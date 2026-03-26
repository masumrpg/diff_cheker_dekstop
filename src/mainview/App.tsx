import { useState, useCallback, useEffect } from "react";
import { OnChange } from "@monaco-editor/react";
import { diffLines } from "diff";
import { Sparkles, X } from "lucide-react";
import { Header } from "./components/Header";
import { EditorPanel } from "./components/EditorPanel";
import { DiffViewer } from "./components/DiffViewer";
import { ActionBar } from "./components/ActionBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Import highlight.js CSS
import "highlight.js/styles/atom-one-dark-reasonable.css";

type DiffLine = {
	value: string;
	type: "added" | "removed" | "unchanged";
	lineNumberOld?: number;
	lineNumberNew?: number;
};

type ViewMode = "split" | "unified";

function detectLanguage(content: string): string {
	const patterns = [
		{ regex: /import\s+.*from/, lang: "typescript" },
		{ regex: /fun\s+\w+\s*\(/, lang: "kotlin" },
		{ regex: /def\s+\w+\s*\(/, lang: "python" },
		{ regex: /func\s+\w+\s*\(/, lang: "go" },
		{ regex: /fn\s+\w+\s*\(/, lang: "rust" },
		{ regex: /#include\s+</, lang: "c" },
		{ regex: /package\s+\w+/, lang: "java" },
		{ regex: /public\s+class/, lang: "java" },
		{ regex: /<html/i, lang: "html" },
		{ regex: /<!DOCTYPE/i, lang: "html" },
		{ regex: /^{[\s\S]*"/, lang: "json" },
		{ regex: /SELECT\s+.*FROM/i, lang: "sql" },
		{ regex: /---\n/, lang: "yaml" },
	];

	for (const { regex, lang } of patterns) {
		if (regex.test(content)) {
			return lang;
		}
	}

	return "plaintext";
}

function App() {
	const [oldText, setOldText] = useState("");
	const [newText, setNewText] = useState("");
	const [language, setLanguage] = useState("plaintext");
	const [autoDetect, setAutoDetect] = useState(true);
	const [diffResult, setDiffResult] = useState<{
		oldLines: DiffLine[];
		newLines: DiffLine[];
	} | null>(null);
	const [showDiff, setShowDiff] = useState(false);
	const [viewMode, setViewMode] = useState<ViewMode>("split");
	const [showBanner, setShowBanner] = useState(true);
	const [isDark, setIsDark] = useState(true);

	useEffect(() => {
		if (isDark) {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
	}, [isDark]);

	const toggleTheme = useCallback(() => {
		setIsDark((prev) => !prev);
	}, []);

	const computeDiff = useCallback(() => {
		if (!oldText && !newText) {
			setDiffResult(null);
			setShowDiff(false);
			return;
		}

		const diff = diffLines(oldText, newText);
		const oldLines: DiffLine[] = [];
		const newLines: DiffLine[] = [];
		let oldLineNumber = 1;
		let newLineNumber = 1;

		diff.forEach((part) => {
			const lines = part.value.split("\n");
			if (lines.length > 0 && lines[lines.length - 1] === "") {
				lines.pop();
			}

			lines.forEach((line) => {
				if (part.added) {
					newLines.push({
						value: line,
						type: "added",
						lineNumberNew: newLineNumber++,
					});
				} else if (part.removed) {
					oldLines.push({
						value: line,
						type: "removed",
						lineNumberOld: oldLineNumber++,
					});
				} else {
					const unchangedLine: DiffLine = {
						value: line,
						type: "unchanged",
						lineNumberOld: oldLineNumber++,
						lineNumberNew: newLineNumber++,
					};
					oldLines.push(unchangedLine);
					newLines.push({ ...unchangedLine });
				}
			});
		});

		setDiffResult({ oldLines, newLines });
		setShowDiff(true);
	}, [oldText, newText]);

	const handleFileUpload =
		(side: "old" | "new") =>
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0];
			if (file) {
				const reader = new FileReader();
				reader.onload = (e) => {
					const content = e.target?.result as string;
					if (side === "old") {
						setOldText(content);
					} else {
						setNewText(content);
					}
					if (autoDetect) {
						setLanguage(detectLanguage(content));
					}
					setShowDiff(false);
				};
				reader.readAsText(file);
			}
		};

	const handleSwitch = () => {
		const temp = oldText;
		setOldText(newText);
		setNewText(temp);
		setShowDiff(false);
	};

	const handleOldTextChange: OnChange = (value) => {
		setOldText(value || "");
		if (autoDetect && value) {
			setLanguage(detectLanguage(value));
		}
		setShowDiff(false);
	};

	const handleNewTextChange: OnChange = (value) => {
		setNewText(value || "");
		if (autoDetect && value) {
			setLanguage(detectLanguage(value));
		}
		setShowDiff(false);
	};

	const handleClearAll = () => {
		setOldText("");
		setNewText("");
		setDiffResult(null);
		setShowDiff(false);
	};
	
	const handleDownload = useCallback((content: string, title: string) => {
		if (!content) return;
		
		const extensionMap: Record<string, string> = {
			plaintext: "txt",
			javascript: "js",
			typescript: "ts",
			python: "py",
			java: "java",
			kotlin: "kt",
			cpp: "cpp",
			c: "c",
			go: "go",
			rust: "rs",
			php: "php",
			ruby: "rb",
			html: "html",
			css: "css",
			json: "json",
			sql: "sql",
			yaml: "yaml",
			xml: "xml",
			markdown: "md",
		};
		
		const ext = extensionMap[language] || "txt";
		const blob = new Blob([content], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${title.toLowerCase()}_${new Date().getTime()}.${ext}`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}, [language]);

	return (
		<div className="h-screen bg-background text-foreground flex flex-col overflow-hidden transition-colors duration-300">
			<Header isDark={isDark} onToggleTheme={toggleTheme} />

			{/* Notification Banner */}
			{showBanner && (
				<div className="border-b border-primary/20 bg-primary/5 animate-slide-up flex-shrink-0">
					<div className="mx-auto flex items-center justify-between py-2 px-4 max-w-7xl">
						<div className="flex items-center gap-2">
							<Sparkles className="w-3.5 h-3.5 text-primary animate-glow-pulse" />
							<span className="text-xs text-primary text-glow-purple">
								Synthwave '84 Theme — Neon-powered code comparison
							</span>
						</div>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setShowBanner(false)}
							className="h-6 w-6 text-primary/70 hover:text-primary"
						>
							<X className="w-3.5 h-3.5" />
						</Button>
					</div>
				</div>
			)}

			{/* Main Content */}
			<main className="flex-1 flex flex-col mx-auto w-full max-w-7xl px-4 py-4 gap-4 min-h-0 overflow-auto">
				{/* Action Bar */}
				<ActionBar
					language={language}
					onLanguageChange={(lang) => {
						setLanguage(lang);
						setAutoDetect(false);
					}}
					autoDetect={autoDetect}
					onAutoDetectToggle={() => setAutoDetect(!autoDetect)}
					viewMode={viewMode}
					onViewModeChange={setViewMode}
					showDiff={showDiff}
					onCompare={computeDiff}
					onEdit={() => setShowDiff(false)}
					onClear={handleClearAll}
					canCompare={!!(oldText || newText)}
				/>

				{/* Editor / Diff Area */}
				{!showDiff ? (
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-1 animate-fade-in">
						<EditorPanel
							title="Original"
							value={oldText}
							language={language}
							onChange={handleOldTextChange}
							onFileUpload={handleFileUpload("old")}
							onClear={() => setOldText("")}
							onDownload={() => handleDownload(oldText, "Original")}
							onSwitch={handleSwitch}
							showSwitch
							isDark={isDark}
						/>
						<EditorPanel
							title="Changed"
							value={newText}
							language={language}
							onChange={handleNewTextChange}
							onFileUpload={handleFileUpload("new")}
							onClear={() => setNewText("")}
							onDownload={() => handleDownload(newText, "Changed")}
							isDark={isDark}
						/>
					</div>
				) : diffResult ? (
					<DiffViewer
						oldLines={diffResult.oldLines}
						newLines={diffResult.newLines}
						language={language}
						viewMode={viewMode}
					/>
				) : null}

				{/* Empty State */}
				{!showDiff && !oldText && !newText && (
					<div className="flex-1 flex items-center justify-center animate-fade-in">
						<div className="text-center space-y-3">
							<div className="inline-flex items-center justify-center w-16 h-16 rounded-[10px] bg-surface-2 border border-border/50 mb-2 glow-purple">
								<Sparkles className="w-7 h-7 text-primary animate-glow-pulse" />
							</div>
							<p className="text-muted-foreground text-sm">
								Paste or upload text in both panels, then hit{" "}
								<Badge variant="outline" className="mx-1 text-[10px] font-mono">
									Compare
								</Badge>{" "}
								to see the diff
							</p>
						</div>
					</div>
				)}
			</main>

			{/* Footer */}
			<footer className="border-t border-border/50 bg-surface-1/50 flex-shrink-0">
				<div className="mx-auto max-w-7xl px-4 py-2 flex items-center justify-between">
					<span className="text-[10px] text-muted-foreground/50">
						Built with Electrobun
					</span>
					<span className="text-[10px] text-muted-foreground/50 text-glow-purple">
						Synthwave '84
					</span>
				</div>
			</footer>
		</div>
	);
}

export default App;
