import { z } from "zod";

// Usunięcie tagów HTML z tekstu
function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, "").trim();
}

export const addCommentSchema = z.object({
  bikeId: z.string().min(1),
  content: z
    .string()
    .min(1, "Komentarz nie może być pusty")
    .max(2000, "Komentarz może mieć maksymalnie 2000 znaków")
    .transform(stripHtml),
  type: z.enum(["GENERAL", "SUGGESTION", "QUESTION"]),
  parentId: z.string().optional(),
});

export const reportCommentSchema = z.object({
  commentId: z.string().min(1),
  reason: z.enum(["SPAM", "OFFENSIVE", "IRRELEVANT", "OTHER"]),
  details: z
    .string()
    .max(500, "Opis może mieć maksymalnie 500 znaków")
    .optional()
    .transform((val) => (val ? stripHtml(val) : val)),
});

export type AddCommentInput = z.infer<typeof addCommentSchema>;
export type ReportCommentInput = z.infer<typeof reportCommentSchema>;
