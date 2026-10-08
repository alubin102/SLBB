import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const documents = z.array(z.object({ title: z.string(), description: z.string().optional(), file: z.string() })).default([])
const videos = z.array(z.object({ title: z.string(), src: z.string(), poster: z.string().optional() })).default([])
const attachments = { documents, videos, photos: z.array(z.string()).default([]) }

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    section: z.string(),
    updated: z.string().optional(),
    source: z.string().optional(),
    ...attachments,
  }),
})

const actualites = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/actualites' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    image: z.string().optional(),
    source: z.string().optional(),
    ...attachments,
  }),
})

const evenements = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/evenements' }),
  schema: z.object({
    title: z.string(),
    start: z.coerce.date(),
    end: z.coerce.date().optional(),
    lieu: z.string().optional(),
    image: z.string().optional(),
    source: z.string().optional(),
    ...attachments,
  }),
})

export const collections = { pages, actualites, evenements }
