import { z } from "zod";

// Google form IDs are opaque strings; reject empty / whitespace-only values.
export const formIdParamSchema = z.object({
    id: z.string().trim().min(1, "Form ID is required"),
});
