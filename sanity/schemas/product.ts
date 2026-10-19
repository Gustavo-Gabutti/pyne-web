import { defineField, defineType } from "sanity";

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
      options: {
        list: [
          { title: "Numérico (US)", value: "numeric" },
          { title: "Estándar (XS-XXL)", value: "standard" },
          { title: "Talla Única", value: "unique" },
        ],
      },
    }),
    defineField({
      name: "sizes",
      title: "Talles Disponibles",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "condition",
      title: "Condición / Estado",
      type: "string",
      options: {
        list: [
          { title: "Nuevo", value: "Nuevo" },
          { title: "Deadstock", value: "Deadstock" },
          { title: "Usado - 9/10", value: "Usado - 9/10" },
          { title: "Usado - 8/10", value: "Usado - 8/10" },
          { title: "Vintage", value: "Vintage" },
        ],
      },
    }),
    defineField({
      name: "stock",
      title: "Stock Disponible",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "featured",
      title: "Product Destacado (Home)",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "tags",
      title: "Etiquetas / Tags",
      type: "array",
      of: [{ type: "string" }],
    }),
  ],
});