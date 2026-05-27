import { defineCollection, z } from 'astro:content';

const achievementsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    banner: z.string().optional(),
    draft: z.boolean().optional(),
  }),
});

const projectsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    banner: z.string().optional(),
    github: z.string().optional(),
    demo: z.string().optional(),
    category: z.string().default('work'),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().optional(),
  }),
});

const publicationsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    authors: z.string(),
    venue: z.string().optional(),
    year: z.string(),
    type: z.enum(['journal', 'conference', 'preprint']),
    banner: z.string().optional(),
    pdf: z.string().optional(),
    arxiv: z.string().optional(),
    doi: z.string().optional(),
    code: z.string().optional(),
    demo: z.string().optional(),
    draft: z.boolean().optional(),
  }),
});

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    banner: z.string().optional(),
    link: z.string().optional(),   // لینک مدیوم اگه خارجی باشه
    tags: z.array(z.string()).optional(),
    draft: z.boolean().optional(),
  }),
});

export const collections = {
  'achievements': achievementsCollection,
  'projects': projectsCollection,
  'publications': publicationsCollection,
  'blogs': blogCollection,
};