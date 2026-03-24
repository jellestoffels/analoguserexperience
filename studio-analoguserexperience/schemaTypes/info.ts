export const infoType = {
  name: 'info',
  title: 'Info Page',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
    {
      name: 'locationAndYear',
      title: 'Location and Year',
      type: 'string',
      description: 'e.g., Amsterdam, 2026',
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },
    {
      name: 'image',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true }
    }
  ]
}
