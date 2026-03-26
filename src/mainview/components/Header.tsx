import { GitCompare, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface HeaderProps {
	isDark: boolean;
	onToggleTheme: () => void;
}

export function Header({ isDark, onToggleTheme }: HeaderProps) {
	return (
		<header className="sticky top-0 z-50 border-b border-border bg-surface-1/80 backdrop-blur-xl flex-shrink-0">
			<div className="mx-auto flex items-center justify-between h-14 px-4 max-w-7xl">
				<div className="flex items-center gap-6">
					<div className="flex items-center gap-2.5">
						<div className="flex items-center justify-center w-8 h-8 rounded-[8px] bg-gradient-synthwave glow-purple">
							<GitCompare className="w-4 h-4 text-white" />
						</div>
						<h1 className="text-lg font-bold text-gradient-synthwave tracking-tight text-glow-purple">
							Diff Checker
						</h1>
					</div>
					<Separator orientation="vertical" className="h-5 hidden sm:block" />
					<span className="text-xs text-muted-foreground hidden sm:block">
						Compare text files with ease
					</span>
				</div>

				<div className="flex items-center gap-1">
					<Button
						variant="ghost"
						size="icon"
						onClick={onToggleTheme}
						title={isDark ? "Switch to light mode" : "Switch to dark mode"}
						className="text-muted-foreground hover:text-foreground"
					>
						{isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className="text-muted-foreground hover:text-foreground text-xs"
					>
						v1.0.0
					</Button>
				</div>
			</div>
		</header>
	);
}
