import alinea from 'alinea'
import {createNextCMS} from 'alinea/core/driver/Next13Driver'
import * as schema from './content/schema'

export const pages = alinea.root('Pages', {
  contains: ['page']
})

export {schema}

export const cms = createNextCMS({
  schema,
  workspaces: {
    main: alinea.workspace('Alinea', {
      pages,
      media: alinea.root('Media', {
        contains: ['MediaLibrary']
      }),
      [alinea.workspace.meta]: {
        source: './content'
      }
    })
  }
})