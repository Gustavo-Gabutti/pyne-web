import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import product from "./sanity/schemas/product";
import { projectId, dataset } from "./lib/sanity";

export default defineConfig({
  basePath: "/studio",
  name: "PYNE_Studio",
  title: "PYNE ✦ Gestor de Contenidos",
  projectId,
  dataset,
  plugins: [structureTool(), visionTool()],
  schema: {
    types: [product],
  },
});