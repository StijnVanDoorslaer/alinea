import type {FieldOptions, WithoutLabel} from 'alinea/core'
import {RecordField} from 'alinea/core/field/RecordField'
import {type Type, type} from 'alinea/core/Type'
import {viewKeys} from 'alinea/dashboard/editor/ViewKeys'
import {check} from 'alinea/field/check'
import {type ImageField, type ImageLink, image} from 'alinea/field/link'
import {type ObjectField, object} from 'alinea/field/object'
import {tab, tabs} from 'alinea/field/tabs'
import {type TextField, text} from 'alinea/field/text'
import {IcRoundFindInPage} from 'alinea/ui/icons/IcRoundFindInPage'
import {IcRoundShare} from 'alinea/ui/icons/IcRoundShare'
import {Field} from '../../index.js'
import {list} from '../list.js'
import {SeoField} from './SeoField.view.js'

export interface MetadataOptions extends FieldOptions<Metadata> {
  inferTitleFrom?: string
  inferDescriptionFrom?: string
  inferImageFrom?: string
}

export interface MetadataFields {
  title: TextField
  description: TextField
  openGraph: ObjectField<{
    image: ImageField
    title: TextField
    description: TextField
  }>
}

export interface Metadata {
  title: string
  description: string
  openGraph: {
    image: ImageLink
    title: string
    description: string
  }
}

export class MetadataField extends RecordField<
  Metadata,
  MetadataOptions & {fields: Type<MetadataFields>}
> {}

export function metadata(
  label = 'SEO',
  options: WithoutLabel<MetadataOptions> = {}
) {
  const fields = type('Fields', {
    fields: {
      ...tabs(
        tab('Metadata', {
          icon: IcRoundShare,
          fields: {
            metadata: object('Metadata', {
              inline: true,
              fields: {
                title: text('Title', {width: 0.5, help: '50–60 characters'}),
                description: text('Description', {
                  multiline: true,
                  help: '150–160 characters'
                }),
                openGraph: object('Open Graph', {
                  fields: {
                    image: image('Image', {
                      help: 'Recommended 1200x630'
                    }),
                    title: text('Title'),
                    description: text('Description', {multiline: true})
                  }
                })
              }
            })
          }
        }),
        tab('Search Engine Optimization', {
          icon: IcRoundFindInPage,
          fields: {
            noindex: check('Noindex', {
              help: '<meta name="robots" content="noindex">',
              description: 'Prevent search engines from indexing this page.'
            }),
            ...Field.view(<SeoField />)
          }
        })
      )
    }
  })
  return new MetadataField(fields, {
    options: {label, ...options, fields},
    view: viewKeys.MetadataInput
  })
}
