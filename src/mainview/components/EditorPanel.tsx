import { useRef, useEffect } from "react";
import Editor, { OnMount, OnChange, useMonaco } from "@monaco-editor/react";
import { Upload, X, ArrowRightLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Material Synthwave 84 Dark Theme for Monaco
const synthwaveDark = {
	base: "vs-dark" as const,
	inherit: true,
	rules: [
		{ token: "", background: "21203a", foreground: "f8f8f2" },
		{ token: "comment", foreground: "6272a4", fontStyle: "italic" },
		{ token: "keyword", foreground: "ff79c6" },
		{ token: "string", foreground: "f1fa8c" },
		{ token: "number", foreground: "bd93f9" },
		{ token: "type", foreground: "8be9fd" },
		{ token: "function", foreground: "50fa7b" },
		{ token: "variable", foreground: "f8f8f2" },
		{ token: "operator", foreground: "ff79c6" },
		{ token: "tag", foreground: "ff79c6" },
		{ token: "attribute.name", foreground: "50fa7b" },
		{ token: "attribute.value", foreground: "f1fa8c" },
		{ token: "delimiter", foreground: "f8f8f2" },
		{ token: "constant", foreground: "bd93f9" },
	],
	colors: {
		"editor.background": "#21203a",
		"editor.foreground": "#f8f8f2",
		"editor.lineHighlightBackground": "#2d2a4f44",
		"editorLineNumber.foreground": "#6272a4",
		"editorLineNumber.activeForeground": "#bd93f9",
		"editor.selectionBackground": "#44475a88",
		"editor.inactiveSelectionBackground": "#44475a44",
		"editorCursor.foreground": "#ff79c6",
		"editorWidget.background": "#21203a",
		"editorWidget.border": "#44475a",
	},
};

// Synthwave Light Theme for Monaco
const synthwaveLight = {
	base: "vs" as const,
	inherit: true,
	rules: [
		{ token: "", background: "f5f0ff", foreground: "2d2a3f" },
		{ token: "comment", foreground: "8b85a6", fontStyle: "italic" },
		{ token: "keyword", foreground: "c74daa" },
		{ token: "string", foreground: "a67c00" },
		{ token: "number", foreground: "7c3aed" },
		{ token: "type", foreground: "0891b2" },
		{ token: "function", foreground: "16a34a" },
		{ token: "variable", foreground: "2d2a3f" },
		{ token: "operator", foreground: "c74daa" },
		{ token: "tag", foreground: "c74daa" },
		{ token: "attribute.name", foreground: "16a34a" },
		{ token: "attribute.value", foreground: "a67c00" },
		{ token: "delimiter", foreground: "6b7280" },
		{ token: "constant", foreground: "7c3aed" },
	],
	colors: {
		"editor.background": "#f5f0ff",
		"editor.foreground": "#2d2a3f",
		"editor.lineHighlightBackground": "#ede8f8",
		"editorLineNumber.foreground": "#a09abc",
		"editorLineNumber.activeForeground": "#7c3aed",
		"editor.selectionBackground": "#d8d0f0",
		"editor.inactiveSelectionBackground": "#e8e0f8",
		"editorCursor.foreground": "#c74daa",
		"editorWidget.background": "#f5f0ff",
		"editorWidget.border": "#e0d8ef",
	},
};

type Language = string;

interface EditorPanelProps {
	title: string;
	value: string;
	language: Language;
	onChange: OnChange;
	onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onClear: () => void;
	onDownload: () => void;
	onSwitch?: () => void;
	showSwitch?: boolean;
	isDark?: boolean;
}

export function EditorPanel({
	title,
	value,
	language,
	onChange,
	onFileUpload,
	onClear,
	onDownload,
	onSwitch,
	showSwitch = false,
	isDark = true,
}: EditorPanelProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const monaco = useMonaco();

	// Register themes once monaco is available
	useEffect(() => {
		if (monaco) {
			monaco.editor.defineTheme("synthwave-dark", synthwaveDark);
			monaco.editor.defineTheme("synthwave-light", synthwaveLight);
			monaco.editor.setTheme(isDark ? "synthwave-dark" : "synthwave-light");
		}
	}, [monaco, isDark]);

	const handleEditorDidMount: OnMount = (_editor, monacoInstance) => {
		monacoInstance.editor.defineTheme("synthwave-dark", synthwaveDark);
		monacoInstance.editor.defineTheme("synthwave-light", synthwaveLight);
		monacoInstance.editor.setTheme(isDark ? "synthwave-dark" : "synthwave-light");
	};

	const lineCount = value ? value.split("\n").length : 0;

	return (
		<Card className="flex flex-col overflow-hidden bg-surface-1 transition-all duration-300 hover:border-[hsl(var(--neon-purple)/0.4)]">
			{/* Panel Header */}
			<div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface-2/50">
				<div className="flex items-center gap-2">
					<h2 className="font-medium text-sm text-foreground">{title}</h2>
					{lineCount > 0 && (
						<Badge variant="outline" className="text-[10px] px-1.5 py-0">
							{lineCount} lines
						</Badge>
					)}
				</div>
				<div className="flex items-center gap-1">
					{/* Upload */}
					<Button
						variant="ghost"
						size="sm"
						onClick={() => fileInputRef.current?.click()}
						title="Upload file (Up)"
						className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-all duration-200"
					>
						<Upload className="w-3.5 h-3.5" />
					</Button>
					<input
						ref={fileInputRef}
						type="file"
						className="hidden"
						onChange={onFileUpload}
						accept=".txt,.md,.js,.ts,.jsx,.tsx,.html,.css,.json,.py,.java,.cpp,.c,.php,.rb,.go,.xml,.kt,.rs,.sql,.yaml,.yml"
					/>

					{/* Download (Export) */}
					<Button
						variant="ghost"
						size="sm"
						onClick={onDownload}
						title="Export to file (Down)"
						className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-all duration-200"
					>
						<Download className="w-3.5 h-3.5" />
					</Button>

					{/* Switch */}
					{showSwitch && onSwitch && (
						<Button
							variant="ghost"
							size="sm"
							onClick={onSwitch}
							title="Switch panels"
							className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
						>
							<ArrowRightLeft className="w-3.5 h-3.5" />
						</Button>
					)}

					{/* Clear */}
					{value && (
						<Button
							variant="ghost"
							size="sm"
							onClick={onClear}
							title="Clear content"
							className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
						>
							<X className="w-3.5 h-3.5" />
						</Button>
					)}
				</div>
			</div>

			{/* Monaco Editor */}
			<div className="flex-1 min-h-[300px] lg:min-h-[400px]">
				<Editor
					height="100%"
					language={language}
					value={value}
					onChange={onChange}
					theme={isDark ? "synthwave-dark" : "synthwave-light"}
					onMount={handleEditorDidMount}
					options={{
						minimap: { enabled: false },
						scrollbar: {
							verticalScrollbarSize: 6,
							horizontalScrollbarSize: 6,
							useShadows: false,
						},
						fontSize: 13,
						lineNumbers: "on",
						padding: { top: 12, bottom: 12 },
						fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
						fontLigatures: true,
						renderLineHighlight: "gutter",
						smoothScrolling: true,
						cursorBlinking: "smooth",
						cursorSmoothCaretAnimation: "on",
						bracketPairColorization: { enabled: true },
						wordWrap: "on",
						automaticLayout: true,
					}}
				/>
			</div>
		</Card>
	);
}
