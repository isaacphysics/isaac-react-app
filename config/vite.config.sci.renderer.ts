import { defineConfig } from "vite";
import { generateConfig } from "./vite.config.common";

export default defineConfig(
    generateConfig("sci", true)
);
