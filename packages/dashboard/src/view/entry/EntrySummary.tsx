import {Entry, view} from '@alinea/core'
import {Collection, Functions} from '@alinea/store'
import {
  Chip,
  Ellipsis,
  fromModule,
  HStack,
  TextLabel,
  Typo,
  VStack
} from '@alinea/ui'
import {ReactNode} from 'react'
import {MdKeyboardArrowRight} from 'react-icons/md'
import {useWorkspace} from '../../hook/UseWorkspace'
import css from './EntrySummary.module.scss'

const styles = fromModule(css)

function entrySummaryQuery(Entry: Collection<Entry>) {
  const Parent = Entry.as('Parent')
  return {
    id: Entry.id,
    type: Entry.type,
    workspace: Entry.workspace,
    root: Entry.root,
    title: Entry.title,
    parents: Parent.where(Parent.id.isIn(Entry.parents))
      .select({title: Parent.title})
      .orderBy(Functions.arrayLength(Parent.parents).asc())
  }
}

export const EntrySummaryRow = view(
  entrySummaryQuery,
  function EntrySummaryRow({id, title, type: typeName, parents}) {
    const {schema} = useWorkspace()
    const type = schema.type(typeName)!
    return (
      <HStack center full gap={10} className={styles.row()}>
        <VStack>
          {parents.length > 0 && (
            <Ellipsis>
              <Typo.Small>
                <HStack center gap={3}>
                  {parents
                    .map<ReactNode>(({title}, i) => (
                      <TextLabel key={i} label={title} />
                    ))
                    .reduce((prev, curr, i) => [
                      prev,
                      <MdKeyboardArrowRight key={`s${i}`} />,
                      curr
                    ])}
                </HStack>
              </Typo.Small>
            </Ellipsis>
          )}
          <Ellipsis>
            <TextLabel label={title} />
          </Ellipsis>
        </VStack>
        <Chip style={{marginLeft: 'auto'}}>
          <TextLabel label={type.label} />
        </Chip>
      </HStack>
    )
  }
)

export const EntrySummaryThumb = view(
  entrySummaryQuery,
  function EntrySummaryThumb({id, title, type: typeName, parents}) {
    const {schema} = useWorkspace()
    const type = schema.type(typeName)!
    return (
      <div className={styles.thumb()}>
        {parents.length > 0 && (
          <header className={styles.thumb.header()}>
            <Typo.Small>
              <HStack center gap={3}>
                {parents
                  .map<ReactNode>(({title}, i) => (
                    <TextLabel key={i} label={title} />
                  ))
                  .reduce((prev, curr, i) => [
                    prev,
                    <MdKeyboardArrowRight key={`s${i}`} />,
                    curr
                  ])}
              </HStack>
            </Typo.Small>
          </header>
        )}
        <div className={styles.thumb.title()}>
          <TextLabel label={title} />
        </div>
        <div className={styles.thumb.footer()}>
          <Chip style={{marginLeft: 'auto'}}>
            <TextLabel label={type.label} />
          </Chip>
        </div>
      </div>
    )
  }
)