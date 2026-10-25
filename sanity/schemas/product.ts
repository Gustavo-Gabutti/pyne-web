import { defineField, defineType } from "sanity";
import {
  ALL_SIZE_OPTIONS,
  NUMERIC_SIZES,
  PANTS_SIZES,
  PRODUCT_TAGS,
  STANDARD_SIZES,
} from "../../lib/navigation";
import { PRODUCT_CONDITIONS } from "../../lib/types";

export default defineType({
  name: "product",
  title: "Producto",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Nombre del Producto",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug (URL)",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "brand",
      title: "Marca",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "brandSlug",
      title: "Slug de la Marca",
      type: "string",
    }),
    defineField({
      name: "category",
      title: "Categoría Principal",
      type: "string",
      options: {
        list: [
          { title: "Zapatillas", value: "zapatillas" },
          { title: "Indumentaria", value: "indumentaria" },
          { title: "Accesorios", value: "accesorios" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "subcategory",
      title: "Subcategoría",
      type: "string",
    }),
    defineField({
      name: "subcategoryLabel",
      title: "Etiqueta Subcategoría",
      type: "string",
    }),
    defineField({
      name: "price",
      title: "Precio ($ ARS)",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "compareAtPrice",
      title: "Precio Anterior (Tachado)",
      type: "number",
    }),
    defineField({
      name: "description",
      title: "Descripción del Producto",
      type: "text",
    }),
    defineField({
      name: "image",
      title: "Imagen Principal",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "images",
      title: "Galería de Imágenes",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
    defineField({
      name: "sizeType",
      title: "Tipo de Talle",
      type: "string",
      description:
        "Zapatillas: Numérico (US). Ropa: Estándar (XS-XXL). Pantalones: Pantalón (26-42). Accesorios: Talla Única.",
      options: {
        list: [
          { title: "Numérico (US) — zapatillas", value: "numeric" },
          { title: "Estándar (XS-XXL)", value: "standard" },
          { title: "Pantalón (26-42)", value: "pants" },
          { title: "Talla Única", value: "unique" },
        ],
      },
    }),
    defineField({
      name: "sizes",
      title: "Talles Disponibles",
      type: "array",
      of: [{ type: "string" }],
      description: "Tildá los talles que tenés en stock. Para Talla Única no hace falta cargar nada.",
      options: {
        list: ALL_SIZE_OPTIONS.map((value) => ({ title: value, value })),
        layout: "grid",
      },
      validation: (Rule) =>
        Rule.custom((sizes, context) => {
          const sizeType = (context.document as { sizeType?: string } | undefined)?.sizeType;
          if (sizeType === "unique") return true;

          const list = Array.isArray(sizes) ? (sizes as string[]) : [];
          if (list.length === 0) return "Cargá al menos un talle (o elegí Talla Única).";

          const allowed =
            sizeType === "pants"
              ? PANTS_SIZES
              : sizeType === "standard"
              ? STANDARD_SIZES
              : sizeType === "numeric"
              ? NUMERIC_SIZES
              : null;

          if (allowed) {
            const invalid = list.filter((s) => !allowed.includes(s));
            if (invalid.length > 0) {
              return `Estos talles no corresponden al tipo elegido: ${invalid.join(", ")}`;
            }
          }
          return true;
        }),
    }),
    defineField({
      name: "condition",
      title: "Condición / Estado",
      type: "string",
      options: {
        list: PRODUCT_CONDITIONS.map((value) => ({ title: value, value })),
      },
      initialValue: "Nuevo",
      validation: (Rule) => Rule.required().error("Elegí la condición del producto."),
    }),
    defineField({
      name: "stock",
      title: "Stock Disponible",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "featured",
      title: "Producto Destacado (Home)",
      type: "boolean",
      description: "Activalo para que aparezca en la sección Destacados del home.",
      initialValue: false,
    }),
    defineField({
      name: "featuredOrder",
      title: "Orden en Destacados",
      type: "number",
      description:
        "Opcional. 1 = primero. Los destacados sin número van después, por fecha de carga.",
      hidden: ({ document }) => document?.featured !== true,
      validation: (Rule) => Rule.integer().min(1),
    }),
    defineField({
      name: "tags",
      title: "Etiquetas / Tags",
      type: "array",
      of: [{ type: "string" }],
      description:
        "Elegí de la lista. La tag \"Destacado\" también hace que el producto aparezca en Destacados.",
      options: {
        list: PRODUCT_TAGS,
        layout: "grid",
      },
      validation: (Rule) => Rule.unique(),
    }),
  ],
});