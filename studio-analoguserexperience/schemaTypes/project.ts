export const projectType = {
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Project Title',
      type: 'string',
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
    },
    {
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Lower numbers appear first on the projects page',
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },
    {
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      description: 'Image displayed on the projects index page',
      options: { hotspot: true },
    },
    {
      name: 'mediaBlocks',
      title: 'Media Items',
      type: 'array',
      description: 'Add images, videos, or text blocks. The layout adjusts automatically.',
      of: [
        {
          type: 'object',
          name: 'mediaImage',
          title: 'Image',
          fields: [
            { name: 'image', title: 'Image', type: 'image', options: { hotspot: true } },
            { name: 'alt', title: 'Alt Text', type: 'string' },
          ],
          preview: {
            select: { media: 'image' },
            prepare({ media }: any) {
              return { title: 'Image', media };
            },
          },
        },
        {
          type: 'object',
          name: 'mediaVideo',
          title: 'Video',
          fields: [
            {
              name: 'url',
              title: 'Video URL',
              type: 'url',
              description: 'YouTube, Vimeo, or direct .mp4 URL',
            },
            { name: 'caption', title: 'Caption', type: 'string' },
          ],
          preview: {
            select: { title: 'url' },
            prepare({ title }: any) {
              return { title: 'Video', subtitle: title };
            },
          },
        },
        {
          type: 'object',
          name: 'mediaText',
          title: 'Text Block',
          fields: [
            { name: 'content', title: 'Text Content', type: 'text' },
          ],
          preview: {
            select: { title: 'content' },
            prepare({ title }: any) {
              return { title: 'Text', subtitle: title?.slice(0, 60) };
            },
          },
        },
        {
          type: 'object',
          name: 'chapterTitle',
          title: 'Chapter Title',
          fields: [
            { name: 'title', title: 'Title', type: 'string' },
          ],
          preview: {
            select: { title: 'title' },
            prepare({ title }: any) {
              return { title: 'Chapter', subtitle: title };
            },
          },
        },
      ],
    },
  ],
}
