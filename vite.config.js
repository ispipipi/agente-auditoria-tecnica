import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/agente-auditoria-tecnica/",
  plugins: [react()],
});
