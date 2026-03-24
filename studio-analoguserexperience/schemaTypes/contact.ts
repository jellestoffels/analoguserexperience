export const contactType = {
  name: 'contact',
  title: 'Contact Page',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Page Title',
      type: 'string',
    },
    {
      name: 'image',
      title: 'Banner Image',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'email',
      title: 'Email',
      type: 'string',
    },
    {
      name: 'phone',
      title: 'Phone / WhatsApp',
      type: 'string',
    },
    {
      name: 'telegram',
      title: 'Telegram Handle',
      type: 'string',
    },
    {
      name: 'socials',
      title: 'Social Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'platform', title: 'Platform', type: 'string' },
            { name: 'url', title: 'URL', type: 'url' },
          ],
        },
      ],
    },
    {
      name: 'address',
      title: 'Address',
      type: 'text',
    },
  ],
}
