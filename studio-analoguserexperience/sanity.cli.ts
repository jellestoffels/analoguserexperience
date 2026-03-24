import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'yxgcufla',
    dataset: 'production'
  },
  vite: async (config) => {
    config.base = '/studio/'
    return config
  },
  deployment: {
    autoUpdates: false,
  }
})
