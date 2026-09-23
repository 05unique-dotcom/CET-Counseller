import { defineField, defineType } from "sanity";

export const capRoundType = defineType({
  name: "capRound",
  title: "CAP Round",
  type: "document",
  fields: [
    defineField({
      name: "roundNumber",
      title: "Round number",
      type: "number",
      description: "1, 2 or 3. Use 0 for registration and 4 for institute level round.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      title: "Round title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "startDate", title: "Start date", type: "date" }),
    defineField({ name: "endDate", title: "End date", type: "date" }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 5,
    }),
    defineField({
      name: "keyPoints",
      title: "Key points",
      type: "array",
      of: [{ type: "string" }],
    }),
  ],
  orderings: [
    {
      name: "roundAsc",
      title: "Round number",
      by: [{ field: "roundNumber", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "roundNumber" },
    prepare: ({ title, subtitle }) => ({ title, subtitle: `Round ${subtitle ?? "-"}` }),
  },
});
