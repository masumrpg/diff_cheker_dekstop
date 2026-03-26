import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
	plugins: [react()],
	root: "src/mainview",
	build: {
		outDir: "../../dist",
		emptyOutDir: true,
		chunkSizeWarningLimit: 2000,
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes("node_modules")) {
						if (id.includes("monaco-editor")) {
							return "monaco";
						}
						if (id.includes("react") || id.includes("react-dom")) {
							return "react-vendor";
						}
						return "vendor";
					}
				},
			},
		},
	},
	server: {
		port: 5173,
		strictPort: true,
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
