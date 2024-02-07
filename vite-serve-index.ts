import { type Plugin } from 'vite'
import * as fs from 'fs'

export default function directoryListingPlugin(): Plugin {
  return {
    name: 'vite-plugin-directory-listing',
    configureServer({ middlewares }) {
      middlewares.use((req, res, next) => {
        if (req.url?.startsWith('/ls')) {
          fs.readdir('./projects', (err, files) => {
            res.appendHeader('content-type', 'application/json')
            res.write(JSON.stringify(files))
            res.end()
          })
          return null
        }
        return next()
      })
    }
  }
}
