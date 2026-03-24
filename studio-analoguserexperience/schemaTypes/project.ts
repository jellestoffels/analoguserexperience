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
      name: 'description',
      title: 'Description',
      type: 'text',
    },
    {
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      description: 'Image displayed on the projects index page',
      options: { hotspot: true }
    },
    {
      name: 'mediaBlocks',
      title: 'Media Items',
      type: 'array',
      description: 'Images and videos for the project layout',
      of: [
        { type: 'image', options: { hotspot: true } }
      ]
    }
  ]
}
