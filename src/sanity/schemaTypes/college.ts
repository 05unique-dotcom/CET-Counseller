import { defineArrayMember, defineField, defineType } from "sanity";

const CATEGORY_CODES = [
  "OPEN",
  "OBC",
  "SC",
  "ST",
  "VJNT",
  "EWS",
  "TFWS",
  "PWD",
  "DEFENCE",
  "EXS",
] as const;

export const collegeType = defineType({
  name: "college",
  title: "College",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "College name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "shortName", title: "Short name", type: "string" }),
    defineField({
      name: "location",
      title: "Location (city / district)",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "dteCode", title: "DTE code", type: "string" }),
    defineField({
      name: "collegeType",
      title: "Type",
      type: "string",
      options: {
        list: ["Government", "Government-Aided", "Autonomous", "Private Unaided"],
      },
    }),
    defineField({
      name: "branches",
      title: "Branches",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "branch",
          fields: [
            defineField({
              name: "name",
              title: "Branch name",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "cutoffs",
              title: "Category-wise cutoffs",
              type: "array",
              of: [
                defineArrayMember({
                  type: "object",
                  name: "cutoff",
                  fields: [
                    defineField({
                      name: "category",
                      title: "Category",
                      type: "string",
                      options: { list: [...CATEGORY_CODES] },
                      validation: (rule) => rule.required(),
                    }),
                    defineField({ name: "round1", title: "CAP Round 1 closing percentile", type: "number" }),
                    defineField({ name: "round2", title: "CAP Round 2 closing percentile", type: "number" }),
                    defineField({ name: "round3", title: "CAP Round 3 closing percentile", type: "number" }),
                  ],
                  preview: {
                    select: { title: "category", r1: "round1", r3: "round3" },
                    prepare: ({ title, r1, r3 }) => ({
                      title: String(title ?? ""),
                      subtitle: `R1 ${r1 ?? "-"} · R3 ${r3 ?? "-"}`,
                    }),
                  },
                }),
              ],
            }),
          ],
          preview: {
            select: { title: "name", cutoffs: "cutoffs" },
            prepare: ({ title, cutoffs }) => ({
              title: String(title ?? ""),
              subtitle: `${Array.isArray(cutoffs) ? cutoffs.length : 0} categories`,
            }),
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "location" },
  },
});
