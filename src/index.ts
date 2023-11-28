// Config creation
export {Root, Workspace} from 'alinea/core'
export type {Config, Infer, Schema, TextDoc, Type} from 'alinea/core'
export * from 'alinea/core/driver/DefaultDriver'
export * from 'alinea/core/driver/NextDriver'
export {alinea}
import * as alinea from './alinea.js'
export default alinea
export type {
  EntryReference,
  FileReference,
  ImageReference
} from 'alinea/picker/entry/EntryReference'
export type {UrlReference} from 'alinea/picker/url'
