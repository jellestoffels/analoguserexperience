// sanity-client.js
import { createClient } from 'https://esm.sh/@sanity/client'
import imageUrlBuilder from 'https://esm.sh/@sanity/image-url'

export const client = createClient({
  projectId: 'yxgcufla',
  dataset: 'production',
  useCdn: true, // set to `false` to bypass the edge cache
  apiVersion: '2023-05-03', // use current date (YYYY-MM-DD) to target the latest API version
  // token: process.env.SANITY_SECRET_TOKEN // Only if you want to update content with the client
})

const builder = imageUrlBuilder(client)

export function urlFor(source) {
  return builder.image(source)
}