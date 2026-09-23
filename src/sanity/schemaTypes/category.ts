import { defineField, defineType } from "sanity";

export const categoryType = defineType({
  name: "category",
  title: "Category",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Category name",
      type: "string",
      description: "e.g. Other Backward Class",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "code",
      title: "Category code",
      type: "string",
      description: "Short code used in cutoff tables, e.g. OBC, SC, TFWS",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "requiredDocuments",
      title: "Required documents",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "reservationRules",
      title: "Reservation rules",
      type: "text",
      rows: 4,
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "code" },
  },
});
