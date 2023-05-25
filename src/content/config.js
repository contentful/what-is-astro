// 1. Import required libraries from `astro:content`
import { z, defineCollection, reference } from "astro:content";

// 2. Define your collections
const talk = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z.date(),
    // ✨ This is the magic bit
    // Reference a speaker from the `speaker` collection by its filename
    // don't forget to import { reference } from "astro:content";
    speaker: reference("speaker"),
  }),
});

const speaker = defineCollection({
  schema: z.object({
    name: z.string(),
    title: z.string(),
    twitter: z.string().optional(),
  }),
});

// 3. Export a `collections` object
export const collections = {
  talk,
  speaker,
};
