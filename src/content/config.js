// 1. Import required libraries from `astro:content`
import { z, defineCollection } from "astro:content";

// 2. Define your collections
const talkCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z.date(),
  }),
});

// 3. Export a `collections` object
export const collections = {
  talk: talkCollection,
};
