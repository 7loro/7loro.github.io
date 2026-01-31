import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    tags: z.array(z.string()).optional(),
    description: z.string().optional(),
    aliases: z.array(z.string()).optional(),
    created: z.string().optional(),
    modified: z.string().optional(),
  }),
});

export const collections = { posts };
